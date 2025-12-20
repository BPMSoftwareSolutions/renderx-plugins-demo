#!/usr/bin/env pwsh
<#
.SYNOPSIS
Detailed catalog comparison showing file-by-file differences
#>

param(
    [string]$CurrentCatalog = "catalog",
    [string]$OriginalCatalog = "C:\source\repos\bpm\internal\renderx-plugins-demo-fix-ac-to-test-alignment\catalog"
)

function Compare-Directory {
    param([string]$CurrentDir, [string]$OriginalDir, [string]$DirName)
    
    Write-Host "`n=== $DirName ===" -ForegroundColor Cyan
    
    if (Test-Path $CurrentDir) {
        $currentFiles = Get-ChildItem $CurrentDir -File -Recurse | Select-Object -ExpandProperty Name | Sort-Object
        Write-Host "Current ($($currentFiles.Count) files):" -ForegroundColor Green
        $currentFiles | ForEach-Object { Write-Host "  - $_" }
    } else {
        Write-Host "Current: [DIRECTORY NOT FOUND]" -ForegroundColor Red
    }
    
    if (Test-Path $OriginalDir) {
        $originalFiles = Get-ChildItem $OriginalDir -File -Recurse | Select-Object -ExpandProperty Name | Sort-Object
        Write-Host "Original ($($originalFiles.Count) files):" -ForegroundColor Yellow
        $originalFiles | ForEach-Object { Write-Host "  - $_" }
    } else {
        Write-Host "Original: [DIRECTORY NOT FOUND]" -ForegroundColor Red
    }
}

Write-Host "========== DETAILED CATALOG COMPARISON ==========" -ForegroundColor Cyan

$dirs = @(
    @{ Name = "json-components"; Path = "json-components" },
    @{ Name = "json-interactions"; Path = "json-interactions" },
    @{ Name = "json-topics"; Path = "json-topics" },
    @{ Name = "json-sequences"; Path = "json-sequences" }
)

foreach ($dir in $dirs) {
    $currentDir = Join-Path $CurrentCatalog $dir.Path
    $originalDir = Join-Path $OriginalCatalog $dir.Path
    Compare-Directory $currentDir $originalDir $dir.Name
}

Write-Host "`nComparison complete!" -ForegroundColor Green

