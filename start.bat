@echo off
echo Starting CMS...
echo.

where node >nul 2>&1 || (
  echo Node.js not found. Please install from https://nodejs.org
  pause
  exit /b 1
)

echo Node.js detected
echo.

cd backend
if not exist .env copy .env.example .env
echo Installing backend dependencies...
npm install --silent

echo Starting backend on http://localhost:4000 ...
start "CMS Backend" cmd /k "node src/index.js"
timeout /t 2 /nobreak >nul

cd ..\frontend
if not exist .env.local copy .env.local.example .env.local
echo Installing frontend dependencies...
npm install --silent

echo.
echo =========================================
echo   CMS is starting!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:4000
echo   Login: admin@example.com / admin123
echo =========================================
echo.

start "CMS Frontend" cmd /k "npm run dev"

echo Both servers started in separate windows.
pause
