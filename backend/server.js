const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const net = require("net");

const app = express();

app.use(express.static(path.join(__dirname, "../frontend")));

app.listen(3000, () => {
  console.log("Frontend on http://localhost:3000");
});

const wss = new WebSocket.Server({ port: 3001 });

wss.on("connection", (ws) => {
  const client = new net.Socket();
  client.connect(8080, "127.0.0.1");

  let initialized = false;

  ws.on("message", (msg) => {
    if (!initialized) {
      client.write(msg.toString()); // username|room
      initialized = true;
    } else {
      client.write(msg.toString());
    }
  });

  client.on("data", (data) => {
    ws.send(data.toString());
  });

  ws.on("close", () => {
    client.destroy();
  });
});