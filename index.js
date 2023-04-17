import express from "express";
import cors from "cors";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import modelsRoutes from "./routes/modelsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import embeddingsRoutes from "./routes/embeddingsRoutes.js";

const options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "gpt-llama.cpp",
      version: "1.0.0",
      description: "Use llama.cpp in place of the OpenAi GPT API",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Kelden",
        url: "https://github.com/keldenl",
      },
    },
    basePath: "/",
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
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
        url: "http://localhost:6969",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

global.childProcess = undefined;
global.lastRequest = undefined;

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
  })
);
app.use("/v1/models", modelsRoutes);
app.use("/v1/chat", chatRoutes);
app.use("/v1/embeddings", embeddingsRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(6969, () => {
  console.log("Server is listening on port 3000");
});
