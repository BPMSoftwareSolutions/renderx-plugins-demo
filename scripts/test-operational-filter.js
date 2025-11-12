#!/usr/bin/env node
/**
 * Test script to verify operational filter functionality
 * Tests all 5 filtering strategies against sample timeline data
 */

// Sample data - simulating 56-event log
const sampleEvents = [
  { id: '1', name: '✅ Plugin mounted successfully: DynamicTheme', time: 50, duration: 45, type: 'plugin' },
  { id: '2', name: 'Registered sequence: ThemeApplication', time: 95, duration: 230, type: 'sequence' },
  { id: '3', name: 'EventBus: Subscribed to theme:changed', time: 325, duration: 10, type: 'topic' },
  { id: '4', name: 'Gap: Silent Period', time: 335, duration: 1200, type: 'gap' },
  { id: '5', name: '✅ Plugin mounted successfully: ControlPanel', time: 1535, duration: 50, type: 'plugin' },
  { id: '6', name: 'User interaction: Button Click', time: 1600, duration: 5, type: 'interaction' },
  { id: '7', name: 'React render event', time: 1650, duration: 150, type: 'render' },
  { id: '8', name: 'Gap: React blocking main thread', time: 1800, duration: 5300, type: 'blocked' },
  { id: '9', name: '✅ Plugin mounted successfully: HeaderComponent', time: 7100, duration: 40, type: 'plugin' },
  { id: '10', name: 'Registered sequence: HeaderInitialization', time: 7150, duration: 120, type: 'sequence' },
  { id: '11', name: 'EventBus: Subscribed to header:rendered', time: 7270, duration: 10, type: 'topic' },
  { id: '12', name: 'User interaction: Scroll', time: 7290, duration: 3, type: 'interaction' },
  { id: '13', name: 'React render event', time: 7310, duration: 100, type: 'render' },
  { id: '14', name: 'Gap: Silent Period', time: 7410, duration: 800, type: 'gap' },
  { id: '15', name: 'EventBus: Subscribed to layout:changed', time: 8210, duration: 10, type: 'topic' },
];

/**
 * Apply filter to events based on strategy
 * @param {Array} events - Array of timeline events
 * @param {Object} filter - Filter configuration
 * @returns {Array} Filtered events
 */
function applyEventFilter(events, filter) {
  if (!filter || filter.strategyId === 'all') {
    return events;
  }

  switch (filter.strategyId) {
    case 'category':
      if (filter.eventTypes && filter.eventTypes.length > 0) {
        return events.filter(e => filter.eventTypes.includes(e.type));
      }
      if (filter.query) {
        return events.filter(e => e.name.toLowerCase().includes(filter.query.toLowerCase()));
      }
      return events;

    case 'search': {
      try {
        const regex = new RegExp(filter.query, 'i');
        return events.filter(e => regex.test(e.name));
      } catch {
        return events.filter(e => e.name.toLowerCase().includes(filter.query.toLowerCase()));
      }
    }

    case 'timewindow': {
      const parts = filter.query.split('-');
      if (parts.length === 2) {
        const minTime = parseInt(parts[0], 10);
        const maxTime = parseInt(parts[1], 10);
        return events.filter(e => e.time >= minTime && e.time <= maxTime);
      }
      return events;
    }

    case 'performance': {
      const minDuration = filter.minDuration || 1000;
      const maxDuration = filter.maxDuration || Infinity;
      return events.filter(
        e => e.duration >= minDuration && e.duration <= maxDuration
      );
    }

    default:
      return events;
  }
}

// Test suite
console.log('🧪 Running Operational Filter Tests\n');
console.log('📊 Sample Data: 15 events (simulating 56-event log)\n');

let passCount = 0;
let failCount = 0;

function test(name, filter, expectedCount) {
  const result = applyEventFilter(sampleEvents, filter);
  const passed = result.length === expectedCount;
  
  if (passed) {
    console.log(`✅ ${name}`);
    console.log(`   Filter: ${JSON.stringify(filter)}`);
    console.log(`   Result: ${result.length} events (expected ${expectedCount})`);
    passCount++;
  } else {
    console.log(`❌ ${name}`);
    console.log(`   Filter: ${JSON.stringify(filter)}`);
    console.log(`   Result: ${result.length} events (expected ${expectedCount})`);
    failCount++;
  }
  console.log('');
}

// Test 1: All events
test('All Events (no filtering)', { strategyId: 'all', query: '' }, 15);

// Test 2: Category - Plugin events
test('Category Filter - Plugin events only', 
  { strategyId: 'category', query: '', eventTypes: ['plugin'] }, 
  3
);

// Test 3: Category - Gap events
test('Category Filter - Gap/Blocked events', 
  { strategyId: 'category', query: '', eventTypes: ['gap', 'blocked'] }, 
  3
);

// Test 4: Search - "Plugin" pattern
test('Search Filter - Plugin pattern', 
  { strategyId: 'search', query: 'plugin' }, 
  3
);

// Test 5: Search - "React" pattern
test('Search Filter - React pattern', 
  { strategyId: 'search', query: 'react' }, 
  3
);

// Test 6: Time Window - First 1 second
test('Time Window Filter - 0-1000ms', 
  { strategyId: 'timewindow', query: '0-1000' }, 
  4
);

// Test 7: Time Window - Startup phase (0-3000ms)
test('Time Window Filter - Startup phase 0-3000ms', 
  { strategyId: 'timewindow', query: '0-3000' }, 
  8
);

// Test 8: Performance - Very short events (<100ms)
test('Performance Filter - <100ms events', 
  { strategyId: 'performance', query: '', minDuration: 0, maxDuration: 100 }, 
  4
);

// Test 9: Performance - Major bottlenecks (>2000ms)
test('Performance Filter - Major bottlenecks >2000ms', 
  { strategyId: 'performance', query: '', minDuration: 2000, maxDuration: Infinity }, 
  1
);

// Test 10: Preset - Critical Path (gaps > 2s)
test('Preset - Critical Path (>2000ms)', 
  { strategyId: 'performance', query: '', minDuration: 2000 }, 
  1
);

// Summary
console.log('─'.repeat(50));
console.log(`\n📈 Test Results: ${passCount} passed, ${failCount} failed\n`);

if (failCount === 0) {
  console.log('🎉 All tests passed! Operational filter is working correctly.');
  process.exit(0);
} else {
  console.log(`⚠️  ${failCount} test(s) failed. Please review filter logic.`);
  process.exit(1);
}
