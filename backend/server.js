const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const net = require("net");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
const anthropic = new Anthropic();

app.use(express.static(path.join(__dirname, "../frontend")));

app.listen(3000, () => console.log("Frontend on http://localhost:3000"));

const wss = new WebSocket.Server({ port: 3001 });

const rooms = {};

function getRoom(id) {
  if (!rooms[id]) rooms[id] = { transcript: [], clients: {}, judgeRequestedBy: null };
  return rooms[id];
}

function broadcastToRoom(id, message) {
  const room = rooms[id];
  if (!room) return;
  for (const ws of Object.values(room.clients)) {
    if (ws.readyState === WebSocket.OPEN) ws.send(message);
  }
}

async function callJudge(roomId) {
  const transcript = rooms[roomId].transcript.join("\n");
  broadcastToRoom(roomId, "[JUDGE]: Analyzing the debate...");
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `You are an impartial debate judge. Based on the quality of arguments, logic, clarity, and evidence, determine who won the debate and explain your reasoning in 2-3 sentences.\n\nTranscript:\n${transcript}`,
      }],
    });
    broadcastToRoom(roomId, `[JUDGE]: ${response.content[0].text}`);
  } catch (err) {
    broadcastToRoom(roomId, "[SYSTEM]: Error contacting the judge. Please try again.");
    console.error(err);
  }
}

wss.on("connection", (ws) => {
  const tcpClient = new net.Socket();
  tcpClient.connect(8080, "127.0.0.1");
  tcpClient.on("error", (err) => console.error("TCP bridge error:", err.message));

  let username = null;
  let roomId = null;
  let initialized = false;

  ws.on("message", (msg) => {
    const text = msg.toString();

    if (!initialized) {
      [username, roomId] = text.split("|");
      getRoom(roomId).clients[username] = ws;
      tcpClient.write(text);
      initialized = true;
      return;
    }

    if (text.trim() === "/judge") {
      const room = getRoom(roomId);
      if (!room.judgeRequestedBy) {
        room.judgeRequestedBy = username;
        broadcastToRoom(roomId, `[SYSTEM]: ${username} has requested a judge. Type /judge to consent.`);
      } else if (room.judgeRequestedBy !== username) {
        room.judgeRequestedBy = null;
        broadcastToRoom(roomId, "[SYSTEM]: Both players agreed. Calling the judge...");
        callJudge(roomId);
      }
      return;
    }

    getRoom(roomId).transcript.push(`${username}: ${text}`);
    tcpClient.write(text);
  });

  tcpClient.on("data", (data) => ws.send(data.toString()));

  ws.on("close", () => {
    if (roomId && username && rooms[roomId]) delete rooms[roomId].clients[username];
    tcpClient.destroy();
  });
});