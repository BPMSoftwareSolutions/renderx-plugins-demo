# Architecture Governance Auto-Recovery System Guide

## Overview

The **Architecture Governance Auto-Recovery System** enables automatic recovery from out-of-process creation violations. When code or documentation is created without following the established governance process (JSON → Code → Tests → Markdown), the recovery system can detect and automatically fix violations by reverse-engineering the system back to conformity.

## What It Does

### Automatic Detection

The recovery system detects:
- **Orphan Handlers**: Handler implementations in code that don't have corresponding beat definitions in the symphony JSON
- **Uncovered Beats**: Beat definitions in JSON that don't have implementation tests
- **Markdown Contradictions**: Documentation that contradicts the authoritative JSON definitions
- **Missing Reconciliation**: Documentation that hasn't been reconciled with corrected JSON

### Automatic Recovery

The system automatically fixes violations by:
1. **Reconstructing Missing Beats**: Generates JSON beat definitions from discovered orphan handlers
2. **Inferring Structure**: Analyzes handler code to infer kind (validation, testing, auditing) and description
3. **Updating Symphony**: Merges reconstructed beats into the symphony JSON
4. **Resolving Conflicts**: Applies conflict resolution rules (JSON is always source of truth)
5. **Reconciling Markdown**: Updates documentation with recovery reconciliation notes
6. **Verifying Recovery**: Re-runs governance to ensure recovery was successful

## Usage

### Analyze for Orphan Handlers

Detect orphan handlers without making changes:

```bash
npm run governance:recover:analyze
```

Output shows which handlers are orphaned and why:
```
🔍 [RECOVERY] Analyzing handlers for orphan status...
   📝 Found 32 handler implementations
   🎵 Found 30 referenced handlers in symphony
   ⚠️  ORPHAN DETECTED: customValidationHandler
   ⚠️  ORPHAN DETECTED: unknownAuditingHandler
   ✅ Orphan detection complete: 2 orphans found
```

### Auto-Fix All Violations

Automatically recover the entire system from out-of-process creation:

```bash
npm run governance:recover
```

This executes the full recovery pipeline:
1. Detects orphan handlers
2. Reconstructs beats from orphans
3. Updates symphony JSON
4. Reconciles markdown documentation
5. Re-validates governance
6. Generates recovery report

Output example:
```
================================================================================
🎼 GOVERNANCE AUTO-RECOVERY SYSTEM INITIATED
================================================================================

🔍 [RECOVERY] Analyzing handlers for orphan status...
   📝 Found 32 handler implementations
   🎵 Found 30 referenced handlers in symphony
   ⚠️  ORPHAN DETECTED: customHandler
   ✅ Orphan detection complete: 1 orphans found

🏗️  [RECOVERY] Reconstructing beats from orphan handlers...
   ✅ Reconstructed beat for: customHandler (kind: validation)
   ✅ Beat reconstruction complete: 1 beats reconstructed

📝 [RECOVERY] Updating symphony JSON with reconstructed beats...
   ✅ Added reconstructed beat to movement: JSON Schema Validation
   ✅ Updated symphony JSON: .../architecture-governance-enforcement-symphony.json

📄 [RECOVERY] Reconciling markdown with JSON definitions...
   ✅ Reconciled: ARCHITECTURE_GOVERNANCE_SYMPHONY_GUIDE.md
   ✅ Markdown reconciliation complete

✅ [RECOVERY] Verifying recovery by re-running governance...
   ✅ Governance verification PASSED

================================================================================
✅ RECOVERY COMPLETE
================================================================================

📊 Recovery Report: .generated/recovery-report.json
   - Orphans detected: 1
   - Beats reconstructed: 1
   - Conflicts resolved: 0
   - Status: success
```

### Analyze Governance Report

Analyze a governance report and get recovery hints:

```bash
npm run governance:recover:report
```

This reads `.generated/governance-report.json` and shows:
- What violations were found
- Which orphan handlers were detected
- Which beats are uncovered
- Recovery hints for each violation

### Integration with Build Pipeline

Add recovery check to your build/pre-commit process:

```json
// In package.json
"pre:manifests": "npm run governance:recover && npm run governance:enforce && ...",
```

Or in `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run governance:recover
npm run governance:enforce
if [ $? -ne 0 ]; then
  echo "❌ Governance enforcement failed. Run 'npm run governance:recover' to auto-recover."
  exit 1
fi
```

## How It Works

### Step 1: Orphan Detection

```javascript
// Extracts all handler implementations from code
const handlers = new Set();
// Finds all "handlerName: async () => {}" patterns

// Loads symphony JSON to find referenced handlers
const referencedHandlers = symphony.movements
  .flatMap(m => m.beats)
  .map(b => b.handler);

// Identifies orphans
const orphans = handlers.filter(h => !referencedHandlers.has(h));
```

### Step 2: Beat Reconstruction

For each orphan handler:

```javascript
// 1. Infer kind from handler name
inferKindFromName(handlerName); // validation, testing, auditing, etc.

// 2. Infer description from name
inferDescriptionFromName(handlerName); // "Recovered: custom handler"

// 3. Create beat definition
const beat = {
  number: index + 1,
  event: `recovered-beat-${handlerName}`,
  handler: handlerName,
  kind: inferredKind,
  timing: 'immediate',
  description: inferredDescription,
  sourceOfTruth: 'reconstructed-from-orphan-handler'
};
```

### Step 3: Symphony Update

```javascript
// Find target movement based on kind
// kind: 'validation' -> Movement 1 (JSON Schema Validation)
// kind: 'testing' -> Movement 3 (Test Coverage Verification)
// kind: 'auditing' -> Movement 5 (Auditability Chain Verification)

// Check for conflicts
if (beatAlreadyExists) {
  // Conflict: keep JSON definition (JSON is source of truth)
  recordConflictResolution();
} else {
  // Add reconstructed beat to movement
  movement.beats.push(reconstructedBeat);
}

// Write updated symphony
fs.writeFileSync(symphonyPath, symphony);
```

### Step 4: Markdown Reconciliation

```javascript
// For each guide document:
// 1. Check if it has reconciliation note
// 2. Add reconciliation note with timestamp
// 3. Mark as "VERIFIED" by recovery system
```

### Step 5: Recovery Verification

```javascript
// Re-run governance enforcement
npm run governance:enforce

// If passes: recovery successful
// If fails: show what still needs fixing
```

## Recovery Report

The recovery system generates a detailed report at `.generated/recovery-report.json`:

```json
{
  "timestamp": "2025-11-26T14:32:15.000Z",
  "phase": "complete",
  "status": "success",
  "totalOrphansDetected": 2,
  "totalBeatsReconstructed": 2,
  "totalConflictsResolved": 0,
  "recoveryChain": [
    {
      "step": "detect-orphans",
      "timestamp": "2025-11-26T14:32:15.123Z",
      "description": "Scanning handler implementations for orphan status"
    },
    {
      "step": "reconstruct-beats",
      "timestamp": "2025-11-26T14:32:15.234Z",
      "description": "Generating beat definitions for orphan handlers"
    },
    // ... more steps
  ],
  "actionsTaken": [
    {
      "action": "orphan-detection",
      "handlerCount": 32,
      "referencedCount": 30,
      "orphanCount": 2,
      "orphans": ["customHandler", "unknownHandler"]
    },
    {
      "action": "beat-reconstruction",
      "beatsReconstructed": 2,
      "beats": [
        {
          "handler": "customHandler",
          "kind": "validation",
          "description": "Recovered: custom handler"
        }
        // ...
      ]
    },
    // ... more actions
  ],
  "warnings": [],
  "errors": []
}
```

## When to Use Recovery

### Use recovery when:
- A developer created a new handler without updating the symphony JSON
- Code was committed without following the JSON → Code → Tests → Markdown process
- Out-of-process documentation was created that contradicts JSON
- You want to ensure the entire system conforms to governance rules

### Recovery is NOT needed when:
- Changes were made through proper process (JSON first)
- All handlers have corresponding beats
- All beats have implementation tests
- Markdown is consistent with JSON

