import express from "express";
import cors from "cors";
import path, { resolve } from "path";
import { spawn } from "child_process";
import { nanoid } from "nanoid";
import { readdir } from "fs/promises";

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      const currFile = res.split(".");
      if (currFile[currFile.length - 1] === "bin") {
        yield res;
      }
    }
  }
}

function stripAnsiCodes(str) {
  return str.replace(/\u001b\[\d+m/g, "");
}

const app = express();
app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, "client/build")));

let childProcess;

// Utils
const messagesToString = (messages) => {
  return messages
    .map((m) => {
      return `${m.role}: ${m.content}`;
    })
    .join("\n");
};

const dataToResponse = (data, reason = null) => {
  const currDate = new Date();
  const contentData = { content: data };

  return JSON.stringify({
    choices: [
      {
        delta: !!data ? contentData : {},
        finish_reason: reason,
        index: 0,
      },
    ],
    created: currDate.getTime(),
    id: nanoid(),
    object: "chat.completion.chunk",
  });
};

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

const getLlamaPath = (req) => {
  const API_KEY = req.headers.authorization.split(" ")[1];
  // We're using API_KEY as a slot to provide "llama.cpp" folder path
  return API_KEY;
};

app.post("/v1/chat/completions", (req, res) => {
  const llamaPath = getLlamaPath(req);
  const modelId = req.body.model;
  const scriptPath = `${llamaPath}/main`;
  // const modelPath = `${llamaPath}/models/vicuna/7B/ggml-vicuna-7b-4bit-rev1.bin`;
  const modelPath = process.env.MODEL;

  if (!modelPath) {
    return res.status(500).send('Re-run Herd with MODEL= variable set.')
  }

  console.log(scriptPath);
  console.log(modelId);

  const messages = req.body.messages;
  const lastMessage = messages.pop();

  const instructions = `Complete the following chat conversation between the user and the assistant. System messages should be strictly followed as additional instructions.`;
  const defaultMsgs = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "How are you?" },
    { role: "assistant", content: "Hi, how may I help you today?" },
  ];

  const chatHistory = messagesToString(defaultMsgs)
  const defaultArgs = [
    "--temp",
    "0.7",
    "-b",
    "512",
    "-n",
    "512",
    "--top_k",
    "40",
    "--top_p",
    "0.1",
    "--repeat_penalty",
    "1.1764705882352942",
  ];

  const stopPrompts = [
    "user:",
    "\nuser",
    "system:",
    "\nsystem",
    "###",
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
  const stream = new ReadableStream({
    start(controller) {
      const decoder = new TextDecoder();
      const onData = (chunk) => {
        const data = stripAnsiCodes(decoder.decode(chunk));
        // Don't return initial prompt
        if (data.includes(`### Instructions`)) {
          return;
        }
        controller.enqueue(dataToResponse(data));
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

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
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
        res.write(`data: ${dataToResponse(undefined, "stop")}\n\n`);
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

  stream.pipeTo(writable);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(6969, () => {
  console.log("Server is listening on port 3000");
});
