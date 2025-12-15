@echo off
echo Creating zip file for itch.io publication...
powershell "Compress-Archive -Path 'assets', 'styles', 'js', 'index.html', 'favicon.svg', 'README.md' -DestinationPath 'Space-Drift-Arena-itchio.zip' -Force"
echo Zip file created successfully!
pause