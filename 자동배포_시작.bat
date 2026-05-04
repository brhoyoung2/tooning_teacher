@echo off
start "자동배포 감시중" /min powershell -ExecutionPolicy Bypass -File "%~dp0자동배포_감시.ps1"
