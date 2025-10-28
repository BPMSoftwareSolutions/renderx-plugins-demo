# Host SDK Version Validation - Lint Rule Update

## Summary

Updated the host SDK version validation lint rules to provide more granular feedback:
- **ERRORS** for version mismatches (critical - will cause runtime failures)
- **WARNINGS** for missing dependencies (informational - not all plugins need host-sdk)

## Changes Made

### 1. Split Original Rule into Two Separate Rules

**Original**: Single rule `validate-host-sdk-version` that reported both issues as errors

**New**:
- `validate-host-sdk-version-mismatch` - Reports **ERRORS** for incompatible versions
- `validate-host-sdk-missing` - Reports **WARNINGS** for missing dependencies

### 2. Files Created

- `eslint-rules/validate-host-sdk-version-mismatch.js` - Version mismatch detection (error)
- `eslint-rules/validate-host-sdk-missing.js` - Missing dependency detection (warning)

### 3. Files Updated

- `eslint.config.js` - Added both new rules with appropriate severity levels
- `docs/eslint-rules/validate-host-sdk-version.md` - Updated documentation

## Current Detection Results

Running `npx eslint package.json` now shows:

```
C:\source\repos\bpm\internal\renderx-plugins-demo\package.json
  1:1  error    Plugin "@renderx-plugins/header" uses @renderx-plugins/host-sdk@>=0.1.0, 
                but host requires @renderx-plugins/host-sdk@^1.0.5. 
                This may cause runtime errors. Update the plugin to use a compatible version
                host-sdk-version-mismatch/validate-host-sdk-version-mismatch
                
  1:1  warning  Plugin "@renderx-plugins/canvas-component" does not declare 
                @renderx-plugins/host-sdk as a dependency. 
                If this plugin uses host SDK APIs, it should declare the dependency
                host-sdk-missing/validate-host-sdk-missing
                
  1:1  warning  Plugin "@renderx-plugins/components" does not declare 
                @renderx-plugins/host-sdk as a dependency. 
                If this plugin uses host SDK APIs, it should declare the dependency
                host-sdk-missing/validate-host-sdk-missing
                
  1:1  warning  Plugin "@renderx-plugins/manifest-tools" does not declare 
                @renderx-plugins/host-sdk as a dependency. 
                If this plugin uses host SDK APIs, it should declare the dependency
                host-sdk-missing/validate-host-sdk-missing

✖ 4 problems (1 error, 3 warnings)
```

## Interpretation

### Critical Issue (ERROR)
- **@renderx-plugins/header** - Has version mismatch, needs immediate update

### Informational (WARNINGS)
- **@renderx-plugins/canvas-component** - No host-sdk dependency (may be okay)
- **@renderx-plugins/components** - No host-sdk dependency (may be okay)
- **@renderx-plugins/manifest-tools** - No host-sdk dependency (may be okay)

The warnings indicate plugins that don't declare host-sdk. This is acceptable if:
- The plugin doesn't use any host SDK APIs
- The plugin is purely presentational (UI components only)
- The plugin only provides data/configuration (no runtime code)

## Benefits

### 1. Clear Severity Levels
- **Errors** block builds and must be fixed
- **Warnings** are informational and can be reviewed case-by-case

### 2. Reduced False Positives
- Not all plugins need host-sdk
- Warnings allow teams to acknowledge and document why a plugin doesn't need it

### 3. Better Developer Experience
- Clear distinction between critical and informational issues
- Easier to prioritize fixes
- Less noise in lint output

### 4. Flexible Configuration
- Can disable warnings if desired: `"host-sdk-missing/validate-host-sdk-missing": "off"`
- Can promote warnings to errors if needed: `"host-sdk-missing/validate-host-sdk-missing": "error"`

## Next Steps

### For Plugin Teams

1. **Fix version mismatches** (errors) immediately:
   ```bash
   # Update plugin to use compatible host-sdk version
   npm install @renderx-plugins/host-sdk@^1.0.5
   ```

2. **Review warnings** and either:
   - Add host-sdk dependency if the plugin uses SDK APIs
   - Document why the plugin doesn't need host-sdk (in plugin README)
   - Ignore the warning if it's a false positive

### For Host Team

1. Monitor lint output for new version mismatches
2. Review warnings periodically to ensure they're legitimate
3. Update plugin dependencies when new host-sdk versions are released

## Configuration

### Current Configuration (eslint.config.js)

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

### Alternative Configurations

**Strict mode** (treat missing dependencies as errors):
```javascript
rules: {
  "host-sdk-version-mismatch/validate-host-sdk-version-mismatch": "error",
  "host-sdk-missing/validate-host-sdk-missing": "error", // Changed to error
}
```

**Permissive mode** (only check version mismatches):
```javascript
rules: {
  "host-sdk-version-mismatch/validate-host-sdk-version-mismatch": "error",
  "host-sdk-missing/validate-host-sdk-missing": "off", // Disabled
}
```

## Related Documentation

- [Host SDK Version Validation](./HOST_SDK_VERSION_VALIDATION.md)
- [ESLint Rule Documentation](./eslint-rules/validate-host-sdk-version.md)
- [Issue #318: Host-Managed Configuration Service](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/318)

## Conclusion

The updated lint rules provide better granularity and reduce false positives while still catching critical version mismatches that would cause runtime errors. This improves the developer experience and makes it easier to maintain a healthy plugin ecosystem.

