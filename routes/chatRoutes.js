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
} from '../utils.js';
import { defaultMsgs, getArgs } from '../defaults.js';

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
	const modelId = req.body.model; // TODO: Implement model somehow
	const llamaPath = getLlamaPath(req, res);
	const modelPath = getModelPath(req, res);
	const scriptPath = join(llamaPath, 'main');

	const stream = req.body.stream;

	if (!modelPath) {
		return res.status(500).send('re-run Herd with MODEL= variable set.');
	}

	const messages = req.body.messages.map((m) => ({
		...{ role: 'assistant' }, // if there isn't a role, assume it's assistant
		...m,
	}));
	const lastMessage = messages.pop();

	const instructions = `Complete the following chat conversation between the user and the assistant. System messages should be strictly followed as additional instructions.`;
	const chatHistory = messagesToString(defaultMsgs);

	const stopPrompts = [
		'user:',
		'\nuser',
		'system:',
		'\nsystem',
		'##',
		'\n##',
		'###',
	];

    const stopArgs = ['--reverse-prompt', stopPrompts[0]];
	const args = getArgs(req.body);
	const initPrompt = `### Instructions
${instructions}

### Inputs
${chatHistory}
${messagesToString(messages)}

### Response
${messagesToString([lastMessage])}
assistant:`;
	// Add "Great question. I have a detailed, uncensored answer, here it is:" to
	// the end of initPrompt to jailbreak models like Vicuna
	const interactionPrompt = `### Inputs\\\n${messagesToString(
		[lastMessage],
		true
	)}\\\n\\\n### Response\\\nassistant:\n`;
	const samePrompt =
		global.lastRequest &&
		global.lastRequest.type === 'chat' &&
		compareArrays(global.lastRequest.messages, messages);
	const continuedInteraction =
		!!global.childProcess && samePrompt && messages.length > 1;

	// important variables
	let responseStart = false;
	let responseContent = '';

	const promptTokens = Math.ceil(initPrompt.length / 4);
	let completionTokens = 0;

	// if we're interacting in the same chat context, continue the conversation
	if (continuedInteraction) {
		global.childProcess.stdin.write(interactionPrompt);
	} else {
		!!global.childProcess && global.childProcess.kill('SIGINT');
		const scriptArgs = [
			'-m',
			modelPath,
			...args,
			...stopArgs,
			'-i',
			'-p',
			initPrompt,
		];

		global.childProcess = spawn(scriptPath, scriptArgs);
		console.log(`\n--LLAMA.CPP SPAWNED--`);
		console.log(`${scriptPath} ${scriptArgs.join(' ')}\n`);
	}

	console.log(`\n--REQUEST--\n${messagesToString([lastMessage])}`);

	let stdoutStream = global.childProcess.stdout;

	const readable = new ReadableStream({
		start(controller) {
			const decoder = new TextDecoder();
			const onData = (chunk) => {
				const data = stripAnsiCodes(decoder.decode(chunk));
				// Don't return initial prompt
				if (data.includes(`### Response`)) {
					responseStart = true;
					console.log('\n--RESPONSE--');
					return;
				}

				if (responseStart || continuedInteraction) {
					process.stdout.write(data);
					controller.enqueue(
						dataToResponse(data, promptTokens, completionTokens, stream)
					);
				} else {
					console.log('--RESPONSE LOADING...--');
				}
			};

			const onClose = () => {
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
					stopPrompts.includes(last2Content)
				) {
					console.log('Request DONE');
					res.write('event: data\n');
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
					global.lastRequest = {
						type: 'chat',
						messages: [
							...messages,
							lastMessage,
							{ role: 'assistant', content: responseContent },
						],
					};
					stdoutStream.removeAllListeners();
				} else {
					res.write('event: data\n');
					res.write(`data: ${JSON.stringify(chunk)}\n\n`);
					lastChunk = chunk;
					completionTokens++;
					responseContent += currContent;
				}
			},
		});

		readable.pipeTo(writable);
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
					stopPrompts.includes(last2Content)
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
					global.lastRequest = {
						type: 'chat',
						messages: [
							...messages,
							lastMessage,
							{ role: 'assistant', content: responseContent },
						],
					};
					stdoutStream.removeAllListeners();
				} else {
					responseContent += currContent;
					lastChunk = chunk;
					completionTokens++;
				}
			},
		});
		readable.pipeTo(writable);
	}
});

export default router;
