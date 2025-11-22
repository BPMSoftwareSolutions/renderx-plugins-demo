# Plugin Readiness Status System

## Problem

The ESLint rule `validate-served-sequences-mountable` was too simplistic:
- It checked if a sequence file existed with a `pluginId`
- It verified the `pluginId` was in the plugin manifest
- **But it had no concept of plugin readiness** - development/alpha plugins were treated the same as production plugins

This caused lint errors when adding new plugins that weren't ready for serving yet.

## Solution

Implemented a **plugin readiness status system** using a `status` field in the plugin manifest.

### Plugin Status Values

| Status | Meaning | Served? | Lint Check? |
|--------|---------|---------|------------|
| `production` | Ready for serving | ✅ Yes | ✅ Validated |
| `development` | In development | ❌ No | ⏭️ Skipped |
| `alpha` | Alpha/experimental | ❌ No | ⏭️ Skipped |

### How It Works

1. **Plugin Manifest** (`catalog/json-plugins/plugin-manifest.json`)
   - Each plugin entry now has a `status` field
   - Default: `"production"` (if omitted)
   - Example:
     ```json
     {
       "id": "SelfHealingPlugin",
       "status": "development",
       "description": "Self-healing system plugin - in development"
     }
     ```

2. **ESLint Rule** (`eslint-rules/validate-served-sequences-mountable.js`)
   - Loads plugin statuses from manifest
   - Skips validation for non-production plugins
   - Only validates sequences from production-ready plugins

3. **Workflow**
   - Add plugin to manifest with `"status": "development"`
   - Create sequences in `json-sequences/[plugin]/`
   - Lint passes (sequences are skipped)
   - Implement handlers and tests
   - When ready: change status to `"production"`
   - Lint validates sequences are properly mounted

## Example: SelfHealingPlugin

```json
{
  "id": "SelfHealingPlugin",
  "status": "development",
  "description": "Self-healing system plugin - in development, not yet ready for production serving"
}
```

**Result**: Sequences in `json-sequences/self-healing/` are skipped during lint validation.

## Benefits

✅ **Clear Intent** - Plugin status is explicit in manifest
✅ **No Lint Errors** - Development plugins don't block CI
✅ **Gradual Integration** - Plugins can be developed incrementally
✅ **Automatic Validation** - When status changes to production, lint validates
✅ **Scalable** - Works for any number of development plugins

## Updating Plugin Status

When a plugin is ready for production:

```json
{
  "id": "SelfHealingPlugin",
  "status": "production",  // Changed from "development"
  "ui": { ... },
  "runtime": { ... }
}
```

Lint will now validate that all sequences are properly mounted.

## Files Modified

- `eslint-rules/validate-served-sequences-mountable.js` - Added status checking
- `catalog/json-plugins/plugin-manifest.json` - Added status field to all plugins

