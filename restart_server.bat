@echo off
echo Stopping existing Node.js processes...
taskkill /f /im node.exe

echo Waiting for processes to stop...
timeout /t 3 /nobreak >nul

echo Starting matchmaking server...
cd /d "e:\Space Drift Arena"
start cmd /k "node server\server.js"

echo Server restart complete!
echo.
echo The matchmaking server should now be running on http://localhost:3000
echo Press any key to close this window...
pause >nul