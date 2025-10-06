# ESLint Rules: Host SDK Version Validation

## Overview

These rules validate that all external plugins use compatible versions of `@renderx-plugins/host-sdk`. They prevent runtime errors caused by API incompatibilities between the host application and installed plugins.

## Rules

### 1. `host-sdk-version-mismatch/validate-host-sdk-version-mismatch` (ERROR)

Reports **errors** for plugins using incompatible major versions of host-sdk. This is critical because it **will** cause runtime errors.

### 2. `host-sdk-missing/validate-host-sdk-missing` (WARNING)

Reports **warnings** for plugins that don't declare host-sdk as a dependency. This is informational - not all plugins need the host SDK.

## Rule Details

The rules:
1. Read the host's `package.json` to determine the expected host-sdk version
2. Scan all `@renderx-plugins/*` packages in `node_modules`
3. Check each plugin's host-sdk dependency version
4. Report:
   - **ERRORS** for incompatible major versions (e.g., v0.x vs v1.x)
   - **WARNINGS** for missing dependencies (may be okay if plugin doesn't use SDK)

## Why This Rule Exists

### Problem

When plugins use incompatible versions of the host SDK, they may:
- Call methods that don't exist (e.g., `hasValue()` instead of `has()`)
- Receive unexpected data types
- Cause runtime errors that break the application
- Have type mismatches that TypeScript doesn't catch (if using different SDK versions)

### Real-World Example

In issue #318, the library plugin was calling `config.hasValue()` which doesn't exist in host-sdk v1.0.5. The correct method is `config.has()`. This caused all E2E tests to fail with:

```
TypeError: t.hasValue is not a function
```

This lint rule would have caught this issue during development, before running tests.

## Configuration

The rules are configured in `eslint.config.js`:

```javascript
{
  files: ["package.json"],
  languageOptions: {
    parser: jsonParser,
  },
  plugins: {
    "host-sdk-version-mismatch": validateHostSdkVersionMismatch,
    "host-sdk-missing": validateHostSdkMissing,
  },
  rules: {
    // Error for version mismatches - these WILL cause runtime errors
    "host-sdk-version-mismatch/validate-host-sdk-version-mismatch": "error",
    // Warning for missing dependencies - not all plugins need host-sdk
    "host-sdk-missing/validate-host-sdk-missing": "warn",
  },
}
```

## Examples

### ❌ Incorrect (will fail)

**Host package.json:**
```json
{
  "dependencies": {
    "@renderx-plugins/host-sdk": "^1.0.5",
    "@renderx-plugins/library": "^1.0.4"
  }
}
```

**Plugin package.json (@renderx-plugins/library):**
```json
{
  "dependencies": {
    "@renderx-plugins/host-sdk": "^0.3.0"
  }
}
```

**Error (version mismatch):**
```
1:1  error  Plugin "@renderx-plugins/library" uses @renderx-plugins/host-sdk@^0.3.0,
            but host requires @renderx-plugins/host-sdk@^1.0.5.
            This may cause runtime errors. Update the plugin to use a compatible version.
            host-sdk-version-mismatch/validate-host-sdk-version-mismatch
```

**Warning (missing dependency):**
```
1:1  warning  Plugin "@renderx-plugins/components" does not declare
              @renderx-plugins/host-sdk as a dependency.
              If this plugin uses host SDK APIs, it should declare the dependency.
              host-sdk-missing/validate-host-sdk-missing
```

### ✅ Correct

**Host package.json:**
```json
{
  "dependencies": {
    "@renderx-plugins/host-sdk": "^1.0.5",
    "@renderx-plugins/library": "^1.0.5"
  }
}
```

**Plugin package.json (@renderx-plugins/library):**
```json
{
  "dependencies": {
    "@renderx-plugins/host-sdk": "^1.0.5"
  }
}
```

## How to Fix Violations

### For Plugin Developers

1. Update your plugin's `package.json` to use the same major version of host-sdk as the host:
   ```bash
   npm install @renderx-plugins/host-sdk@^1.0.5
   ```

2. Update your code to use the correct API methods from the new SDK version

3. Test your plugin with the new SDK version

4. Publish a new version of your plugin

### For Host Developers

1. Update the plugin to a compatible version:
   ```bash
   npm install @renderx-plugins/library@latest
   ```

2. If no compatible version exists, contact the plugin maintainer or:
   - Fork the plugin and update it yourself
   - Use a different plugin
   - Temporarily disable the lint rule (not recommended)

## Version Compatibility Rules

The rule checks **major version compatibility**:

- ✅ `^1.0.5` is compatible with `^1.2.0` (same major version)
- ✅ `^1.0.5` is compatible with `~1.0.8` (same major version)
- ❌ `^1.0.5` is NOT compatible with `^0.3.0` (different major version)
- ❌ `^1.0.5` is NOT compatible with `^2.0.0` (different major version)

## Running the Rule

### Check all files
```bash
npm run lint
```

### Check only package.json
```bash
npx eslint package.json
```

### Auto-fix (not applicable for this rule)
This rule does not support auto-fixing as it requires manual dependency updates.

## Related

- [Host SDK Documentation](../HOST_SDK.md)
- [Plugin Development Guide](../PLUGIN_DEVELOPMENT.md)
- [Issue #318: Host-Managed Configuration Service](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/318)

## Implementation Details

The rule:
- Only runs on `package.json` files
- Reads from the file system to check installed plugin versions
- Normalizes version strings (removes `^`, `~` prefixes)
- Compares major versions only (semantic versioning)
- Silently skips if it can't read package files (prevents build breakage)

## Limitations

- Only checks major version compatibility (not minor/patch)
- Requires plugins to be installed in `node_modules`
- Cannot detect runtime API usage mismatches (only version numbers)
- Does not check transitive dependencies

## Future Enhancements

Potential improvements:
- Check minor version compatibility for breaking changes
- Validate actual API usage against SDK version
- Suggest specific upgrade commands
- Auto-fix by updating package.json (with user confirmation)

