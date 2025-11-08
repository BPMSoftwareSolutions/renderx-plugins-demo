# Plugin Validation Pre-Build Script
# Validates that all plugins in plugin-manifest.json have corresponding implementations
# and are registered in PluginLoader.cs

param(
    [string]$ManifestPath = "plugins/plugin-manifest.json",
    [string]$PluginLoaderPath = "Infrastructure/Plugins/PluginLoader.cs",
    [string]$ProjectRoot = $PSScriptRoot
)

$ErrorCount = 0

# Read manifest
$manifestFile = Join-Path $ProjectRoot $ManifestPath
if (-not (Test-Path $manifestFile)) {
    Write-Error "Manifest not found at $manifestFile"
    exit 1
}

$manifest = Get-Content $manifestFile | ConvertFrom-Json

# Read PluginLoader
$loaderFile = Join-Path $ProjectRoot $PluginLoaderPath
if (-not (Test-Path $loaderFile)) {
    Write-Error "PluginLoader not found at $loaderFile"
    exit 1
}

$loaderContent = Get-Content $loaderFile -Raw

# Validate each plugin
foreach ($plugin in $manifest.plugins) {
    $pluginId = $plugin.id
    $slot = $plugin.ui.slot

    # Skip runtime-only plugins
    if (-not $slot) {
        continue
    }

    # Check if slot is registered in PluginLoader
    $slotPattern = "`"$slot`""
    if (-not ($loaderContent -match $slotPattern)) {
        Write-Error "Slot '$slot' is NOT registered in PluginLoader for plugin $pluginId"
        $ErrorCount++
    }
}

if ($ErrorCount -gt 0) {
    exit 1
}

exit 0

