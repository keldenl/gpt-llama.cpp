import express from 'express';
import cors from 'cors';
import IP from 'ip';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import modelsRoutes from './routes/modelsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import embeddingsRoutes from './routes/embeddingsRoutes.js';

const PORT = 443;
const isWin = process.platform === 'win32';

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
		? 'double click the test-installation.ps1 (powershell) or test-installation.bat (cmd) file'
		: 'open another terminal window and run sh ./test-installation.sh'
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

global.childProcess = undefined;
global.lastRequest = undefined;

const app = express();
app.use(cors());
app.use(express.json());

app.use(
	'/docs',
	swaggerUi.serve,
	swaggerUi.setup(specs, {
		explorer: true,
	})
);
app.use('/v1/models', modelsRoutes);
app.use('/v1/chat', chatRoutes);
app.use('/v1/embeddings', embeddingsRoutes);
app.get('/', (req, res) => res.type('text/plain').send(`
################################################################################
### WELCOME TO GPT-LLAMA!!
################################################################################


${getServerRunningMsg()}`));

app.listen(PORT, () => {
	console.log(getServerRunningMsg());
});
