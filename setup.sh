#!/bin/bash

echo "Setting up project..."

cd backend || { echo "Backend folder not found"; exit 1; }

echo "Initializing Node project..."
npm init -y

echo "Installing dependencies..."
npm install ws express net

echo "Making run.sh executable..."
cd ..

chmod +x run.sh

echo "Setup complete!"