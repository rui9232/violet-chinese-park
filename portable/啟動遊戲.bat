@echo off
chcp 65001 >nul
title Violet的中文樂園
cd /d "%~dp0"
echo.
echo   正在開啟 Violet的中文樂園 ...
echo   請保持這個黑視窗開著，關掉遊戲就會結束。
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0啟動伺服器.ps1"
if errorlevel 1 (
  echo.
  echo 啟動失敗。這台電腦需要 Windows 10 或更新版本。
  pause
)
