# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-10-05

### Fixed
- **CRITICAL**: Replaced Node.js `crypto` module with browser-compatible UUID generator
  - Removed `import { randomUUID } from "node:crypto"` that was causing build failures in browser environments
  - Implemented browser-compatible UUID generator using native `crypto.randomUUID()` with fallback
  - Updated `src/symphonies/drop.symphony.ts` and `src/symphonies/drop.container.symphony.ts`
  - Fixes Vite build error: `"randomUUID" is not exported by "__vite-browser-external"`

### Technical Details
The plugin now uses the browser's native Web Crypto API (`crypto.randomUUID()`) when available, with a fallback implementation for older browsers:

```typescript
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
```

## [1.0.1] - 2025-10-05

### Changed
- Updated peer dependency to `@renderx-plugins/host-sdk` ^1.0.4-rc.0
- Updated dev dependency to `@renderx-plugins/host-sdk` ^1.0.5

## [1.0.0] - 2025-09-20

### Added
- Initial stable release
- Library component drag/drop sequences for RenderX
- Auto-discovery support via `renderx.sequences` metadata
- Plugin manifest contribution via `package.json`
- Handlers export for JSON sequence mounting

### Features
- Drag sequence with custom preview ghost
- Drop sequence for component placement
- Container drop sequence for nested components
- Browser-compatible implementation
- Full TypeScript support

## [0.1.0-rc.5] - 2025-09-20

### Fixed
- Fixed drag event topic naming convention

## [0.1.0-rc.4] - 2025-09-20

### Fixed
- Fixed plugin ID mismatch by standardizing to `LibraryComponentPlugin`

## [0.1.0-rc.3] - 2025-09-13

### Added
- Plugin manifest contribution via `package.json` `renderx.plugins`
- Auto-discovery keyword `renderx-plugin`

## [0.1.0-rc.2] - 2025-09-11

### Added
- Handlers export validation script
- JSON sequence catalog support

## [0.1.0-rc.1] - 2025-09-11

### Added
- Initial release candidate
- JSON sequences with auto-discovery
- Externalized from host repository

