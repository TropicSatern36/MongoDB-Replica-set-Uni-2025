@echo off
setlocal enabledelayedexpansion

REM ==== Config ====
set "ENV_FILE=mongo-cluster.env"

REM ==== Check env file ====
if not exist "%ENV_FILE%" (
    echo Missing %ENV_FILE% file! Exiting.
    exit /b 1
)

REM ==== Load environment variables from .env ====
for /f "usebackq tokens=1* delims== eol=#" %%A in ("%ENV_FILE%") do (
    if not "%%A"=="" (
        set "%%A=%%B"
    )
)

echo Environment variables loaded:
for /f "usebackq tokens=1* delims==" %%V in ("%ENV_FILE%") do (
    echo    %%V=%%W
)

REM ==== Check required env vars ====
if "%MONGO_VOLUME_1%"=="" (
    echo ERROR: MONGO_VOLUME_1 is not set in %ENV_FILE%.
    exit /b 1
)
if "%MONGO_VOLUME_2%"=="" (
    echo ERROR: MONGO_VOLUME_2 is not set in %ENV_FILE%.
    exit /b 1
)
if "%MONGO_VOLUME_3%"=="" (
    echo ERROR: MONGO_VOLUME_3 is not set in %ENV_FILE%.
    exit /b 1
)
if "%MONGO_VOLUME_4%"=="" (
    echo ERROR: MONGO_VOLUME_4 is not set in %ENV_FILE%.
    exit /b 1
)
if "%MONGO_VOLUME_5%"=="" (
    echo ERROR: MONGO_VOLUME_5 is not set in %ENV_FILE%.
    exit /b 1
)

REM ==== Convert relative paths to absolute ====
for %%V in (MONGO_VOLUME_1 MONGO_VOLUME_2 MONGO_VOLUME_3 MONGO_VOLUME_4 MONGO_VOLUME_5) do (
  call :abs_path "!%%V!" absPath
  set "%%V=!absPath!"
)

REM ==== Create volume directories ====
echo Creating MongoDB volume directories...
if not exist "%MONGO_VOLUME_1%" mkdir "%MONGO_VOLUME_1%"
if not exist "%MONGO_VOLUME_2%" mkdir "%MONGO_VOLUME_2%"
if not exist "%MONGO_VOLUME_3%" mkdir "%MONGO_VOLUME_3%"
if not exist "%MONGO_VOLUME_4%" mkdir "%MONGO_VOLUME_4%"
if not exist "%MONGO_VOLUME_5%" mkdir "%MONGO_VOLUME_5%"
echo Volume directories created: %MONGO_VOLUME_1%, %MONGO_VOLUME_2%, %MONGO_VOLUME_3%, %MONGO_VOLUME_4%, %MONGO_VOLUME_5%

REM ==== Run Docker Compose ====
echo Starting MongoDB containers...
docker compose --env-file %ENV_FILE% up -d
echo MongoDB containers started.

REM ==== Wait for mongo1 to be ready ====
echo Waiting for mongo1 to become ready...
timeout /t 10 >nul
echo mongo1 is ready to accept connections.

REM ==== Initiate replica set ====
echo Initiating replica set...
docker exec mongo1 mongo --eval ^
"rs.initiate({^
  _id: 'myReplicaSet',^
  members: [^
    { _id: 0, host: 'mongo1:27017' },^
    { _id: 1, host: 'mongo2:27017' },^
    { _id: 2, host: 'mongo3:27017' },^
    { _id: 3, host: 'mongo4:27017' },^
    { _id: 4, host: 'mongo5:27017' }^
  ]^
})"
echo MongoDB replica set initialized successfully!

pause
endlocal
exit /b

REM ==== Helper function: convert path to absolute ====
:abs_path
REM %1 = input path
REM %2 = output variable name
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
