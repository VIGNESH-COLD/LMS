@echo off
setlocal
title Learning Management System - Shutdown

echo ===================================================
echo     Learning Management System - Shutdown
echo ===================================================
echo.

echo Stopping processes on ports 8080 (backend) and 5173 (frontend)...
powershell -NoProfile -Command "
$ports = 8080, 5173
foreach ($p in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conns) {
        $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $pids) {
            if ($procId -gt 0) {
                Write-Host ('Stopping process ID ' + $procId + ' on port ' + $p + '...')
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
    } else {
        Write-Host ('Port ' + $p + ' is already clear.')
    }
}
Write-Host 'Done!' -ForegroundColor Green
"

echo.
echo All LMS servers have been stopped.
echo.
pause
