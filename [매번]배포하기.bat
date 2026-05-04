@echo off
chcp 65001 > nul
title 투닝 강사 서비스 - 배포

echo.
echo ╔══════════════════════════════════════════╗
echo ║       투닝 강사 서비스 - 배포 시작         ║
echo ╚══════════════════════════════════════════╝
echo.

:: Git 상태 확인
git status --short
echo.

:: 변경사항 없으면 종료
git diff --quiet HEAD 2>nul
git status --porcelain > tmp_status.txt
set /p STATUS_CHECK=<tmp_status.txt
del tmp_status.txt
if "%STATUS_CHECK%"=="" (
  echo [알림] 변경된 파일이 없습니다.
  pause & exit /b 0
)

:: Code.gs에서 버전 읽기
set VERSION=unknown
for /f "tokens=3 delims= '" %%a in ('findstr "const VERSION" Code.gs') do set VERSION=%%a
echo  배포 버전: %VERSION%
echo.

:: 커밋 메시지 입력
set /p MSG="커밋 메시지 입력 (Enter = 버전 메시지 자동): "
if "%MSG%"=="" set MSG=deploy: %VERSION%

:: git add → commit → push
echo.
echo [1/3] 변경사항 스테이징...
git add .

echo [2/3] 커밋 중...
git commit -m "%MSG%"

echo [3/3] GitHub에 푸시 중...
git push origin main
if %errorlevel% neq 0 (
  echo.
  echo [오류] push 실패. 인터넷 연결 또는 GitHub 권한을 확인하세요.
  pause & exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  GitHub Push 완료! GitHub Actions가 자동 배포 시작합니다.  ║
echo ║                                                          ║
echo ║  배포 진행 상황 확인:                                     ║
echo ║  GitHub 저장소 → Actions 탭                              ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

:: GitHub Actions 페이지 열기 여부
set /p OPEN="Actions 페이지를 브라우저로 열까요? (Y/N): "
if /i "%OPEN%"=="Y" (
  for /f "tokens=*" %%a in ('git remote get-url origin') do set REPO_URL=%%a
  set REPO_URL=%REPO_URL:.git=%
  start %REPO_URL%/actions
)

echo.
pause
