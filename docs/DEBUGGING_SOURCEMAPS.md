# Debugging Source Maps

Source maps are critical for debugging TypeScript/JSX code in the browser. This guide helps diagnose and fix source map issues.

## Quick Fixes

### 1. Hard Refresh Browser
The most common issue is browser cache serving stale files:

- **Windows/Linux**: `Ctrl+Shift+R`
- **Mac**: `Cmd+Shift+R`

### 2. Clear Vite Cache
If hard refresh doesn't work, clear Vite's internal cache:

```bash
npm run dev:clean
```

This will:
- Rebuild the MusicalConductor package
- Clear Vite's `.vite` cache
- Restart the dev server with fresh source maps

### 3. Clear Browser Cache
In Chrome DevTools:
1. Open DevTools (`F12`)
2. Go to **Application** tab
3. Click **Clear site data**
4. Hard refresh the page

## Verifying Source Maps

### Check if Source Maps Exist
```bash
npm run debug:sourcemaps
```

This script will:
- List all JS and `.map` files in `dist/` and `packages/*/dist/`
- Verify each JS file has a corresponding source map
- Validate source map JSON structure
- Show which sources are included in each map

### Manual Verification in DevTools

1. Open DevTools (`F12`)
2. Go to **Sources** tab
3. Look for your TypeScript files in the file tree
4. If you see red X marks, source maps aren't loading
5. Check the **Console** tab for errors about missing source maps

## Common Issues & Solutions

### Issue: Source Maps Not Loading in DevTools

**Symptoms:**
- JavaScript files show in Sources tab, but TypeScript files don't
- Red X marks in the file tree
- Can't set breakpoints on TypeScript code

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R`
2. Clear cache: `npm run dev:clean`
3. Check DevTools Console for errors
4. Verify source map files exist: `npm run debug:sourcemaps`

### Issue: Source Maps Out of Date

**Symptoms:**
- Breakpoints don't align with code
- Stepping through code jumps around
- Console shows wrong line numbers

**Solutions:**
1. Rebuild packages: `npm run build:packages`
2. Restart dev server: `npm run dev:clean`
3. Hard refresh browser: `Ctrl+Shift+R`

### Issue: Changes Not Reflected After Edit

**Symptoms:**
- Edit a file, but old code still runs
- Breakpoints hit old code
- Console logs show old values

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R`
2. Check if file was actually saved
3. Verify Vite detected the change (check terminal for rebuild message)
4. If still broken: `npm run dev:clean`

## Configuration

### Vite Config (vite.config.js)
- `server.sourcemap: true` - Enables source maps in dev mode
- `build.sourcemap: true` - Enables source maps in production builds

### TypeScript Config (tsconfig.base.json)
- `sourceMap: true` - Generates `.map` files
- `declarationMap: true` - Maps for `.d.ts` files

### Package Build Config (tsup.config.ts)
- `sourcemap: true` - Enables source maps for package builds

## Advanced Debugging

### Check Source Map References
In DevTools Console, run:
```javascript
// Check if source maps are loaded
fetch('/assets/main-*.js').then(r => r.text()).then(t => {
  const hasSourceMapRef = t.includes('sourceMappingURL');
  console.log('Source map reference:', hasSourceMapRef ? '✅ Found' : '❌ Missing');
});
```

### Validate Source Map JSON
```bash
# Check a specific source map
cat dist/assets/main-*.js.map | jq '.sources | length'
```

## Performance Note

Source maps add ~10-20% to build size but are essential for debugging. They're included in:
- **Development builds** - Always enabled
- **Production builds** - Enabled for debugging (can be disabled if needed)

## Related Documentation

- [Vite Source Maps](https://vitejs.dev/config/shared-options.html#build-sourcemap)
- [TypeScript Source Maps](https://www.typescriptlang.org/tsconfig#sourceMap)
- [Chrome DevTools Debugging](https://developer.chrome.com/docs/devtools/javascript/)

