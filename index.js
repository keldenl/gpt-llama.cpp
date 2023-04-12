import express from "express";
import cors from "cors";
import path from "path";
import { spawn } from "child_process";
import {
  getFiles,
  stripAnsiCodes,
  messagesToString,
  dataToResponse,
  getLlamaPath,
} from "./utils.js";
import { defaultArgs, defaultMsgs } from "./defaults.js";

let childProcess;
const app = express();
app.use(cors());
app.use(express.json());

app.get("/v1/models", async (req, res) => {
  const llamaPath = getLlamaPath(req);
  (async () => {
    const models = [];
    for await (const f of getFiles(`${llamaPath}/models/`)) {
      models.push(f.split("llama.cpp/models")[1]); // only return relative
    }
    console.log(models);
    const data = models.map((m) => ({
      id: m,
      object: m,
      owned_by: "user",
      permission: [],
    }));
    console.log({ data });
    res.status(200).json({ data });
  })();
});

app.post("/v1/chat/completions", (req, res) => {
  const llamaPath = getLlamaPath(req);
  const modelId = req.body.model; // TODO: Implement model somehow
  const scriptPath = `${llamaPath}/main`;
  const modelPath = process.env.MODEL;

  const stream = req.body.stream;

  if (!modelPath) {
    return res.status(500).send("re-run Herd with MODEL= variable set.");
  }

  const messages = req.body.messages;
  const lastMessage = messages.pop();

  const instructions = `Complete the following chat conversation between the user and the assistant. System messages should be strictly followed as additional instructions.`;
  const chatHistory = messagesToString(defaultMsgs);

  const stopPrompts = [
    "user:",
    "\nuser",
    "system:",
    "\nsystem",
    // "###",
    "##",
    "\n##",
  ];

  const stopArgs = stopPrompts.flatMap((s) => ["--reverse-prompt", s]);

  const scriptArgs = [
    "-m",
    modelPath,
    ...defaultArgs,
    ...stopArgs,
    "-p",
    `### Instructions
${instructions}

### Inputs
${chatHistory}
${messagesToString(messages)}

### Response
${messagesToString([lastMessage])}
assistant:`,
  ];

  childProcess = spawn(scriptPath, scriptArgs);
  console.log(
    `Child process spawned with command: ${scriptPath} ${scriptArgs.join(" ")}`
  );

  const stdoutStream = childProcess.stdout;
  const readable = new ReadableStream({
    start(controller) {
      const decoder = new TextDecoder();
      const onData = (chunk) => {
        const data = stripAnsiCodes(decoder.decode(chunk));
        // Don't return initial prompt
        if (data.includes(`### Instructions`)) {
          return;
        }
        controller.enqueue(dataToResponse(data, stream));
      };

      const onClose = () => {
        console.log("Readable Stream: CLOSED");
        controller.close();
      };

      const onError = (error) => {
        console.log("Readable Stream: ERROR");
        console.log(error);
        controller.error(error);
      };

      stdoutStream.on("data", onData);
      stdoutStream.on("close", onClose);
      stdoutStream.on("error", onError);
    },
  });

  // const contentType = stream ? "text/event-stream" : "application/json";

  
  // If streaming, return an event-stream
  if (stream) {
    res.writeHead(200, {
      "Content-Type": 'text/event-stream',
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    let lastChunk; // in case stop prompts are longer, lets combine the last 2 chunks to check
    const writable = new WritableStream({
      write(chunk) {
        const currContent = JSON.parse(chunk).choices[0].delta.content;
        const lastContent = !!lastChunk
          ? JSON.parse(lastChunk).choices[0].delta.content
          : undefined;
        const last2Content = !!lastContent
          ? lastContent + currContent
          : currContent;
        console.log("last2: ", last2Content);
        // If we detect the stop prompt, stop generation
        if (
          stopPrompts.includes(currContent) ||
          stopPrompts.includes(last2Content)
        ) {
          console.log("SEND DONE EVENT SIGNAL");
          res.write("event: data\n");
          res.write(`data: ${dataToResponse(undefined, stream, "stop")}\n\n`);
          res.write("event: data\n");
          res.write("data: [DONE]\n\n");
          childProcess.kill("SIGINT");
        } else {
          res.write("event: data\n");
          res.write(`data: ${chunk}\n\n`);
          lastChunk = chunk;
        }
      },
    });

    readable.pipeTo(writable);
  }
  // Return a single json response instead of streaming
  else {
    let responseData = "";
    let lastChunk; // in case stop prompts are longer, lets combine the last 2 chunks to check
    const writable = new WritableStream({
      write(chunk) {
        const currContent = JSON.parse(chunk).choices[0].message.content;
        const lastContent = !!lastChunk
          ? JSON.parse(lastChunk).choices[0].message.content
          : undefined;
        const last2Content = !!lastContent
          ? lastContent + currContent
          : currContent;
        console.log("last2: ", last2Content);
        // If we detect the stop prompt, stop generation
        if (
          stopPrompts.includes(currContent) ||
          stopPrompts.includes(last2Content)
        ) {
          console.log('DONE JSON')
          console.log(dataToResponse(responseData,stream, "stop"))
          res.status(200).json(dataToResponse(responseData, stream,"stop"))
          childProcess.kill("SIGINT");
        } else {
          responseData += currContent;
          console.log(responseData);
          lastChunk = chunk;
        }
      },
    });
    readable.pipeTo(writable);
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(6969, () => {
  console.log("Server is listening on port 3000");
});
