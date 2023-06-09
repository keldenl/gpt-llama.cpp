import express from 'express';
import cors from 'cors';
import IP from 'ip';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { spawn } from 'child_process';

import modelsRoutes from './routes/modelsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import chatRoutesGGML from './routes/chatRoutes-ggml.js';
import completionsRoutes from './routes/completionsRoutes.js';
import completionsRoutesGGML from './routes/completionsRoutes-ggml.js';
import embeddingsRoutes from './routes/embeddingsRoutes.js';
import { getHelpList, validateAndReturnUserArgs } from './defaults.js';
import { getInferenceEngine, getModelPath, stripAnsiCodes } from './utils.js';
import path from 'path';

const PORT = process.env.PORT || 443;
const isWin = process.platform === 'win32';

// Check that the user args are valid
const { errors, userArgs } = validateAndReturnUserArgs();
if (errors.length > 0) {
	process.exit();
}
if (userArgs.includes('--help') || userArgs.includes('-h')) {
	console.log('=====  LIST OF AVAILABLE ARGS  ======');
	console.log(getHelpList);
	console.log();
	process.exit();
}

const getServerRunningMsg = () => {
	const ipAddress = IP.address();
	return `Server is listening on:
  - http://localhost:${PORT}
  - http://${ipAddress}:${PORT} (for other devices on the same network)

See Docs
  - http://localhost:${PORT}/docs

Test your installation
  - ${
		isWin
			? 'double click the scripts/test-installation.ps1 (powershell) or scripts/test-installation.bat (cmd) file'
			: 'open another terminal window and run sh ./scripts/test-installation.sh'
	}

See https://github.com/keldenl/gpt-llama.cpp#usage for more guidance.`;
};

