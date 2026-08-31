@echo off
:: Auto-push script (non-interactive, used by the watcher)
:: Does NOT prompt for anything - uses auto-generated commit messages with timestamp

title Auto-Push Pipeline
cd /d "%~dp0"

echo ===================================================
echo   Auto-Push: Checking for changes...
echo ===================================================

:: Check for changes via git status --porcelain
git status --porcelain > "%TEMP%\git_status_auto.tmp" 2>&1
set STATUS_FOUND=0
for /f %%L in ("%TEMP%\git_status_auto.tmp") do set STATUS_FOUND=1
del "%TEMP%\git_status_auto.tmp" 2>nul

if "%STATUS_FOUND%"=="0" (
    echo [SKIP] No changes detected. Nothing to push.
    exit /b 0
)

echo [1/3] Staging all changes...
git add .
if errorlevel 1 ( echo [ERROR] Staging failed. & exit /b 1 )

:: Build commit message with timestamp
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set MYDATE=%%c-%%b-%%a
for /f "tokens=1-2 delims=:. " %%a in ("%time: =0%") do set MYTIME=%%a:%%b
set "commitMsg=Auto-push %MYDATE% %MYTIME%"

echo [2/3] Committing: %commitMsg%
git commit -m "%commitMsg%"
if errorlevel 1 ( echo [ERROR] Commit failed. & exit /b 1 )

echo [3/3] Pushing to GitHub...
git push origin main
if errorlevel 1 ( echo [ERROR] Push failed - check auth + network. & exit /b 1 )

echo ===================================================
echo   SUCCESS: Changes pushed to GitHub.
echo ===================================================
exit /b 0
