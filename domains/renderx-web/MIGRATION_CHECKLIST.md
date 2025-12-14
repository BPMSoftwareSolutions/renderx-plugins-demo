# RenderX-Web Domain Migration Checklist

**Status:** In Progress
**Started:** TBD
**Completed:** TBD

---

## Quick Reference

| Phase | Status | Duration | Completed |
|-------|--------|----------|-----------|
| 1. Preparation | ✅ Complete | 2h | 2025-12-14 |
| 2. Move Runtime Plugins | ⏳ Pending | 4h | - |
| 3. Move UI Plugins | ⏳ Pending | 4h | - |
| 4. Consolidate SRC | ⏳ Pending | 3h | - |
| 5. Move Public Assets | ⏳ Pending | 2h | - |
| 6. Move Orchestration | ⏳ Pending | 1h | - |
| 7. Update Host SDK | ⏳ Pending | 3h | - |
| 8. Update Documentation | ⏳ Pending | 2h | - |
| 9. Cleanup & Validation | ⏳ Pending | 2h | - |
| 10. Update CI/CD | ⏳ Pending | 2h | - |

**Total Progress:** 10% (1/10 phases)

---

## Phase 1: Preparation ✅

**Status:** Complete
**Completed:** 2025-12-14

- [x] Create `domains/renderx-web/` directory structure
- [x] Create `domain-registry.json` manifest
- [x] Create `domain-registry.schema.json` for validation
- [x] Create domain `README.md`
- [x] Document current state in `RENDERX_WEB_DOMAIN_ARCHITECTURE.md`

---

## Phase 2: Move Runtime Plugins ⏳

**Status:** Pending
**Assignee:** TBD
**Started:** TBD

### Tasks

- [ ] Move `packages/canvas-component/` → `domains/renderx-web/runtime/canvas-component/`
- [ ] Move `packages/library-component/` → `domains/renderx-web/runtime/library-component/`
- [ ] Update package names in `package.json` files
  - [ ] `canvas-component/package.json`: `@renderx-web/canvas-component`
  - [ ] `library-component/package.json`: `@renderx-web/library-component`
- [ ] Update root `package.json` workspaces
  - [ ] Add `"domains/renderx-web/runtime/*"` to workspaces array
- [ ] Update imports across codebase
  - [ ] Search: `@renderx-plugins/canvas-component`
  - [ ] Replace: `@renderx-web/canvas-component`
  - [ ] Search: `@renderx-plugins/library-component`
  - [ ] Replace: `@renderx-web/library-component`
- [ ] Update `public/plugins/plugin-manifest.json`
  - [ ] Update canvas-component module references
  - [ ] Update library-component module references
- [ ] Update build scripts
  - [ ] `build:packages` script in root package.json
  - [ ] Any scripts referencing these packages

### Testing

- [ ] `npm install` succeeds
- [ ] `npm run build:packages` succeeds
- [ ] `npm run dev` works
- [ ] `npm test` passes (all tests)
- [ ] `npm run e2e:cypress` passes

### Files Changed

- [ ] `packages/canvas-component/` → deleted
- [ ] `packages/library-component/` → deleted
- [ ] `domains/renderx-web/runtime/canvas-component/` → created
- [ ] `domains/renderx-web/runtime/library-component/` → created
- [ ] Root `package.json` → updated
- [ ] `public/plugins/plugin-manifest.json` → updated
- [ ] All import statements → updated

### Commit & Tag

- [ ] Commit: `feat: migrate runtime plugins to domain structure`
- [ ] Tag: `phase-2-runtime-plugins`

---

## Phase 3: Move UI Plugins ⏳

**Status:** Pending
**Assignee:** TBD
**Started:** TBD

### Tasks

- [ ] Move UI plugins to domain
  - [ ] `packages/control-panel/` → `domains/renderx-web/ui-plugins/control-panel/`
  - [ ] `packages/header/` → `domains/renderx-web/ui-plugins/header/`
  - [ ] `packages/library/` → `domains/renderx-web/ui-plugins/library/`
  - [ ] `packages/canvas/` → `domains/renderx-web/ui-plugins/canvas/`
- [ ] Update package names
  - [ ] `control-panel/package.json`: `@renderx-web/control-panel`
  - [ ] `header/package.json`: `@renderx-web/header`
  - [ ] `library/package.json`: `@renderx-web/library`
  - [ ] `canvas/package.json`: `@renderx-web/canvas`
- [ ] Update root `package.json` workspaces
  - [ ] Add `"domains/renderx-web/ui-plugins/*"` to workspaces
- [ ] Update all imports
  - [ ] control-panel imports
  - [ ] header imports
  - [ ] library imports
  - [ ] canvas imports
- [ ] Update plugin manifest
- [ ] Update build scripts
- [ ] Update Vite config aliases (if any)

### Testing