const options = {
	definition: {
		openapi: '3.0.1',
		info: {
			title: 'gpt-llama.cpp',
			version: '1.0.0',
			description: 'Use llama.cpp in place of the OpenAi GPT API',
			license: {
				name: 'MIT',
				url: 'https://spdx.org/licenses/MIT.html',
			},
			contact: {
				name: 'Kelden',
				url: 'https://github.com/keldenl',
			},
		},
		basePath: '/',
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
		servers: [
			{
				url: `http://localhost:${PORT}`,
			},
		],
	},
	apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

global.serverBusy = false;
global.childProcess = undefined;
global.lastRequest = undefined;

const app = express();
app.use(cors());
app.use(express.json());

// MIDDLEWARE CODE TO LIMIT REQUESTS TO 1 AT A TIME
let requestQueue = [];

function processNextRequest() {
	if (requestQueue.length === 0) {
		return;
	}
	// check if server is currently processing a request
	if (!global.serverBusy) {
		let nextRequest = requestQueue.shift();
		processRequest(nextRequest.req, nextRequest.res, nextRequest.next);
	} else {
		console.log('> SERVER BUSY, REQUEST QUEUED');
	}
}

// create a function to process the requests
function processRequest(req, res, next) {
	// do the work for this request here
	console.log(`> PROCESSING NEXT REQUEST FOR ${req.url}`);

	// call the next middleware
	next();
}

// create a middleware function to handle incoming requests
function requestHandler(req, res, next) {
	console.log('> REQUEST RECEIVED');
	requestQueue.push({ req, res, next });
	processNextRequest();

	const jitter = Math.floor(Math.random() * 1000);
	const busyInterval = setInterval(() => {
		if (global.serverBusy) {
			// still working on previos request
			return;
		}
		console.log('> PROCESS COMPLETE');
		clearInterval(busyInterval);
		if (requestQueue.length > 0) {
			console.log(
				`> ${requestQueue.length} REQUEST(S) IN QUEUE. STARTING NEXT REQUEST...`
			);
			processNextRequest();
		}
	}, 2500 + jitter);
}

app.use(requestHandler);
app.use(
	'/docs',
	swaggerUi.serve,
	swaggerUi.setup(specs, {
		explorer: true,
	})
);
app.use('/v1/models', modelsRoutes);
app.use('/v1/chat', (req, res, next) => {
	const modelPath = getModelPath(req, res);
	const inferenceEngine = getInferenceEngine(modelPath);
	switch (inferenceEngine) {
		case 'ggml':
			console.log('> GGML DETECTED');
			chatRoutesGGML(req, res, next);
			break;
		case 'llama.cpp':
			console.log('> LLAMA.CPP DETECTED');
			chatRoutes(req, res, next);
			break;
		default:
			console.log('> NO INFERENCE ENGINE DETECTED, DEFAULTING TO LLAMA.CPP');
			chatRoutes(req, res, next);
			break;
	}
});
app.use('/v1/completions', (req, res, next) => {
	const modelPath = getModelPath(req, res);
	const inferenceEngine = getInferenceEngine(modelPath);
	switch (inferenceEngine) {
		case 'ggml':
			console.log('> GGML DETECTED');
			completionsRoutesGGML(req, res, next);
			break;
		case 'llama.cpp':
			console.log('> LLAMA.CPP DETECTED');
			completionsRoutes(req, res, next);
			break;
		default:
			console.log('> NO INFERENCE ENGINE DETECTED, DEFAULTING TO LLAMA.CPP');
			completionsRoutes(req, res, next);
			break;
	}
});
app.use(/^\/v1(?:\/.+)?\/embeddings$/, embeddingsRoutes);

// app.post('/v1/images/generations', (req, res) => {
// 	global.serverBusy = true;
// 	// const modelId = req.body.model; // TODO: Implement model somehow
// 	const prompt = req.body.prompt;
// 	const scriptArgs = [
// 		'--resource-path',
// 		'./models/Counterfeit-V3.0_split-einsum',
// 	];
// 	const scriptPath = 'swift';
// 	// const prompt = 'red riding hood visiting grandma';
// 	const cwd = 'InferenceEngine/image/ml-stable-diffusion/';
// 	const seed = Math.floor(Math.random() * 10000);
// 	const commandArgs = [
// 		'run',
// 		'StableDiffusionSample',
// 		'--negative-prompt',
// 		'EasyNegativeV2',
// 		'--guidance-scale',
// 		10,
// 		'--step-count',
// 		75,
// 		'--resource-path',
// 		'models/Counterfeit-V3.0_split-einsum',
// 		'--seed',
// 		seed,
// 		prompt,
// 	];

// 	global.childProcess = spawn(scriptPath, commandArgs, { cwd });
// 	console.log(`\n=====  REQUEST  =====`);
// 	console.log(`"${prompt}"`);

// 	let stdoutStream = global.childProcess.stdout;
// 	let stderrStream = global.childProcess.stderr;

// 	let lastErr = '';
// 	const stderr = new ReadableStream({
// 		start(controller) {
// 			const decoder = new TextDecoder();
// 			const onData = (chunk) => {
// 				const data = stripAnsiCodes(decoder.decode(chunk));
// 				lastErr = data;
// 			};

// 			const onClose = () => {
// 				console.error('\n=====  STDERR  =====');
// 				console.log('stderr Readable Stream: CLOSED');
// 				console.log(lastErr);
// 				controller.close();
// 			};

// 			const onError = (error) => {
// 				console.error('\n=====  STDERR  =====');
// 				console.log('stderr Readable Stream: ERROR');
// 				console.log(lastErr);
// 				console.log(error);
// 				controller.error(error);
// 			};

// 			stderrStream.on('data', onData);
// 			stderrStream.on('close', onClose);
// 			stderrStream.on('error', onError);
// 		},
// 	});

// 	const stdout = new ReadableStream({
// 		start(controller) {
// 			const decoder = new TextDecoder();
// 			const onData = (chunk) => {
// 				const data = stripAnsiCodes(decoder.decode(chunk));
// 				// process.stdout.write(data);
// 				// console.log(data)
// 				controller.enqueue(data);
// 				// if (!!data && data.includes('Saved')) {
// 				// 	const fileName = `${prompt.split(' ').join('_')}.${seed}.final.png`
// 				// 	console.log('filename: ', fileName)
// 				// 	console.log(data)
// 				// 	// console.log(data.split(' '))
// 				// 	// console.log(data.split(' ')[1])
// 				// }
// 				// controller.enqueue(
// 				// 	dataToCompletionResponse(data, promptTokens, completionTokens)
// 				// );
// 			};

// 			const onClose = () => {
// 				global.serverBusy = false;
// 				console.log('Readable Stream: CLOSED');
// 				controller.close();
// 			};

// 			const onError = (error) => {
// 				console.log('Readable Stream: ERROR');
// 				console.log(error);
// 				controller.error(error);
// 			};

// 			stdoutStream.on('data', onData);
// 			stdoutStream.on('close', onClose);
// 			stdoutStream.on('error', onError);
// 		},
// 	});

// 	const writable = new WritableStream({
// 		write(chunk) {
// 			// If we detect the stop prompt, stop generation
// 			if (!!chunk && chunk.includes('Saved')) {
// 				global.childProcess.kill('SIGINT');
// 				// const fileName = `${prompt.split(' ').join('_')}.${seed}.final.png`;
// 				console.log(`chunk: "${chunk}"`);
// 				console.log('Request DONE');
// 				const fileName = chunk.split("Saved ")[1].trim()
// 				console.log('filename: ', fileName);
// 				const dirName = path.resolve()
// 				res.status(200).json({
// 					data: [{ url: path.join(dirName, 'InferenceEngine', 'image', 'ml-stable-diffusion', fileName) }],
// 				});
// 				res.end();
// 				global.lastRequest = {
// 					type: 'image',
// 					prompt: prompt,
// 				};
// 				global.serverBusy = false;
// 				stdoutStream.removeAllListeners();
// 			} else {
// 				console.log('chunk: ', chunk);
// 			}
// 		},
// 	});
// 	stdout.pipeTo(writable);
// });

app.get('/', (req, res) =>
	res.type('text/plain').send(`
################################################################################
### WELCOME TO GPT-LLAMA!!
################################################################################


${getServerRunningMsg()}`)
);

app.listen(PORT, () => {
	console.log(getServerRunningMsg());
});
