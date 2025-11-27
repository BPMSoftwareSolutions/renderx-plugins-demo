# Symphonia Architecture Governance

**Effective: November 27, 2025**  
**Authority: Senior Architect Decision**

---

## Executive Summary

The Symphonia orchestration system operates under strict architectural governance where **JSON is the single source of truth** for all definitions. This document establishes the authoritative hierarchy, governance rules, validation mechanisms, and audit trails that ensure consistency, auditability, and maintainability across the entire system.

---

## Part 1: Source of Truth Hierarchy

### The Authoritative Stack

```
TIER 1 (Authoritative Definition)
┌─────────────────────────────────────────────────────────────┐
│ JSON FILES - THE SINGLE SOURCE OF TRUTH                     │
├─────────────────────────────────────────────────────────────┤
│ • orchestration-domains.json  (master registry)              │
│ • build-pipeline-symphony.json (primary symphony spec)       │
│ • safe-continuous-delivery-pipeline.json (SAFe spec)         │
│ • symphonia-conformity-alignment-pipeline.json (conformity)  │
│ • symphony-report-pipeline.json (reporting spec)             │
│ • All JSON in packages/orchestration/json-sequences/*        │
└─────────────────────────────────────────────────────────────┘
         ↓ DEFINES ↓
TIER 2 (Implementation Conformance)
┌─────────────────────────────────────────────────────────────┐
│ CODE IMPLEMENTATIONS - MUST CONFORM TO JSON                 │
├─────────────────────────────────────────────────────────────┤
│ • Handlers in scripts/build-symphony-handlers.js             │
│ • Orchestrators in scripts/orchestrate-build-symphony.js    │
│ • TypeScript implementations in src/**/*.symphony.ts        │
│ • All code MUST match JSON specifications                   │
└─────────────────────────────────────────────────────────────┘
         ↓ VALIDATED BY ↓
TIER 3 (Testing & Validation)
┌─────────────────────────────────────────────────────────────┐
│ TESTS - VALIDATE JSON ↔ CODE MAPPING                        │
├─────────────────────────────────────────────────────────────┤
│ • tests/**/*.spec.ts (beat → handler mapping tests)         │
│ • vitest suites (JSON schema validation)                    │
│ • bdd/**/*.feature (Gherkin specs from JSON)                │
│ • Integration tests (JSON → execution verification)         │
└─────────────────────────────────────────────────────────────┘
         ↓ DOCUMENTS ↓
TIER 4 (Documentation - DERIVED ONLY)
┌─────────────────────────────────────────────────────────────┐
│ MARKDOWN - DOCUMENTATION ONLY (NEVER AUTHORITATIVE)         │
├─────────────────────────────────────────────────────────────┤
│ • *.md files are ALWAYS generated from or validated against  │
│ • ENTITY_TERMINOLOGY_MAPPING.md (describes JSON structure)  │
│ • BUILD_PIPELINE_SYMPHONY.md (documents JSON spec)          │
│ • SYMPHONY_ORCHESTRATION_FRAMEWORK_GUIDE.md (guide only)   │
│ • If MD contradicts JSON → JSON is correct, MD is stale    │
└─────────────────────────────────────────────────────────────┘
```

### The Rule

**Any change to the system MUST start with the JSON.**

```
JSON Change → Code Change → Test Addition → Markdown Update
              (required)   (required)      (required)
```

If the order is violated:
- Code-first changes → CI/CD blocks until JSON is updated
- Test-first changes → Must reference JSON specification
- Markdown-first changes → Are documentation tasks, not system changes

---

## Part 2: Governance Rules

### Rule 1: JSON Definitions Are Immutable-Unless-Versioned

**Definition:** Once a JSON structure is deployed, changes must be versioned.

```json
{
  "id": "build-pipeline-symphony",
  "version": "1.0.0",
  "deprecatedVersions": [],
  "movements": [ /* ... */ ]
}
```

**Actions:**
- Backward-incompatible changes → Increment major version
- New fields (additive) → Increment minor version
- Bug fixes only → Increment patch version

---

### Rule 2: Code Must Conform to JSON

**Definition:** Every code implementation must have a corresponding JSON specification it implements.

**Validation:**
```javascript
// Example: Handler must match beat definition
const beat = symphony.movements[0].beats[0];
const handler = handlers[beat.handler]; // must exist

if (!handler) {
  throw new Error(`Handler "${beat.handler}" not implemented for beat "${beat.event}"`);
}
```

**Enforcement:**
- CI/CD validates handler existence before build
- Tests verify handler behavior matches beat specification
- Linting rules check for orphaned handlers (code without JSON)

---

