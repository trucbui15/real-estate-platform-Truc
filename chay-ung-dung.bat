@echo off
title Nha Dat Viet - Dang chay
cd /d "%~dp0"
if not exist ".env" (
    echo [LOI] Chua cai dat lan dau. Vui long bam file cai-dat-lan-dau.bat truoc.
    pause
    exit /b 1
)
echo Dang khoi dong ung dung, cho vai giay...
start "" cmd /c "timeout /t 5 >nul && start http://localhost:3000"
call npm run dev
pause
