@echo off
echo Space Drift Arena - Deployment Script
echo ======================================

echo.
echo 1. Starting local development server...
echo Opening game in browser...
start "" "http://localhost:8000"

echo.
echo 2. To deploy to GitHub Pages:
echo    - Create a GitHub repository
echo    - Push your files to the repository
echo    - Enable GitHub Pages in repository settings

echo.
echo 3. To deploy to itch.io:
echo    - Create an account at https://itch.io
echo    - Upload all game files
echo    - Set index.html as the launch file

echo.
echo 4. For live streaming development:
echo    - Use OBS Studio with browser source
echo    - Point to http://localhost:8000
echo    - Recommended resolution: 1920x1080 at 60 FPS

echo.
echo Press any key to exit...
pause >nul