#!/bin/bash

echo "🚀 Starting StackOverflow Clone (Local Development)..."

# Check Node.js version
node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "⚠️  Warning: Node.js 18+ recommended. Current version: $(node --version)"
    echo "💡 Use: nvm use 18 or nvm install 18"
fi

# Start backend
echo "🏗️  Starting backend..."
cd server
npm install
npm run dev &
BACKEND_PID=$!

# Wait for backend
sleep 3

# Start frontend
echo "🏗️  Starting frontend..."
cd ../client
npm install

# Check if we need legacy OpenSSL
if node -e "console.log(process.version)" | grep -q "v16"; then
    echo "🔧 Using legacy OpenSSL for Node.js 16..."
    NODE_OPTIONS="--openssl-legacy-provider" npm run dev &
else
    npm run dev &
fi
FRONTEND_PID=$!

echo ""
echo "✅ Services started!"
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080"
echo ""
echo "🛑 To stop: press Ctrl+C"

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait