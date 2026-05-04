# 투닝 강사 서비스 - GitHub 초기 설정 (1회용)
$Host.UI.RawUI.WindowTitle = "투닝 강사 서비스 - GitHub 초기 설정"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗"
Write-Host "║     투닝 강사 서비스 - GitHub 초기 설정 (1회용)    ║"
Write-Host "╚══════════════════════════════════════════════════╝"
Write-Host ""

# Node.js 확인
try { node -v 2>&1 | Out-Null; Write-Host "[OK] Node.js 확인" }
catch {
  Write-Host "[오류] Node.js가 없습니다. https://nodejs.org 에서 설치하세요."
  pause; exit 1
}

# Git 확인
try { git --version 2>&1 | Out-Null; Write-Host "[OK] Git 확인" }
catch {
  Write-Host "[오류] Git이 없습니다. https://git-scm.com 에서 설치하세요."
  pause; exit 1
}

# clasp 설치
Write-Host ""
Write-Host "[1/5] clasp 설치 중..."
npm install -g @google/clasp
Write-Host "[OK] clasp 설치 완료"

# Google 로그인
Write-Host ""
Write-Host "[2/5] Google 계정 로그인"
Write-Host "      브라우저가 열리면 GAS 프로젝트 소유자 계정으로 로그인하세요."
Write-Host ""
clasp login
Write-Host "[OK] 로그인 완료"

# Script ID 입력
Write-Host ""
Write-Host "[3/5] GAS 스크립트 ID 입력"
Write-Host ""
Write-Host " GAS 에디터 주소창에서 복사:"
Write-Host " https://script.google.com/home/projects/[여기]/edit"
Write-Host ""
$SCRIPT_ID = Read-Host "스크립트 ID를 붙여넣고 Enter"

if ([string]::IsNullOrWhiteSpace($SCRIPT_ID)) {
  Write-Host "[오류] 스크립트 ID를 입력하지 않았습니다."
  pause; exit 1
}

'{"scriptId": "' + $SCRIPT_ID + '", "rootDir": "."}' | Out-File -FilePath ".clasp.json" -Encoding utf8 -NoNewline
Write-Host "[OK] .clasp.json 저장 완료"

# GitHub 저장소 입력
Write-Host ""
Write-Host "[4/5] GitHub 저장소 연결"
Write-Host ""
Write-Host " GitHub에서 새 저장소(repository)를 먼저 만들어주세요."
Write-Host " https://github.com/new"
Write-Host ""
$REPO_URL = Read-Host "GitHub 저장소 URL (예: https://github.com/user/repo.git)"

# Git 초기화 및 푸시
git init
git add .
git commit -m "feat: 초기 커밋 - 투닝 강사 시간등록 서비스"
git branch -M main
git remote add origin $REPO_URL
git push -u origin main
Write-Host "[OK] GitHub 업로드 완료"

# CLASPRC_JSON 안내
Write-Host ""
Write-Host "[5/5] GitHub Secret 등록 안내"
Write-Host ""
Write-Host "┌─────────────────────────────────────────────────────────────┐"
Write-Host "│  아래 내용을 GitHub Secret에 등록하세요:                      │"
Write-Host "│                                                              │"
Write-Host "│  저장소 → Settings → Secrets and variables → Actions         │"
Write-Host "│  → New repository secret                                     │"
Write-Host "│     Name:  CLASPRC_JSON                                      │"
Write-Host "│     Value: (아래 출력된 내용 전체 복사해서 붙여넣기)           │"
Write-Host "└─────────────────────────────────────────────────────────────┘"
Write-Host ""
Write-Host "▼▼▼ 아래 내용 전체를 복사하세요 ▼▼▼"
Write-Host ""
$clasprcPath = "$env:USERPROFILE\.clasprc.json"
if (Test-Path $clasprcPath) {
  Get-Content $clasprcPath
} else {
  Write-Host "[오류] .clasprc.json 파일이 없습니다. clasp login을 다시 실행하세요."
}
Write-Host ""
Write-Host "▲▲▲ 여기까지 복사 ▲▲▲"
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗"
Write-Host "║  설정 완료! 위 내용을 GitHub Secret에 등록하면   ║"
Write-Host "║  [배포하기.ps1] 실행만으로 자동 배포됩니다.       ║"
Write-Host "╚══════════════════════════════════════════════════╝"
Write-Host ""
Read-Host "Enter를 눌러 종료"
