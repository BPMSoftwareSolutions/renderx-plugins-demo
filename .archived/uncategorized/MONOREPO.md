# RenderX Monorepo Development Guide

This document provides comprehensive guidelines for developing in the RenderX monorepo.

## Table of Contents

- [Overview](#overview)
- [Monorepo Structure](#monorepo-structure)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Building Packages](#building-packages)
- [Running Tests](#running-tests)
- [Adding New Packages](#adding-new-packages)
- [Version Management](#version-management)
- [Publishing Strategy](#publishing-strategy)
- [Troubleshooting](#troubleshooting)

## Overview

The RenderX monorepo consolidates all RenderX architecture components and dependencies into a single repository. This approach:

- **Simplifies Development**: All code in one place, easier to make cross-cutting changes
- **Unifies Versioning**: Coordinate releases across all packages
- **Shares Tooling**: Single ESLint, TypeScript, and test configuration
- **Accelerates CI/CD**: Build and test all packages together
- **Improves Dependency Management**: Internal packages use workspace protocol
- **Enhances Developer Experience**: Single clone, single install, single build

## Monorepo Structure

```
renderx-plugins-demo/
├── packages/                        # All monorepo packages
│   ├── host-sdk/                    # @renderx-plugins/host-sdk
│   ├── manifest-tools/              # @renderx-plugins/manifest-tools
│   ├── musical-conductor/           # musical-conductor
│   ├── canvas/                      # @renderx-plugins/canvas
│   ├── canvas-component/            # @renderx-plugins/canvas-component
│   ├── control-panel/               # @renderx-plugins/control-panel
│   ├── header/                      # @renderx-plugins/header
│   ├── library/                     # @renderx-plugins/library
│   ├── library-component/           # @renderx-plugins/library-component
│   ├── components/                  # @renderx-plugins/components
│   └── digital-assets/              # @renderx-plugins/digital-assets
├── src/                             # Host application code
├── tests/                           # Host application tests
├── docs/                            # Documentation
├── scripts/                         # Build and automation scripts
├── tsconfig.base.json               # Base TypeScript configuration
├── tsconfig.json                    # Root TypeScript configuration
├── eslint.config.js                 # ESLint configuration
├── vitest.config.ts                 # Vitest configuration
├── vite.config.js                   # Vite configuration
└── package.json                     # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 10 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/BPMSoftwareSolutions/renderx-plugins-demo.git
cd renderx-plugins-demo

# Install all dependencies (including workspace packages)
npm install

# Build all packages
npm run build:packages

# Start development server
npm run dev
```

## Development Workflow

### Working on the Host Application

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Working on Packages

```bash
# Build all packages
npm run build:packages

# Build specific package
npm --prefix packages/package-name run build

# Watch mode for package development
npm --prefix packages/package-name run dev
```

### Running Tests

```bash
# Run all tests (host + packages)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run package tests only
npm run packages:test

# Run E2E tests
npm run e2e
```

### Linting

```bash
# Lint all code
npm run lint

# Lint and auto-fix
npm run lint:fix

# Lint packages only
npm run packages:lint
```

## Building Packages

### Build Order

Packages are built in dependency order:

1. **host-sdk** (no dependencies)
2. **manifest-tools** (depends on host-sdk)
3. **musical-conductor** (no dependencies)
4. **All plugins** (depend on host-sdk, manifest-tools, musical-conductor)

### Build Commands

```bash
# Build all packages
npm run build:packages

# Build host application
npm run build:host

# Build everything (packages + host)
npm run build:all
```

### Watch Mode

For active development, use watch mode to automatically rebuild on changes:

```bash
# Watch specific package
npm --prefix packages/package-name run dev
```

## Running Tests

### Test Structure

- **Unit Tests**: Located in `tests/` directory and package-specific `tests/` directories
- **Integration Tests**: Located in `tests/` directory
- **E2E Tests**: Located in `cypress/e2e/` directory

### Test Commands

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run e2e

# Run specific test file
npm test -- tests/specific-test.spec.ts
```

## Adding New Packages

### Step 1: Create Package Directory

```bash
mkdir -p packages/new-package/src
```

### Step 2: Create package.json

```json
{
  "name": "@renderx-plugins/new-package",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@renderx-plugins/host-sdk": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.9.2",
    "vitest": "^3.2.4"
  }
}
```

### Step 3: Create tsconfig.json

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

### Step 4: Create Source Files

```bash
# Create entry point
touch packages/new-package/src/index.ts
```

### Step 5: Update Root Configuration

Add package reference to root `tsconfig.json`:

```json
{
  "references": [
    { "path": "./packages/new-package" }
  ]
}
```

### Step 6: Install Dependencies

```bash
npm install
```

## Version Management

### Versioning Strategy

The monorepo uses **independent versioning** where each package maintains its own version number. This allows:

- Packages to evolve at their own pace
- Semantic versioning per package
- Flexibility in release cycles

### Bumping Versions

```bash
# Bump version for specific package
cd packages/package-name
npm version patch|minor|major

# Update dependencies in other packages if needed
```

## Publishing Strategy

### Publishing to npm

Packages can be published to npm individually:

```bash
# Publish specific package
cd packages/package-name
npm publish

# Publish all changed packages
npm run publish:changed
```

### Workspace Protocol

During development, packages reference each other using the `workspace:*` protocol:

```json
{
  "dependencies": {
    "@renderx-plugins/host-sdk": "workspace:*"
  }
}
```

When publishing, npm automatically converts `workspace:*` to the actual version number.

## Troubleshooting

### Common Issues

#### Issue: "Cannot find module '@renderx-plugins/package-name'"

**Solution**: Ensure the package is built:

```bash
npm run build:packages
```

#### Issue: "Type errors in package"

**Solution**: Rebuild TypeScript declarations:

```bash
cd packages/package-name
npm run build
```

#### Issue: "Tests failing after package changes"

**Solution**: Rebuild packages and re-run tests:

```bash
npm run build:packages
npm test
```

#### Issue: "Circular dependency detected"

**Solution**: Review package dependencies and refactor to remove circular references. Use dependency injection or event-driven patterns to break cycles.

### Getting Help

- Check [GitHub Issues](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues)
- Review [Architecture Documentation](./docs/renderx-plugins-demo-adf.json)
- Consult [ADRs](./docs/adr/) for architectural decisions

## Migration Status

See [Issue #321](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/321) for the complete migration plan and status.

### Phases

- [x] Phase 1: Setup monorepo infrastructure
- [x] Phase 2: Migrate @renderx-plugins/host-sdk
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

