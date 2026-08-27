@echo off
setlocal enabledelayedexpansion
title Outcome-Indexed AI Spend Router - Server Launcher

:: Ensure we are in the script's root directory
cd /d "%~dp0"

echo ============================================================
echo   Outcome-Indexed AI Spend Router - Server Launcher
echo ============================================================
echo.

:: 1. Copy .env if not present
if not exist ".env" (
    if exist ".env.example" (
        echo [*] Initializing .env configuration from .env.example...
        copy /y ".env.example" ".env" >nul
        echo [OK] .env file created.
    )
)

:: 2. Check Python
echo [*] Checking Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ============================================================
    echo [ERROR] Python is not installed or not found in system PATH.
    echo Please install Python 3.11+ and ensure "Add python.exe to PATH" is checked.
    echo ============================================================
    echo.
    pause
    exit /b 1
)

:: 3. Check Node / npm using CALL (avoids batch auto-termination)
echo [*] Checking Node.js and npm environment...
call npm --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ============================================================
    echo [ERROR] Node.js or npm is not found in system PATH.
    echo Please install Node.js 20+ from https://nodejs.org
    echo ============================================================
    echo.
    pause
    exit /b 1
)

echo [OK] Python detected.
echo [OK] Node.js and npm detected.
echo.
echo ============================================================
echo   Launching Servers...
echo ============================================================
echo.

:: 4. Launch Backend (FastAPI on Port 8000)
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
pushd "%~dp0backend"
start "Outcome AI Router - Backend (Port 8000)" cmd /k "echo FastAPI Backend Server is starting... && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
popd

:: 5. Launch Frontend (Next.js on Port 3000)
echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
pushd "%~dp0"
start "Outcome AI Router - Frontend (Port 3000)" cmd /k "echo Next.js Frontend is starting... && call npm run dev"
popd

echo.
echo ============================================================
echo   🚀 All Servers Started Successfully!
echo ------------------------------------------------------------
echo   • Web Console UI:   http://localhost:3000
echo   • Backend FastAPI:  http://127.0.0.1:8000
echo   • Interactive Docs: http://127.0.0.1:8000/api/v1/docs
echo ============================================================
echo.
echo Launching http://localhost:3000 in your browser...
ping 127.0.0.1 -n 4 >nul
start http://localhost:3000

echo.
echo [NOTE] Servers are running in their dedicated terminal windows.
echo To stop the servers at any time, simply close those windows.
echo.
echo Press any key to exit this launcher window...
pause >nul
