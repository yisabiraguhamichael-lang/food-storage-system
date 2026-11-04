@echo off
setlocal
set "ROOT=%~dp0"

if not exist "%ROOT%backend\.env" (
  echo Backend configuration is missing: backend\.env
  echo Copy backend\.env.example to backend\.env and configure your PostgreSQL settings.
  pause
  exit /b 1
)

if not exist "%ROOT%backend\node_modules\express\package.json" (
  echo Backend dependencies are missing. Run "npm install" in the backend folder.
  pause
  exit /b 1
)

if not exist "%ROOT%frontend\node_modules\vite\package.json" (
  echo Frontend dependencies are missing. Run "npm install" in the frontend folder.
  pause
  exit /b 1
)

start "FreshKeep Backend" /D "%ROOT%backend" cmd /k npm run dev
start "FreshKeep Frontend" /D "%ROOT%frontend" cmd /k npm run dev -- --strictPort
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"