### Rule 3: Tests Are Specifications

**Definition:** Tests are executable specifications derived from JSON.

**Structure:**
```typescript
describe('Build Pipeline Symphony - Beat Validation', () => {
  const symphony = require('build-pipeline-symphony.json');
  
  symphony.movements.forEach(movement => {
    movement.beats.forEach(beat => {
      it(`should implement handler for beat: ${beat.event}`, () => {
        // Test verifies handler exists and conforms to beat spec
        expect(handlers[beat.handler]).toBeDefined();
        expect(handlers[beat.handler].matches(beat)).toBe(true);
      });
    });
  });
});
```

**Purpose:**
- Tests are NOT opinions about behavior
- Tests are executable representations of JSON specifications
- Every beat in JSON MUST have a corresponding test
- Every event in JSON MUST be verifiable

---

### Rule 4: Markdown Is Documentation, Never Source

**Definition:** Markdown documents what JSON defines; it never defines new behavior.

**Valid Markdown Statements:**
- ✅ "Movement 1 has 3 beats" (can verify from JSON)
- ✅ "Build validates orchestration domains" (describes beat handler)
- ✅ "Run `npm run build:symphony`" (documents invocation)

**Invalid Markdown Statements:**
- ❌ "Movement 1 should have 3 beats" (JSON is authority)
- ❌ "Build validates orchestration domains and also validates X" (not in JSON)
- ❌ "Add a new beat for Y" (JSON change, not markdown)

**Audit Rule:**
If markdown contradicts JSON:
1. JSON is correct
2. Markdown must be updated
3. A ticket is created to audit why they diverged

---

### Rule 5: Any Change Requires Traceability

**Definition:** Every system change must be traceable from JSON → Code → Tests → Markdown.

**Change Audit Trail:**
```
JSON Change (e.g., add beat)
├─ Update: build-pipeline-symphony.json
├─ Code: Add handler in build-symphony-handlers.js
├─ Test: Add test in build-symphony.spec.ts
├─ Verify: beat.handler exists and passes test
├─ Docs: Update BUILD_PIPELINE_SYMPHONY.md
└─ Commit: Single PR with all 5 changes

CI/CD Checklist:
✓ JSON is valid schema
✓ All handlers referenced in JSON exist
✓ All handlers have corresponding tests
✓ Tests reference JSON specification
✓ Markdown documents JSON (not contradicting)
```

---

## Part 3: Validation Mechanisms

### Validation 1: JSON Schema Validation

**File:** `packages/orchestration/schemas/symphony-schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Symphonia Orchestration Sequence",
  "type": "object",
  "required": ["id", "name", "movements", "events"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "name": { "type": "string" },
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "movements": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "beats"],
        "properties": {
          "name": { "type": "string" },
          "beats": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["number", "event", "handler"],
              "properties": {
                "number": { "type": "integer", "minimum": 1 },
                "event": { "type": "string" },
                "handler": { "type": "string" },
                "description": { "type": "string" }
              }
            }
          }
        }
      }
    }
  }
}
```

**Validation Command:**
```bash
ajv validate -s packages/orchestration/schemas/symphony-schema.json \
            -d packages/orchestration/json-sequences/build-pipeline-symphony.json
```

**CI/CD Integration:**
```yaml
- name: Validate Symphony JSON
  run: npm run validate:symphony:schemas
```

---

### Validation 2: Handler-to-Beat Mapping

**File:** `scripts/validate-handler-mapping.js`

```javascript
/**
 * Validates that all beats in symphony have corresponding handlers
 * and all handlers are used by at least one beat
 */
const symphony = require('../packages/orchestration/json-sequences/build-pipeline-symphony.json');
const handlers = require('./build-symphony-handlers.js');

const errors = [];
const warnings = [];

// Check: Every beat has a handler
symphony.movements.forEach((movement, mIdx) => {
  movement.beats.forEach((beat, bIdx) => {
    if (!handlers[beat.handler]) {
      errors.push(
        `Movement ${mIdx + 1}, Beat ${bIdx + 1}: Handler "${beat.handler}" not implemented`
      );
    }
  });
});

// Check: Every handler is used (warning if not)
Object.keys(handlers).forEach(handlerName => {
  const used = symphony.movements.some(m =>
    m.beats.some(b => b.handler === handlerName)
  );
  if (!used) {
    warnings.push(`Handler "${handlerName}" is not used by any beat`);
  }
});

if (errors.length > 0) {
  console.error('❌ Handler mapping validation FAILED:\n', errors);
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('⚠️ Handler mapping warnings:\n', warnings);
}

console.log('✅ Handler mapping validation PASSED');
```

