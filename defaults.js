export const defaultMsgs = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "How are you?" },
  { role: "assistant", content: "Hi, how may I help you today?" },
];

export const defaultArgs = [
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
