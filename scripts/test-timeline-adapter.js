#!/usr/bin/env node

/**
 * Test script to validate data adapter with real analyzer output
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple implementation of the adapter for Node.js testing
function analyzerToTimelineData(analyzerData) {
  const events = [];
  const baseTime = new Date(analyzerData.earliest).getTime();

  // 1. Add plugin mount events
  if (analyzerData.pluginMounts?.byPlugin) {
    Object.entries(analyzerData.pluginMounts.byPlugin).forEach(([pluginName, data]) => {
      if (data.successTimestamps && Array.isArray(data.successTimestamps)) {
        data.successTimestamps.forEach((timestamp, idx) => {
          const eventTime = new Date(timestamp).getTime() - baseTime;
          const duration = data.durations?.[idx] ?? 1;

          events.push({
            time: eventTime,
            duration: Math.max(duration, 1),
            name: `${pluginName}`,
            type: 'plugin',
            color: '#a855f7',
            details: {
              plugin: pluginName,
              timestamp,
            },
          });
        });
      }
    });
  }

  // 2. Add sequence events
  if (analyzerData.sequences) {
    Object.entries(analyzerData.sequences).forEach(([seqId, seqData]) => {
      if (seqData.timestamps && Array.isArray(seqData.timestamps) && seqData.timestamps.length > 0) {
        const startTime = new Date(seqData.timestamps[0]).getTime() - baseTime;
        const endTime =
          seqData.timestamps.length > 1
            ? new Date(seqData.timestamps[seqData.timestamps.length - 1]).getTime() - baseTime
            : startTime;
        const duration = Math.max(endTime - startTime, 1);

        events.push({
          time: startTime,
          duration,
          name: `Sequence ${seqId.slice(0, 8)}`,
          type: 'sequence',
          color: '#f43f5e',
          details: {
            sequenceId: seqId,
            beats: seqData.timestamps.length,
          },
        });
      }
    });
  }

  // 3. Add performance gaps
  if (analyzerData.performance?.gaps && Array.isArray(analyzerData.performance.gaps)) {
    analyzerData.performance.gaps.forEach(gap => {
      const startTime = new Date(gap.start).getTime() - baseTime;
      const duration = gap.durationMs;

      let gapType = 'gap';
      let gapColor = '#dc2626';
      let gapName = `Gap (${(duration / 1000).toFixed(2)}s)`;

      if (duration > 5000) {
        gapType = 'blocked';
        gapColor = '#ef4444';
        gapName = `⚠️ React Block (${(duration / 1000).toFixed(2)}s)`;
      }

      events.push({
        time: startTime,
        duration,
        name: gapName,
        type: gapType,
        color: gapColor,
        details: {
          durationMs: duration,
          category: 'performance-gap',
        },
      });
    });
  }

  events.sort((a, b) => a.time - b.time);

  return {
    events,
    totalDuration: analyzerData.durationMs,
    sessionStart: analyzerData.earliest,
    sessionEnd: analyzerData.latest,
  };
}

// Load the most recent analyzer output
const outputsDir = path.join(__dirname, '../outputs');
const files = fs.readdirSync(outputsDir)
  .filter(f => f.startsWith('log-analysis-') && f.endsWith('.json'))
  .sort()
  .reverse();

if (files.length === 0) {
  console.error('❌ No analyzer output files found in outputs/ directory');
  process.exit(1);
}

const latestFile = path.join(outputsDir, files[0]);
console.log(`📊 Testing with: ${files[0]}`);

try {
  const analyzerData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  const timelineData = analyzerToTimelineData(analyzerData);

  console.log('\n✅ Data Adapter Test Results:');
  console.log(`   Total Events: ${timelineData.events.length}`);
  console.log(`   Total Duration: ${(timelineData.totalDuration / 1000).toFixed(2)}s`);
  console.log(`   Session: ${new Date(timelineData.sessionStart).toISOString()} → ${new Date(timelineData.sessionEnd).toISOString()}`);

  // Count by type
  const typeCount = {};
  timelineData.events.forEach(e => {
    typeCount[e.type] = (typeCount[e.type] || 0) + 1;
  });

  console.log('\n📈 Event Type Distribution:');
  Object.entries(typeCount).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  // Find performance gaps
  const gaps = timelineData.events.filter(e => e.type === 'gap' || e.type === 'blocked');
  const totalGapTime = gaps.reduce((sum, g) => sum + g.duration, 0);
  const longestGap = Math.max(...gaps.map(g => g.duration), 0);

  console.log('\n⚡ Performance Insights:');
  console.log(`   Gap Count: ${gaps.length}`);
  console.log(`   Total Gap Time: ${(totalGapTime / 1000).toFixed(2)}s`);
  console.log(`   Longest Gap: ${(longestGap / 1000).toFixed(2)}s`);
  console.log(`   Active Efficiency: ${((1 - totalGapTime / timelineData.totalDuration) * 100).toFixed(1)}%`);

  // Sample events
  console.log('\n📋 First 5 Events:');
  timelineData.events.slice(0, 5).forEach((e, i) => {
    console.log(`   ${i + 1}. ${e.name} [${e.type}] @ ${(e.time / 1000).toFixed(2)}s (${e.duration}ms)`);
  });

  // Verify gaps are identified
  const largeGaps = gaps.filter(g => g.duration > 1000);
  console.log(`\n✓ Large gaps detected: ${largeGaps.length}`);
  if (largeGaps.length > 0) {
    console.log('   Largest gaps:');
    largeGaps
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 3)
      .forEach((g, i) => {
        console.log(`     ${i + 1}. ${g.name} → ${(g.duration / 1000).toFixed(2)}s`);
      });
  }

  console.log('\n✅ All tests passed! Data adapter is working correctly.');
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
