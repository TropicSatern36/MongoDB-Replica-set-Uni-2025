@echo off
setlocal enabledelayedexpansion

REM ==== Config ====
set "ENV_FILE=mongo-cluster.env"

REM ==== Check env file ====
if not exist "%ENV_FILE%" (
    echo ❌ Missing %ENV_FILE% file! Exiting.
    exit /b 1
)

REM ==== Load environment variables from .env ====
for /f "usebackq tokens=1* delims== eol=#" %%A in ("%ENV_FILE%") do (
    if not "%%A"=="" (
        set "%%A=%%B"
    )
)

REM ==== Check required env vars ====
for %%V in (MONGO_VOLUME_1 MONGO_VOLUME_2 MONGO_VOLUME_3 MONGO_VOLUME_4 MONGO_VOLUME_5) do (
    if "!%%V!"=="" (
        echo ERROR: %%V is not set in %ENV_FILE%.
        exit /b 1
    )
)

REM ==== Convert relative paths to absolute ====
for %%V in (MONGO_VOLUME_1 MONGO_VOLUME_2 MONGO_VOLUME_3 MONGO_VOLUME_4 MONGO_VOLUME_5) do (
    call :abs_path "!%%V!" absPath
    set "%%V=!absPath!"
)

REM ==== Stop and remove Docker containers ====
echo 🛑 Stopping and removing Docker containers...
docker compose --env-file %ENV_FILE% down

REM ==== Remove volume directories ====
echo 🗑️ Removing MongoDB volume directories...
for %%D in ("%MONGO_VOLUME_1%" "%MONGO_VOLUME_2%" "%MONGO_VOLUME_3%" "%MONGO_VOLUME_4%" "%MONGO_VOLUME_5%") do (
    if exist %%D (
        echo Removing %%D
        rmdir /s /q "%%D"
    ) else (
        echo Skipped: %%D (does not exist)
    )
)

echo ✅ Cleanup complete.
endlocal
exit /b

REM ==== Helper: Convert path to absolute ====
:abs_path
pushd "%~1" >nul 2>&1
if errorlevel 1 (
    set "curdir=%cd%"
    popd >nul
    set "abs=%curdir%\%~1"
) else (
    set "abs=%cd%"
    popd >nul
)
set "%2=%abs%"
exit /b
