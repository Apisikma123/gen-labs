@echo off
title GEN LABS — Local Dev Host
cd /d "%~dp0"

echo ========================================================
echo   GEN LABS - Starting Local Development Host...
echo ========================================================
echo.

node dev.js

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] Gagal menjalankan local host. Pastikan Node.js dan PHP terinstall.
  pause
)
