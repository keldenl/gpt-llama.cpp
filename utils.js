import { resolve } from "path";
import { nanoid } from "nanoid";
import { readdir } from "fs/promises";

export async function* getFiles(dir) {
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

export function stripAnsiCodes(str) {
  return str.replace(/\u001b\[\d+m/g, "");
}

export const messagesToString = (messages) => {
  return messages
    .map((m) => {
      return `${m.role}: ${m.content}`;
    })
    .join("\n");
};

export const dataToResponse = (data, stream = false, reason = null) => {
  const currDate = new Date();
  const contentData = { content: data };
  const contentName = stream ? "delta" : "message";

  return JSON.stringify({
    choices: [
      {
        [contentName]: !!data ? contentData : {},
        finish_reason: reason,
        index: 0,
      },
    ],
    created: currDate.getTime(),
    id: nanoid(),
    object: "chat.completion.chunk",
  });
};

export const dataToEmbeddingResponse = (output) => {
  return JSON.stringify({
    object: 'list',
    data: [
      {
        object: 'embedding',
        embedding: output,
        index: 0,
      },
    ],
  });
}

export const getModelPath = (req, res) => {
  const API_KEY = req.headers.authorization;
  if (!API_KEY) {
    return;
  }
  // We're using API_KEY as a slot to provide the "llama.cpp" model path
  const modelPath = API_KEY.split(" ")[1];
  return modelPath;
};

export const getModelName = (path) => {
  const modelArr = path.split("/");
  return modelArr[modelArr.length - 1];
};

export const getLlamaPath = (req, res) => {
  const modelPath = getModelPath(req, res);
  const path = modelPath.split("/llama.cpp")[0]; // only
  return `${path}/llama.cpp`;
};
