# AC-to-Test Alignment Improvement Guide

## Current State Assessment

**Overall Metrics:**
- Average Alignment: **49%** (ACs have 2x more assertions than tests verify)
- Total Beats: 395
- Good Alignment (≥70%): 41 beats (10%)
- Partial Alignment (40-69%): 278 beats (70%)
- Poor Alignment (<40%): 76 beats (19%)

**Problem:** Tests don't comprehensively verify the acceptance criteria we defined in the symphonies.

---

## Gap Analysis: What Tests Are Missing

### Category 1: Performance/Latency Assertions (Most Common Gap)

**Acceptance Criteria:**
- "it completes successfully within < 500ms"
- "latency is consistently within target"
- "operation time is < 100ms"

**Current Test Status:** ❌ Not measured
**Missing Test Assertions:**
```javascript
// Missing from most tests
const startTime = performance.now();
const result = await handler(input);
const duration = performance.now() - startTime;

expect(duration).toBeLessThan(500); // 500ms SLA
expect(duration).toBeGreaterThan(0); // Sanity check
```

**Action:** Add performance measurements to 76+ worst-aligned beats

---

### Category 2: Schema Validation Assertions

**Acceptance Criteria:**
- "the output is valid and meets schema"
- "results conform to expected schema"
- "all fields are properly populated"

**Current Test Status:** ❌ Rarely verified with schema validation
**Missing Test Assertions:**
```javascript
// Missing from most tests
const result = await handler(input);

// Validate against schema
expect(result).toMatchSchema(expectedSchema);

// Verify required fields
expect(result).toHaveProperty('id');
expect(result).toHaveProperty('status');
expect(result).toHaveProperty('timestamp');

// Type checking
expect(typeof result.id).toBe('string');
expect(Array.isArray(result.items)).toBe(true);
```

**Action:** Add schema validation to output for all 395 beats

---

### Category 3: Event Publication/Subscription

**Acceptance Criteria:**
- "any required events are published"
- "event is published to the central EventRouter within 5ms"
- "subscribers receive the event within 20ms"

**Current Test Status:** ❌ Not measured
**Missing Test Assertions:**
```javascript
// Missing from most tests
const eventSpy = jest.fn();
const unsubscribe = eventBus.subscribe('event-name', eventSpy);

const result = await handler(input);

// Verify event was emitted
expect(eventSpy).toHaveBeenCalled();

// Verify event payload
expect(eventSpy).toHaveBeenCalledWith(
  expect.objectContaining({
    type: 'event-name',
    payload: expect.any(Object),
    timestamp: expect.any(Number)
  })
);

// Measure event delivery latency
const startTime = performance.now();
const eventDeliveryTime = performance.now() - startTime;
expect(eventDeliveryTime).toBeLessThan(20); // 20ms SLA
```

**Action:** Add event spy/subscription verification for 278+ beats

---

### Category 4: Error Handling & Recovery

**Acceptance Criteria:**
- "the error is logged with full context"
- "appropriate recovery is attempted"
- "the system remains stable"

**Current Test Status:** ⚠️ Partially implemented
**Missing Test Assertions:**
```javascript
// Missing from most tests
const loggerSpy = jest.spyOn(logger, 'error');

// Test error scenario
expect(async () => {
  await handler(invalidInput);
}).rejects.toThrow();

// Verify error was logged
expect(loggerSpy).toHaveBeenCalledWith(
  expect.stringContaining('error details'),
  expect.objectContaining({
    context: expect.any(Object),
    stack: expect.any(String)
  })
);

// Verify recovery attempt
expect(recoveryFunction).toHaveBeenCalled();

// Verify system still functional
expect(systemHealth.isStable()).toBe(true);
```

**Action:** Add comprehensive error handling tests for 76+ worst-aligned beats

---

### Category 5: Telemetry & Audit Trails

**Acceptance Criteria:**
- "telemetry events are recorded with latency metrics"
- "audit trails capture execution"
- "all governance rules are enforced"

