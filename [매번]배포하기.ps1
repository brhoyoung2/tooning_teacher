# 투닝 강사 서비스 - 배포
$Host.UI.RawUI.WindowTitle = "투닝 강사 서비스 - 배포"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗"
Write-Host "║       투닝 강사 서비스 - 배포 시작         ║"
Write-Host "╚══════════════════════════════════════════╝"
Write-Host ""

Set-Location $PSScriptRoot

# Git 상태 확인
git status --short
Write-Host ""

# 변경사항 없으면 종료
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
  Write-Host "[알림] 변경된 파일이 없습니다."
  Read-Host "Enter를 눌러 종료"
  exit 0
}

# Code.gs에서 버전 읽기
$VERSION = "unknown"
if (Test-Path "Code.gs") {
  $line = Select-String -Path "Code.gs" -Pattern "const VERSION" | Select-Object -First 1
  if ($line) {
    if ($line.Line -match "'([^']+)'") { $VERSION = $Matches[1] }
  }
}
Write-Host " 배포 버전: $VERSION"
Write-Host ""

# 커밋 메시지 입력
$MSG = Read-Host "커밋 메시지 입력 (Enter = 버전 메시지 자동)"
if ([string]::IsNullOrWhiteSpace($MSG)) { $MSG = "deploy: $VERSION" }

# git add → commit → push
Write-Host ""
Write-Host "[1/3] 변경사항 스테이징..."
git add .

Write-Host "[2/3] 커밋 중..."
git commit -m $MSG

Write-Host "[3/3] GitHub에 푸시 중..."
git push origin main
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "[오류] push 실패. 인터넷 연결 또는 GitHub 권한을 확인하세요."
  Read-Host "Enter를 눌러 종료"
  exit 1
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗"
Write-Host "║  GitHub Push 완료! GitHub Actions가 자동 배포 시작합니다.  ║"
Write-Host "║                                                          ║"
Write-Host "║  배포 진행 상황: 저장소 → Actions 탭에서 확인             ║"
Write-Host "╚══════════════════════════════════════════════════════════╝"
Write-Host ""

# GitHub Actions 페이지 열기
$OPEN = Read-Host "Actions 페이지를 브라우저로 열까요? (Y/N)"
if ($OPEN -eq "Y" -or $OPEN -eq "y") {
  $REPO_URL = git remote get-url origin
  $REPO_URL = $REPO_URL -replace "\.git$", ""
  Start-Process "$REPO_URL/actions"
}

Write-Host ""
Read-Host "Enter를 눌러 종료"
