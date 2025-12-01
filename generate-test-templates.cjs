#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const basePath = 'c:\\source\\repos\\bpm\\Internal\\renderx-plugins-demo';

/**
 * Extract handler name from beat
 */
function extractHandlerName(handler) {
  if (typeof handler === 'string') {
    const parts = handler.split('#');
    const lastPart = parts[parts.length - 1] || handler;
    return lastPart.split('/').pop().split('.').pop();
  } else if (handler?.name) {
    const lastPart = handler.name.split('#').pop();
    return lastPart.split('/').pop().split('.').pop();
  }
  return 'unknown';
}

/**
 * Generate test template for a beat
 */
function generateTestTemplate(symphony, movement, beat) {
  const handlerName = extractHandlerName(beat.handler);
  const userStory = beat.userStory || '';
  const acCount = beat.acceptanceCriteria?.length || 0;
  const acConditions = beat.acceptanceCriteria?.map(ac => {
    // Extract key assertions from Gherkin
    return ac.split('\n').filter(line => line.includes('Then') || (line.includes('And') && line !== 'And ')).slice(0, 2).join(' ');
  }) || [];
  
  const slaMatch = userStory.match(/<(\d+)\s*(ms|seconds?|minutes?)/i);
  const slaMs = slaMatch ? (slaMatch[2].toLowerCase().includes('second') ? parseInt(slaMatch[1]) * 1000 : parseInt(slaMatch[1])) : 500;
  
  return `import { ${handlerName} } from '@renderx-plugins/${movement.name}';
import { eventBus, telemetryService, logger } from '@renderx-plugins/core';

describe('${handlerName}', () => {
  let performanceMetrics;
  let eventSpy;
  let telemetrySpy;
  let loggerSpy;
  
  beforeEach(() => {
    eventSpy = jest.fn();
    telemetrySpy = jest.fn();
    loggerSpy = jest.spyOn(logger, 'debug');
    
    eventBus.subscribe('handler-event', eventSpy);
    telemetryService.onMetric(telemetrySpy);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    loggerSpy.mockRestore();
  });
  
  describe('Performance & Latency', () => {
    it('should complete within ${slaMs}ms SLA', async () => {
      const startTime = performance.now();
      const result = await ${handlerName}(testInput);
      const duration = performance.now() - startTime;
      
      // AC: Latency requirement
      expect(duration).toBeLessThan(${slaMs});
      expect(result).toBeDefined();
      
      // Store metric
      performanceMetrics = { duration, timestamp: Date.now() };
    });
    
    it('should have consistent latency across multiple calls', async () => {
      const durations = [];
      
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        await ${handlerName}(testInput);
        durations.push(performance.now() - start);
      }
      
      const avgDuration = durations.reduce((a, b) => a + b) / durations.length;
      const maxDuration = Math.max(...durations);
      
      // Should be consistently under SLA
      expect(maxDuration).toBeLessThan(${slaMs});
      expect(avgDuration).toBeLessThan(${slaMs} * 0.8); // 80% of SLA on average
    });
  });
  
  describe('Output Validation', () => {
    it('should return valid output conforming to schema', async () => {
      const result = await ${handlerName}(testInput);
      
      // AC: Output validation
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      
      // Basic type checks
      expect(typeof result.id).toBe('string');
      expect(['pending', 'success', 'error']).toContain(result.status);
      expect(typeof result.timestamp).toBe('number');
    });
  });
  
  describe('Event Publishing', () => {
    it('should publish completion event', async () => {
      const result = await ${handlerName}(testInput);
      
      // AC: Event publication
      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'handler-event',
          handler: '${handlerName}',
          payload: expect.any(Object)
        })
      );
    });
  });
  
  describe('Telemetry Recording', () => {
    it('should record telemetry with latency metrics', async () => {
      const result = await ${handlerName}(testInput);
      
      // AC: Telemetry recording
      expect(telemetrySpy).toHaveBeenCalled();
      expect(telemetrySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          handler: '${handlerName}',
          status: 'success',
          latency: expect.any(Number),
          timestamp: expect.any(Number)
        })
      );
    });
  });
  
  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      const invalidInput = null;
      
      // AC: Error handling
      await expect(${handlerName}(invalidInput))
        .rejects.toThrow();
      
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('${handlerName}'),
        expect.any(Object)
      );
    });
    
    it('should log error context', async () => {
      const error = new Error('Test error');
      
      try {
        await ${handlerName}({ error });
      } catch (e) {
        // Expected
      }
      
      // AC: Error logging with context
      expect(loggerSpy).toHaveBeenCalled();
    });
  });
  
  describe('System Stability', () => {
    it('should maintain system stability', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Execute handler multiple times
      for (let i = 0; i < 10; i++) {
        await ${handlerName}(testInput);
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // AC: System stability (memory leak check)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Max 10MB increase
    });
  });
});

// Test data
const testInput = {
  // TODO: Replace with actual test data
  id: 'test-123',
  data: { /* ... */ }
};
`;
}

/**
 * Generate test enhancement recommendations
 */
