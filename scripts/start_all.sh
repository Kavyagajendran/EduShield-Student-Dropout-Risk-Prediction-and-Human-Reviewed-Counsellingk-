#!/bin/bash
# EduShield Multi-Tier Startup Script (Linux/macOS)

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=========================================================="
echo "  Starting EduShield: Explainable AI Counselling Framework"
echo "=========================================================="

echo "[1/3] Starting Machine Learning & TreeSHAP Service on port 8000..."
(cd "$BASE_DIR/ml_service" && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) &
ML_PID=$!

echo "[2/3] Starting Node.js / Express Backend on port 5000..."
(cd "$BASE_DIR/backend" && npm run dev) &
BACKEND_PID=$!

echo "[3/3] Starting Vite / React Frontend on port 3000..."
(cd "$BASE_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "All 3 EduShield tiers launched!"
echo "  - Frontend Portal: http://localhost:3000"
echo "  - Backend Health:  http://localhost:5000/api/health"
echo "  - ML Swagger Docs: http://localhost:8000/docs"
echo ""

# Handle graceful shutdown
trap "kill $ML_PID $BACKEND_PID $FRONTEND_PID" SIGINT SIGTERM
wait

