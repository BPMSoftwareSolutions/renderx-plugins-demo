# Vite Dependency Optimization Configuration

This document explains the Vite configuration updates made to resolve dependency optimization issues that interfere with externalized library plugin loading.

## Problem

Issue #124 identified that Vite's dependency optimization can interfere with library plugin loading, causing:

1. **Dependency Re-optimization Messages**: Vite showing "Re-optimizing dependencies" messages during development
2. **Plugin Loading Interference**: Dynamic plugin imports being affected by Vite's pre-bundling  
3. **Hot Reload Issues**: Plugin registration timing problems during development
4. **Specific Issues**: `gif.js.optimized` and other dependencies causing unexpected reloads

### Observed Behavior

Console messages like:
```
✨ new dependencies optimized: gif.js.optimized
✨ optimized dependencies changed. reloading
✨ new dependencies optimized: react-dom
✨ optimized dependencies changed. reloading
```

Library plugin sometimes fails to load or initialize after these events.

## Solution

Enhanced the existing `vite.config.js` with optimized configuration for plugin loading stability:

### Key Configuration Features

#### 1. Dependency Optimization Control
```javascript
optimizeDeps: {
  // Include stable dependencies that should be pre-bundled
  include: [
    '@renderx-plugins/header', 
    '@renderx-plugins/library', 
    '@renderx-plugins/host-sdk',
    'react',
    'react-dom',
    'react-dom/client'
  ],
  
  // Exclude problematic dependencies that cause reloads
  exclude: [
    'gif.js.optimized', // Issue #124 specific
    '/plugins/',        // Local plugin modules
  ],
  
  // Reduce optimization churn
  force: false,
  esbuildOptions: {
    keepNames: true, // Preserve function names for debugging
  }
}
```

#### 2. Development Server Optimization
```javascript
server: {
  // Disable HMR overlay to prevent blocking plugin loading
  hmr: {
    overlay: false,
    port: 24678 // Custom port to reduce conflicts
  },
  
  // Configure file watching for better plugin handling
  watch: {
    ignored: ['!**/node_modules/**']
  }
}
```

#### 3. Build Configuration
```javascript
build: {
  // Source maps for better debugging
  sourcemap: true
}
```

## Benefits

1. **Stable Plugin Loading**: Problematic dependencies excluded from optimization
2. **Faster Development**: Core dependencies and external packages pre-bundled
3. **Better Debugging**: Source maps and preserved function names
4. **Reduced Interference**: HMR overlay disabled, reduced reload frequency
5. **External Package Support**: Proper handling of `@renderx-plugins/*` packages

## Testing

The configuration includes comprehensive tests in `__tests__/vite-config/dependency-optimization.spec.ts`:

- ✅ Excludes problematic dependencies that cause reloads
- ✅ Includes stable dependencies for better performance  
- ✅ Configures HMR to prevent plugin loading interference
- ✅ Has optimization settings that reduce reload churn
- ✅ Handles plugin registration timing correctly

## Usage

The configuration is automatically applied when running:

```bash
npm run dev    # Development server with optimized config
npm run build  # Production build with source maps
```

## Compatibility

- **Vite**: v7.1.3+
- **Node.js**: v18+
- **React**: v18+
- **External Packages**: `@renderx-plugins/header`, `@renderx-plugins/library`, `@renderx-plugins/host-sdk`

## Architecture Integration

This configuration works with the current externalized plugin architecture:

- **Header Plugin**: `@renderx-plugins/header` (external package)
- **Library Plugin**: `@renderx-plugins/library` (external package)  
- **Host SDK**: `@renderx-plugins/host-sdk` (external package)
- **Local Plugins**: Canvas, Control Panel (local modules)

## Future Enhancements

Potential improvements for the configuration:

1. **Dynamic Exclusion**: Automatically detect and exclude problematic dependencies
2. **Plugin-Specific Optimization**: Fine-tune patterns for different plugin types
3. **Environment-Specific Config**: Different strategies for dev/staging/prod
4. **Performance Monitoring**: Add metrics for optimization effectiveness
5. **Hot Reload Resilience**: Enhanced plugin re-registration after reloads
