@echo off
echo ========================================
echo Automated Git Deployment Script
echo ========================================
echo.

REM Remove git lock file if it exists
if exist .git\index.lock (
    echo Removing git lock file...
    del /f .git\index.lock
    echo Lock file removed.
    echo.
)

REM Pull latest changes
echo Pulling latest changes from GitHub...
git pull origin main --rebase
if errorlevel 1 (
    echo Main branch failed, trying master...
    git pull origin master --rebase
)
echo.

REM Build the project
echo Building the project...
call npm run build
if errorlevel 1 (
    echo Build failed! Please fix the errors before deploying.
    pause
    exit /b 1
)
echo Build successful!
echo.

REM Add all files
echo Adding all files...
git add -A
echo.

REM Commit changes
echo Committing changes...
git commit -m "Deploy: %date% %time%"
echo.

REM Push to GitHub
echo Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo Main branch failed, trying master...
    git push origin master
)
if errorlevel 1 (
    echo Normal push failed, trying force push...
    git push origin main --force
    if errorlevel 1 (
        git push origin master --force
    )
)

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
pause
