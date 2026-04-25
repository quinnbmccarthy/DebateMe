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

echo "Waiting for C server on port 8080..."
for i in $(seq 1 20); do
  sleep 0.5
  if nc -z 127.0.0.1 8080 2>/dev/null; then
    echo "C server ready"
    break
  fi
done

echo "Starting Node server..."
node backend/server.js &

NODE_PID=$!

echo "Servers running!"
echo "Press Ctrl+C to stop..."

trap "echo 'Stopping...'; kill $C_PID $NODE_PID; exit" SIGINT

wait