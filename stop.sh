#!/bin/bash

# StackOverflow Clone - Stop Services Script

echo "🛑 Stopping StackOverflow Clone services..."

# Stop frontend
echo "Stopping frontend..."
cd client
docker-compose down

# Stop backend
echo "Stopping backend..."
cd ../server
docker-compose down

echo "✅ All services stopped!"