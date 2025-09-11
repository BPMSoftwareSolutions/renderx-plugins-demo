# Vite Dependency Optimization Configuration

This document explains the Vite configuration added to resolve dependency optimization issues that can interfere with library plugin loading.

## Problem

Issue #124 identified that Vite's dependency optimization can interfere with library plugin loading, causing:

1. **Dependency Re-optimization Messages**: Vite showing "Re-optimizing dependencies" messages during development
2. **Plugin Loading Interference**: Dynamic plugin imports being affected by Vite's pre-bundling
3. **Hot Reload Issues**: Plugin registration timing problems during development

## Solution

Added `vite.config.js` with optimized configuration for plugin loading stability:

### Key Configuration Features

#### 1. Dependency Optimization Control
```javascript
optimizeDeps: {
  // Include stable dependencies that should be pre-bundled
  include: [
    'react',
    'react-dom',
    'react-dom/client',
    'musical-conductor'
  ],
  
  // Exclude plugin modules from optimization
  exclude: [
    '/plugins/'
  ]
}
```

#### 2. Development Server Optimization
```javascript
server: {
  // Disable HMR overlay to prevent blocking plugin loading
  hmr: {
    overlay: false
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

1. **Stable Plugin Loading**: Plugins are excluded from Vite's dependency optimization
2. **Faster Development**: Core dependencies are pre-bundled for better performance
3. **Better Debugging**: Source maps enabled for plugin development
4. **Reduced Interference**: HMR overlay disabled to prevent blocking plugin UI

## Testing

The configuration includes comprehensive tests in `__tests__/vite-config/dependency-optimization.spec.ts`:

- ✅ Excludes plugin modules from dependency optimization
- ✅ Includes stable dependencies in optimization
- ✅ Configures plugin loading resilience
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
- **No additional dependencies required**

## Future Enhancements

Potential improvements for the configuration:

1. **React Plugin**: Add `@vitejs/plugin-react` when available
2. **Plugin-Specific Optimization**: Fine-tune exclusion patterns for specific plugin types
3. **Environment-Specific Config**: Different optimization strategies for dev/prod
4. **Performance Monitoring**: Add metrics for optimization effectiveness
