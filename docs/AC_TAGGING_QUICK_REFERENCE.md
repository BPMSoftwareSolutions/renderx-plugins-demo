# AC Tagging Quick Reference Card

**Version:** 1.0.0 | **Updated:** 2025-12-01

---

## 🎯 Quick Start

```typescript
import { acTag, beatTag } from './helpers/ac-tags';

// Tag a describe block with a BEAT
describe(beatTag('create', '1.1'), () => {
  // Tag individual tests with AC
  it(acTag('create', '1.1', 1) + ' should do something', () => {
    // test code
  });
});
```

---

## 📖 Tag Formats

### Full AC Tag
```
[AC:domain:sequence:beat:acIndex]
```

**Example:** `[AC:renderx-web-orchestration:create:1.1:1]`

### Beat Tag
```
[BEAT:domain:sequence:beat]
```

**Example:** `[BEAT:renderx-web-orchestration:create:1.1]`

---

## 🛠️ Helper Functions

### Basic Tags

```typescript
import { acTag, beatTag } from './helpers/ac-tags';

// AC tag
acTag('create', '1.1', 1)
// → '[AC:renderx-web-orchestration:create:1.1:1]'

// BEAT tag
beatTag('select', '2.3')
// → '[BEAT:renderx-web-orchestration:select:2.3]'
```

### With Descriptions

```typescript
import { acDescription, beatDescription } from './helpers/ac-tags';

// BEAT with description
describe(beatDescription('create', '1.1', 'Component Serialization'), () => {
  // tests...
});

// AC with description
it(acDescription('create', '1.1', 1, 'serializes deterministically'), () => {
  // test code
});
```

### Using Constants

```typescript
import { Sequences, acTag, beatTag } from './helpers/ac-tags';

beatTag(Sequences.CREATE, '1.1')
// → '[BEAT:renderx-web-orchestration:create:1.1]'

acTag(Sequences.EXPORT, '2.1', 3)
// → '[AC:renderx-web-orchestration:export:2.1:3]'
```

### Tag Builder (Type-Safe)

```typescript
import { tagBuilder } from './helpers/ac-tags';

const tags = tagBuilder()
  .withSequence('create')
  .withBeat('1.1');

tags.ac(1)   // → '[AC:renderx-web-orchestration:create:1.1:1]'
tags.beat()  // → '[BEAT:renderx-web-orchestration:create:1.1]'
```

---

## 📝 Common Patterns

### Pattern 1: Beat-Level Tagging

```typescript
describe(beatTag('create', '1.1'), () => {
  it('test 1', () => { /* ... */ });
  it('test 2', () => { /* ... */ });
  // All tests counted toward beat 1.1
});
```

### Pattern 2: AC-Level Tagging

```typescript
describe('Component Creation', () => {
  it(acTag('create', '1.1', 1) + ' serializes data', () => {
    // Specific AC validation
  });

  it(acTag('create', '1.1', 2) + ' validates schema', () => {
    // Different AC validation
  });
});
```

### Pattern 3: Multiple ACs (Use Sparingly)

```typescript
it(`${acTag('create', '1.1', 1)} ${acTag('create', '1.1', 2)} validates and serializes`, () => {
  // Test covers multiple ACs
  // Prefer separate tests for clarity
});
```

---

## 🗂️ Available Sequences

```typescript
Sequences.CREATE        // 'create'
Sequences.SELECT        // 'select'
Sequences.EXPORT        // 'export'
Sequences.UI_INIT       // 'ui-init'
Sequences.UI_THEME      // 'ui-theme-toggle'
Sequences.AUGMENT       // 'augment'
Sequences.DELETE        // 'delete'
Sequences.COPY          // 'copy'
```

---

## 🔍 Finding AC IDs

### Method 1: AC Registry

```bash
# Generate registry
npm run generate:ac-registry

# View registry
cat .generated/acs/renderx-web-orchestration.registry.json | grep "acId"
```

### Method 2: Sequence JSON

Check: `packages/orchestration/json-sequences/renderx-web-orchestration.json`

Look for `acceptanceCriteriaStructured` fields in beats.

### Method 3: Alignment Report

```bash
# Run alignment
npm run validate:ac-alignment

# Check uncovered ACs
cat docs/generated/renderx-web-orchestration/ac-alignment-report.md
```

---

## ✅ Best Practices

### DO ✓

- ✓ Use helper functions to avoid typos
- ✓ Tag at the appropriate level (BEAT for grouping, AC for specific)
- ✓ One primary AC per test for clarity
- ✓ Match THEN clauses to assertions
- ✓ Keep tags consistent and up-to-date

### DON'T ✗

- ✗ Hard-code tag strings (use helpers)
- ✗ Tag unrelated tests
- ✗ Mix multiple ACs in one test without clear reason
- ✗ Forget to update tags when ACs change
- ✗ Tag utility/helper tests

---

## 📊 Coverage Targets

| Threshold | Status | Action |
|-----------|--------|--------|
| ≥70% | ✅ Good | Maintain |
| 40-69% | ⚠️ Partial | Improve |
| <40% | ❌ Poor | Urgent |

---

## 🔗 Links

- **Full Guide:** [TEST_TAGGING_GUIDE.md](./TEST_TAGGING_GUIDE.md)
- **Examples:** [tests/examples/ac-tagged-test.example.spec.ts](../tests/examples/ac-tagged-test.example.spec.ts)
- **Helper Source:** [tests/helpers/ac-tags.ts](../tests/helpers/ac-tags.ts)
- **Issue #420:** https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/420

---

## 🚀 Commands

```bash
# Validate alignment
npm run validate:ac-alignment

# Generate AC registry
npm run generate:ac-registry

# Run code analysis (includes AC alignment)
node scripts/analyze-symphonic-code.cjs
```

---

**Quick Copy-Paste:**

```typescript
import { acTag, beatTag, acDescription, beatDescription, Sequences } from './helpers/ac-tags';

describe(beatTag('create', '1.1'), () => {
  it(acTag('create', '1.1', 1) + ' description', () => { });
});
```

---

**Generated:** 2025-12-01 | **Domain:** renderx-web-orchestration
