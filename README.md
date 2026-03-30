# DebateMe
## Summary
This project will implement a multi-client chat system that uses event-driven I/O to create chat rooms for users to debate random topics. We will use an event-driven server core with non-blocking sockets, message broadcasting, user sessions, a server-side event loop, and a minimal CLI client. With the winner judged by the LLM overlord

We used C for the backend and Node.js for the frontend

## Team
- Itay Shemesh
- Seth Aguilar 
- Quinn McCarthy 

## How to Run 
One Time Execution:
```
chmod +x setup.sh
./setup.sh
```
Then just run `./run.sh` to start server.c and server.js (it should open to port 3000, `http://localhost:3000`)