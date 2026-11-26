# Learning Management System - All-in-One Runner
$ErrorActionPreference = "Continue"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    Learning Management System - Launcher" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

# 1. Start Backend
Write-Host "[1/2] Launching Spring Boot Backend on port 8080..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$root\lms-backend`" && .\mvnw.cmd spring-boot:run" -WorkingDirectory "$root\lms-backend"

# 2. Start Frontend
Write-Host "[2/2] Launching Frontend Dev Server on port 5173..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$root\lms-frontend`" && npm run dev" -WorkingDirectory "$root\lms-frontend"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "All services started successfully!" -ForegroundColor Green
Write-Host "  * Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "  * Backend  : http://localhost:8080" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""