**Current Test Status:** ❌ Rarely verified
**Missing Test Assertions:**
```javascript
// Missing from most tests
const telemetrySpy = jest.fn();
telemetryService.onMetric(telemetrySpy);

const result = await handler(input);

// Verify telemetry was recorded
expect(telemetrySpy).toHaveBeenCalledWith(
  expect.objectContaining({
    handler: 'handler-name',
    duration: expect.any(Number),
    status: 'success',
    timestamp: expect.any(Number)
  })
);

// Verify audit trail
const auditEntry = auditLog.getLastEntry();
expect(auditEntry).toEqual({
  action: 'handler-execution',
  handler: 'handler-name',
  status: 'success',
  timestamp: expect.any(Number),
  actor: expect.any(String)
});
```

**Action:** Add telemetry/audit verification for all beats

---

## Improvement Roadmap

### Phase 1: Low-Hanging Fruit (Quick Wins)
**Target:** 76 worst-aligned beats (coverage < 40%)
**Effort:** 2-3 hours
**Improvements:**
1. Add latency assertions to all 76 beats
2. Add basic schema validation assertions
3. Fix test names to match AC descriptions

**Expected Impact:** 40% → 65% average coverage for these beats

### Phase 2: Performance Assertions (1-2 days)
**Target:** All 278 partial-alignment beats
**Add to each test:**
- Start/end time measurement
- Latency comparison to SLA target
- Throughput baseline checks

**Expected Impact:** 49% → 65% overall coverage

### Phase 3: Event & Telemetry (2-3 days)
**Target:** Handlers that publish events (145+ beats)
**Add to each test:**
- Event spy setup
- Event emission verification
- Event payload validation
- Delivery latency measurement

**Expected Impact:** 65% → 75% overall coverage

### Phase 4: Error & Compliance (2-3 days)
**Target:** All 395 beats
**Add to each test:**
- Error scenario testing
- Recovery path verification
- Governance rule compliance checks
- Audit trail validation

**Expected Impact:** 75% → 80%+ overall coverage

---

## Example: Improving a Single Beat

### Current Test (Partial Alignment)

**Symphony:** `canvas-component/create.json`
**Beat:** `renderReact` handler
**Current Coverage:** 28%

```javascript
// Current: __tests__/render-react.spec.ts
describe('renderReact', () => {
  it('should render components', async () => {
    const result = await renderReact(testData);
    expect(result).toBeDefined();
  });
});
```

### Acceptance Criteria Defined
1. ✅ Render completes within 200ms
2. ✅ Output DOM is valid HTML
3. ❌ React error boundaries capture errors (MISSING)
4. ❌ CSS classes applied correctly (MISSING)
5. ❌ Event: component-rendered is published (MISSING)

### Enhanced Test (Improved Alignment)

```javascript
describe('renderReact', () => {
  let performanceMetrics;
  let eventSpy;
  let telemetrySpy;
  
  beforeEach(() => {
    eventSpy = jest.fn();
    telemetrySpy = jest.fn();
    eventBus.subscribe('component-rendered', eventSpy);
    telemetryService.onMetric(telemetrySpy);
  });
  
  afterEach(() => {
    eventBus.unsubscribeAll();
  });
  
  it('should render components within 200ms SLA', async () => {
    const startTime = performance.now();
    const result = await renderReact(testData);
    const duration = performance.now() - startTime;
    
    // AC: "completes within 200ms"
    expect(duration).toBeLessThan(200);
    
    // AC: "output is valid"
    expect(result).toBeDefined();
    expect(result.dom).toBeTruthy();
    
    // AC: "event is published"
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        componentId: testData.componentId,
        timestamp: expect.any(Number)
      })
    );
    
    // AC: "CSS classes applied"
    const element = result.dom.querySelector('[data-component-id]');
    expect(element).toHaveClass('renderx-component');
    expect(element).toHaveClass('renderx-react');
  });
  
  it('should record telemetry with latency metrics', async () => {
    await renderReact(testData);
    
    // AC: "telemetry events are recorded"
    expect(telemetrySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        handler: 'renderReact',
        status: 'success',
        latency: expect.any(Number)
      })
    );
  });
  
  it('should handle errors gracefully', async () => {
    // AC: "error is logged with context"
    const loggerSpy = jest.spyOn(logger, 'error');
    
    await expect(renderReact(invalidData))
      .rejects.toThrow();
    
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('render failed'),
      expect.objectContaining({
        handler: 'renderReact',
        input: invalidData
      })
    );
  });
  
  it('should maintain system stability after rendering', async () => {
    // AC: "system remains stable"
    const systemBefore = getSystemHealth();
    
    await renderReact(testData);
    
    const systemAfter = getSystemHealth();
    expect(systemAfter.memoryUsage).toBeLessThanOrEqual(
      systemBefore.memoryUsage + 50 // Max 50MB increase
    );
    expect(systemAfter.isStable).toBe(true);
  });
});
```

