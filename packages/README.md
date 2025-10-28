# RenderX Monorepo Packages

This directory contains all RenderX packages in the monorepo structure.

## Package Structure

Each package in this directory follows a consistent structure:

```
packages/
├── package-name/
│   ├── src/
│   │   └── index.ts
│   ├── tests/
│   │   └── *.spec.ts
│   ├── package.json
│   ├── tsconfig.json (extends ../../tsconfig.base.json)
│   ├── README.md
│   └── .npmignore
```

## Packages

### Core Infrastructure
- **host-sdk** - Plugin system SDK and interfaces
- **manifest-tools** - Manifest schema validation and utilities
- **musical-conductor** - Orchestration engine for plugin coordination

### Plugins
- **canvas** - Canvas rendering plugin
- **canvas-component** - Canvas interaction layer
- **control-panel** - Control panel plugin
- **header** - Header plugin
- **library** - Library plugin
- **library-component** - Library component plugin
- **components** - Component catalog
- **digital-assets** - Digital assets library

## Development

### Building Packages

```bash
# Build all packages
npm run build:packages

# Build specific package
npm --prefix packages/package-name run build
```

### Testing Packages

```bash
# Test all packages
npm run packages:test

# Test specific package
npm --prefix packages/package-name run test
```

### Adding a New Package

1. Create package directory: `packages/new-package/`
2. Create `package.json` with workspace dependencies:
   ```json
   {
     "name": "@renderx-plugins/new-package",
     "version": "0.1.0",
     "dependencies": {
       "@renderx-plugins/host-sdk": "workspace:*"
     }
   }
   ```
3. Create `tsconfig.json` extending base:
   ```json
   {
     "extends": "../../tsconfig.base.json",
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src"
     },
     "include": ["src"]
   }
   ```
4. Add package reference to root `tsconfig.json`
5. Update build scripts if needed

## Workspace Protocol

Internal dependencies use the `workspace:*` protocol to reference other packages in the monorepo:

```json
{
  "dependencies": {
    "@renderx-plugins/host-sdk": "workspace:*"
  }
}
```

This ensures packages always use the local workspace version during development.

## Migration Status

Packages are being migrated from external repositories in phases:

- [x] Phase 1: Setup monorepo infrastructure ✅
- [x] Phase 2: Migrate @renderx-plugins/host-sdk ✅
- [ ] Phase 3: Migrate @renderx-plugins/manifest-tools
- [ ] Phase 4: Migrate musical-conductor
- [ ] Phase 5: Migrate @renderx-plugins/canvas
- [ ] Phase 6: Migrate @renderx-plugins/canvas-component
- [ ] Phase 7: Migrate @renderx-plugins/control-panel
- [ ] Phase 8: Migrate @renderx-plugins/header
- [ ] Phase 9: Migrate @renderx-plugins/library
- [ ] Phase 10: Migrate @renderx-plugins/library-component
- [ ] Phase 11: Migrate @renderx-plugins/components
- [ ] Phase 12: Migrate @renderx-plugins/digital-assets
- [ ] Phase 13: Final cleanup and documentation

See [Issue #321](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/321) for the full migration plan.

