# CI Fix: Unsupported `workspace:*` Protocol

## Problem

**Error in CI:**
```
npm error code EUNSUPPORTEDPROTOCOL
npm error Unsupported URL Type "workspace:": workspace:*
```

**First occurrence:** [Run #19598696844](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/actions/runs/19598696844/job/56127013479)  
**Introduced in commit:** [dccca65](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/commit/dccca65f010375129ca7f8b99182abcf4b18fcd2)  
**Status:** Failing in all CI runs since then

## Root Cause

The `workspace:*` protocol is a **pnpm/yarn workspaces feature** that npm does not support. When commit `dccca65` added the `packages/self-healing` package, it used `workspace:*` for internal dependencies:

```json
{
  "dependencies": {
    "@renderx-plugins/host-sdk": "workspace:*",
    "@renderx-plugins/manifest-tools": "workspace:*"
  }
}
```

The CI workflow uses **npm** (not pnpm):
```yaml
- name: Install dependencies (work around npm optional deps bug)
  run: npm ci --legacy-peer-deps
```

npm doesn't understand `workspace:*` and fails immediately during dependency resolution.

## Solution

Replace all `workspace:*` references with `*` to use npm's native workspace resolution.

### Files Changed

1. **`package.json`** (root)
   - Changed 13 dependencies from `workspace:*` to `*`

2. **`packages/self-healing/package.json`**
   - Changed 2 dependencies from `workspace:*` to `*`

3. **`packages/self-healing/json-sequences/package.json`**
   - Changed 2 dependencies from `workspace:*` to `*`

### Verification

✅ **Local test passed:**
```bash
npm install --legacy-peer-deps
# added 111 packages, removed 1 package, changed 1 package, and audited 1354 packages in 2m
```

## Why This Works

Both npm and pnpm support workspaces, but with different syntax:

| Package Manager | Workspace Syntax | Behavior |
|----------------|------------------|----------|
| **pnpm** | `workspace:*` | Explicit workspace protocol |
| **yarn** | `workspace:*` | Explicit workspace protocol |
| **npm** | `*` | Implicit workspace resolution |

Using `*` is compatible with **all three** package managers when workspaces are configured in `package.json`:

```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

## Alternative Solution (Not Implemented)

We could have switched the CI to use **pnpm** instead:

```yaml
- uses: pnpm/action-setup@v2
  with:
    version: 8
- run: pnpm install --frozen-lockfile
```

However, this would require:
- Generating a `pnpm-lock.yaml` file
- Updating all CI workflows
- Potentially breaking local developer workflows

The `workspace:*` → `*` change is **less disruptive** and maintains compatibility.

## Testing

To verify the fix works in CI, push this commit and check:
- ✅ `npm ci --legacy-peer-deps` succeeds
- ✅ `npm run build:packages` succeeds
- ✅ All lint and test steps pass

## References

- [npm workspaces documentation](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [pnpm workspace protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)
- [Failing CI run](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/actions/runs/19598696844)
- [Commit that introduced the issue](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/commit/dccca65f010375129ca7f8b99182abcf4b18fcd2)

---

**Date:** 2025-11-26  
**Fixed by:** Augment AI Agent  
**Status:** ✅ Ready for commit and push

