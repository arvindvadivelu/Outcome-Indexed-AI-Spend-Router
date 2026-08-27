@echo off
setlocal enabledelayedexpansion
title Outcome-Indexed AI Spend Router - Launcher

:: Set current working directory
cd /d "%~dp0"

echo ============================================================
echo   Outcome-Indexed AI Spend Router - Server Launcher
echo ============================================================
echo.

:: 1. Initialize .env if missing
if not exist ".env" (
    if exist ".env.example" (
        echo [*] Creating .env from .env.example...
        copy /y ".env.example" ".env" >nul
        echo [OK] .env created.
    )
)

:: 2. Check Python
echo [*] Checking Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Python is not installed or not in your system PATH!
    echo Please install Python 3.11+ and check "Add Python to PATH".
    echo.
    pause
    exit /b 1
)

:: 3. Check Node / npm
echo [*] Checking Node.js / npm environment...
npm --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js / npm is not installed or not in your system PATH!
    echo Please install Node.js (https://nodejs.org) and try again.
    echo.
    pause
    exit /b 1
)

echo [OK] Python and Node.js detected successfully!
echo.
echo ============================================================
echo   Starting Servers...
echo ============================================================
echo.

:: 4. Start Backend Server (FastAPI on Port 8000)
echo [1/2] Launching Backend Server on port 8000...
start "Outcome AI Router - Backend (Port 8000)" cmd /k "cd /d %~dp0backend && echo Starting FastAPI Backend on http://127.0.0.1:8000 ... && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: 5. Start Frontend Server (Next.js on Port 3000)
echo [2/2] Launching Frontend Server on port 3000...
start "Outcome AI Router - Frontend (Port 3000)" cmd /k "cd /d %~dp0 && echo Starting Next.js Frontend on http://localhost:3000 ... && npm run dev"

echo.
echo ============================================================
echo   🚀 All Servers Started Successfully!
echo ============================================================
echo.
echo   • Web Application UI:  http://localhost:3000
echo   • Backend FastAPI:     http://127.0.0.1:8000
echo   • Interactive API Docs: http://127.0.0.1:8000/api/v1/docs
echo.
echo ============================================================
echo   Opening http://localhost:3000 in your default browser...
echo ============================================================
echo.

:: Open browser after a brief delay
ping 127.0.0.1 -n 4 >nul
start http://localhost:3000

echo.
echo Both servers are actively running in their own windows.
echo To stop the servers, simply close their respective windows.
echo.
echo Press any key to close this launcher window (servers will stay running)...
pause >nul
