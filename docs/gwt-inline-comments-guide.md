# GWT Inline Comments Guide

## Purpose

This guide demonstrates the proper use of **inline Given/When/Then comments** in unit tests to create self-documenting, traceable test code that directly maps to Acceptance Criteria.

## The Pattern

Each test should have **three comment sections** that mirror the test's logical flow:

```typescript
it("[AC:domain:sequence:beat:ac] test description", () => {
  // Given: preconditions and setup
  const data = { /* ... */ };
  const ctx = { /* ... */ };

  // When: action being tested
  const result = handler.execute(data, ctx);

  // Then: expected outcomes
  expect(result).toEqual(expectedValue);

  // And: additional assertions (optional)
  expect(sideEffect).toHaveBeenCalled();
});
```

## Why This Matters

### ✅ Self-Documenting Tests
Tests become readable documentation that explains:
- **Given:** What state the system is in
- **When:** What action triggers the behavior
- **Then:** What outcomes should occur

### ✅ Direct AC Mapping
Each inline comment maps to a clause in the Acceptance Criteria, creating **bidirectional traceability**:
- AC → Test (via AC tag in test title)
- Test → AC (via inline GWT comments matching AC clauses)

### ✅ Easier Debugging
When a test fails, the inline comments immediately show:
- What preconditions were set up
- What action was triggered
- What assertion failed

## Real Examples

### Example 1: Simple ID Derivation Test

```typescript
/**
 * @ac canvas-component-select-symphony:select:1.1:1
 *
 * Given: selection event contains data.id
 * When: showSelectionOverlay executes
 * Then: element ID is derived from data.id
 *       overlay container is created or reused
 * And: operation completes within 100ms P95
 */
it("[AC:canvas-component-select-symphony:select:1.1:1] derives ID from data.id when present", () => {
  // Given: selection event contains data.id
  const data = { id: "rx-node-button123" };
  const ctx = { conductor: mockConductor };

  // When: showSelectionOverlay executes
  const result = selectHandlers.showSelectionOverlay(data, ctx);

  // Then: element ID is derived from data.id
  expect(result).toEqual({ id: "rx-node-button123" });
});
```

**Key Points:**
- Block comment (`/** */`) documents the full AC with all clauses
- Each inline comment (`//`) maps to a specific code section
- The `Then` comment precedes the assertion it describes

### Example 2: Multi-Step Create Flow

```typescript
/**
 * @ac canvas-component-create-symphony:canvas-component-create-symphony:1.4:1
 *
 * Given: context.payload.kind is 'react' with valid reactCode
 * When: renderReact executes
 * Then: React code is validated before compilation
 *       JSX is transformed to JavaScript using Babel
 *       React component is compiled and mounted using createRoot
 * And: context.payload.reactRendered is set to true
 */
it("[AC:canvas-component-create-symphony:canvas-component-create-symphony:1.4:1] creates a React component", async () => {
  // Given: context.payload.kind is 'react' with valid reactCode
  const ctx = makeCtx();
  const template = makeReactComponentTemplate();
  const data = {
    component: { template },
    position: { x: 50, y: 80 }
  };

  // When: renderReact executes (via complete create sequence)
  await createHandlers.resolveTemplate(data, ctx);
  await createHandlers.registerInstance(data, ctx);
  await createHandlers.createNode(data, ctx);
  await createHandlers.renderReact(data, ctx);
  await createHandlers.notifyUi(data, ctx);

  // Then: React code is validated before compilation (mocked)
  // Then: JSX is transformed to JavaScript using Babel (mocked)
  expect(ctx.payload.kind).toBe("react");
  expect(ctx.payload.template.render.strategy).toBe("react");

  // Then: React component is compiled and mounted using createRoot
  const nodeId = ctx.payload.nodeId;
  const container = document.getElementById(nodeId);
  expect(mockCreateRoot).toHaveBeenCalledWith(container);
  expect(mockRender).toHaveBeenCalled();

  // And: context.payload.reactRendered is set to true
  expect(ctx.payload.reactRendered).toBe(true);
});
```

**Key Points:**
- Multiple `Then` comments for multiple assertions
- Each `Then` maps to a specific AC clause
- `And` comment for additional quality attributes

### Example 3: DOM Creation Test