**CI/CD Integration:**
```bash
npm run validate:handlers
```

---

### Validation 3: Test Coverage from JSON

**File:** `scripts/validate-test-coverage.js`

```javascript
/**
 * Validates that every beat in JSON has a corresponding test
 */
const symphony = require('../packages/orchestration/json-sequences/build-pipeline-symphony.json');
const fs = require('fs');
const path = require('path');

const testFile = fs.readFileSync(
  path.join(__dirname, '../tests/build-symphony.spec.ts'),
  'utf8'
);

const coverage = {};
const errors = [];

symphony.movements.forEach((movement, mIdx) => {
  movement.beats.forEach((beat, bIdx) => {
    const beatId = `${movement.name}:${beat.event}`;
    
    // Check if test mentions this beat
    if (!testFile.includes(beat.event)) {
      errors.push(
        `Missing test for: Movement ${mIdx + 1}, Beat ${bIdx + 1} (${beat.event})`
      );
    }
    
    coverage[beatId] = testFile.includes(beat.event);
  });
});

const covered = Object.values(coverage).filter(Boolean).length;
const total = Object.keys(coverage).length;
const percentage = Math.round((covered / total) * 100);

console.log(`\n📊 Test Coverage Report`);
console.log(`   Covered: ${covered}/${total} beats (${percentage}%)\n`);

if (errors.length > 0) {
  console.error('❌ Missing test coverage:');
  errors.forEach(e => console.error(`   - ${e}`));
  process.exit(1);
}

console.log('✅ All beats have test coverage');
```

**CI/CD Integration:**
```bash
npm run validate:test-coverage
```

---

### Validation 4: Markdown Consistency

**File:** `scripts/validate-markdown-consistency.js`

```javascript
/**
 * Validates that markdown documentation is consistent with JSON definitions
 */
const symphony = require('../packages/orchestration/json-sequences/build-pipeline-symphony.json');
const fs = require('fs');

const mdFiles = [
  'BUILD_PIPELINE_SYMPHONY.md',
  'SYMPHONY_ORCHESTRATION_FRAMEWORK_GUIDE.md'
];

const errors = [];

// Key facts to verify
const facts = {
  movementCount: symphony.movements.length,
  totalBeats: symphony.movements.reduce((sum, m) => sum + m.beats.length, 0),
  eventCount: symphony.events.length
};

mdFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check: Movement count is mentioned correctly
  if (content.includes(`${facts.movementCount} movements`)) {
    // Good
  } else if (content.includes('movement')) {
    errors.push(`${file}: Movement count mismatch or not mentioned`);
  }
  
  // Check: Beat count is mentioned correctly
  if (!content.includes(String(facts.totalBeats))) {
    errors.push(`${file}: Total beat count (${facts.totalBeats}) not found`);
  }
});

if (errors.length > 0) {
  console.error('⚠️ Markdown consistency warnings:');
  errors.forEach(e => console.error(`   - ${e}`));
  console.error('\n💡 Tip: Update markdown to match JSON specification');
}
```

**CI/CD Integration:**
```bash
npm run validate:markdown
```

---

## Part 4: Symphony Structure in JSON

### Enhanced orchestration-domains.json

Add a "schema" section that makes the symphony structure machine-readable:

```json
{
  "metadata": { /* ... */ },
  
  "schema": {
    "version": "1.0.0",
    "description": "Schema for all Symphonia sequences",
    "sequenceTypes": [
      {
        "type": "orchestration",
        "requiredFields": ["id", "name", "movements", "events", "governance"],
        "movementSchema": {
          "requiredFields": ["name", "beats"],
          "beatSchema": {
            "requiredFields": ["number", "event", "handler"],
            "optionalFields": ["timing", "kind", "description"]
          }
        }
      },
      {
        "type": "plugin",
        "requiredFields": ["id", "name", "sequenceId"],
        "optionalFields": ["movements", "beats"]
      }
    ],
    "handlerRequirements": {
      "mustMatch": "beat.handler must reference a function in implementation code",
      "mustBeNamed": "handler function name must exactly match beat.handler",
      "mustBeDocumented": "handler must include JSDoc @symphony annotation"
    }
  },
  
  "categories": [ /* ... */ ],
  "domains": { /* ... */ }
}
```

---

## Part 5: Removed Ambiguity

### Canonical Names (CONFLATED - USE INTERCHANGEABLY)