## Conflict Resolution Rules

When recovery detects conflicts:

1. **Handler Already Has JSON Definition**: Keep JSON definition (JSON is source of truth)
   - Mark as conflict in report
   - Don't overwrite existing beat
   - Record resolution in recovery report

2. **Beat Already Has Tests**: Don't regenerate tests
   - Keep existing tests
   - Mark beat as verified
   - Add to reconciliation

3. **Markdown Contradicts JSON**: Update markdown to match JSON
   - Add reconciliation note
   - Mark with timestamp and "recovery system" attribution
   - Document original vs. corrected version in report

## Programmatic Usage

```javascript
const recovery = require('./scripts/governance-auto-recovery.js');

// Full auto-recovery
const report = await recovery.runFullRecovery({
  skipVerification: false  // Re-run governance after recovery
});

// Detect orphans only
const orphans = await recovery.detectOrphanHandlers();
console.log(`Found ${orphans.length} orphan handlers`);

// Reconstruct beats
const beats = await recovery.reconstructBeatsFromOrphans();
console.log(`Reconstructed ${beats.length} beats`);

// Update symphony
const updatedSymphony = await recovery.updateSymphonyWithReconstructedBeats();

// Reconcile markdown
const reconciled = await recovery.reconcileMarkdownWithJSON();

// Analyze a governance report
const analysis = await recovery.analyzeGovernanceReportAndRecover(
  '.generated/governance-report.json'
);
```

## Troubleshooting

### Recovery Failed with "No handlers found"

This means the handler extraction regex didn't match your handler format. Check:
```javascript
// Expected format:
handlerName: async () => {
  // implementation
}
```

### Recovery Added beats to wrong movement

The kind inference looks for keywords in the handler name:
- `validate` → Movement 1
- `verify` → Movement 2
- `test` → Movement 3
- `audit` → Movement 5
- `report` → Movement 6

If your handler doesn't contain these keywords, it defaults to Movement 1. Manually move beats as needed and re-run governance.

### Conflicts keep occurring

If the same handler appears in both orphan and JSON definitions:
1. Manual review required
2. Decide which definition is correct
3. Delete the incorrect one
4. Re-run recovery

### Governance still fails after recovery

This means additional violations exist beyond orphan handlers:
1. Check the governance report for specific violations
2. Fix violations manually if needed
3. Run recovery again if new orphans are detected
4. Contact architecture team if unresolvable

## Architecture Governance Hierarchy

The recovery system enforces this hierarchy:

```
1. JSON (Authoritative)
   ↓ Source of truth for all system definitions
   
2. Code (Implements JSON)
   ↓ Must conform to JSON specifications
   
3. Tests (Validate Code ↔ JSON)
   ↓ Must verify mapping between implementations and definitions
   
4. Markdown (Derived from JSON)
   ↓ Must be consistent with authoritative JSON
```

Recovery works backwards through this chain:
- Detects code without JSON → Reconstructs JSON
- Updates JSON with missing definitions
- Reconciles markdown with corrected JSON
- Re-validates entire chain

## Next Steps

1. **Try recovery analysis**: `npm run governance:recover:analyze`
2. **Review recovery report**: Check `.generated/recovery-report.json`
3. **Run auto-recovery**: `npm run governance:recover`
4. **Verify governance**: `npm run governance:enforce`
5. **Integrate into CI/CD**: Add recovery to build pipeline

## Related Documentation

- [Architecture Governance Symphony Guide](./ARCHITECTURE_GOVERNANCE_SYMPHONY_GUIDE.md)
- [Architecture Governance Complete](./ARCHITECTURE_GOVERNANCE_COMPLETE.md)
- [Entity Terminology Mapping](./ENTITY_TERMINOLOGY_MAPPING.md)
- [Symphony Orchestration Pattern](./BUILD_SYMPHONY_DOCUMENTATION_INDEX.md)

---

**Recovery System Version**: 1.0.0  
**Last Updated**: November 26, 2025  
**JSON Authority**: Enabled ✅  
**Auto-Recovery**: Enabled ✅  
