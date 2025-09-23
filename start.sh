#!/bin/bash

# StackOverflow Clone - Quick Start Script

echo "🚀 Starting StackOverflow Clone with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed."
    exit 1
fi

# Start backend first
echo "🏗️  Starting backend..."
cd server
docker-compose up -d --build

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 5

# Start frontend
echo "🏗️  Starting frontend..."
cd ../client
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "📊 Checking services status..."
cd ../server
if docker-compose ps | grep -q "Up"; then
    echo "✅ Backend started successfully!"
else
    echo "❌ Backend failed to start. Check logs with: cd server && docker-compose logs"
fi

cd ../client
if docker-compose ps | grep -q "Up"; then
    echo "✅ Frontend started successfully!"
else
    echo "❌ Frontend failed to start. Check logs with: cd client && docker-compose logs"
fi

echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080"
echo ""
echo "📊 View logs:"
echo "   Backend: cd server && docker-compose logs -f"
echo "   Frontend: cd client && docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   Backend: cd server && docker-compose down"
echo "   Frontend: cd client && docker-compose down"