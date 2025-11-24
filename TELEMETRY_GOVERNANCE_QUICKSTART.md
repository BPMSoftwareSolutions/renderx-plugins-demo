<!-- AUTO-GENERATED -->
<!-- Source: orchestration-audit-system-project-plan.json (governanceDocumentation.telemetryGovernance.quickstart) -->
<!-- Generated: 2025-11-24T19:41:42.869Z -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# Telemetry Governance Quickstart

Quick reference for all telemetry governance operations and npm scripts

---

## Quick Reference: npm Scripts

```bash
# Generate sprint telemetry baseline snapshots
npm run telemetry:snapshots

# Capture telemetry from demo execution
npm run demo:capture:telemetry <sprint-id>

# Generate telemetry validation report
npm run telemetry:validate

```

## How It Works (End-to-End)

### 1️⃣ Phase 1: Define Telemetry (Sprint Planning)

Signatures defined in plan.telemetry.signatures

### 2️⃣ Phase 2: Generate Snapshots (Pre-Build)

npm run build creates immutable baselines

### 3️⃣ Phase 3: Instrument Demo (Development)

Developers emit [TELEMETRY_EVENT] markers

### 4️⃣ Phase 4: Capture Demo Telemetry (Test Phase)

npm run demo:capture:telemetry validates signatures

### 5️⃣ Phase 5: Validate Coverage (Release Phase)

npm run telemetry:validate confirms 100% coverage


---

**Generated from**: `orchestration-audit-system-project-plan.json` (v1.3.0)  
**Generator**: `scripts/generate-telemetry-quickstart.js`  
**Pattern**: JSON Authority → Auto-Generated Markdown  

<!-- DO NOT EDIT - Regenerate with: npm run build -->
<!-- AUTO-GENERATED -->
