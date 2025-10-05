# Host SDK Version Validation

## Overview

This document describes the Host SDK version validation system that ensures all external plugins use compatible versions of `@renderx-plugins/host-sdk`.

## Problem Statement

### Issue #318: Configuration Service Runtime Errors

During implementation of the Host-Managed Configuration Service (issue #318), we encountered runtime errors caused by version mismatches between the host application and external plugins:

```
TypeError: t.hasValue is not a function
  at Y.isConfigured (http://localhost:4173/assets/index-fOon97pF.js:539:196)
```

### Root Cause

The library plugin was using an older version of the host SDK (v0.3.0) that had a different API:
- **Old API (v0.3.0)**: `config.hasValue(key)`
- **New API (v1.0.5)**: `config.has(key)`

When the plugin tried to call `hasValue()`, it failed because the method didn't exist in the newer SDK version.

### Dependency Tree Analysis

Running `npm list @renderx-plugins/host-sdk` revealed:

```
renderx-plugins-demo@0.1.0
├─┬ @renderx-plugins/canvas@0.1.0-rc.3
│ └── @renderx-plugins/host-sdk@0.3.0
├─┬ @renderx-plugins/library@1.0.5
│ └── @renderx-plugins/host-sdk@1.0.5 deduped invalid
├─┬ @renderx-plugins/library-component@0.1.0-rc.5
│ └── @renderx-plugins/host-sdk@1.0.5 deduped invalid: "^0.3.0" expected
└── @renderx-plugins/host-sdk@1.0.5
```

Multiple plugins were using incompatible versions, causing runtime failures.

## Solution: ESLint Rule

We created a custom ESLint rule `validate-host-sdk-version` that:

1. **Detects version mismatches** at lint time (before runtime)
2. **Prevents incompatible plugins** from being used
3. **Provides clear error messages** with actionable guidance
4. **Enforces architectural consistency** across the plugin ecosystem

### Implementation

**File**: `eslint-rules/validate-host-sdk-version.js`

The rule:
- Reads the host's `package.json` to get the expected SDK version
- Scans all `@renderx-plugins/*` packages in `node_modules`
- Compares major versions (semantic versioning)
- Reports errors for incompatible versions

### Configuration

**File**: `eslint.config.js`

```javascript
{
  files: ["package.json"],
  languageOptions: {
    parser: jsonParser,
  },
  plugins: {
    "host-sdk-version": validateHostSdkVersion,
  },
  rules: {
    "host-sdk-version/validate-host-sdk-version": "error",
  },
}
```

## Detection Results

Running `npx eslint package.json` now detects all version mismatches:

```
C:\source\repos\bpm\internal\renderx-plugins-demo\package.json
  1:1  error  Plugin "@renderx-plugins/canvas" uses @renderx-plugins/host-sdk@^0.3.0, 
              but host requires @renderx-plugins/host-sdk@^1.0.5
  1:1  error  Plugin "@renderx-plugins/canvas-component" does not declare 
              @renderx-plugins/host-sdk as a dependency
  1:1  error  Plugin "@renderx-plugins/components" does not declare 
              @renderx-plugins/host-sdk as a dependency
  1:1  error  Plugin "@renderx-plugins/header" uses @renderx-plugins/host-sdk@>=0.1.0, 
              but host requires @renderx-plugins/host-sdk@^1.0.5
  1:1  error  Plugin "@renderx-plugins/library-component" uses @renderx-plugins/host-sdk@^0.3.0, 
              but host requires @renderx-plugins/host-sdk@^1.0.5
  1:1  error  Plugin "@renderx-plugins/manifest-tools" does not declare 
              @renderx-plugins/host-sdk as a dependency
```

## Benefits

### 1. Early Detection
- Catches version mismatches during development
- Prevents runtime errors in E2E tests
- Fails CI builds before deployment

### 2. Clear Guidance
- Specific error messages identify the problem
- Shows expected vs actual versions
- Suggests updating plugins

### 3. Architectural Enforcement
- Ensures all plugins follow SDK versioning
- Maintains consistency across the ecosystem
- Documents version requirements

### 4. Developer Experience
- Faster debugging (lint time vs runtime)
- Prevents "works on my machine" issues
- Reduces time spent troubleshooting

## Usage

### Check for version mismatches
```bash
npm run lint
```

### Check only package.json
```bash
npx eslint package.json
```

### Fix version mismatches
```bash
# Update plugins to compatible versions
npm install @renderx-plugins/canvas@latest
npm install @renderx-plugins/library-component@latest

# Or update all plugins
npm update @renderx-plugins/*
```

## Integration with CI/CD

The lint rule runs as part of the standard lint process:

```bash
npm run lint  # Includes host-sdk version validation
```

This ensures:
- All PRs are validated before merge
- CI builds fail if version mismatches exist
- Production deployments use compatible versions

## Related Documentation

- [ESLint Rule Documentation](./eslint-rules/validate-host-sdk-version.md)
- [Host SDK API Documentation](./HOST_SDK.md)
- [Plugin Development Guide](./PLUGIN_DEVELOPMENT.md)
- [Issue #318: Host-Managed Configuration Service](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/318)

## Future Enhancements

Potential improvements:
1. **Auto-fix capability** - Automatically update package.json versions
2. **Minor version checking** - Detect breaking changes in minor versions
3. **API usage validation** - Check actual code against SDK version
4. **Upgrade suggestions** - Recommend specific plugin versions
5. **Transitive dependency checking** - Validate nested dependencies

## Lessons Learned

### From Issue #318

1. **Version mismatches cause runtime errors** that are hard to debug
2. **npm's dependency resolution** can install incompatible versions
3. **Lint-time validation** is more effective than runtime detection
4. **Clear error messages** significantly improve developer experience
5. **Architectural rules** should be enforced automatically

### Best Practices

1. **Always check plugin versions** before adding new plugins
2. **Run lint before committing** to catch issues early
3. **Update plugins regularly** to stay compatible
4. **Document version requirements** in plugin README files
5. **Use semantic versioning** correctly (major.minor.patch)

## Conclusion

The Host SDK version validation system prevents a entire class of runtime errors by detecting version mismatches at lint time. This improves developer experience, reduces debugging time, and ensures architectural consistency across the plugin ecosystem.

By enforcing version compatibility through ESLint, we catch issues before they reach production and provide clear guidance for resolution.

