@echo off
chcp 65001 > nul
title 투닝 강사 서비스 - 초기 설정

echo.
echo ╔══════════════════════════════════════════╗
echo ║     투닝 강사 서비스 - 초기 설정 (1회용)    ║
echo ╚══════════════════════════════════════════╝
echo.

:: Node.js 설치 확인
node -v > nul 2>&1
if %errorlevel% neq 0 (
  echo [오류] Node.js가 설치되어 있지 않습니다.
  echo https://nodejs.org 에서 LTS 버전을 설치 후 다시 실행하세요.
  pause
  exit /b 1
)
echo [OK] Node.js 확인 완료

:: clasp 설치
echo.
echo [1/4] clasp 설치 중...
call npm install -g @google/clasp
echo [OK] clasp 설치 완료

:: Google 로그인
echo.
echo [2/4] Google 계정 로그인
echo      브라우저가 열리면 GAS 프로젝트 소유자 계정으로 로그인하세요.
echo.
call clasp login
echo [OK] 로그인 완료

:: Script ID 입력
echo.
echo [3/4] GAS 스크립트 ID 입력
echo.
echo  ┌─ 스크립트 ID 찾는 방법 ──────────────────────────────┐
echo  │                                                      │
echo  │  GAS 에디터 주소창:                                  │
echo  │  https://script.google.com/home/projects/[ID]/edit  │
echo  │                                [여기가 ID]           │
echo  └──────────────────────────────────────────────────────┘
echo.
set /p SCRIPT_ID="스크립트 ID를 붙여넣고 Enter: "

if "%SCRIPT_ID%"=="" (
  echo [오류] 스크립트 ID를 입력하지 않았습니다.
  pause
  exit /b 1
)

:: .clasp.json 생성
echo {"scriptId": "%SCRIPT_ID%", "rootDir": "."} > .clasp.json
echo [OK] .clasp.json 저장 완료

:: 첫 push 테스트
echo.
echo [4/4] GAS에 코드 업로드 테스트...
call clasp push
if %errorlevel% neq 0 (
  echo.
  echo [오류] push 실패. 스크립트 ID가 올바른지 확인하세요.
  pause
  exit /b 1
)
echo [OK] 코드 업로드 성공!

echo.
echo ╔══════════════════════════════════════════╗
echo ║          초기 설정 완료!                  ║
echo ║  이제 [배포하기.bat] 를 실행하면          ║
echo ║  클릭 한 번으로 배포됩니다.               ║
echo ╚══════════════════════════════════════════╝
echo.
pause
