# EduShield Multi-Tier Startup Script (Windows PowerShell)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting EduShield: Explainable AI Counselling Framework" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseDir = Split-Path -Parent $PSScriptRoot

Write-Host "[1/3] Starting Machine Learning & TreeSHAP Service on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\ml_service'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "[2/3] Starting Node.js / Express Backend on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\backend'; npm run dev"

Write-Host "[3/3] Starting Vite / React Frontend on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\frontend'; npm run dev"

Write-Host "`nAll 3 EduShield tiers launched in background terminals!" -ForegroundColor Yellow
Write-Host "  - Frontend Portal: http://localhost:3000"
Write-Host "  - Backend Health:  http://localhost:5000/api/health"
Write-Host "  - ML Swagger Docs: http://localhost:8000/docs`n"

