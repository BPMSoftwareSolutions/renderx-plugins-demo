# ESLint Rule: validate-plugin-registration

## Overview

This ESLint rule validates **plugin registration consistency** across the RenderX plugin system. It detects architectural discrepancies between plugin manifest declarations, actual implementations, and JSON catalog expectations.

## Problem Statement

The rule addresses common plugin architecture issues:

1. **Unused Runtime Entries**: Plugins with `runtime` entries in the manifest but no sequences expected from them
2. **Missing Runtime Entries**: Plugins without `runtime` entries but with sequences expected in catalogs
3. **Implementation Verification**: Plugins that should register sequences but may have no-op `register()` functions

## Rule Details

### ❌ Examples of incorrect code:

#### 1. Unused Runtime Entry
```javascript
// Plugin manifest
{
  "plugins": [
    {
      "id": "HeaderPlugin",
      "ui": { "slot": "header", "module": "@renderx-plugins/header", "export": "Header" },
      "runtime": { "module": "@renderx-plugins/header", "export": "register" }  // ❌ Unused
    }
  ]
}

// No sequences expected from HeaderPlugin in any catalog files
```

#### 2. Missing Runtime Entry
```javascript
// Plugin manifest
{
  "plugins": [
    {
      "id": "LibraryPlugin",
      "ui": { "slot": "library", "module": "@renderx-plugins/library", "export": "Library" }
      // ❌ Missing runtime entry
    }
  ]
}

// Interaction catalog expects sequences
{
  "routes": {
    "library.load": {
      "pluginId": "LibraryPlugin",           // ❌ No runtime to handle this
      "sequenceId": "library-load-symphony"
    }
  }
}
```

#### 3. Implementation Verification Needed
```javascript
// Plugin manifest
{
  "plugins": [
    {
      "id": "CanvasComponentPlugin",
      "runtime": { "module": "@renderx-plugins/canvas-component", "export": "register" }
    }
  ]
}

// Catalog expects sequences
{
  "routes": {
    "canvas.component.create": {
      "pluginId": "CanvasComponentPlugin",
      "sequenceId": "canvas-component-create-symphony"  // ⚠️ Verify register() implements this
    }
  }
}
```

### ✅ Examples of correct code:

#### 1. UI-Only Plugin (Consistent)
```javascript
// Plugin manifest
{
  "plugins": [
    {
      "id": "HeaderPlugin",
      "ui": { "slot": "header", "module": "@renderx-plugins/header", "export": "Header" }
      // ✅ No runtime entry, no sequences expected
    }
  ]
}

// No sequences expected in catalogs - consistent!
```

#### 2. Runtime Plugin with Proper Registration
```javascript
// Plugin manifest
{
  "plugins": [
    {
      "id": "LibraryComponentPlugin",
      "runtime": { "module": "@renderx-plugins/library-component", "export": "register" }
    }
  ]
}

// Plugin implementation
export async function register(conductor) {
  // ✅ Actually registers the expected sequences
  conductor.registerSequence("LibraryComponentPlugin", dragSequence, dragHandlers);
  conductor.registerSequence("LibraryComponentPlugin", dropSequence, dropHandlers);
}

// Catalog expectations match implementation
{
  "routes": {
    "library.component.drop": {
      "pluginId": "LibraryComponentPlugin",
      "sequenceId": "library-component-drop-symphony"  // ✅ Registered by plugin
    }
  }
}
```

## Architecture Patterns

The rule supports different plugin architecture patterns:

### 1. **UI-Only Plugins**
- Have `ui` entry in manifest
- No `runtime` entry
- No sequences expected in catalogs
- **Example**: Pure React components for layout slots

### 2. **Runtime-Only Plugins**
- Have `runtime` entry in manifest
- No `ui` entry
- Sequences expected and registered
- **Example**: Background services, event handlers

### 3. **Hybrid Plugins**
- Have both `ui` and `runtime` entries
- May or may not register sequences
- **Example**: Components with associated behavior

### 4. **Logical Plugin Extensions**
- Fine-grained plugin IDs that extend manifest plugins
- Handled by the `validate-plugin-ids` rule
- **Example**: `CanvasComponentSelectionPlugin` extends `CanvasComponentPlugin`

## Configuration

This rule is automatically applied to JSON imports in catalog directories:
- `catalog/json-plugins/`
- `catalog/json-interactions/`
- `catalog/json-components/json-topics/`

```javascript
// eslint.config.js
rules: {
  "plugin-registration/validate-plugin-registration": "error"
}
```

## Integration

### Build Pipeline
The rule runs automatically during ESLint checks:

```bash
npm run lint  # Includes plugin registration validation
```

### Manifest Source
The rule uses the **generated plugin manifest** as the source of truth:
1. `catalog/json-plugins/.generated/plugin-manifest.json` (preferred)
2. `catalog/json-plugins/plugin-manifest.json` (fallback)

## Error Messages

| Message ID | Description | Action Required |
|------------|-------------|-----------------|
| `unusedRuntime` | Plugin has runtime entry but no sequences expected | Remove runtime entry or add sequences |
| `missingRuntime` | Plugin missing runtime entry but sequences expected | Add runtime entry to manifest |
| `verifyImplementation` | Plugin should register sequences | Verify `register()` function implementation |
| `manifestNotFound` | Plugin manifest not found | Run `npm run pre:manifests` |

## Related Rules

- `validate-plugin-ids`: Validates plugin ID naming and cross-references
- `no-restricted-imports`: Enforces plugin boundary isolation

## Best Practices

1. **Keep UI and Runtime Separate**: UI-only plugins shouldn't have runtime entries
2. **Implement What You Declare**: If a plugin has a runtime entry, it should register sequences
3. **Clean Up Unused Entries**: Remove runtime entries from plugins that don't need them
4. **Verify Implementations**: Ensure `register()` functions actually mount expected sequences

This rule helps maintain **architectural consistency** and prevents common plugin integration issues in the RenderX system.
