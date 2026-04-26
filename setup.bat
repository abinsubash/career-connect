@echo off
REM ========================================
REM CAREERCONNECT - ONE-CLICK SETUP
REM ========================================
REM
REM Master setup script for the entire project
REM Installs both backend and frontend
REM
REM Usage: Just double-click this file!
REM ========================================

echo.
echo ========================================
echo   CareerConnect - Complete Setup
echo ========================================
echo.
echo Setting up Backend and Frontend...
echo.

REM Setup Backend
echo.
echo *** Setting up BACKEND (Flask) ***
cd backend
call setup.bat
cd ..

REM Setup Frontend
echo.
echo *** Setting up FRONTEND (React) ***
cd frontend
call setup.bat
cd ..

echo.
echo ========================================
echo   All Setup Complete! ✅
echo ========================================
echo.
echo Next Steps:
echo   1. Open TWO terminal windows
echo   2. Terminal 1 (Backend):
echo      - cd backend
echo      - .venv\Scripts\activate
echo      - python run.py
echo   3. Terminal 2 (Frontend):
echo      - cd frontend
echo      - npm run dev
echo.
pause
