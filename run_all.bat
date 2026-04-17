@echo off
title Chilli Grading - Both Servers
echo Starting Backend API...

cd backend
start "Backend API" cmd /k "python app.py"

timeout /t
