# DebateMe

## Team
- Itay Shemesh
- Seth Aguilar 
- Quinn McCarthy 

## Summary
In this project, we implemented a multi-client chat system that uses event-driven I/O to create chat rooms for users to debate random topics. We use an event-driven server core with non-blocking sockets, message broadcasting, user sessions, a server-side event loop, and a minimal CLI client, with the winner judged by the LLM overlord. We used C for the backend and Node.js for the frontend. Our goal with this project is to allow users to express their opinions online in a match-style format.

## Themes
Our top 4 themes are:
- System-level I/O, Our server uses non-blocking sockets and event-driven I/O, which is directly tied to low-level input/output handling in C.
- Network Programming, We're handling, Client-server communications, Socket connections, and Message passing between users.
- Distributed Systems, Our system needs to coordinates multiple clients, and manage shared states between users.
- Concurrent Programming, Since our system has multiple clients at once, which means our system is  managing simultaneous connections while the chats are open.

## Design Decisions
One key design choice we made was determining the winner of the debates. This was a significant issue because if we used a general AI, users might send messages that the AI would agree with instead of contributing meaningful arguments. To solve this, we set up a simple agent that instructs the LLM to remain unbiased while judging.

## Challenges
One big challenge we faced was integrating an LLM into the project without using Python. We solved this by setting up an Anthropic API call that sends the LLM the entire chat log, as well as our prewritten non-biased statement. Through this, we have learned not only how to set up a multi-client chat, but also how to integrate AI into non-Python projects.

## How to Run 
One Time Execution:
```
chmod +x setup.sh
export ANTHROPIC_API_KEY="sk-ant-..."
./setup.sh
```
Anothropic API key is necessary for AI judge feature.
Then just run `./run.sh` to start server.c and server.js (it should open to port 3000, `http://localhost:3000`)