- [ ] `npm install` succeeds
- [ ] `npm run build:packages` succeeds
- [ ] `npm run dev` works
- [ ] UI renders correctly
- [ ] Theme toggle works
- [ ] Canvas operations work
- [ ] Control panel works
- [ ] `npm test` passes
- [ ] `npm run e2e:cypress` passes

### Commit & Tag

- [ ] Commit: `feat: migrate UI plugins to domain structure`
- [ ] Tag: `phase-3-ui-plugins`

---

## Phase 4: Consolidate SRC ⏳

**Status:** Pending
**Assignee:** TBD
**Started:** TBD

### Tasks

- [ ] Create directory structure
  - [ ] `domains/renderx-web/src/ui/`
  - [ ] `domains/renderx-web/src/services/`
  - [ ] `domains/renderx-web/src/infrastructure/`
  - [ ] `domains/renderx-web/src/config/`
- [ ] Move UI files
  - [ ] `src/ui/**` → `domains/renderx-web/src/ui/`
- [ ] Move domain services
  - [ ] `src/domain/components/inventory/` → `domains/renderx-web/src/services/inventory/`
  - [ ] `src/domain/css/` → `domains/renderx-web/src/services/css/`
  - [ ] `src/domain/layout/` → `domains/renderx-web/src/ui/layout/`
- [ ] Move infrastructure
  - [ ] `src/infrastructure/**` → `domains/renderx-web/src/infrastructure/`
- [ ] Move vendor (temporary)
  - [ ] `src/vendor/**` → `domains/renderx-web/src/infrastructure/vendor/`
- [ ] Move config
  - [ ] `src/core/manifests/**` → `domains/renderx-web/src/config/`
- [ ] Move entry points
  - [ ] `src/index.tsx` → `domains/renderx-web/src/index.tsx`
  - [ ] `src/global.css` → `domains/renderx-web/src/global.css`
- [ ] Update `index.html`
  - [ ] Point to `domains/renderx-web/src/index.tsx`
- [ ] Update `vite.config.js`
  - [ ] Set `root: 'domains/renderx-web'`
- [ ] Update all relative imports

### Testing

- [ ] `npm run dev` works
- [ ] `npm test` passes
- [ ] No import errors in console

### Commit & Tag

- [ ] Commit: `feat: consolidate src files into domain`
- [ ] Tag: `phase-4-consolidate-src`

---

## Phase 5: Move Public Assets ⏳

**Status:** Pending
**Assignee:** TBD
**Started:** TBD

### Tasks

- [ ] Move public directory
  - [ ] `public/**` → `domains/renderx-web/public/`
- [ ] Rename directories
  - [ ] `public/json-sequences/` → `domains/renderx-web/public/sequences/`
- [ ] Create manifests directory
  - [ ] `domains/renderx-web/public/manifests/`
- [ ] Move manifests
  - [ ] `interaction-manifest.json` → `manifests/`
  - [ ] `topics-manifest.json` → `manifests/`
  - [ ] `layout-manifest.json` → `manifests/`
  - [ ] `build-versions.json` → `manifests/`
- [ ] Update build scripts
  - [ ] `sync-json-sequences.js` - update output path
  - [ ] `generate-interaction-manifest.js` - update output path
  - [ ] `generate-topics-manifest.js` - update output path
  - [ ] `generate-layout-manifest.js` - update output path
  - [ ] `generate-versions-manifest.js` - update output path
  - [ ] `aggregate-plugins.js` - update paths
  - [ ] `sync-plugins.js` - update paths

### Testing

- [ ] `npm run pre:manifests` succeeds
- [ ] `npm run dev` works
- [ ] Manifests load correctly (check network tab)
- [ ] Plugin loading works

### Commit & Tag

- [ ] Commit: `feat: move public assets to domain`
- [ ] Tag: `phase-5-public-assets`

---

## Phase 6: Move Orchestration Registry ⏳

**Status:** Pending
**Assignee:** TBD
**Started:** TBD

### Tasks

- [ ] Create orchestration directory
  - [ ] `domains/renderx-web/orchestration/`
- [ ] Move orchestration file
  - [ ] `orchestration-domains.json` → `domains/renderx-web/orchestration/domains.json`
- [ ] Update scripts
  - [ ] `generate-orchestration-domains-from-sequences.js`
  - [ ] Any analysis/reporting scripts that reference orchestration-domains.json

### Testing

- [ ] `npm run regenerate:ographx` works
- [ ] `npm run pre:manifests` works
- [ ] Orchestration generation succeeds

### Commit & Tag

- [ ] Commit: `feat: move orchestration registry to domain`
- [ ] Tag: `phase-6-orchestration`

---

## Phase 7: Update Host SDK ⏳

**Status:** Pending
**Assignee:** TBD
**Started:** TBD

### Tasks

- [ ] Move symphony loader to host-sdk
  - [ ] `domains/renderx-web/src/infrastructure/vendor/vendor-symphony-loader.ts` → `packages/host-sdk/src/core/manifests/symphony-loader.ts`
