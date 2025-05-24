@echo off
SETLOCAL

REM Lokasi folder proyek, bisa kamu ubah jika ingin di tempat lain
set "PROJECT_DIR=%USERPROFILE%\Documents\bot-topup-maxi"

REM Buat folder proyek
echo Membuat folder proyek di %PROJECT_DIR%
mkdir "%PROJECT_DIR%"
cd /d "%PROJECT_DIR%"

REM Inisialisasi Node.js
echo Inisialisasi npm...
call npm init -y

REM Buat folder struktur
echo Membuat struktur folder...
mkdir helpers
mkdir utils
mkdir services
mkdir controllers
mkdir models
mkdir logs

REM Buat file utama
echo Membuat file utama...
type nul > index.js
type nul > .env
type nul > helpers\digiflazz.js
type nul > helpers\tripay.js
type nul > utils\db.js
type nul > utils\format.js
type nul > services\whatsapp.js
type nul > controllers\topupController.js
type nul > models\transaksiModel.js
type nul > logs\log.txt

echo Proyek bot-topup-maxi berhasil disiapkan!
pause
