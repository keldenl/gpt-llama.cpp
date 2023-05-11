import express from 'express';
import { spawn } from 'child_process';
import { join } from 'path';
import {
	stripAnsiCodes,
	messagesToString,
	dataToResponse,
	getLlamaPath,
	getModelPath,
	compareArrays,
	getGgmlModelType,
	getGgmlPath,
} from '../utils.js';
import { defaultMsgs, getArgs } from '../defaults.js';
import { initializeChatEngine } from '../chatEngine/initializeChatEngine.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: API for generating chatbot completions using the LLM model
 * /v1/chat/completions:
 *   get:
 *     summary: Generate chatbot completions using LLM model
 *     tags:
 *       - Chat
 *     description: Creates a completion for the chat message
 *     requestBody:
 *       description: Object containing inputs for generating chatbot completions
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *                 description: The ID of the LLM model to use for generating completions (this currently makes no difference)
 *               stream:
 *                 type: boolean
 *                 description: If true, the response will be streamed as a series of chunks. If false, the entire response will be returned in a single JSON object.
 *               messages:
 *                 type: array
 *                 description: The messages to generate chat completions for, in the [chat format](https://platform.openai.com/docs/guides/chat/introduction).
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       description: The speaker of the message, either "system", "user", or "assistant"
 *                     content:
 *                       type: string
 *                       description: The content of the message
 *     responses:
 *       '200':
 *         description: A response object containing the generated chatbot completions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 choices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: object
 *                         properties:
 *                           content:
 *                             type: string
 *                             description: The generated completion text
 *                           metadata:
 *                             type: object
 *                             description: Additional metadata about the completion
 */

router.post('/completions', async (req, res) => {
	global.serverBusy = true;
	console.log(`\n=====  CHAT COMPLETION REQUEST  =====`);

	const ggmlPath = getGgmlPath(req, res);
	const modelPath = getModelPath(req, res);
	const modelType = getGgmlModelType(req, res);
	const scriptPath = join(ggmlPath, modelType);

	const stream = req.body.stream || false;

	if (!modelPath) {
		return res.status(500).send('re-run Herd with MODEL= variable set.');
	}

	const messages = req.body.messages.map((m) => ({
		...{ role: 'assistant' }, // if there isn't a role, assume it's assistant
		...m,
	}));

	// Pop messages until we've reached to the uder message (maybe=)
	const maybeLastMessage = messages.pop();
	let lastMessages = [maybeLastMessage];
	if (maybeLastMessage.role !== 'user') {
		const lastLastMessage = messages.pop();
		lastMessages = [lastLastMessage, ...lastMessages];
	}

	const chatEngine = initializeChatEngine(modelPath)
	const stopPrompts = chatEngine.stopPrompts;
	const initPrompt = chatEngine.getChatPrompt(messages, lastMessages);
	const interactionPrompt = chatEngine.getInteractionPrompt(lastMessages);

	// const stopArgs = stopPrompts.flatMap((s) => ['--reverse-prompt', s]);
	const { args, maxTokens } = getArgs(req.body, 'ggml');

	const supportsInteractive = false; // GGML DOESN'T SUPPORT INTERACTIVE MODE YET
	const samePrompt =
		global.lastRequest &&
		global.lastRequest.type === 'chat' &&
		compareArrays(global.lastRequest.messages, messages);
	const continuedInteraction =
		supportsInteractive && !!global.childProcess && samePrompt && messages.length > 1;

	// important variables
	let responseStart = false;
	let responseContent = '';

	const promptTokens = Math.ceil(initPrompt.length / 4);
	let completionTokens = 0;

	// if we're interacting in the same chat context, continue the conversation
	if (continuedInteraction) {
		global.childProcess.stdin.write(interactionPrompt);
	} else {
		console.log('CHILD PROCESS: ', global.childProcess)
		!!global.childProcess && global.childProcess.kill('SIGINT');
		const scriptArgs = [
			'-m',
			// '../ggml/build/models/Dante_1.3B/ggml-model-q4_1.bin',
			// '../ggml/build/models/redpajama/RedPajama-INCITE-Chat-3B-v1/ggml-model-q5_1.bin',
			modelPath,
			...args,
			// ...stopArgs,
			// '-i',
			'-p',
			initPrompt,
		];


		// '../ggml/build/bin/gpt-2'
		// '../ggml/build/models/Dante_1.3B/ggml-model-q4_1.bin'
		global.childProcess = spawn(`../ggml/build/bin/${modelType}`, scriptArgs);
		console.log(`\n=====  GGML SPAWNED  =====`);
		console.log(`${scriptPath} ${scriptArgs.join(' ')}\n`);
	}

	console.log(`\n=====  REQUEST  =====\n"${chatEngine.messagesToString(lastMessages)}"`);

	let stdoutStream = global.childProcess.stdout;
	let stderrStream = global.childProcess.stderr;

	let lastErr = '';

	const stderr = new ReadableStream({
		start(controller) {
			const decoder = new TextDecoder();
			const onData = (chunk) => {
				const data = stripAnsiCodes(decoder.decode(chunk));
				lastErr = data;
			};

			const onClose = () => {
				console.error('\n=====  STDERR  =====');
				console.log('stderr Readable Stream: CLOSED');
				console.log(lastErr);
				controller.close();
			};
			
			const onError = (error) => {
				console.error('\n=====  STDERR  =====');
				console.log('stderr Readable Stream: ERROR');
				console.log(lastErr);
				console.log(error);
				controller.error(error);
			};

			stderrStream.on('data', onData);
			stderrStream.on('close', onClose);
			stderrStream.on('error', onError);
		},
	});

	let initData = '';
	const stdout = new ReadableStream({
		start(controller) {
			const decoder = new TextDecoder();
			const onData = (chunk) => {
				const data = stripAnsiCodes(decoder.decode(chunk));
				initData = initData + data;

				const promptCount = initData.split(initPrompt).length - 1
				const promptQuotesCount = initData.split(`'${initPrompt}'`).length - 1

				// console.log(data !== '.')
				// console.log(!data.includes('model_load'))
				// console.log(!data.includes('main: token'))
				// console.log(!data.includes('main: prompt'))
				// console.log(promptCount > promptQuotesCount)
				if (
					!responseStart &&
					data !== '.' &&
					!data.includes('model_load') &&
					!data.includes('main: token') &&
					!data.includes('main: prompt') &&
					promptCount > promptQuotesCount // make sure prompt is rendered first (and not just 'prompt')
					// initData.includes(prompt)
				) {
					console.log('RESPONSE START!!!!!!')
					responseStart = true;
					console.log('\n=====  RESPONSE  =====');
					return;
				}

				if (responseStart || continuedInteraction) {
					process.stdout.write(data);
					controller.enqueue(
						dataToResponse(data, promptTokens, completionTokens, stream)
					);
				}
			};

			const onClose = () => {
				global.serverBusy = false;
				console.log('Readable Stream: CLOSED');
				controller.close();
			};

			const onError = (error) => {
				console.log('Readable Stream: ERROR');
				console.log(error);
				controller.error(error);
			};

			stdoutStream.on('data', onData);
			stdoutStream.on('close', onClose);
			stdoutStream.on('error', onError);
		},
	});

	let debounceTimer;
	if (stream) {
		// If streaming, return an event-stream
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		});
		let lastChunk; // in case stop prompts are longer, lets combine the last 2 chunks to check
		const writable = new WritableStream({
			write(chunk) {
				const currContent = chunk.choices[0].delta.content;
				const lastContent = !!lastChunk
					? lastChunk.choices[0].delta.content
					: undefined;
				const last2Content = !!lastContent
					? lastContent + currContent
					: currContent;

				// If we detect the stop prompt, stop generation
				if (
					stopPrompts.includes(currContent) ||
					stopPrompts.includes(last2Content) ||
					completionTokens >= maxTokens - 1
				) {
					console.log('Request DONE');
					res.write('event: data\n\n');
					res.write(
						`data: ${JSON.stringify(
							dataToResponse(
								undefined,
								promptTokens,
								completionTokens,
								stream,
								'stop'
							)
						)}\n\n`
					);
					res.write('event: data\n');
					res.write('data: [DONE]\n\n');
					res.end();
					!!global.childProcess && global.childProcess.kill('SIGINT');

					global.lastRequest = {
						type: 'chat',
						messages: [
							...messages,
							...lastMessages,
							{ role: 'assistant', content: responseContent },
						],
					};
					global.serverBusy = false;
					stdoutStream.removeAllListeners();
					clearTimeout(debounceTimer);
				} else {
					res.write('event: data\n\n');
					res.write(`data: ${JSON.stringify(chunk)}\n\n`);
					lastChunk = chunk;
					completionTokens++;
					responseContent += currContent;
					!!debounceTimer && clearTimeout(debounceTimer);

					debounceTimer = setTimeout(() => {
						console.log(
							'> LLAMA.CPP UNRESPONSIVE FOR 20 SECS. ATTEMPTING TO RESUME GENERATION..'
						);
						global.childProcess.stdin.write('\n');
					}, 20000);
				}
			},
		});

		stdout.pipeTo(writable);
	}
	// Return a single json response instead of streaming
	else {
		let lastChunk; // in case stop prompts are longer, lets combine the last 2 chunks to check
		const writable = new WritableStream({
			write(chunk) {
				const currContent = chunk.choices[0].message.content;
				const lastContent = !!lastChunk
					? lastChunk.choices[0].message.content
					: undefined;
				const last2Content = !!lastContent
					? lastContent + currContent
					: currContent;

				// If we detect the stop prompt, stop generation
				if (
					stopPrompts.includes(currContent) ||
					stopPrompts.includes(last2Content) ||
					completionTokens >= maxTokens - 1
				) {
					console.log('Request DONE');
					res
						.status(200)
						.json(
							dataToResponse(
								responseContent,
								promptTokens,
								completionTokens,
								stream,
								'stop'
							)
						);
					res.end()
					!!global.childProcess && global.childProcess.kill('SIGINT');
					global.lastRequest = {
						type: 'chat',
						messages: [
							...messages,
							...lastMessages,
							{ role: 'assistant', content: responseContent },
						],
					};
					global.serverBusy = false;
					stdoutStream.removeAllListeners();
					clearTimeout(debounceTimer);
				} else {
					responseContent += currContent;
					lastChunk = chunk;
					completionTokens++;
					!!debounceTimer && clearTimeout(debounceTimer);

					debounceTimer = setTimeout(() => {
						console.log(
							'> LLAMA.CPP UNRESPONSIVE FOR 20 SECS. ATTEMPTING TO RESUME GENERATION..'
						);
						global.childProcess.stdin.write('\n');
					}, 20000);
				}
			},
		});
		stdout.pipeTo(writable);
	}
});

export default router;
