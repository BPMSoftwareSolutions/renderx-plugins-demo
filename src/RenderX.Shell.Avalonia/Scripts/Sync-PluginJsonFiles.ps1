# Sync-PluginJsonFiles-Robocopy.ps1
# Copies JSON files from desktop plugins to the shell's plugins directory using robocopy
# This mirrors the web version's sync-json-sequences.js and related scripts

param(
    [string]$SourceRoot = (Join-Path $PSScriptRoot ".." ".."),
    [string]$TargetRoot = (Join-Path $PSScriptRoot ".." "plugins")
)

Write-Host "Syncing plugin JSON files..." -ForegroundColor Cyan
Write-Host "   Source: $SourceRoot" -ForegroundColor Gray
Write-Host "   Target: $TargetRoot" -ForegroundColor Gray
Write-Host ""

# Ensure target directories exist
$jsonSequencesTarget = Join-Path $TargetRoot "json-sequences"
$jsonTopicsTarget = Join-Path $TargetRoot "json-topics"
$jsonComponentsTarget = Join-Path $TargetRoot "json-components"

New-Item -ItemType Directory -Force -Path $jsonSequencesTarget | Out-Null
New-Item -ItemType Directory -Force -Path $jsonTopicsTarget | Out-Null
New-Item -ItemType Directory -Force -Path $jsonComponentsTarget | Out-Null

# Track statistics
$totalFiles = 0

# Function to copy using robocopy
function Copy-WithRobocopy {
    param(
        [string]$Source,
        [string]$Target,
        [string]$PluginName
    )
    
    if (Test-Path $Source) {
        # Use robocopy: /E = copy subdirectories including empty, /NFL = no file list, /NDL = no directory list, /NJH = no job header, /NJS = no job summary, /NP = no progress
        $result = robocopy $Source $Target *.json /E /NFL /NDL /NJH /NJS /NP 2>&1
        
        # Robocopy exit codes: 0-7 are success (0=no files, 1=files copied, 2=extra files, 3=mismatches, etc.)
        if ($LASTEXITCODE -lt 8) {
            # Count files in target
            $count = (Get-ChildItem -Path $Target -Recurse -File -Filter "*.json" -ErrorAction SilentlyContinue).Count
            if ($count -gt 0) {
                Write-Host "   OK $PluginName : $count files" -ForegroundColor Green
            }
            return $count
        } else {
            Write-Host "   ERROR $PluginName : robocopy failed with exit code $LASTEXITCODE" -ForegroundColor Red
            return 0
        }
    }
    
    return 0
}

# Copy from Canvas plugin
$canvasSeqTarget = Join-Path $jsonSequencesTarget "canvas-component"
$canvasSeq = Copy-WithRobocopy `
    -Source (Join-Path (Join-Path $SourceRoot "RenderX.Plugins.Canvas") "json-sequences\canvas-component") `
    -Target $canvasSeqTarget `
    -PluginName "Canvas sequences"
$totalFiles += $canvasSeq

$canvasTopicTarget = Join-Path $jsonTopicsTarget "canvas-component"
$canvasTopic = Copy-WithRobocopy `
    -Source (Join-Path (Join-Path $SourceRoot "RenderX.Plugins.Canvas") "json-topics") `
    -Target $canvasTopicTarget `
    -PluginName "Canvas topics"
$totalFiles += $canvasTopic

# Copy from ControlPanel plugin
$cpSeqTarget = Join-Path $jsonSequencesTarget "control-panel"
$cpSeq = Copy-WithRobocopy `
    -Source (Join-Path (Join-Path $SourceRoot "RenderX.Plugins.ControlPanel") "json-sequences") `
    -Target $cpSeqTarget `
    -PluginName "ControlPanel sequences"
$totalFiles += $cpSeq

$cpTopicTarget = Join-Path $jsonTopicsTarget "control-panel"
$cpTopic = Copy-WithRobocopy `
    -Source (Join-Path (Join-Path $SourceRoot "RenderX.Plugins.ControlPanel") "json-topics") `
    -Target $cpTopicTarget `
    -PluginName "ControlPanel topics"
$totalFiles += $cpTopic

# Copy from Header plugin
$headerSeqTarget = Join-Path $jsonSequencesTarget "header"
$headerSeq = Copy-WithRobocopy `
    -Source (Join-Path (Join-Path $SourceRoot "RenderX.Plugins.Header") "json-sequences\header") `
    -Target $headerSeqTarget `
    -PluginName "Header sequences"
$totalFiles += $headerSeq

# Copy from Library plugin (both library and library-component)
$libSeqTarget = Join-Path $jsonSequencesTarget "library"
$libSeq = Copy-WithRobocopy `
    -Source (Join-Path (Join-Path $SourceRoot "RenderX.Plugins.Library") "json-sequences\library") `
    -Target $libSeqTarget `
    -PluginName "Library sequences"
$totalFiles += $libSeq

$libCompSeqTarget = Join-Path $jsonSequencesTarget "library-component"
$libCompSeq = Copy-WithRobocopy `
    -Source (Join-Path (Join-Path $SourceRoot "RenderX.Plugins.Library") "json-sequences\library-component") `
    -Target $libCompSeqTarget `
    -PluginName "Library-component sequences"
$totalFiles += $libCompSeq

# Copy from Components plugin
$compFiles = Copy-WithRobocopy `
    -Source (Join-Path (Join-Path $SourceRoot "RenderX.Plugins.Components") "json-components") `
    -Target $jsonComponentsTarget `
    -PluginName "Components"
$totalFiles += $compFiles

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   Total: $totalFiles files copied" -ForegroundColor White
Write-Host ""
Write-Host "Plugin JSON files synced successfully!" -ForegroundColor Green

