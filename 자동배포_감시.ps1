Set-Location $PSScriptRoot

Write-Host "================================"
Write-Host " 자동 배포 감시 시작"
Write-Host " 파일 수정 후 2분 뒤 자동 배포"
Write-Host " 이 창을 닫으면 자동배포 중단"
Write-Host "================================"
Write-Host ""

$lastChangeTime = $null
$deployed = $true

while ($true) {
    $status = git status --porcelain 2>&1

    if (-not [string]::IsNullOrWhiteSpace($status)) {
        if ($deployed) {
            $lastChangeTime = Get-Date
            $deployed = $false
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 변경 감지. 2분 후 자동 배포..."
        }

        $elapsed = (Get-Date) - $lastChangeTime
        if ($elapsed.TotalSeconds -ge 120) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 배포 시작..."

            git add .

            $version = "unknown"
            if (Test-Path "Code.gs") {
                $line = Select-String -Path "Code.gs" -Pattern "const VERSION" | Select-Object -First 1
                if ($line -and $line.Line -match "'([^']+)'") { $version = $Matches[1] }
            }

            git commit -m "auto: $version"
            git push origin main

            if ($LASTEXITCODE -eq 0) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 배포 완료! ($version)"
                $deployed = $true
            } else {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 배포 실패. 30초 후 재시도..."
                $lastChangeTime = Get-Date
            }
        }
    }

    Start-Sleep -Seconds 30
}
