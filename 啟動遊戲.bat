@echo off
chcp 65001 >nul
title Violet的中文樂園
cd /d "%~dp0獨屬於Violet"
if not exist "啟動遊戲.bat" (
  echo 找不到「獨屬於Violet」資料夾，請重新下載完整倉庫。
  pause
  exit /b 1
)
call "啟動遊戲.bat"
