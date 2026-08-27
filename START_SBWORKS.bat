@echo off
title SB Works — FreelanceHub Launcher
color 0A

echo.
echo  =====================================================
echo   SB Works ^| FreelanceHub — Starting All Services
echo  =====================================================
echo.
echo  [1/2] Starting Backend Server (Port 6001)...
start "SB Works — Backend (Port 6001)" cmd /k "cd /d C:\Users\ASHISH\OneDrive\Desktop\Freelance\server && node index.js"

timeout /t 3 /nobreak >nul

echo  [2/2] Starting Frontend Dev Server (Port 5173)...
start "SB Works — Frontend (Port 5173)" cmd /k "cd /d C:\Users\ASHISH\OneDrive\Desktop\Freelance\client && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo  =====================================================
echo   Both servers are starting up!
echo.
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:6001
echo  =====================================================
echo.
echo  Opening Chrome in 5 seconds...
timeout /t 5 /nobreak >nul

start chrome http://localhost:5173

echo.
echo  Done! You can close this window.
pause
