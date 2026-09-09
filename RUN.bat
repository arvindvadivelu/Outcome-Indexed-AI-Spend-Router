@echo off
title Outcome-Indexed AI Spend Router
color 0A
cls

echo ==============================================================================
echo   ⚡ OUTCOME-INDEXED AI SPEND ROUTER - AUTONOMOUS LAUNCHER
echo ==============================================================================
echo.

:: 1. Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

:: 2. Check and install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [SETUP] Installing Node.js dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

:: 3. Launch the Next.js Server & API Gateway in background
echo [1/3] Starting Next.js Web Console & API Gateway on port 3000...
start "Outcome Router Next.js Gateway" /min cmd /c "npm run dev"

:: 4. Launch FastAPI Python Backend on port 8000 if python exists
where python >nul 2>nul
if %errorlevel% equ 0 (
    if exist "backend\app\main.py" (
        echo [2/3] Starting FastAPI Python Router on port 8000...
        start "Outcome Router FastAPI Backend" /min cmd /c "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
    )
) else (
    echo [2/3] Python not detected. Running on Next.js integrated engine.
)

:: 5. Wait for server to initialize and auto-open browser
echo [3/3] Initializing gateway services...
echo Waiting for server to become ready at http://localhost:3000 ...

:: Wait 4 seconds for Next.js to start listening
timeout /t 4 /nobreak >nul

echo Opening Outcome Router Console in default browser...
start http://localhost:3000

echo.
echo ==============================================================================
echo   ✓ SYSTEM ACTIVE & READY
echo   • Web Console    : http://localhost:3000
echo   • API Completions: http://localhost:3000/v1/chat/completions
echo   • Health Probe   : http://localhost:3000/api/v1/health
echo ==============================================================================
echo.
echo [INFO] Close this window or press CTRL+C in server terminals to stop.
echo Keep this window open while using Outcome Router.
echo.
pause
