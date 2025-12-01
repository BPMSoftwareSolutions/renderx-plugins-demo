# Test Tagging Guide — AC-to-Test Alignment

## Overview

This guide explains how to tag tests so they can be correlated with Acceptance Criteria (ACs) in the symphonic code analysis pipeline. Tagging enables automated measurement of AC coverage and improves traceability between requirements and tests.

## Why Tag Tests?

- **Traceability**: Link tests directly to acceptance criteria
- **Coverage Metrics**: Measure which ACs are validated by tests
- **Quality Assurance**: Ensure all requirements are tested
- **CI Gating**: Enable automated quality gates based on AC coverage
- **Documentation**: Make test intent explicit and discoverable

## Tagging Convention

Tags are embedded in test titles (for `describe()` or `it()` blocks) using a simple bracket notation.

### Full AC Tag

Links a test to a specific acceptance criterion:

```
[AC:<domain>:<sequence>:<beat>:<acIndex>]
```

**Example:**
```typescript
it('[AC:renderx-web-orchestration:create:1.1:1] should serialize component deterministically', () => {
  // Test implementation
});
```

### Beat Tag

Links a test to an entire beat (aggregates all ACs for that beat):

```
[BEAT:<domain>:<sequence>:<beat>]
```

**Example:**
```typescript
describe('[BEAT:renderx-web-orchestration:create:1.1] Component Serialization', () => {
  // Multiple tests for this beat
});
```

## Tag Format Breakdown

### Domain
The canonical domain identifier from `DOMAIN_REGISTRY.json`. For renderx-web domain, use:
- `renderx-web-orchestration` (canonical)

### Sequence
The sequence ID from the JSON sequence file (e.g., `create`, `select`, `export`, `ui-init`).

### Beat
The beat identifier in `<movement>.<beat>` format (e.g., `1.1`, `2.3`).

### AC Index
The 1-based index of the acceptance criterion within the beat (e.g., `1`, `2`, `3`).

## Finding AC IDs

### Using the AC Registry

The AC registry file contains all available AC IDs:
```bash
# Generate the registry
ANALYSIS_DOMAIN_ID=renderx-web-orchestration node scripts/generate-ac-registry.cjs

# View the registry
cat .generated/acs/renderx-web-orchestration.registry.json
```

Each AC entry includes:
```json
{
  "acId": "renderx-web-orchestration:create:1.1:1",
  "sequenceId": "create",
  "beatId": "1.1",
  "beatName": "serializeSelectedComponent",
  "handler": "serializeSelectedComponent",
  "given": ["selected component"],
  "when": ["serializeSelectedComponent runs"],
  "then": ["component serializes deterministically", "payload validates", "latency ≤ 20ms"]
}
```

### Using Sequence JSON Files

ACs are also defined in sequence JSON files under `acceptanceCriteriaStructured`:

```
packages/orchestration/json-sequences/renderx-web-orchestration.json
```

## Tagging Examples

### Unit Tests (Vitest/Jest)

#### Full AC Tag in Test Case
```typescript
import { describe, it, expect } from 'vitest';

describe('Component Serialization', () => {
  it('[AC:renderx-web-orchestration:create:1.1:1] serializes deterministically', () => {
    const component = createTestComponent();
    const serialized = serializeSelectedComponent(component);

    expect(serialized).toBeDefined();
    expect(serialized.id).toBe(component.id);
  });

  it('[AC:renderx-web-orchestration:create:1.1:1] validates payload schema', () => {
    const component = createTestComponent();
    const serialized = serializeSelectedComponent(component);

    expect(validatePayload(serialized)).toBe(true);
  });

  it('[AC:renderx-web-orchestration:create:1.1:1] completes within 20ms', async () => {
    const component = createTestComponent();
    const start = performance.now();

    await serializeSelectedComponent(component);

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(20);
  });
});
```

#### Beat Tag in Describe Block
```typescript
describe('[BEAT:renderx-web-orchestration:create:1.2] Copy to Clipboard', () => {
  it('places payload on clipboard', () => {
    const payload = { data: 'test' };
    copyToClipboard(payload);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('test')
    );
  });

  it('provides user confirmation', () => {
    const onConfirm = vi.fn();
    copyToClipboard({ data: 'test' }, onConfirm);

    expect(onConfirm).toHaveBeenCalled();
  });

  it('retries on transient failure', async () => {
    mockClipboard.writeText.mockRejectedValueOnce(new Error('Transient'));

    await copyToClipboard({ data: 'test' });

    expect(mockClipboard.writeText).toHaveBeenCalledTimes(2);
  });
});
```

### E2E Tests (Cypress)

#### Full AC Tag
```typescript
describe('[BEAT:renderx-web-orchestration:select:1.1] Selection Overlay', () => {
  it('[AC:renderx-web-orchestration:select:1.1:1] shows overlay within 30ms', () => {
    cy.visit('/');

    cy.get('[data-component-id="test-component"]').click();

    cy.get('[data-testid="selection-overlay"]')
      .should('be.visible')
      .and('have.css', 'opacity', '1');

    // Verify timing (requires performance instrumentation)
    cy.window().then(win => {
      const timing = win.selectionOverlayTiming;
      expect(timing).to.be.lessThan(30);
    });
  });

  it('[AC:renderx-web-orchestration:select:1.1:1] aligns within 1px', () => {
    cy.visit('/');
    cy.get('[data-component-id="test-component"]').click();

    cy.get('[data-testid="selection-overlay"]').then($overlay => {
      cy.get('[data-component-id="test-component"]').then($component => {
        const overlayBounds = $overlay[0].getBoundingClientRect();
        const componentBounds = $component[0].getBoundingClientRect();

        expect(Math.abs(overlayBounds.top - componentBounds.top)).to.be.lessThan(1);
        expect(Math.abs(overlayBounds.left - componentBounds.left)).to.be.lessThan(1);
      });
    });
  });
});
```

