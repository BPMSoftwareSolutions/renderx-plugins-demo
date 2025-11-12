# Sync-PluginJsonFiles.ps1
# DATA-DRIVEN: Reads plugin-manifest.json and automatically syncs JSON files from all plugins
# This mirrors the web version's sync-json-sequences.js and related scripts

param(
    [string]$SourceRoot = (Join-Path (Join-Path $PSScriptRoot "..") ".."),
    [string]$TargetRoot = (Join-Path (Join-Path $PSScriptRoot "..") "plugins"),
    [string]$ManifestPath = (Join-Path (Join-Path (Join-Path $PSScriptRoot "..") "plugins") "plugin-manifest.json")
)

Write-Host "Syncing plugin JSON files (manifest-driven)..." -ForegroundColor Cyan
Write-Host "   Manifest: $ManifestPath" -ForegroundColor Gray
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
$processedPlugins = @{}

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

# Function to derive plugin project name from DLL name
function Get-PluginProjectName {
    param([string]$DllName)
    # Remove .dll extension: "RenderX.Plugins.Canvas.dll" -> "RenderX.Plugins.Canvas"
    return $DllName -replace '\.dll$', ''
}

# Function to derive kebab-case name from plugin ID
function Get-KebabCaseName {
    param([string]$PluginId)
    # Convert PascalCase to kebab-case: "CanvasComponentPlugin" -> "canvas-component"
    # Remove "Plugin" suffix first
    $name = $PluginId -replace 'Plugin$', ''
    # Insert hyphens before capitals and convert to lowercase
    $kebab = $name -creplace '([A-Z])', '-$1'
    $kebab = $kebab.Trim('-').ToLower()
    return $kebab
}

# Read and parse the manifest
if (-not (Test-Path $ManifestPath)) {
    Write-Host "ERROR: Plugin manifest not found at $ManifestPath" -ForegroundColor Red
    exit 1
}

$manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json

# Process each plugin in the manifest
foreach ($plugin in $manifest.plugins) {
    $pluginId = $plugin.id
    $dllName = $null

    # Get DLL name from runtime.module (preferred) or ui.module
    if ($plugin.runtime -and $plugin.runtime.module) {
        $dllName = $plugin.runtime.module
    } elseif ($plugin.ui -and $plugin.ui.module) {
        $dllName = $plugin.ui.module
    }

    if (-not $dllName) {
        Write-Host "   SKIP $pluginId : No module specified" -ForegroundColor Yellow
        continue
    }

    # Derive project name from DLL
    $projectName = Get-PluginProjectName -DllName $dllName

    # Skip if we've already processed this project (multiple plugins can share a DLL)
    if ($processedPlugins.ContainsKey($projectName)) {
        continue
    }
    $processedPlugins[$projectName] = $true

    $projectPath = Join-Path $SourceRoot $projectName

    if (-not (Test-Path $projectPath)) {
        Write-Host "   SKIP $projectName : Project directory not found" -ForegroundColor Yellow
        continue
    }

    # Derive kebab-case name for subdirectories
    $kebabName = Get-KebabCaseName -PluginId $pluginId

    # Check for json-sequences directory
    $jsonSeqPath = Join-Path $projectPath "json-sequences"
    if (Test-Path $jsonSeqPath) {
        # Check if there's a subdirectory matching the kebab name
        $jsonSeqSubPath = Join-Path $jsonSeqPath $kebabName
        if (Test-Path $jsonSeqSubPath) {
            $seqTarget = Join-Path $jsonSequencesTarget $kebabName
            $count = Copy-WithRobocopy -Source $jsonSeqSubPath -Target $seqTarget -PluginName "$projectName sequences"
            $totalFiles += $count
        } else {
            # Copy all sequences directly
            $seqTarget = Join-Path $jsonSequencesTarget $kebabName
            $count = Copy-WithRobocopy -Source $jsonSeqPath -Target $seqTarget -PluginName "$projectName sequences"
            $totalFiles += $count
        }
    }

    # Check for json-topics directory
    $jsonTopicsPath = Join-Path $projectPath "json-topics"
    if (Test-Path $jsonTopicsPath) {
        $topicsTarget = Join-Path $jsonTopicsTarget $kebabName
        $count = Copy-WithRobocopy -Source $jsonTopicsPath -Target $topicsTarget -PluginName "$projectName topics"
        $totalFiles += $count
    }

    # Check for json-components directory (special case for Components plugin)
    $jsonComponentsPath = Join-Path $projectPath "json-components"
    if (Test-Path $jsonComponentsPath) {
        $count = Copy-WithRobocopy -Source $jsonComponentsPath -Target $jsonComponentsTarget -PluginName "$projectName components"
        $totalFiles += $count
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   Plugins processed: $($processedPlugins.Count)" -ForegroundColor White
Write-Host "   Total files copied: $totalFiles" -ForegroundColor White
Write-Host ""
Write-Host "Plugin JSON files synced successfully!" -ForegroundColor Green

