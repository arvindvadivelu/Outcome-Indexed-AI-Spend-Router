#!/usr/bin/env bash

# ==============================================================================
#  ⚡ Outcome-Indexed AI Spend Router - Universal Server Launcher
#  Starts FastAPI Backend (Port 8000) and Next.js Frontend (Port 3000)
# ==============================================================================

set -e

# Change to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================================"
echo " ⚡ Starting Outcome-Indexed AI Spend Router Development Stack"
echo "============================================================"
echo ""

# 1. Environment file check
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "[*] Creating .env from .env.example..."
    cp .env.example .env
fi

# 2. Detect Python binary
PYTHON_BIN=""
if command -v python3 &>/dev/null; then
    PYTHON_BIN="python3"
elif command -v python &>/dev/null; then
    PYTHON_BIN="python"
elif command -v py &>/dev/null; then
    PYTHON_BIN="py"
else
    echo "[ERROR] Python is not installed or not in PATH."
    echo "Please install Python 3.11+ to run the backend."
    exit 1
fi

# 3. Detect Node / npm
if ! command -v npm &>/dev/null; then
    echo "[ERROR] Node.js / npm is not installed or not in PATH."
    echo "Please install Node.js 20+ to run the frontend."
    exit 1
fi

echo "[✓] Python executable: $PYTHON_BIN"
echo "[✓] npm executable: $(which npm)"
echo ""

# Handle graceful shutdown on Ctrl+C (SIGINT / SIGTERM)
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    echo "============================================================"
    echo " 🛑 Stopping all servers..."
    echo "============================================================"
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    # Wait for processes to release ports
    wait 2>/dev/null || true
    echo "[✓] All servers stopped cleanly."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 4. Start Backend (FastAPI on Port 8000)
echo "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..."
(
    cd "$SCRIPT_DIR/backend"
    "$PYTHON_BIN" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) &
BACKEND_PID=$!

# 5. Start Frontend (Next.js on Port 3000)
echo "[2/2] Starting Next.js Frontend on http://localhost:3000 ..."
(
    cd "$SCRIPT_DIR"
    npm run dev
) &
FRONTEND_PID=$!

echo ""
echo "============================================================"
echo " 🚀 Servers are up and running!"
echo " ----------------------------------------------------------"
echo "  • Web Console:    http://localhost:3000"
echo "  • Backend API:    http://127.0.0.1:8000"
echo "  • Swagger Docs:   http://127.0.0.1:8000/api/v1/docs"
echo " ----------------------------------------------------------"
echo " Press Ctrl+C in this terminal to stop all servers."
echo "============================================================"
echo ""

# Optional: Try to open browser automatically if tool exists
if command -v xdg-open &>/dev/null; then
    (sleep 2 && xdg-open http://localhost:3000) &>/dev/null &
elif command -v open &>/dev/null; then
    (sleep 2 && open http://localhost:3000) &>/dev/null &
elif command -v cmd.exe &>/dev/null; then
    (sleep 2 && cmd.exe /c start http://localhost:3000) &>/dev/null &
fi

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
