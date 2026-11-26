@echo off
setlocal enabledelayedexpansion
title Learning Management System - Launcher

echo ===================================================
echo     Learning Management System - All-in-One Runner
echo ===================================================
echo.

set "SCRIPT_DIR=%~dp0"

:: 1. Start Backend in separate window
echo [1/2] Starting Spring Boot Backend (Port 8080)...
start "LMS Backend (Port 8080)" cmd /k "cd /d "%SCRIPT_DIR%lms-backend" && .\mvnw.cmd spring-boot:run"

:: 2. Start Frontend in separate window
echo [2/2] Starting Frontend Dev Server (Port 5173)...
start "LMS Frontend (Port 5173)" cmd /k "cd /d "%SCRIPT_DIR%lms-frontend" && npm run dev"

echo.
echo ===================================================
echo All services launched!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8080
echo ===================================================
echo.
echo You can close this launcher window at any time.
echo The services will continue running in their respective windows.
echo.
pause