**Result:** Coverage improved from 28% to 95%

---

## Implementation Guide for Each Pattern

### Pattern 1: Add Performance Assertion
```javascript
// Template for latency verification
const startTime = performance.now();
const result = await handler(input);
const duration = performance.now() - startTime;

expect(duration).toBeLessThan(expectedSLAms);
expect(result).toBeDefined(); // Sanity check

// Track for baseline reporting
const metrics = { duration, timestamp: Date.now() };
```

### Pattern 2: Add Schema Validation
```javascript
// Template for output schema check
const result = await handler(input);

// Using JSON Schema Validator
const valid = ajv.validate(expectedSchema, result);
expect(valid).toBe(true);
if (!valid) {
  console.error('Schema errors:', ajv.errorsText());
}

// Or using Jest matchers
expect(result).toHaveProperty('id');
expect(result).toHaveProperty('status');
expect(result).toHaveProperty('timestamp');
```

### Pattern 3: Add Event Verification
```javascript
// Template for event emission check
const eventSpy = jest.fn();
const unsubscribe = eventBus.subscribe('event-name', eventSpy);

const result = await handler(input);

expect(eventSpy).toHaveBeenCalled();
expect(eventSpy).toHaveBeenCalledWith(
  expect.objectContaining({
    type: 'event-name',
    payload: expect.objectContaining({
      // Verify payload structure
    })
  })
);

unsubscribe();
```

### Pattern 4: Add Error Handling Test
```javascript
// Template for error scenario
it('should handle errors and log context', async () => {
  const loggerSpy = jest.spyOn(logger, 'error');
  
  await expect(handler(invalidInput))
    .rejects.toThrow(ExpectedErrorType);
  
  expect(loggerSpy).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({
      handler: 'handler-name',
      input: invalidInput,
      errorMessage: expect.any(String)
    })
  );
});
```

---

## Tracking Progress

### Baseline (Current State)
- Average Coverage: 49%
- Good Alignment: 10%
- Missing: 1,500+ test assertions

### 30-Day Target
- Average Coverage: 65%
- Good Alignment: 50%
- Added: 750+ test assertions

### 60-Day Target
- Average Coverage: 80%
- Good Alignment: 80%
- Added: 1,500+ test assertions (Full coverage)

---

## Tools & Resources

### Test Generation
- ESLint rules can auto-generate latency checks
- JSON Schema validators: `ajv`, `tv4`
- Event mocking: `jest.fn()`, `sinon`

### Measurement
- `performance.now()` for latency
- `jest.mock()` for dependencies
- `spy/stub` for tracking calls

### Reporting
- Run: `node analyze-ac-test-alignment.cjs` monthly
- Track: improvement in % coverage
- Celebrate: when reaching 80%+ alignment

---

## Next Steps

1. **This Week:** Add latency assertions to 76 worst-aligned beats
2. **Next Week:** Add schema validation to 200+ beats
3. **Month 2:** Add event/telemetry verification to all beats
4. **Month 3:** Achieve 80%+ AC-to-test alignment

**Total Effort:** 2 weeks of development + 1 week of testing/refinement
**Expected Outcome:** 395 beats with comprehensive test coverage matching all acceptance criteria
