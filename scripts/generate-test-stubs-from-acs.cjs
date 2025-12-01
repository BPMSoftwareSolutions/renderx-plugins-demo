#!/usr/bin/env node

/**
 * Test Stub Generator from Acceptance Criteria
 *
 * Generates test file skeletons from symphony acceptance criteria.
 * Creates boilerplate test stubs for each AC condition.
 *
 * Usage:
 *   node scripts/generate-test-stubs-from-acs.cjs <symphony-file.json>
 *
 * Output:
 *   .generated/test-stubs/<symphony-name>.spec.ts
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse Gherkin AC into testable conditions
 */
function parseAcceptanceCriteria(ac) {
  const lines = ac.split('\n').map(l => l.trim()).filter(l => l);

  const parsed = {
    given: [],
    when: [],
    then: [],
    and: []
  };

  let currentSection = null;

  lines.forEach(line => {
    if (line.startsWith('Given')) {
      currentSection = 'given';
      parsed.given.push(line.replace(/^Given\s+/, ''));
    } else if (line.startsWith('When')) {
      currentSection = 'when';
      parsed.when.push(line.replace(/^When\s+/, ''));
    } else if (line.startsWith('Then')) {
      currentSection = 'then';
      parsed.then.push(line.replace(/^Then\s+/, ''));
    } else if (line.startsWith('And') && currentSection) {
      const target = currentSection === 'then' ? 'and' : currentSection;
      parsed[target].push(line.replace(/^And\s+/, ''));
    }
  });

  return parsed;
}

/**
 * Determine assertion type from condition
 */
function getAssertionType(condition) {
  const lower = condition.toLowerCase();

  if (/within|<|less than|under|latency|duration/.test(lower)) {
    return 'performance';
  }
  if (/valid|schema|conform/.test(lower)) {
    return 'schema';
  }
  if (/event|publish|emit|record/.test(lower)) {
    return 'event';
  }
  if (/error|exception|throw/.test(lower)) {
    return 'error';
  }
  if (/governance|audit|compliance/.test(lower)) {
    return 'governance';
  }
  if (/success|complete/.test(lower)) {
    return 'success';
  }

  return 'generic';
}

/**
 * Generate test stub for a condition
 */
function generateTestStub(condition, type, beatHandler) {
  const templates = {
    performance: `
    it('${condition}', async () => {
      // Extract timing requirement (e.g., "< 1 second" -> 1000ms)
      const maxDuration = 1000; // TODO: Update based on AC requirement

      const start = performance.now();
      await ${beatHandler}(input);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(maxDuration);
    });`,

    schema: `
    it('${condition}', () => {
      const result = ${beatHandler}(input);

      // TODO: Define schema or use existing schema
      const isValid = validateSchema(result, expectedSchema);

      expect(isValid).toBe(true);
    });`,

    event: `
    it('${condition}', () => {
      const publishSpy = jest.spyOn(eventRouter, 'publish');

      ${beatHandler}(input);

      // TODO: Update event type based on AC
      expect(publishSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'expected.event.type' })
      );
    });`,

    error: `
    it('${condition}', async () => {
      const logSpy = jest.spyOn(logger, 'error');
      const invalidInput = {}; // TODO: Define invalid input

      await expect(${beatHandler}(invalidInput)).rejects.toThrow();

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({ context: expect.any(Object) })
      );
    });`,

    governance: `
    it('${condition}', () => {
      const auditSpy = jest.spyOn(auditService, 'record');

      const result = ${beatHandler}(input);

      expect(result.violations).toEqual([]);
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: expect.any(String),
          timestamp: expect.any(String)
        })
      );
    });`,

    success: `
    it('${condition}', () => {
      const result = ${beatHandler}(input);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });`,

    generic: `
    it('${condition}', () => {
      // TODO: Implement assertion for: ${condition}

      const result = ${beatHandler}(input);

      expect(result).toBeDefined();
    });`
  };

  return templates[type] || templates.generic;
}

/**
 * Generate complete test file for symphony
 */
