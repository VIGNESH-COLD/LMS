@echo off
setlocal enabledelayedexpansion
title Learning Management System - Launcher

echo ===================================================
echo     Learning Management System - All-in-One Runner
echo ===================================================
echo.

set "SCRIPT_DIR=%~dp0"

:: 1. Check & Start Ollama
echo [1/3] Checking Ollama AI service...
powershell -NoProfile -Command "if (-not (Get-Process ollama* -ErrorAction SilentlyContinue)) { Start-Process 'ollama' -ArgumentList 'serve' -WindowStyle Hidden; Write-Host 'Started Ollama in background.' } else { Write-Host 'Ollama is already running.' }"

:: 2. Start Backend in separate window
echo [2/3] Starting Spring Boot Backend (Port 8080)...
start "LMS Backend (Port 8080)" cmd /k "cd /d "%SCRIPT_DIR%lms-backend" && .\mvnw.cmd spring-boot:run"

:: 3. Start Frontend in separate window
echo [3/3] Starting Frontend Dev Server (Port 5173)...
start "LMS Frontend (Port 5173)" cmd /k "cd /d "%SCRIPT_DIR%lms-frontend" && npm run dev"

echo.
echo ===================================================
echo All services launched!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8080
echo - Ollama:   http://localhost:11434
echo ===================================================
echo.
echo You can close this launcher window at any time.
echo The services will continue running in their respective windows.
echo.
pause
