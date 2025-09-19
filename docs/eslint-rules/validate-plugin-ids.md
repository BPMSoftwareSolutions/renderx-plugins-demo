# ESLint Rule: validate-plugin-ids

## Overview

This ESLint rule validates plugin IDs in catalog JSON files to ensure consistency, prevent naming conflicts, and maintain cross-reference integrity across the plugin system.

## Rule Details

The rule validates plugin IDs in three key areas:

1. **Plugin Manifest** (`catalog/json-plugins/plugin-manifest.json`)
2. **Interaction Files** (`catalog/json-interactions/*.json`)
3. **Topic Files** (`catalog/json-components/json-topics/*.json`)

### Validation Checks

#### 1. Naming Convention
Plugin IDs must follow PascalCase and end with "Plugin":
- ✅ `LibraryPlugin`
- ✅ `CanvasComponentPlugin`
- ❌ `library-plugin` (not PascalCase)
- ❌ `LibraryComponent` (doesn't end with "Plugin")

#### 2. Reserved Names
Certain naming patterns are reserved for system use:
- ❌ `SystemPlugin`, `SystemCorePlugin`
- ❌ `CorePlugin`, `CoreManagementPlugin`
- ❌ `HostPlugin`, `HostIntegrationPlugin`
- ❌ `RuntimePlugin`, `RuntimeManagerPlugin`

#### 3. Uniqueness
Plugin IDs must be unique within the manifest:
```json
{
  "plugins": [
    { "id": "LibraryPlugin" },
    { "id": "LibraryPlugin" }  // ❌ Duplicate ID
  ]
}
```

#### 4. Cross-Reference Validation
Plugin IDs referenced in interaction and topic files must either:
- Exist directly in the manifest, OR
- Follow the logical plugin ID pattern (extend a manifest plugin)

**Manifest:**
```json
{
  "plugins": [
    { "id": "CanvasComponentPlugin" }
  ]
}
```

**Valid references:**
```json
{
  "routes": {
    "canvas.component.create": {
      "pluginId": "CanvasComponentPlugin",  // ✅ Direct match
      "sequenceId": "canvas-component-create-symphony"
    },
    "canvas.component.select": {
      "pluginId": "CanvasComponentSelectionPlugin",  // ✅ Logical extension
      "sequenceId": "canvas-component-select-symphony"
    }
  }
}
```

**Invalid reference:**
```json
{
  "routes": {
    "library.load": {
      "pluginId": "MissingPlugin",  // ❌ Not in manifest and doesn't extend any
      "sequenceId": "library-load-symphony"
    }
  }
}
```

## Examples

### ❌ Invalid Examples

**Invalid naming:**
```json
// catalog/json-plugins/plugin-manifest.json
{
  "plugins": [
    { "id": "library-plugin" },     // Not PascalCase
    { "id": "LibraryComponent" },   // Doesn't end with Plugin
    { "id": "SystemCorePlugin" }    // Reserved pattern
  ]
}
```

**Missing cross-reference:**
```json
// catalog/json-interactions/library.json
{
  "routes": {
    "library.load": {
      "pluginId": "NonExistentPlugin",  // Not in manifest
      "sequenceId": "library-load-symphony"
    }
  }
}
```

### ✅ Valid Examples

**Proper naming:**
```json
// catalog/json-plugins/plugin-manifest.json
{
  "plugins": [
    { "id": "LibraryPlugin" },
    { "id": "CanvasPlugin" },
    { "id": "ControlPanelPlugin" }
  ]
}
```

**Valid cross-references:**
```json
// catalog/json-interactions/library.json
{
  "routes": {
    "library.load": {
      "pluginId": "LibraryPlugin",  // Exists in manifest
      "sequenceId": "library-load-symphony"
    }
  }
}
```

## Architecture Support

The validation supports a **hierarchical plugin architecture**:

1. **Manifest Plugins**: Main plugin packages registered in the manifest (e.g., `CanvasComponentPlugin`)
2. **Logical Plugin IDs**: Fine-grained identifiers for specific functionality within a plugin (e.g., `CanvasComponentSelectionPlugin`, `CanvasComponentDragPlugin`)

**Logical Plugin ID Pattern**: `{ManifestPluginBase}{SpecificFunction}Plugin`
- Base: `CanvasComponent` (from `CanvasComponentPlugin`)
- Extensions: `CanvasComponentSelectionPlugin`, `CanvasComponentDragPlugin`, etc.

This allows for:
- **Coarse-grained packaging** (fewer npm packages)
- **Fine-grained routing** (specific interactions → specific handlers)

## Configuration

### ESLint Rule
Applied to JSON imports in catalog directories:
- `catalog/json-plugins/`
- `catalog/json-interactions/`
- `catalog/json-components/json-topics/`

```javascript
rules: {
  "plugin-ids/validate-plugin-ids": "error"
}
```

### Build Integration
Plugin ID validation runs automatically during the build process:

```bash
npm run validate:plugin-ids  # Standalone validation
npm run pre:manifests        # Includes validation in build pipeline
```

## Error Messages

- **invalidNaming**: Plugin ID naming convention violations
- **duplicateId**: Duplicate plugin IDs in manifest
- **missingReference**: Plugin ID referenced but not found in manifest
- **manifestNotFound**: Plugin manifest file not found

## Benefits

1. **Consistency**: Enforces uniform plugin ID naming across the codebase
2. **Reliability**: Prevents runtime errors from missing plugin references
3. **Maintainability**: Makes plugin relationships explicit and verifiable
4. **Documentation**: Plugin IDs serve as clear identifiers in the system

## Integration with Other Rules

This rule complements other plugin-related ESLint rules:
- `sequences-in-json`: Ensures sequences are in JSON files
- `valid-handlers-path`: Validates handler module paths
- `handler-export-exists`: Verifies handler exports exist

## Migration Guide

If you encounter violations:

1. **Fix naming**: Update plugin IDs to PascalCase ending with "Plugin"
2. **Remove duplicates**: Ensure each plugin ID is unique in the manifest
3. **Add missing plugins**: Add referenced plugins to the manifest or remove invalid references
4. **Avoid reserved names**: Choose different names for plugins using reserved patterns
