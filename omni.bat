@echo off
setlocal

:: Check if Node.js is available
where node >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Get the directory where this batch file is located  
set "SCRIPT_DIR=%~dp0"

:: Check if the CLI file exists
if not exist "%SCRIPT_DIR%bin\cli.js" (
    echo Error: Omniscript CLI not found at %SCRIPT_DIR%bin\cli.js
    echo Please check your Omniscript installation.
    exit /b 1
)

:: Execute the Omniscript CLI
node "%SCRIPT_DIR%bin\cli.js" %*