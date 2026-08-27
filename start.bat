@echo off
title Outcome-Indexed AI Spend Router - Server Launcher

:: Set current directory to the location of this script
cd /d "%~dp0"

echo ============================================================
echo   Outcome-Indexed AI Spend Router - Server Launcher
echo ============================================================
echo.

:: 1. Copy .env if not present
if not exist ".env" (
    if exist ".env.example" (
        echo [*] Initializing .env configuration...
        copy ".env.example" ".env" >nul
    )
)

:: 2. Detect Python
set PYTHON_CMD=python
python --version >nul 2>&1
if errorlevel 1 (
    py --version >nul 2>&1
    if not errorlevel 1 (
        set PYTHON_CMD=py
    ) else (
        echo [ERROR] Python is not found in PATH.
        echo Please ensure Python 3.11+ is installed and added to PATH.
        pause
        exit /b 1
    )
)

:: 3. Detect Node / npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js / npm is not found in PATH.
    echo Please ensure Node.js 20+ is installed and added to PATH.
    pause
    exit /b 1
)

echo [OK] Python detected (%PYTHON_CMD%)
echo [OK] Node / npm detected
echo.

echo [1/2] Launching Backend Server (FastAPI on Port 8000)...
start "Outcome AI Router - Backend (Port 8000)" cmd /k "cd /d ""%~dp0backend"" && %PYTHON_CMD% -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Launching Frontend Server (Next.js on Port 3000)...
start "Outcome AI Router - Frontend (Port 3000)" cmd /k "cd /d ""%~dp0"" && npm run dev"

echo.
echo ============================================================
echo   Servers are starting in dedicated terminal windows!
echo ------------------------------------------------------------
echo   - Web Console:   http://localhost:3000
echo   - Backend API:   http://127.0.0.1:8000
echo   - Swagger Docs:  http://127.0.0.1:8000/api/v1/docs
echo ============================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:3000
