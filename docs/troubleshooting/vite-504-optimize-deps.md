## Vite 504 "Outdated Optimize Dep" for scoped packages (@renderx-plugins/*)

### Symptoms
- Dev server shows 504 responses for module endpoints like /@id/@renderx-plugins/library?import
- Browser console shows "Failed to resolve module specifier" for @renderx-plugins/library or @renderx-plugins/header
- Sequences using these packages fail to register/mount in dev

### Likely cause
Vite’s dependency optimizer (esbuild pre-bundle) can get into an inconsistent state with scoped workspace packages that contain ESM, CSS sidecars, or non-standard exports. Vite then serves a stale/invalid optimized chunk which triggers 504 “Outdated Optimize Dep”.

### Fix
Exclude the problematic packages from optimizeDeps so they’re served as native ESM during dev (no pre-bundle):

<augment_code_snippet path="vite.config.js" mode="EXCERPT">
````js
optimizeDeps: {
  include: [
    '@renderx-plugins/library-component',
    '@renderx-plugins/control-panel',
    '@renderx-plugins/host-sdk',
  ],
  exclude: [
    '@renderx-plugins/library',
    '@renderx-plugins/header',
    '@renderx-plugins/canvas-component',
    'gif.js.optimized',
  ],
  force: true,
},
````
</augment_code_snippet>

Then clear the cache and restart dev:

- Delete node_modules/.vite
- Start with force: `npm run dev -- --force`

### Verification steps
- Hit these endpoints in a browser or curl:
  - http://localhost:5173/@id/@renderx-plugins/library?import → 200
  - http://localhost:5173/@id/@renderx-plugins/header?import → 200
- Confirm sequences for Library and Header plugins mount without errors

### CI/test considerations
- Tests should not rely on public/ artifacts committed to the repo. We prefer catalog-generated JSON.
- If a test or fallback loader needs the plugin manifest during Vitest, prefer the catalog path first and avoid static literal dynamic imports so Vite doesn’t try to statically resolve a non-existent file.
  - Example (runtime fallback for tests only):

<augment_code_snippet path="src/ui/shared/PanelSlot.tsx" mode="EXCERPT">
````ts
if (env.allowFallbacks?.()) {
  try {
    const catPath = ['..','..','..','catalog','json-plugins','.generated','plugin-manifest.json?raw'].join('/');
    const mod: any = await import(/* @vite-ignore */ (catPath as any));
    return JSON.parse(mod?.default || mod || '{"plugins":[]}');
  } catch {}
}
````
</augment_code_snippet>

- For tests that read the manifest, prefer the catalog file and only fall back to public when explicitly needed.

### Notes
- This approach is minimal and reversible; revisit include/exclude when packages change their outputs.
- Keep React deduped in resolve.dedupe to avoid multiple React copies.

