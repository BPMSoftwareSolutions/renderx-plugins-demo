#!/usr/bin/env pwsh
<#
.SYNOPSIS
Compares catalog data between current build and original branch
.DESCRIPTION
Identifies missing topics, components, and other catalog differences
#>

param(
    [string]$CurrentCatalog = "catalog",
    [string]$OriginalCatalog = "C:\source\repos\bpm\internal\renderx-plugins-demo-fix-ac-to-test-alignment\catalog"
)

function Compare-JsonFiles {
    param([string]$CurrentFile, [string]$OriginalFile, [string]$FileName)

    if (-not (Test-Path $CurrentFile)) {
        Write-Host "[MISSING] in current: $FileName" -ForegroundColor Red
        return
    }

    if (-not (Test-Path $OriginalFile)) {
        Write-Host "[NEW] in current: $FileName" -ForegroundColor Yellow
        return
    }

    try {
        $current = Get-Content $CurrentFile -Raw | ConvertFrom-Json
        $original = Get-Content $OriginalFile -Raw | ConvertFrom-Json

        # Compare top-level keys
        $currentKeys = $current.PSObject.Properties.Name | Sort-Object
        $originalKeys = $original.PSObject.Properties.Name | Sort-Object

        $missing = @($originalKeys | Where-Object { $_ -notin $currentKeys })
        $extra = @($currentKeys | Where-Object { $_ -notin $originalKeys })

        if ($missing.Count -gt 0) {
            Write-Host "[MISSING] keys in $FileName : $($missing -join ', ')" -ForegroundColor Red
        }
        if ($extra.Count -gt 0) {
            Write-Host "[EXTRA] keys in $FileName : $($extra -join ', ')" -ForegroundColor Yellow
        }
        if ($missing.Count -eq 0 -and $extra.Count -eq 0) {
            Write-Host "[OK] $FileName : Keys match" -ForegroundColor Green
        }
    } catch {
        Write-Host "[ERROR] comparing $FileName : $_" -ForegroundColor Yellow
    }
}

Write-Host "========== CATALOG COMPARISON: Current vs Original Branch ==========" -ForegroundColor Cyan

Write-Host "`nComparing JSON files..." -ForegroundColor Cyan

$jsonFiles = @(
    "json-components/components.json",
    "json-interactions/interactions.json",
    "json-topics/topics.json",
    "json-sequences/sequences.json"
)

foreach ($file in $jsonFiles) {
    $currentFile = Join-Path $CurrentCatalog $file
    $originalFile = Join-Path $OriginalCatalog $file
    Compare-JsonFiles $currentFile $originalFile $file
}

Write-Host "`nComparing directory structures..." -ForegroundColor Cyan

$dirs = @("json-components", "json-interactions", "json-topics", "json-sequences")
foreach ($dir in $dirs) {
    $currentDir = Join-Path $CurrentCatalog $dir
    $originalDir = Join-Path $OriginalCatalog $dir

    if (Test-Path $currentDir) {
        $currentCount = (Get-ChildItem $currentDir -File -Recurse).Count
        $originalCount = (Get-ChildItem $originalDir -File -Recurse).Count

        if ($currentCount -eq $originalCount) {
            Write-Host "[OK] $dir : $currentCount files" -ForegroundColor Green
        } else {
            Write-Host "[DIFF] $dir : Current=$currentCount, Original=$originalCount" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nComparison complete!" -ForegroundColor Green

