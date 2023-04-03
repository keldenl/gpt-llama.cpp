const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const WebSocket = require("ws");

function stripAnsiCodes(str) {
  return str.replace(/\u001b\[\d+m/g, "");
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "client/build")));

const wsServer = new WebSocket.Server({ port: 8080 });
let childProcess;

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.post("/start-process", (req, res) => {
  const { scriptPath, binaryPath } = req.body;

  childProcess = spawn(scriptPath, ["-m", binaryPath]);
  console.log(
    `Child process spawned with command: ${scriptPath} -m ${binaryPath}`
  );

  childProcess.stdout.on("data", (data) => {
    const cleanedData = stripAnsiCodes(data.toString());
    wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(cleanedData);
      }
    });
  });

  childProcess.on("close", (code) => {
    console.error(`Child process exited with code ${code}`);
    wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`child process exited with code ${code}`);
      }
    });
  });

  res.send("Process started");
});

app.post("/run-command", (req, res) => {
  const command = req.body.command;
  childProcess.stdin.write(`${command}\n`);
  res.send("Command sent to process");
});

wsServer.on("error", (error) => {
  console.error(`WebSocket server error: ${error}`);
});

wsServer.on("listening", () => {
  console.log("WebSocket server listening on port 8080");
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
