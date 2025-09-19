# Plugin Manifest Architecture

## Single Source of Truth: npm Packages

The RenderX plugin system uses **npm packages as the single source of truth** for plugin definitions. There is no base manifest file - all plugins are discovered and aggregated from installed npm packages.

## How It Works

### 1. Plugin Discovery
The `scripts/aggregate-plugins.js` script scans `node_modules` for packages that:
- Have the `"renderx-plugin"` keyword in `package.json`, OR
- Have a `"renderx"` field in `package.json`

### 2. Plugin Definition
Plugins are defined in the npm package's `package.json` under the `renderx.plugins` field:

```json
{
  "name": "@renderx-plugins/header",
  "keywords": ["renderx-plugin"],
  "renderx": {
    "plugins": [
      {
        "id": "HeaderTitlePlugin",
        "ui": {
          "slot": "headerLeft",
          "module": "@renderx-plugins/header",
          "export": "HeaderTitle"
        }
      }
    ]
  }
}
```

### 3. Manifest Generation
The aggregation script:
1. Discovers all `@renderx-plugins/*` packages
2. Extracts plugin definitions from their `package.json` files
3. Automatically adds runtime entries for UI-only plugins
4. Generates `catalog/json-plugins/.generated/plugin-manifest.json`
5. Copies to `public/plugins/plugin-manifest.json` for runtime use

## File Structure

```
catalog/json-plugins/
├── .generated/
│   └── plugin-manifest.json    # Generated manifest (ignored by git)
└── (no base manifest)          # npm packages are the source of truth

public/plugins/
└── plugin-manifest.json        # Runtime copy (ignored by git)
```

## Benefits

1. **No Duplication**: Plugin definitions exist only in their npm packages
2. **No Synchronization Issues**: No need to keep base manifest in sync with packages
3. **Clear Ownership**: Each plugin package owns its own definition
4. **Automatic Discovery**: New packages are automatically included
5. **Runtime Injection**: UI-only plugins automatically get runtime stubs

## Plugin Types

### UI + Runtime Plugin
```json
{
  "id": "LibraryPlugin",
  "ui": {
    "slot": "library",
    "module": "@renderx-plugins/library",
    "export": "LibraryPanel"
  }
  // Runtime entry automatically added by aggregation script
}
```

### Runtime-Only Plugin
```json
{
  "id": "LibraryComponentPlugin",
  "runtime": {
    "module": "@renderx-plugins/library-component",
    "export": "register"
  }
}
```

## Validation

The system includes comprehensive validation:
- **Plugin ID validation**: Ensures consistent naming and cross-references
- **Plugin registration validation**: Verifies runtime modules can be imported
- **Architectural consistency**: Validates manifest ↔ catalog expectations

## Migration Notes

**Before**: Had confusing base manifest + generated manifest
**After**: npm packages are the single source of truth

This eliminates the confusion around which manifest file is authoritative and ensures that plugin definitions live with their implementations.
