@echo off
REM ========================================
REM SETUP SCRIPT FOR CAREERCONNECT FRONTEND
REM ========================================
REM
REM This script sets up the React frontend with
REM one click - installs all node packages
REM
REM Usage: Just run this script
REM ========================================

echo.
echo ========================================
echo   CareerConnect Frontend Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo Download the LTS version and run the installer
    pause
    exit /b 1
)

echo [1/2] Checking Node.js installation...
node --version
echo.

REM Install npm packages
echo [2/2] Installing packages from package.json...
npm install

if errorlevel 1 (
    echo.
    echo ERROR: Installation failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Setup Complete! ✅
echo ========================================
echo.
echo Your React frontend is ready to use!
echo.
echo To run the development server:
echo   1. Open PowerShell/Terminal in this folder
echo   2. Run: npm run dev
echo.
pause
