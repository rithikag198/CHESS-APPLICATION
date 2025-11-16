@echo off
echo Chess Application - GitHub Setup Script
echo ========================================
echo.

REM This script will help you push your chess application to GitHub
REM Make sure you have already created the repository on GitHub!

echo Please follow these steps:
echo 1. Go to github.com and create a new repository named "chess-application"
echo 2. Copy the repository URL (https://github.com/YOUR_USERNAME/chess-application.git)
echo 3. Paste the URL below when prompted
echo.

set /p REPO_URL="Enter your GitHub repository URL: "

echo.
echo Setting up GitHub connection...
git remote add origin %REPO_URL%

echo.
echo Pushing to GitHub...
git push -u origin master

echo.
echo ✅ Your chess application is now on GitHub!
echo.
echo Next steps:
echo 1. Visit your repository on GitHub
echo 2. Pin it to your profile
echo 3. Add it to your portfolio
echo.

pause
