#!/bin/bash
# start.sh — Start Baymax AI backend + frontend
# Usage: bash start.sh

PROJECT="$(cd "$(dirname "$0")" && pwd)"

echo "🤖 Baymax AI — Starting servers..."
echo ""

# Kill any stale processes on our ports
lsof -ti:8000,8080 | xargs kill -9 2>/dev/null
sleep 0.5

# Start backend
echo "▶  Backend  → http://localhost:8000"
cd "$PROJECT"
source venv/bin/activate
uvicorn api:app --port 8000 &
BACKEND_PID=$!

# Wait for backend to be ready
for i in {1..20}; do
  curl -s http://localhost:8000/health >/dev/null 2>&1 && break
  sleep 0.5
done

echo "▶  Frontend → http://localhost:8080"
cd "$PROJECT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers running!"
echo "   Open: http://localhost:8080"
echo ""
echo "   Press Ctrl+C to stop everything"
echo ""

# Trap Ctrl+C to kill both
trap "echo ''; echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait $BACKEND_PID $FRONTEND_PID
