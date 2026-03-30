#!/bin/bash

echo "Compiling C server..."
gcc backend/server.c -o backend/server -lpthread

if [ $? -ne 0 ]; then
  echo "Compilation failed"
  exit 1
fi

echo "Starting C server..."
./backend/server &

C_PID=$!

echo "Starting Node server..."
node backend/server.js &

NODE_PID=$!

echo "Servers running!"
echo "Press Ctrl+C to stop..."

trap "echo 'Stopping...'; kill $C_PID $NODE_PID; exit" SIGINT

wait