function generateTestFile(symphony) {
  const symphonyName = symphony.name || symphony.id;
  const beats = [];

  // Collect all beats from movements
  if (symphony.movements && Array.isArray(symphony.movements)) {
    symphony.movements.forEach(movement => {
      if (movement.beats && Array.isArray(movement.beats)) {
        movement.beats.forEach(beat => {
          beats.push({
            ...beat,
            movement: movement.name
          });
        });
      }
    });
  }

  // Generate test file content
  let testFile = `/**
 * Auto-generated test stubs for: ${symphonyName}
 * Generated: ${new Date().toISOString()}
 *
 * TODO: Complete the test implementations below
 */

import { describe, it, expect, jest, beforeEach } from 'vitest';

// TODO: Import actual handlers
// import { handler1, handler2, ... } from '../src/handlers';

// TODO: Import test utilities
// import { validateSchema } from './test-utils/schema-validator';

// Mock dependencies
const eventRouter = { publish: jest.fn() };
const logger = { error: jest.fn(), info: jest.fn() };
const auditService = { record: jest.fn() };

describe('${symphonyName}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

`;

  // Generate tests for each beat
  beats.forEach(beat => {
    const beatTitle = beat.title || beat.handler;
    const handler = beat.handler || 'unknownHandler';

    testFile += `
  describe('${beatTitle}', () => {
    // Handler: ${handler}
    // Movement: ${beat.movement}

    const input = {}; // TODO: Define valid input for ${handler}
`;

    if (beat.acceptanceCriteria && Array.isArray(beat.acceptanceCriteria)) {
      beat.acceptanceCriteria.forEach((ac, acIndex) => {
        const parsed = parseAcceptanceCriteria(ac);
        const conditions = [...parsed.then, ...parsed.and];

        testFile += `
    describe('AC ${acIndex + 1}', () => {
      // Given: ${parsed.given.join(', ')}
      // When: ${parsed.when.join(', ')}
`;

        conditions.forEach(condition => {
          const type = getAssertionType(condition);
          const stub = generateTestStub(condition, type, handler);
          testFile += stub;
        });

        testFile += `
    });
`;
      });
    } else {
      testFile += `
    it('should execute successfully', () => {
      // TODO: Add assertions for ${handler}
      expect(true).toBe(true);
    });
`;
    }

    testFile += `
  });
`;
  });

  testFile += `
});
`;

  return testFile;
}

/**
 * Main execution
 */
function main() {
  const symphonyPath = process.argv[2];

  if (!symphonyPath) {
    console.error('Usage: node generate-test-stubs-from-acs.cjs <symphony-file.json>');
    process.exit(1);
  }

  if (!fs.existsSync(symphonyPath)) {
    console.error(`❌ Symphony file not found: ${symphonyPath}`);
    process.exit(1);
  }

  console.log(`📖 Reading symphony: ${symphonyPath}`);
  const symphony = JSON.parse(fs.readFileSync(symphonyPath, 'utf8'));

  console.log(`🎼 Generating test stubs for: ${symphony.name || symphony.id}`);
  const testFileContent = generateTestFile(symphony);

  // Create output directory
  const outputDir = path.join(process.cwd(), '.generated', 'test-stubs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write test file
  const symphonyId = symphony.id || 'unknown';
  const outputPath = path.join(outputDir, `${symphonyId}.spec.ts`);
  fs.writeFileSync(outputPath, testFileContent);

  console.log(`✅ Test stub generated: ${outputPath}`);
  console.log(`📊 Generated ${symphony.movements?.length || 0} movements`);

  const totalBeats = symphony.movements?.reduce((sum, m) => sum + (m.beats?.length || 0), 0) || 0;
  console.log(`📊 Generated ${totalBeats} beat test suites`);

  const totalACs = symphony.movements?.reduce((sum, m) =>
    sum + m.beats?.reduce((beatSum, b) => beatSum + (b.acceptanceCriteria?.length || 0), 0)
  , 0) || 0;
  console.log(`📊 Generated test stubs for ${totalACs} acceptance criteria`);

  console.log(`\n📣 Next steps:`);
  console.log(`   1. Review generated test file: ${outputPath}`);
  console.log(`   2. Import actual handlers and update function names`);
  console.log(`   3. Define valid/invalid test inputs`);
  console.log(`   4. Complete TODO items in test assertions`);
  console.log(`   5. Run tests: npm test ${outputPath}`);
}

main();