function generateEnhancementRecommendations(beat) {
  const recommendations = [];
  
  // Check what's missing
  if (!beat.testFile || beat.testFile === 'TBD') {
    recommendations.push('- Create new test file (use template above)');
  } else {
    recommendations.push('- Add missing assertions to existing test');
  }
  
  // Check for latency in user story
  if (beat.userStory && beat.userStory.includes('ms')) {
    recommendations.push('- Add performance.now() measurement for latency assertion');
  }
  
  // Check ACs
  if (beat.acceptanceCriteria) {
    if (beat.acceptanceCriteria.some(ac => ac.includes('event') || ac.includes('publish'))) {
      recommendations.push('- Add event spy and expect(spy).toHaveBeenCalled()');
    }
    if (beat.acceptanceCriteria.some(ac => ac.includes('error') || ac.includes('throw'))) {
      recommendations.push('- Add error scenario test with expect(...).rejects.toThrow()');
    }
    if (beat.acceptanceCriteria.some(ac => ac.includes('schema') || ac.includes('conform'))) {
      recommendations.push('- Add schema validation: expect(result).toHaveProperty(...)');
    }
    if (beat.acceptanceCriteria.some(ac => ac.includes('telemetry') || ac.includes('audit'))) {
      recommendations.push('- Add telemetry spy and verify metrics recorded');
    }
  }
  
  return recommendations;
}

/**
 * Generate enhancement report
 */
function generateEnhancementReport() {
  console.log('🧪 Test Enhancement Template Generator\n');
  console.log('='.repeat(70));
  
  const symphonies = [];
  
  const packages = [
    'orchestration', 'control-panel', 'self-healing', 'slo-dashboard',
    'canvas-component', 'header', 'library', 'library-component', 'real-estate-analyzer'
  ];
  
  for (const pkg of packages) {
    const flatPath = path.join(basePath, `packages/${pkg}/json-sequences`);
    if (fs.existsSync(flatPath)) {
      try {
        const files = fs.readdirSync(flatPath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            symphonies.push(path.join(flatPath, file));
          }
        }
      } catch (e) {}
    }
  }
  
  console.log(`\n📋 Analyzing ${symphonies.length} symphonies for test templates...\n`);
  
  let templateGenerated = 0;
  let worstBeats = [];
  
  for (const symphonyPath of symphonies) {
    try {
      const content = fs.readFileSync(symphonyPath, 'utf8');
      const symphony = JSON.parse(content);
      
      if (!symphony.movements || !Array.isArray(symphony.movements)) continue;
      
      for (const movement of symphony.movements) {
        if (!movement.beats || !Array.isArray(movement.beats)) continue;
        
        for (const beat of movement.beats) {
          if (!beat.testFile || beat.testFile === 'TBD') {
            const handler = extractHandlerName(beat.handler);
            worstBeats.push({
              symphony: path.basename(symphonyPath, '.json'),
              beat: beat.title || handler,
              handler,
              movement: movement.name,
              testFile: beat.testFile
            });
            templateGenerated++;
          }
        }
      }
    } catch (e) {}
  }
  
  console.log(`📝 Beats Missing Test Files: ${templateGenerated}\n`);
  console.log('Top 5 Beats Needing New Test Files:');
  console.log('-'.repeat(70));
  
  for (let i = 0; i < Math.min(5, worstBeats.length); i++) {
    const beat = worstBeats[i];
    console.log(`\n${i+1}. ${beat.symphony} → ${beat.beat}`);
    console.log(`   Handler: ${beat.handler}`);
    console.log(`   Movement: ${beat.movement}`);
    console.log(`   Test File: ${beat.testFile || 'MISSING'}`);
    
    const recommendations = generateEnhancementRecommendations(beat);
    console.log('   Action Items:');
    for (const rec of recommendations.slice(0, 3)) {
      console.log(`     ${rec}`);
    }
  }
  
  // Generate example template
  if (worstBeats.length > 0) {
    const exampleBeat = worstBeats[0];
    const movement = { name: exampleBeat.movement };
    const beat = {
      handler: exampleBeat.handler,
      userStory: `As a system, I want ${exampleBeat.handler} to execute reliably...`,
      acceptanceCriteria: [
        'Given the handler is triggered\nWhen it executes\nThen it completes successfully\nAnd returns valid output\nAnd events are published'
      ]
    };
    
    const template = generateTestTemplate({}, movement, beat);
    
    console.log('\n\n💡 Example Test Template (for ' + exampleBeat.handler + '):');
    console.log('-'.repeat(70));
    console.log(template.substring(0, 500) + '...\n');
  }
  
  console.log('\n✅ Recommendations:');
  console.log('   1. Create test files for ' + templateGenerated + ' beats missing tests');
  console.log('   2. Use above template as starting point for new test files');
  console.log('   3. Each test file includes patterns for:');
  console.log('      - Performance/latency measurement');
  console.log('      - Output schema validation');
  console.log('      - Event publication verification');
  console.log('      - Error handling checks');
  console.log('      - Telemetry recording validation');
  console.log('      - System stability monitoring');
  console.log('\n   4. Estimated effort: 1 day to generate templates, 2-3 days to implement');
}

generateEnhancementReport();
