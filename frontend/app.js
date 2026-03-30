const username = localStorage.getItem("username");
const room = localStorage.getItem("room");

document.getElementById("roomTitle").innerText = "Room: " + room;

const ws = new WebSocket("ws://localhost:3001");

ws.onopen = () => {
  ws.send(username + "|" + room);
};

ws.onmessage = (e) => {
  const chat = document.getElementById("chat");
  chat.innerHTML += "<p>" + e.data + "</p>";
  chat.scrollTop = chat.scrollHeight;
};

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