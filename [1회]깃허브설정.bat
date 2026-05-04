@echo off
chcp 65001 > nul
title 투닝 강사 서비스 - GitHub 초기 설정

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║     투닝 강사 서비스 - GitHub 초기 설정 (1회용)    ║
echo ╚══════════════════════════════════════════════════╝
echo.

:: Node.js 확인
node -v > nul 2>&1
if %errorlevel% neq 0 (
  echo [오류] Node.js가 없습니다. https://nodejs.org 에서 설치하세요.
  pause & exit /b 1
)
echo [OK] Node.js 확인

:: Git 확인
git --version > nul 2>&1
if %errorlevel% neq 0 (
  echo [오류] Git이 없습니다. https://git-scm.com 에서 설치하세요.
  pause & exit /b 1
)
echo [OK] Git 확인

:: clasp 설치
echo.
echo [1/5] clasp 설치 중...
call npm install -g @google/clasp
echo [OK] clasp 설치 완료

:: Google 로그인
echo.
echo [2/5] Google 계정 로그인
echo      브라우저가 열리면 GAS 프로젝트 소유자 계정으로 로그인하세요.
echo.
call clasp login
echo [OK] 로그인 완료

:: Script ID 입력
echo.
echo [3/5] GAS 스크립트 ID 입력
echo.
echo  GAS 에디터 주소창에서 복사:
echo  https://script.google.com/home/projects/[여기]/edit
echo.
set /p SCRIPT_ID="스크립트 ID: "
echo {"scriptId": "%SCRIPT_ID%", "rootDir": "."} > .clasp.json
echo [OK] .clasp.json 저장

:: GitHub 레포 주소 입력
echo.
echo [4/5] GitHub 저장소 연결
echo.
echo  GitHub에서 새 저장소(repository)를 먼저 만들어주세요.
echo  https://github.com/new
echo.
set /p REPO_URL="GitHub 저장소 URL (예: https://github.com/user/repo.git): "

:: Git 초기화
git init
git add .
git commit -m "feat: 초기 커밋 - 투닝 강사 시간등록 서비스"
git branch -M main
git remote add origin %REPO_URL%
git push -u origin main
echo [OK] GitHub 업로드 완료

:: CLASPRC_JSON 시크릿 안내
echo.
echo [5/5] GitHub Secret 등록 안내
echo.
echo ┌─────────────────────────────────────────────────────────────┐
echo │  GitHub Actions가 GAS에 배포하려면 인증키가 필요합니다.       │
echo │                                                             │
echo │  아래 명령어로 인증키 내용을 확인하세요:                      │
echo │                                                             │
echo │    type "%USERPROFILE%\.clasprc.json"                       │
echo │                                                             │
echo │  그 내용을 GitHub 시크릿에 등록하세요:                       │
echo │    저장소 → Settings → Secrets → Actions →                  │
echo │    [New repository secret]                                  │
echo │    Name: CLASPRC_JSON                                       │
echo │    Value: (위 명령어로 나온 내용 전체 붙여넣기)               │
echo └─────────────────────────────────────────────────────────────┘
echo.
echo 인증키 내용 자동 출력:
type "%USERPROFILE%\.clasprc.json"
echo.
echo.
echo ╔══════════════════════════════════════════════════╗
echo ║  설정 완료! 위 내용을 GitHub Secret에 등록하면   ║
echo ║  [배포하기.bat] 실행만으로 자동 배포됩니다.       ║
echo ╚══════════════════════════════════════════════════╝
echo.
pause
