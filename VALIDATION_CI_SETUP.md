# CI Enforcement: Symphonic Implementation Standard

This repository enforces the Symphonic Implementation Standard ("The Bible") via a validator that runs in CI on every push and pull request.

## What is validated
- `DOMAIN_REGISTRY.json` entries for orchestration domains
- Presence of implementation code under `analysisSourcePath`
- Symphonies folder detection (e.g., `src/symphonies/**`)
- Sequence JSON existence under `packages/orchestration/json-sequences`
- Every beat has an explicit `handler.name` and maps to a real exported function

## GitHub Actions workflow
The workflow file is located at `.github/workflows/validate-bible.yml` and runs on Windows with Node 20.

It executes:
```powershell
npm ci
$env:VALIDATE_BIBLE='1'; npm run analyze
npm run validate:symphonic
```

If the validator finds violations, the job fails.

## Local verification
Before pushing:
```powershell
# Optional debug to inspect indexes
$env:DEBUG_BIBLE='1'; npm run validate:symphonic

# Standard validation
npm run validate:symphonic
```

## Notes
- Set `VALIDATE_BIBLE=1` to ensure the validator runs after the analysis pipeline where applicable.
- Handler naming convention: `package/module#function` (package-qualified). Example: `canvas-component/export.export.gif#exportSvgToGif`.
