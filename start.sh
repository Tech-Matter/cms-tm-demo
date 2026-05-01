#!/bin/bash
# CMS Quick Start Script
set -e

echo "🚀 Starting CMS..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current: $(node -v)"
  exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Backend setup
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚙️  Created backend/.env from .env.example"
fi
npm install --silent
echo ""

# Start backend in background
echo "🔧 Starting backend API on http://localhost:4000 ..."
node src/index.js &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
sleep 2
echo ""

# Frontend setup
cd ../frontend
echo "📦 Installing frontend dependencies..."
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  echo "⚙️  Created frontend/.env.local from .env.local.example"
fi
npm install --silent
echo ""

echo "🎨 Starting frontend on http://localhost:3000 ..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  CMS is starting up!"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:4000"
echo ""
echo "  Login: admin@example.com / admin123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo ""

# Trap to kill backend when script exits
trap "kill $BACKEND_PID 2>/dev/null; echo ''; echo 'Servers stopped.'" EXIT

npm run dev