### Multiple Tags

You can include multiple tags in a single test title if the test validates multiple ACs:

```typescript
it('[AC:renderx-web-orchestration:create:1.1:1] [AC:renderx-web-orchestration:create:1.1:2] serializes and validates', () => {
  const component = createTestComponent();
  const serialized = serializeSelectedComponent(component);

  // AC 1.1:1 - Deterministic serialization
  expect(serialized.id).toBe(component.id);

  // AC 1.1:2 - Validation
  expect(validatePayload(serialized)).toBe(true);
});
```

## Best Practices

### 1. Tag at the Right Level

- **Describe blocks**: Use `[BEAT:...]` tags for grouping related tests
- **Test cases**: Use `[AC:...]` tags for specific AC validation

### 2. One Primary AC Per Test

Prefer one AC per test for clarity and granular failure reporting:

```typescript
// ✅ GOOD - One AC per test
it('[AC:renderx-web-orchestration:create:1.1:1] validates schema', () => { ... });
it('[AC:renderx-web-orchestration:create:1.1:2] checks latency', () => { ... });

// ⚠️ AVOID - Multiple ACs in one test (harder to debug failures)
it('[AC:...:1.1:1] [AC:...:1.1:2] validates schema and latency', () => { ... });
```

### 3. Match THEN Clauses to Assertions

Each THEN clause in an AC should map to at least one assertion:

**AC:**
```json
{
  "given": "selected component",
  "when": "serializeSelectedComponent runs",
  "then": [
    "component serializes deterministically",
    "payload validates",
    "latency ≤ 20ms"
  ]
}
```

**Test:**
```typescript
it('[AC:renderx-web-orchestration:create:1.1:1] meets all requirements', () => {
  const component = createTestComponent();
  const start = performance.now();
  const serialized = serializeSelectedComponent(component);
  const duration = performance.now() - start;

  // THEN: component serializes deterministically
  expect(serialized).toMatchSnapshot();

  // THEN: payload validates
  expect(validatePayload(serialized)).toBe(true);

  // THEN: latency ≤ 20ms
  expect(duration).toBeLessThan(20);
});
```

### 4. Use Assertion Markers (Phase 2)

For deeper alignment analysis, optionally annotate assertion types:

```typescript
it('[AC:renderx-web-orchestration:create:1.1:1] validates requirements', () => {
  const serialized = serialize(component);

  // ASSERT:dom - DOM state validation
  expect(container.querySelector('.component')).toBeInTheDocument();

  // ASSERT:event - Event/telemetry validation
  expect(mockEventBus.publish).toHaveBeenCalledWith('component.serialized', ...);

  // ASSERT:perf - Performance validation
  expect(duration).toBeLessThan(20);

  // ASSERT:api - API response validation
  expect(response.status).toBe(200);
});
```

### 5. Keep Tags Accurate

- Update tags when ACs change
- Remove tags when tests are deleted
- Add tags to new tests covering existing ACs

## Validation & CI Integration

### Local Validation

Check your tags locally before committing:

```bash
# Generate AC registry
ANALYSIS_DOMAIN_ID=renderx-web-orchestration node scripts/generate-ac-registry.cjs

# Run alignment analysis (when implemented)
npm run analyze:ac-alignment
```

### CI Pipeline

The CI pipeline will:
1. Generate the AC registry
2. Run all tests and collect results
3. Parse test titles to extract AC tags
4. Compute alignment metrics
5. Report coverage and enforce thresholds

### Coverage Thresholds

- **Good**: ≥70% Average AC coverage
- **Warning**: <70% Average AC coverage
- **Fail**: <50% coverage on critical beats

## Tag Helper Functions (Optional)

Create helper functions to reduce typos:

```typescript
// test-helpers/ac-tags.ts
export function acTag(sequence: string, beat: string, ac: number): string {
  return `[AC:renderx-web-orchestration:${sequence}:${beat}:${ac}]`;
}

export function beatTag(sequence: string, beat: string): string {
  return `[BEAT:renderx-web-orchestration:${sequence}:${beat}]`;
}

// Usage:
import { acTag } from '../test-helpers/ac-tags';

it(`${acTag('create', '1.1', 1)} serializes deterministically`, () => {
  // ...
});
```

## FAQ

### Q: Do I need to tag every test?

A: No. Focus on tagging tests that directly validate acceptance criteria. Utility tests, negative tests, and edge cases don't need tags unless they validate a specific AC.

### Q: What if a beat has no tests yet?

A: The alignment report will show 0% coverage for that beat, which is valuable feedback. Create tests and add tags to increase coverage.

### Q: Can I tag tests in other test frameworks?

A: Yes! The tagging convention works with any framework that includes test titles in output (Jest, Mocha, Jasmine, etc.).

### Q: What if an AC changes?

A: Regenerate the AC registry and update the tags in your tests. The alignment report will show mismatches if tags reference non-existent ACs.

### Q: How do I handle one test validating multiple beats?

A: Use multiple tags in the test title, or split the test into multiple smaller tests (preferred for clarity).

## Next Steps

1. Generate the AC registry for your domain
2. Review existing tests and identify which ACs they cover
3. Add tags to test titles
4. Run the alignment analysis to see your coverage metrics
5. Create new tests for uncovered ACs
6. Iterate toward ≥70% coverage

## Support

- For issues or questions, see: [GitHub Issue #420](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/420)
- AC Registry: `.generated/acs/<domain>.registry.json`
- Alignment Reports: `docs/generated/<domain>/*-CODE-ANALYSIS-REPORT.md`

---

**Last Updated:** 2025-12-01
**Version:** 1.0.0
