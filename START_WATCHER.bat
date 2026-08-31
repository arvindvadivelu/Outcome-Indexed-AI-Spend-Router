@echo off
title Auto-Push Watcher
cd /d "%~dp0"
echo ===================================================
echo   Auto-Push File Watcher
echo   Monitors project for changes every 30s
echo   Pushes automatically 15 minutes after a change
echo   Close this window to stop the watcher
echo ===================================================
echo.
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0auto_push_watcher.ps1"
pause