- [ ] Update host-sdk exports
  - [ ] `packages/host-sdk/src/index.ts` - export symphony-loader
- [ ] Update all imports
  - [ ] Search: `../../vendor/vendor-symphony-loader`
  - [ ] Replace: `@renderx-plugins/host-sdk/core/manifests/symphony-loader`
- [ ] Remove vendor directory
  - [ ] Delete `domains/renderx-web/src/infrastructure/vendor/`
- [ ] Handle `vendor-control-panel.ts` if needed

### Testing

- [ ] `npm run build -w packages/host-sdk` succeeds
- [ ] `npm run dev` works
- [ ] `npm test` passes
- [ ] Symphony loading works

### Commit & Tag

- [ ] Commit: `feat: move symphony loader to host-sdk`
- [ ] Tag: `phase-7-host-sdk`

---

## Phase 8: Update Documentation ⏳

**Status:** Pending
**Assignee:** TBD
**Started:** TBD

### Tasks

- [ ] Create docs directory
  - [ ] `domains/renderx-web/docs/`
- [ ] Create documentation files
  - [ ] `architecture.md` - Architecture diagrams and patterns
  - [ ] `sequences.md` - Complete sequence catalog
  - [ ] `api.md` - API reference documentation
- [ ] Update domain README
  - [ ] Reflect final structure
  - [ ] Update examples
  - [ ] Update paths
- [ ] Update root README
  - [ ] Add reference to domain
  - [ ] Update project structure section
- [ ] Add migration notes
  - [ ] Update `RENDERX_WEB_DOMAIN_ARCHITECTURE.md` with completion status

### Commit & Tag

- [ ] Commit: `docs: add domain documentation`
- [ ] Tag: `phase-8-documentation`

---

## Phase 9: Cleanup & Validation ⏳

**Status:** Pending
**Assignee:** TBD
**Started:** TBD

### Tasks

- [ ] Remove old directories
  - [ ] Delete `src/` (if empty)
  - [ ] Delete `public/` (if empty)
- [ ] Check for broken symlinks
- [ ] Run validation
  - [ ] `npm run validate:domains` (if exists)
  - [ ] `npm run analyze:domains` (if exists)
- [ ] Run full test suite
  - [ ] `npm test` - all unit tests
  - [ ] `npm run e2e:cypress` - all E2E tests
- [ ] Build for production
  - [ ] `npm run build` - production build
  - [ ] `npm run preview` - preview server
- [ ] Manual testing
  - [ ] Load preview
  - [ ] Test all features
  - [ ] Verify bundle sizes
  - [ ] Check source maps

### Validation Checklist

- [ ] No old `src/` directory
- [ ] No old `public/` directory
- [ ] All tests passing
- [ ] Production build succeeds
- [ ] Preview server works
- [ ] All features functional

### Commit & Tag

- [ ] Commit: `chore: remove old structure and validate migration`
- [ ] Tag: `phase-9-cleanup`

---

## Phase 10: Update CI/CD ⏳

**Status:** Pending
**Assignee:** TBD
**Started:** TBD

### Tasks

- [ ] Update GitHub Actions
  - [ ] Update paths in workflow files
  - [ ] Update build commands
  - [ ] Update artifact paths
- [ ] Update deployment scripts
  - [ ] Update paths
  - [ ] Update environment variables (if needed)
- [ ] Update CI cache keys (if path-dependent)
- [ ] Test CI pipeline
  - [ ] Trigger CI build
  - [ ] Verify all jobs pass
  - [ ] Verify deployment (if applicable)

### Files to Update

- [ ] `.github/workflows/*.yml`
- [ ] Deployment scripts
- [ ] CI configuration files

### Commit & Tag

- [ ] Commit: `ci: update CI/CD for domain structure`
- [ ] Tag: `phase-10-ci-cd`

---

## Final Checklist

### Code Quality

- [ ] Zero test failures
- [ ] Zero ESLint errors
- [ ] Zero TypeScript errors
- [ ] 100% backwards compatibility maintained

### Performance

- [ ] Build time not degraded
- [ ] Dev server startup time acceptable
- [ ] Runtime performance maintained
- [ ] Bundle size not increased

### Documentation

- [ ] All documentation updated
- [ ] Examples work
- [ ] Migration notes complete
- [ ] README files accurate

### Team Readiness

- [ ] Team briefed on new structure
- [ ] Onboarding guide available
- [ ] Questions answered
- [ ] Buy-in achieved

---

## Completion

**Migration Completed:** TBD
**Total Time:** TBD
**Issues Encountered:** TBD
**Lessons Learned:** TBD

---

## Notes

Use this space for migration notes, issues encountered, and solutions:

```
[Date] - [Note]
Example:
2025-12-14 - Phase 1 completed. Domain registry and documentation created.
```

---

**Last Updated:** 2025-12-14
