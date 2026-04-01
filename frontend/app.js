const username = localStorage.getItem("username");
const room = localStorage.getItem("room");

document.getElementById("roomTitle").innerText = room;

const ws = new WebSocket("ws://localhost:3001");

ws.onopen = () => {
  ws.send(username + "|" + room);
  appendSystem(username + " joined the room");
};

ws.onmessage = (e) => {
  const raw = e.data;
  const colonIdx = raw.indexOf(": ");

  if (colonIdx === -1) {
    appendSystem(raw);
    return;
  }

  const sender = raw.substring(0, colonIdx);
  const text   = raw.substring(colonIdx + 2);
  const isSelf = sender === username;

  appendBubble(sender, text, isSelf);
};

ws.onclose = () => {
  appendSystem("Disconnected from room");
};

function appendBubble(sender, text, isSelf) {
  const chat = document.getElementById("chat");

  const row = document.createElement("div");
  row.className = "msg-row " + (isSelf ? "self" : "other");

  const senderEl = document.createElement("div");
  senderEl.className = "msg-sender";
  senderEl.textContent = sender;

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.textContent = text;

  row.appendChild(senderEl);
  row.appendChild(bubble);
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function appendSystem(text) {
  const chat = document.getElementById("chat");
  const el = document.createElement("div");
  el.className = "msg-system";
  el.textContent = text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

function send() {
  const input = document.getElementById("msg");
  const message = input.value.trim();
  if (message === "") return;
  ws.send(message);
  input.value = "";
}

function leave() {
  ws.close();
  window.location.href = "/";
}

document.getElementById("msg").addEventListener("keydown", (e) => {
  if (e.key === "Enter") send();
});
