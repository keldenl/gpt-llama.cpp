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
	dataToCompletionResponse,
} from '../utils.js';
import { defaultMsgs, getArgs } from '../defaults.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Completion
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

router.post('/', async (req, res) => {
	global.serverBusy = true;
	console.log(`\n=====  TEXT COMPLETION REQUEST  =====`);

	const modelId = req.body.model; // TODO: Implement model somehow
	const llamaPath = getLlamaPath(req, res);
	const modelPath = getModelPath(req, res);
	const scriptPath = join(llamaPath, 'main');

	const stream = req.body.stream || false;

	if (!modelPath) {
		return res.status(500).send('re-run Herd with MODEL= variable set.');
	}

	const prompt = req.body.prompt;
	const stopPrompts = typeof req.body.stop === 'string' ? [req.body.stop] : req.body.stop || ['\n\n'];
	const stopArgs = stopPrompts.flatMap((s) => ['--reverse-prompt', s]);
	const { args, maxTokens } = getArgs(req.body);

	// important variables
	let responseStart = false;
	let responseContent = '';

	const promptTokens = Math.ceil(prompt.length / 4);
	let completionTokens = 0;

	!!global.childProcess && global.childProcess.kill('SIGINT');
	const scriptArgs = ['-m', modelPath, ...args, ...stopArgs, '--repeat_penalty', '1.3', '-p', prompt];

	global.childProcess = spawn(scriptPath, scriptArgs);
	console.log(`\n=====  LLAMA.CPP SPAWNED  =====`);
	console.log(`${scriptPath} ${scriptArgs.join(' ')}\n`);

	console.log(`\n=====  REQUEST  =====`);
	console.log(`"${prompt}"`)

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
				// Don't return initial prompt
				if (!responseStart && initData.length > prompt.length) {
					responseStart = true;
					console.log('\n=====  RESPONSE  =====');
					return;
				}

				if (responseStart) {
					process.stdout.write(data);
					controller.enqueue(
						dataToCompletionResponse(data, promptTokens, completionTokens)
					);
				} else {
					console.log('=====  PROCESSING PROMPT...  =====');
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
				const currContent = chunk.choices[0].text;
				const lastContent = !!lastChunk
					? lastChunk.choices[0].text
					: undefined;
				const last2Content = !!lastContent
					? lastContent + currContent
					: currContent;

				completionTokens++;

				// If we detect the stop prompt, stop generation
				if (
					stopPrompts.includes(currContent) ||
					stopPrompts.includes(last2Content) ||
					completionTokens >= maxTokens - 1
				) {
					global.childProcess.kill('SIGINT');
					console.log('Request DONE');
					res.write('event: data\n');
					res.write(
						`data: ${JSON.stringify(
							dataToCompletionResponse(
								undefined,
								promptTokens,
								completionTokens,
								'stop'
							)
						)}\n\n`
					);
					res.write('event: data\n');
					res.write('data: [DONE]\n\n');
					res.end();
					global.lastRequest = {
						type: 'completion',
						prompt: prompt,
					};
					global.serverBusy = false;
					stdoutStream.removeAllListeners();
					clearTimeout(debounceTimer);
				} else {
					res.write('event: data\n');
					res.write(`data: ${JSON.stringify(chunk)}\n\n`);
					lastChunk = chunk;
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
				const currContent = chunk.choices[0].text;
				const lastContent = !!lastChunk
					? lastChunk.choices[0].text
					: undefined;
				const last2Content = !!lastContent
					? lastContent + currContent
					: currContent;

				completionTokens++;

				// If we detect the stop prompt, stop generation
				if (
					stopPrompts.includes(currContent) ||
					stopPrompts.includes(last2Content) ||
					completionTokens >= maxTokens - 1
				) {
					global.childProcess.kill('SIGINT');
					console.log('Request DONE');
					res
						.status(200)
						.json(
							dataToCompletionResponse(
								responseContent.trim(),
								promptTokens,
								completionTokens,
								'stop'
							)
						);
					global.lastRequest = {
						type: 'completion',
						prompt: prompt,
					};
					global.serverBusy = false;
					stdoutStream.removeAllListeners();
					clearTimeout(debounceTimer);
				} else {
					responseContent += currContent;
					lastChunk = chunk;
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
