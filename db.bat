@echo off
:: BatchGotLinuxPath
set PYTHONPATH=%PYTHONPATH%;C:\Python39
:: EndBatchGotLinuxPath

:Start
color 0B
echo Welcome to DQ Dashboard!
title Dashboard

python C:\Users\jeria\Desktop\Dashboard\app.py

:Menu
echo.
echo Application has closed.
echo What would you like to do next?
echo 1. Relaunch Dashboard
echo 2. Close

set /p choice=Select an option (1 or 2): 

if "%choice%"=="1" (
    goto Start
) else (
    exit
)
