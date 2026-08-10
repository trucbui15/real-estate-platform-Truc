@echo off
setlocal enabledelayedexpansion
title Cai dat Nha Dat Viet - Lan dau
cd /d "%~dp0"
echo ============================================
echo   CAI DAT LAN DAU - Nha Dat Viet
echo ============================================
echo.
REM ---- 1. Kiem tra Node.js ----
where node >nul 2>nul
if errorlevel 1 (
    echo [LOI] Chua tim thay Node.js. Vui long cai Node.js tai https://nodejs.org roi chay lai file nay.
    pause
    exit /b 1
)
REM ---- 2. Tao file .env neu chua co ----
if not exist ".env" (
    echo Chua co file .env, dang tao...
    echo.
    set /p DBPASS=Nhap MAT KHAU PostgreSQL - user postgres - roi Enter:
    (
        echo DATABASE_URL="postgresql://postgres:!DBPASS!@localhost:5432/real_estate?schema=public"
        echo NEXTAUTH_SECRET="doi-chuoi-nay-random-!RANDOM!!RANDOM!!RANDOM!"
        echo NEXTAUTH_URL="http://localhost:3000"
    ) > .env
    echo Da tao file .env.
) else (
    echo File .env da ton tai, bo qua buoc tao.
)
echo.
REM ---- 3. Cai dat thu vien ----
echo Dang cai dat thu vien, co the mat vai phut, cho den thong bao HOAN TAT...
call npm install
if errorlevel 1 (
    echo [LOI] npm install that bai. Xem loi ben tren.
    pause
    exit /b 1
)
REM ---- 4. Tao database neu chua co, roi tao bang du lieu ----
REM Prisma se tu tao database real_estate tren PostgreSQL neu chua ton tai,
REM khong can psql/pgAdmin, chi can dung mat khau trong file .env.
echo Dang tao database va bang du lieu...
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo.
    echo [LOI] Khong ket noi/tao duoc database. Nguyen nhan thuong gap:
    echo   - Sai mat khau PostgreSQL trong file .env, dong DATABASE_URL
    echo   - Dich vu PostgreSQL chua chay, mo Task Manager, tab Services, tim postgresql-x64...
    echo Sua xong thi xoa file .env roi chay lai file nay.
    pause
    exit /b 1
)
REM ---- 5. Tao du lieu mau ----
echo Dang tao du lieu mau, tai khoan demo...
call npm run prisma:seed
echo.
echo ============================================
echo   HOAN TAT! Bam file chay-ung-dung.bat de mo web.
echo ============================================
pause