```typescript
/**
 * @ac canvas-component-create-symphony:canvas-component-create-symphony:1.3:1
 *
 * Given: valid template and nodeId exist in context.payload
 * When: createNode executes
 * Then: DOM element is created with specified tag and ID
 *       CSS styles and variables are injected and applied
 *       element is appended to canvas or target container
 * And: operation completes within 2s P95
 */
it("[AC:canvas-component-create-symphony:canvas-component-create-symphony:1.3:1] creates a single element", () => {
  // Given: valid template and nodeId exist in context.payload
  const template = makeTemplate();

  // When: createNode executes
  handlers.resolveTemplate({ component: { template } } as any, ctx);
  handlers.createNode({ position: { x: 50, y: 80 } } as any, ctx);

  const btn = document.querySelector("#rx-canvas button") as HTMLButtonElement | null;

  // Then: DOM element is created with specified tag and ID
  expect(btn).toBeTruthy();
  expect(btn!.id).toMatch(/^rx-node-/);
  expect(btn!.className).toContain("rx-button");
  expect(btn!.textContent).toBe("Click Me");

  // Then: CSS styles and variables are injected and applied
  const style = (btn as HTMLElement).style as CSSStyleDeclaration;
  expect(style.position).toBe("absolute");
  expect(style.left).toBe("50px");
  expect(style.top).toBe("80px");

  // Then: element is appended to canvas or target container
  expect(btn!.parentElement?.id).toBe("rx-canvas");
});
```

**Key Points:**
- Each `Then` section groups related assertions
- Assertions are organized by AC clause
- Reading the test tells a clear story

## Common Patterns

### Pattern 1: Simple Given-When-Then
```typescript
it("[AC:...] does something", () => {
  // Given: precondition
  const input = setupInput();

  // When: action
  const result = handler(input);

  // Then: outcome
  expect(result).toBe(expected);
});
```

### Pattern 2: Multiple Then Clauses
```typescript
it("[AC:...] does multiple things", () => {
  // Given: precondition
  const setup = createSetup();

  // When: action
  handler.execute(setup);

  // Then: first outcome
  expect(firstResult).toBe(true);

  // Then: second outcome
  expect(secondResult).toBe(true);

  // And: quality attribute
  expect(metrics.duration).toBeLessThan(100);
});
```

### Pattern 3: Async Operations
```typescript
it("[AC:...] handles async", async () => {
  // Given: async precondition
  const data = await setupAsync();

  // When: async action
  await handler.process(data);

  // Then: async verification
  const result = await getResult();
  expect(result).toBeDefined();
});
```

### Pattern 4: Error Handling
```typescript
it("[AC:...] handles missing data", () => {
  // Given: data.id is missing
  const data = {};

  // When: handler validates
  const result = handler(data);

  // Then: returns early without processing
  expect(result).toEqual({});

  // And: warning is logged
  expect(logger.warn).toHaveBeenCalled();
});
```

## Anti-Patterns to Avoid

### ❌ No Inline Comments
```typescript
// BAD: No GWT comments, hard to understand
it("[AC:...] test", () => {
  const data = { id: "test" };
  const result = handler(data);
  expect(result).toBe(true);
});
```

### ❌ Inline Comments Don't Match AC
```typescript
// BAD: Comment says "Given: X" but AC says "Given: Y"
it("[AC:...] test", () => {
  // Given: wrong precondition (doesn't match AC)
  const data = setupWrongThing();

  expect(result).toBe(true);
});
```

### ❌ Comments After Code
```typescript
// BAD: Comment should come BEFORE the code it describes
it("[AC:...] test", () => {
  const data = { id: "test" };
  // Given: data has ID  <-- TOO LATE

  const result = handler(data);
  expect(result).toBe(true);
  // Then: returns true  <-- TOO LATE
});
```

### ❌ Vague Comments
```typescript
// BAD: Vague comments don't explain what's being tested
it("[AC:...] test", () => {
  // Setup
  const data = { id: "test" };

  // Do stuff
  const result = handler(data);

  // Check result
  expect(result).toBe(true);
});
```

## Benefits Summary

| Benefit | Description |
|---------|-------------|
| **Readability** | Tests read like specifications |
| **Traceability** | Direct mapping AC ↔ Test ↔ Code |
| **Maintainability** | Easy to update when ACs change |
| **Debugging** | Failed assertions clearly show which AC clause failed |
| **Onboarding** | New developers can understand tests immediately |
| **Documentation** | Tests serve as executable documentation |

## Implementation Checklist

When writing or updating a test:

- [ ] Add AC tag to test title: `[AC:domain:sequence:beat:ac]`
- [ ] Add block comment with full AC (Given/When/Then/And)
- [ ] Add inline `// Given:` comment before setup code
- [ ] Add inline `// When:` comment before action code
- [ ] Add inline `// Then:` comment before each assertion group
- [ ] Add inline `// And:` comment for quality attributes
- [ ] Ensure inline comments match AC clauses exactly
- [ ] Group related assertions under appropriate Then comments
- [ ] Verify test tells a clear story when read top-to-bottom

## Coverage Verification

After adding inline GWT comments, verify:

1. **Each AC clause has a corresponding inline comment**
2. **Each inline comment has corresponding code/assertions**
3. **The test reads like the AC specification**
4. **Failed tests clearly indicate which AC clause failed**

## Conclusion

Inline GWT comments transform tests from "code that checks behavior" into **executable specifications** that:
- Document what the system should do
- Prove the system does it
- Trace requirements to implementation
- Make debugging trivial

This pattern is the cornerstone of AC-to-test alignment and ensures **100% bidirectional traceability** between requirements and tests.
