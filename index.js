import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import IP from 'ip';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

if (!fs.existsSync('.env')) {
  console.error('.env file not found. Please create a .env file.');
  process.exit(1);
}

import {
	normalizePath,
} from './utils.js';

import modelsRoutes from './routes/modelsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import embeddingsRoutes from './routes/embeddingsRoutes.js';

import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;

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
app.use(/^\/v1\/(.+)\/embeddings$/, embeddingsRoutes);

if(process.env.SSL === true) {
	// Load the SSL/TLS certificate and key files
	const ssl_options = {
		cert: fs.readFileSync(normalizePath(process.env.SSL_CERT)),
		key: fs.readFileSync(normalizePath(process.env.SSL_KEY))
	};

	// Create an HTTPS server with the certificate and key
	https.createServer(ssl_options, app).listen(PORT, () => {
		const ipAddress = IP.address();
		console.log(`Server is listening on:
		- localhost:${PORT}
		- ${ipAddress}:${PORT} (for other devices on the same network)`);
	});
}else{
	// Create HTTP server
	app.listen(PORT, () => {
		const ipAddress = IP.address();
		console.log(`Server is listening on:
		- localhost:${PORT}
		- ${ipAddress}:${PORT} (for other devices on the same network)`);
	});
}