```
Symphony = Orchestration Domain = Symphonic Domain
  └─ Authoritative source: JSON file
  └─ Examples: build-pipeline-symphony.json, conformity pipeline

Sub-Symphony = Sub-Orchestration Domain = Symphonic Component
  └─ Refers to: Movements, Beats, Events within a symphony
  └─ Examples: Validation movement, load context beat

Symphonic Pipeline = A pipeline that uses symphony pattern
  └─ NOT a separate entity
  └─ Usage: "symphonic build pipeline" = build symphony

Orchestration Domain Registry = Master symphony registry
  └─ File: orchestration-domains.json
  └─ Contains: All 55+ symphonies (plugin + orchestration)
```

**Rule:** When in doubt about terminology, check the JSON file it refers to.

---

## Part 6: Auditability

### JSON → Code Mapping

```
JSON: build-pipeline-symphony.json
  ├─ movement[0]: "Validation & Verification"
  │   ├─ beat[0]: handler="loadBuildContext"
  │   └─ beat[1]: handler="validateOrchestrationDomains"
  │
  └─ Code: scripts/build-symphony-handlers.js
     ├─ handlers.loadBuildContext()
     └─ handlers.validateOrchestrationDomains()

Audit Query: "Find all code that implements Movement 1"
Answer: grep handlers.js for movement[0].beats[*].handler values
```

### JSON → Test Mapping

```
JSON: build-pipeline-symphony.json
  └─ event: "build:initiated"

Test: tests/build-symphony.spec.ts
  └─ describe('build:initiated event')
     ├─ test('should emit build:initiated')
     └─ test('should pass event to next beat')

Audit Query: "Is every event in JSON tested?"
Answer: Run npm run validate:test-coverage
```

### JSON → Markdown Mapping

```
JSON: build-pipeline-symphony.json
  └─ movements.length = 6

Markdown: BUILD_PIPELINE_SYMPHONY.md
  └─ "The Build Pipeline Symphony has 6 movements"

Audit Query: "Are facts in markdown consistent with JSON?"
Answer: Run npm run validate:markdown
```

---

## Part 7: Implementation Checklist

To adopt this governance model, implement:

- [ ] **Add Schema Validation** - `npm run validate:symphony:schemas`
- [ ] **Add Handler Mapping Check** - `npm run validate:handlers`
- [ ] **Add Test Coverage Check** - `npm run validate:test-coverage`
- [ ] **Add Markdown Consistency Check** - `npm run validate:markdown`
- [ ] **Update CI/CD Pipeline** - All validations run on every PR
- [ ] **Version All JSON** - Add "version": "X.Y.Z" to all symphony files
- [ ] **Add Schema Section** - Update orchestration-domains.json with schema
- [ ] **Audit Existing Markdown** - Verify consistency with JSON
- [ ] **Document Handler Convention** - All handlers must have @symphony JSDoc
- [ ] **Create Handler Template** - Standardize new handler creation

---

## Part 8: Governance Enforcement

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

npm run validate:symphony:schemas || exit 1
npm run validate:handlers || exit 1
npm run validate:test-coverage || exit 1
npm run validate:markdown || exit 1

echo "✅ All validations passed - commit allowed"
```

### CI/CD Pipeline

```yaml
name: Symphonia Governance Validation

on: [pull_request, push]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate JSON Schemas
        run: npm run validate:symphony:schemas
        
      - name: Validate Handler Mapping
        run: npm run validate:handlers
        
      - name: Validate Test Coverage
        run: npm run validate:test-coverage
        
      - name: Validate Markdown Consistency
        run: npm run validate:markdown
```

### Rejection Rules

CI/CD **REJECTS** if:
- ❌ JSON is invalid schema
- ❌ Handler referenced in JSON but not implemented
- ❌ Beat exists in JSON but has no test
- ❌ Markdown contains facts contradicting JSON
- ❌ Code doesn't match JSON specification

---

## Part 9: Summary

| Aspect | Authority | Status | Update Path |
|--------|-----------|--------|-------------|
| **Definitions** | JSON files | Source of truth | JSON first, always |
| **Implementation** | Code + handlers | Must conform | Validate against JSON |
| **Testing** | Tests from JSON | Executable specs | Generated from JSON |
| **Documentation** | Markdown | Derived only | Never authoritative |
| **Versioning** | JSON versions | SemVer required | Major/minor/patch |
| **Conflicts** | JSON wins | Always | JSON is correct, others update |

**This architecture ensures:**
- ✅ Single source of truth (JSON)
- ✅ Auditability (trace changes)
- ✅ Consistency (validation at every step)
- ✅ Maintainability (changes are explicit)
- ✅ Reliability (tests verify JSON → code mapping)

---

**Document Version:** 1.0.0  
**Last Updated:** November 27, 2025  
**Authority:** Senior Architect  
**Status:** Approved & In Effect
