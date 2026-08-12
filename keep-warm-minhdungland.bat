@echo off
title Giu am Website minhdungland.com.vn
echo ----------------------------------------------------
echo Dang gui request giu am website minhdungland.com.vn...
echo ----------------------------------------------------

curl -s -I -A "Mozilla/5.0 KeepAlivePing" https://minhdungland.com.vn > nul

if %errorlevel% equ 0 (
    echo [THANH CONG] Website minhdungland.com.vn dang hoat dong tot!
) else (
    echo [CHO NGHIA] Dang thu lai voi domain vercel...
    curl -s -I https://real-estate-platform-truc-fq4x.vercel.app > nul
)

echo ----------------------------------------------------
echo Hoan thanh giu am! Tu dong dong sau 3 giay...
timeout /t 3 > nul
