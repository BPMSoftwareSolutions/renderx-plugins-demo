# Plugin Validation Pre-Build Script
# Validates that all plugins in plugin-manifest.json have corresponding implementations
# and that PluginLoader uses manifest-driven loading (not hardcoded mappings)

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

# Validate that PluginLoader uses manifest-driven loading
if ($loaderContent -match "_slotTypeMap = new Dictionary") {
    Write-Error "PluginLoader should not have hardcoded _slotTypeMap. Use manifest-driven loading instead."
    $ErrorCount++
}

if (-not ($loaderContent -match "plugin-manifest.json")) {
    Write-Error "PluginLoader should load plugin mappings from plugin-manifest.json"
    $ErrorCount++
}

# Validate each plugin has required UI configuration
foreach ($plugin in $manifest.plugins) {
    $pluginId = $plugin.id
    $slot = $plugin.ui.slot
    $module = $plugin.ui.module
    $export = $plugin.ui.export

    # Skip runtime-only plugins
    if (-not $slot) {
        continue
    }

    # Check that all required fields are present
    if (-not $module) {
        Write-Error "Plugin '$pluginId' missing 'module' in UI configuration"
        $ErrorCount++
    }

    if (-not $export) {
        Write-Error "Plugin '$pluginId' missing 'export' in UI configuration"
        $ErrorCount++
    }
}

if ($ErrorCount -gt 0) {
    exit 1
}

exit 0

