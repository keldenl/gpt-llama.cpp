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

export const dataToResponse = (data, reason = null) => {
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

export const getLlamaPath = (req) => {
  const API_KEY = req.headers.authorization.split(" ")[1];
  // We're using API_KEY as a slot to provide "llama.cpp" folder path
  return API_KEY;
};
