@echo off
title Outcome Router Deployment Pipeline

:: Always run from the folder where this .bat file is located
cd /d "%~dp0"

set "IS_AUTO=0"
if "%~1"=="auto" set "IS_AUTO=1"
if "%~1"=="--auto" set "IS_AUTO=1"
if "%~1"=="-y" set "IS_AUTO=1"

echo ===================================================
echo   Outcome Router GitHub Deployment Pipeline
echo ===================================================
echo.

:: Check for any unstaged or untracked changes
for /f "tokens=*" %%i in ('git status --porcelain') do set "HAS_CHANGES=1"

if "%HAS_CHANGES%"=="" (
    echo [INFO] No new or modified code changes detected.
    echo Everything is clean and up to date.
    if "%IS_AUTO%"=="0" pause
    exit /b 0
)

echo [1/4] Code changes detected. Checking Git status...
git status --short

if errorlevel 1 (
    echo.
    echo [ERROR] Git status failed.
    echo Make sure this folder is a valid Git repository.
    if "%IS_AUTO%"=="0" pause
    exit /b 1
)

echo.
echo [2/4] Staging all changes...
git add .

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to stage changes.
    if "%IS_AUTO%"=="0" pause
    exit /b 1
)

echo [OK] Changes staged.

echo.
if "%IS_AUTO%"=="1" (
    for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set "CURRENT_DATE=%%a-%%b-%%c"
    for /f "tokens=1-2 delims=: " %%a in ("%time%") do set "CURRENT_TIME=%%a:%%b"
    set "commitMsg=Auto-sync: %CURRENT_DATE% %CURRENT_TIME% - Code and workflow updates"
) else (
    set /p commitMsg="Enter commit message (Press Enter for 'Auto-update application code'): "
    if "%commitMsg%"=="" set "commitMsg=Auto-update application code"
)

echo [3/4] Creating commit: "%commitMsg%"
git commit -m "%commitMsg%"

if errorlevel 1 (
    echo.
    echo [ERROR] Commit failed.
    echo Possible reason:
    echo - No changes to commit
    echo - Git configuration issue
    echo - Commit hook failed
    if "%IS_AUTO%"=="0" pause
    exit /b 1
)

echo [OK] Changes committed.

echo.
echo [4/4] Pushing to GitHub (origin main)...
git push origin main

if errorlevel 1 (
    echo.
    echo [ERROR] Push failed.
    echo Check your internet connection, GitHub authentication,
    echo remote URL, or branch configuration.
    if "%IS_AUTO%"=="0" pause
    exit /b 1
)

echo.
echo ===================================================
echo   Deployment Complete!
echo   Changes successfully pushed to GitHub.
echo ===================================================
if "%IS_AUTO%"=="0" pause