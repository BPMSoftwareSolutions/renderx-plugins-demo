# Domain Registry Query Tools

## 📋 Available Query Utilities

You have several built-in tools for querying and analyzing the orchestration-domains registry and related systems:

---

## 1. **Orchestration Registry Validation** ✅
**File:** `scripts/validate-orchestration-registry.js`

**Purpose:** Validates the orchestration registry against the audit system and catalog sequences.

**What it does:**
- Loads the main orchestration-domains.json registry
- Cross-references with 55 web sequences from catalog
- Checks 2 domain sequences from the orchestration directory
- Reports implementation status vs. planned domains
- Shows movement counts for each domain

**How to use:**
```bash
node scripts/validate-orchestration-registry.js
```

**Output:** Shows each domain with either ✅ (implemented) or ⏳ (planned) status

---

## 2. **Lineage Query Engine** 🔍
**File:** `scripts/query-lineage.js`

**Purpose:** Query data lineage to understand origin, transformations, and audit trail of generated artifacts.

**Available commands:**

### Trace Origin
```bash
node scripts/query-lineage.js trace test-health-report.md
```
Shows where an artifact came from and its transformation path.

### Show Changes
```bash
node scripts/query-lineage.js changes test-health-report.md --since 7days
```
Shows what changed in an artifact since last generation.

### View Audit Trail
```bash
node scripts/query-lineage.js audit --full
```
Shows complete audit trail of all pipeline executions.

### Timeline View
```bash
node scripts/query-lineage.js timeline
```
Shows chronological list of all pipeline executions.

**Output:** Detailed lineage chains, source data counts, transformation counts, execution times.

---

## 3. **Catalog Analysis Tools** 📊

### Catalog Components
```bash
npm run analyze:catalog:components
```
Scans all plugin packages for json-components/ directories and generates catalog-components.json

### Catalog Sequences
```bash
npm run analyze:catalog:sequences
```
Analyzes all sequences in the catalog system

### Catalog Topics
```bash
npm run analyze:catalog:topics
```
Extracts and analyzes topic definitions

### Catalog Manifests
```bash
npm run analyze:catalog:manifests
```
Validates and analyzes manifest structures

---

## 4. **Archive Search** 🔎
**File:** `scripts/search-archive.js`

**Purpose:** Search through generated artifacts and historical data.

**How to use:**
```bash
npm run search:archive
```
Or directly:
```bash
node scripts/search-archive.js [query] [options]
```

**Use cases:**
- Find specific pipelines or domains by name
- Search for artifacts by pattern
- Browse archive history

---

## 5. **Tools Registry Documentation** 📚
**File:** `scripts/generate-tools-registry-docs.js`

**Purpose:** Generates documentation for the tools registry.

**How to use:**
```bash
node scripts/generate-tools-registry-docs.js
```

**Output:** Auto-generated documentation of all available tools.

---

## 6. **Registry Validation Tools** ✓

### Validate Orchestration Registry
```bash
node scripts/validate-orchestration-registry.js
```
Cross-validates registry against implemented sequences.

### Validate Tools Registry
```bash
node scripts/validate-tools-registry.js
```
Validates the tools registry structure.

---

## 📝 Recommended Query Workflows

### Query 1: Get Registry Status
```bash
node scripts/validate-orchestration-registry.js
```
→ Shows which domains are implemented vs. planned
→ Displays movement counts
→ Confirms registry validity

### Query 2: Find Pipeline Artifacts
```bash
npm run search:archive
```
→ Search for specific pipelines or documents
→ Browse historical artifacts

### Query 3: Trace Data Lineage
```bash
node scripts/query-lineage.js trace [artifact-name]
```
→ Understand where data came from
→ See transformation steps
→ View audit trail

### Query 4: Analyze Catalog Structure
```bash
npm run analyze:catalog:components
npm run analyze:catalog:sequences
```
→ Get comprehensive catalog analysis
→ Validate component and sequence structures

---

## 🎯 Quick Reference Commands

| Task | Command |
|------|---------|
| Check registry validity | `node scripts/validate-orchestration-registry.js` |
| Search for artifacts | `npm run search:archive` |
| Trace origin of file | `node scripts/query-lineage.js trace <file>` |
| View execution timeline | `node scripts/query-lineage.js timeline` |
| Analyze components | `npm run analyze:catalog:components` |
| Analyze sequences | `npm run analyze:catalog:sequences` |
| Analyze topics | `npm run analyze:catalog:topics` |
| Analyze manifests | `npm run analyze:catalog:manifests` |
| View tools registry | `node scripts/generate-tools-registry-docs.js` |
| Validate tools | `node scripts/validate-tools-registry.js` |

---

## 🔧 Direct Script Access

All tools are accessible via:
- **npm scripts** (for simplified commands)
- **Direct Node execution** (for full control)
- **Arguments and options** (each script supports different flags)

---

## 📍 Registry Location

**Main Registry:** `orchestration-domains.json`
- Contains 61 active domains
- Unified MusicalSequence interface
- 5-step execution flow specification
- Complete governance metadata

**Registry API in Code:**
- Loaded by: `architecture-governance-handlers.js`
- Validated by: `validate-orchestration-registry.js`
- Checked by: `generate-compliance-report.js`

---

## 💡 Next Steps

1. **Try the validation tool:**
   ```bash
   node scripts/validate-orchestration-registry.js
   ```

2. **Search for a specific domain:**
   ```bash
   npm run search:archive
   ```

3. **Trace an artifact's lineage:**
   ```bash
   node scripts/query-lineage.js trace [filename]
   ```

4. **Analyze catalog structure:**
   ```bash
   npm run analyze:catalog:components
   ```

All tools operate on the registry and related artifacts to give you complete visibility into your orchestration pipeline system.

---

**Generated:** 2024  
**Registry Status:** ✅ Valid (100/100 conformity)  
**Tools:** 12 query/validation utilities available
