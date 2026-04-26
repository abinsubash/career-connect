@echo off
REM ========================================
REM SETUP SCRIPT FOR CAREERCONNECT BACKEND
REM ========================================
REM
REM This script sets up the Flask backend with
REM one click - creates venv and installs all
REM packages from requirements.txt
REM
REM Usage: Just run this script and follow prompts
REM ========================================

echo.
echo ========================================
echo   CareerConnect Backend Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo [1/4] Checking Python installation...
python --version
echo.

REM Create virtual environment
if not exist ".venv" (
    echo [2/4] Creating virtual environment...
    python -m venv .venv
    echo Virtual environment created!
) else (
    echo [2/4] Virtual environment already exists, skipping creation...
)
echo.

REM Activate virtual environment
echo [3/4] Activating virtual environment...
call .venv\Scripts\activate.bat
echo Virtual environment activated!
echo.

REM Install requirements
echo [4/4] Installing packages from requirements.txt...
pip install -r requirements.txt

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
echo Your Flask backend is ready to use!
echo.
echo To run the server:
echo   1. Open PowerShell/Terminal in this folder
echo   2. Run: .venv\Scripts\activate
echo   3. Run: python run.py
echo.
pause
