/*
 Simple timestamp-aware log analyzer for RenderX logs.
 Usage:
   node scripts/analyze-logs.js <path-to-log-file> [--json]
 Outputs a human-readable summary to stdout and writes a JSON summary to outputs/.
*/

import fs from 'fs';
import path from 'path';

function parseIso(ts) {
  try {
    return new Date(ts);
  } catch {
    return null;
  }
}

function extractTimestamp(line) {
  const m = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
  return m ? m[1] : null;
}

function extractBetween(line, startToken, endToken) {
  const start = line.indexOf(startToken);
  if (start === -1) return null;
  const from = start + startToken.length;
  const end = line.indexOf(endToken, from);
  if (end === -1) return null;
  return line.substring(from, end);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/analyze-logs.js <path-to-log-file> [--json]');
    process.exit(1);
  }
  const logPath = path.resolve(process.cwd(), args[0]);
  const emitJson = args.includes('--json');
  if (!fs.existsSync(logPath)) {
    console.error(`Log file not found: ${logPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(logPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);

  const stats = {
    file: logPath,
    totalLines: lines.length,
    earliest: null,
    latest: null,
    durationMs: 0,
    pluginMounts: {
      attempts: 0,
      successes: 0,
      byPlugin: {},
    },
    sequences: {
      registered: 0,
      byName: {},
      details: {},
      executions: [],
    },
    topics: {
      subscribed: 0,
      byTopic: {},
    },
    css: {
      injectTopics: 0,
      controlPanelEvents: 0,
    },
    beats: {
      started: [],
      completed: [],
      stats: {},
    },
    movements: {
      started: [],
      completed: [],
      stats: {},
    },
    // context stack to attribute PerformanceTracker lines
    _ctx: {
      currentSequence: null,
      currentMovement: null,
    },
    // performance analysis
    performance: {
      metrics: {},
      gaps: [],
      slowSequences: {},
    },
  };

  // Track all timestamped lines for gap detection
  // Track all timestamped lines for gap detection and performance analysis
  const _allTimestamps = [];

  for (const line of lines) {
    const tsStr = extractTimestamp(line);
    if (tsStr) {
      const d = parseIso(tsStr);
      if (!isNaN(d)) {
        if (!stats.earliest || d < stats.earliest) stats.earliest = d;
        if (!stats.latest || d > stats.latest) stats.latest = d;
        _allTimestamps.push({ ts: tsStr, d });
      }
    }

    // Plugin mount attempts/successes
    if (line.includes('PluginManager: Attempting to mount plugin:')) {
      stats.pluginMounts.attempts += 1;
      const name = line.split('Attempting to mount plugin:')[1]?.trim();
      const tsStr = extractTimestamp(line);
      const _ts = tsStr ? parseIso(tsStr) : null;
      if (name) {
        const entry = stats.pluginMounts.byPlugin[name] || { attempts: 0, successes: 0, attemptTimestamps: [], successTimestamps: [], durations: [] };
        entry.attempts += 1;
        if (_ts) entry.attemptTimestamps.push(_ts.toISOString());
        stats.pluginMounts.byPlugin[name] = entry;
      }
    }
    if (line.includes('✅ Plugin mounted successfully:')) {
      stats.pluginMounts.successes += 1;
      const name = line.split('✅ Plugin mounted successfully:')[1]?.trim();
      const tsStr = extractTimestamp(line);
      const _ts = tsStr ? parseIso(tsStr) : null;
      if (name) {
        const entry = stats.pluginMounts.byPlugin[name] || { attempts: 0, successes: 0, attemptTimestamps: [], successTimestamps: [], durations: [] };
        entry.successes += 1;
        if (_ts) entry.successTimestamps.push(_ts.toISOString());
        // If there is an unmatched attempt timestamp, pair it for duration
        if (entry.attemptTimestamps && entry.attemptTimestamps.length > 0) {
          const attemptTs = entry.attemptTimestamps.shift();
          if (attemptTs && _ts) {
            const dur = _ts.getTime() - new Date(attemptTs).getTime();
            entry.durations.push(dur);
          }
        }
        stats.pluginMounts.byPlugin[name] = entry;
      }
    }

    // Sequence registration
    if (line.includes('SequenceRegistry: Registered sequence')) {
      stats.sequences.registered += 1;
      const seqName = extractBetween(line, 'Registered sequence "', '"');
      const idMatch = line.match(/\(id:\s*([^\)]+)\)/);
      const seqId = idMatch ? idMatch[1] : null;
      const tsStr = extractTimestamp(line);
      const ts = tsStr ? parseIso(tsStr) : null;
      if (seqName) {
        stats.sequences.byName[seqName] = (stats.sequences.byName[seqName] || 0) + 1;
        const det = stats.sequences.details[seqName] || { count: 0, ids: [], timestamps: [] };
        det.count += 1;
        if (seqId) det.ids.push(seqId.trim());
        if (ts) det.timestamps.push(ts.toISOString());
        stats.sequences.details[seqName] = det;
        // set current sequence context
        stats._ctx.currentSequence = seqName;
      }
    }

    // Topic subscriptions
    if (line.includes('EventBus: Subscribed to')) {
      stats.topics.subscribed += 1;
      const topic = extractBetween(line, 'Subscribed to "', '"');
      const tsStr = extractTimestamp(line);
      const ts = tsStr ? parseIso(tsStr) : null;
      if (topic) {
        stats.topics.byTopic[topic] = (stats.topics.byTopic[topic] || 0) + 1;
      }
      if (topic && topic.includes('css:inject')) stats.css.injectTopics += 1;
      if (topic && topic.startsWith('control:panel:css:')) stats.css.controlPanelEvents += 1;
    }

    // Heuristic: update current sequence/movement context when explicit sequence/movement lines appear
    if (line.includes('🎼 Sequence:')) {
      const m = line.match(/🎼 Sequence:\s*(.+)$/);
      if (m) stats._ctx.currentSequence = m[1].trim();
    }
    if (line.includes('🎵 Movement:')) {
      const m = line.match(/🎵 Movement:\s*(.+)$/);
      if (m) stats._ctx.currentMovement = m[1].trim();
    }

    // PerformanceTracker: Beat/Mvmt completed in XXms
    const beatDone = line.match(/PerformanceTracker:\s*Beat\s*(\d+)\s*completed in\s*([0-9.]+)ms/i);
    if (beatDone) {
      const beatNum = Number(beatDone[1]);
      const dur = Number(beatDone[2]);
      const seq = stats._ctx.currentSequence || 'unknown';
      stats.sequences.details[seq] = stats.sequences.details[seq] || { count: 0, ids: [], timestamps: [], beats: {} };
      const det = stats.sequences.details[seq];
      det.beats = det.beats || {};
      det.beats[beatNum] = det.beats[beatNum] || [];
      det.beats[beatNum].push(dur);
      stats.sequences.details[seq] = det;
    }

    const mvmtDone = line.match(/PerformanceTracker:\s*Movement\s*(.+)\s*completed in\s*([0-9.]+)ms/i);
    if (mvmtDone) {
      const name = mvmtDone[1].trim();
      const dur = Number(mvmtDone[2]);
      const seq = stats._ctx.currentSequence || 'unknown';
      stats.sequences.details[seq] = stats.sequences.details[seq] || { count: 0, ids: [], timestamps: [], movements: [] };
      const det = stats.sequences.details[seq];
      det.movements = det.movements || [];
      det.movements.push({ name, durationMs: dur });
      stats.sequences.details[seq] = det;
    }

    // Execution start/completed for sequence-level durations
    const seqStart = line.match(/ExecutionQueue:\s*Now executing\s*"([^"]+)"/);
    if (seqStart) {
      const name = seqStart[1].trim();
      const tsStr = extractTimestamp(line);
      const ts = tsStr ? parseIso(tsStr) : null;
      stats.sequences.executions.push({ name, start: ts ? ts.toISOString() : null, end: null, durationMs: null });
      // set current sequence
      stats._ctx.currentSequence = name;
    }
    const seqComplete = line.match(/SequenceExecutor:\s*Sequence\s*"([^"]+)"\s*completed in\s*([0-9.]+)ms/);
    if (seqComplete) {
      const name = seqComplete[1].trim();
      const dur = Number(seqComplete[2]);
      const tsStr = extractTimestamp(line);
      const ts = tsStr ? parseIso(tsStr) : null;
      // find last execution entry without end
      for (let i = stats.sequences.executions.length - 1; i >= 0; i--) {
        const e = stats.sequences.executions[i];
        if (e.name === name && !e.end) {
          e.end = ts ? ts.toISOString() : null;
          e.durationMs = dur;
          break;
        }
      }
    }
    // Beat / movement events (pair by order when possible)
    if (line.includes('beat:started') || line.includes('musical-conductor:beat:started') || line.includes('beat-started')) {
      const tsStr = extractTimestamp(line);
      if (tsStr) stats.beats.started.push(parseIso(tsStr).toISOString());
    }
    if (line.includes('beat:completed') || line.includes('musical-conductor:beat:completed') || line.includes('beat-completed')) {
      const tsStr = extractTimestamp(line);
      if (tsStr) stats.beats.completed.push(parseIso(tsStr).toISOString());
    }
    if (line.includes('movement-started') || line.includes('movement-started') || line.includes('movement-start')) {
      const tsStr = extractTimestamp(line);
      if (tsStr) stats.movements.started.push(parseIso(tsStr).toISOString());
    }
    if (line.includes('movement-completed') || line.includes('movement-completed') || line.includes('movement-complete')) {
      const tsStr = extractTimestamp(line);
      if (tsStr) stats.movements.completed.push(parseIso(tsStr).toISOString());
    }

    // Also count direct string matches as fallback if topic extraction missed
    if (line.includes('css:inject')) stats.css.injectTopics += 0; // prevent double counting while allowing scan confirmation
    if (line.includes('control:panel:css:')) stats.css.controlPanelEvents += 0;
  }

  // Detect gaps between consecutive timestamps (dead time zones)
  if (_allTimestamps.length > 1) {
    const gapThreshold = 1000; // report gaps > 1 second
    for (let i = 1; i < _allTimestamps.length; i++) {
      const prev = _allTimestamps[i - 1].d;
      const curr = _allTimestamps[i].d;
      const gap = curr.getTime() - prev.getTime();
      if (gap > gapThreshold) {
        stats.performance.gaps.push({
          start: _allTimestamps[i - 1].ts,
          end: _allTimestamps[i].ts,
          durationMs: gap,
        });
      }
    }
  }

  if (stats.earliest && stats.latest) {
    stats.durationMs = stats.latest.getTime() - stats.earliest.getTime();
  }

  // Emit human-readable summary
  const durationSec = (stats.durationMs / 1000).toFixed(3);
  console.log('--- Log Analysis Summary ---');
  console.log(`File: ${stats.file}`);
  console.log(`Lines: ${stats.totalLines}`);
  if (stats.earliest) console.log(`Start: ${stats.earliest.toISOString()}`);
  if (stats.latest) console.log(`End:   ${stats.latest.toISOString()}`);
  console.log(`Duration: ${durationSec}s`);
  console.log('');
  console.log('Plugins:');
  console.log(`  Mount attempts: ${stats.pluginMounts.attempts}`);
  console.log(`  Mount successes: ${stats.pluginMounts.successes}`);
  const pluginNames = Object.keys(stats.pluginMounts.byPlugin);
  if (pluginNames.length) {
    for (const name of pluginNames.sort()) {
      const p = stats.pluginMounts.byPlugin[name];
      console.log(`   - ${name}: ${p.successes}/${p.attempts} mounted`);
    }
  }
  console.log('');
  console.log(`Sequences registered: ${stats.sequences.registered}`);
  const topSeqs = Object.entries(stats.sequences.byName)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  if (topSeqs.length) {
    console.log(' Top sequences:');
    for (const [name, count] of topSeqs) {
      console.log(`   - ${name}: ${count}`);
    }
  }
  console.log('');
  console.log(`Topic subscriptions: ${stats.topics.subscribed}`);
  const topTopics = Object.entries(stats.topics.byTopic)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  if (topTopics.length) {
    console.log(' Top topics:');
    for (const [topic, count] of topTopics) {
      console.log(`   - ${topic}: ${count}`);
    }
  }
  console.log('');
  console.log('CSS-related:');
  console.log(`  css:inject subscriptions: ${stats.css.injectTopics}`);
  console.log(`  control:panel:css:* subscriptions: ${stats.css.controlPanelEvents}`);

  // Write JSON summary
  try {
    const outDir = path.resolve(process.cwd(), 'outputs');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outPath = path.join(outDir, `log-analysis-${stamp}.json`);
    const json = {
      ...stats,
      earliest: stats.earliest ? stats.earliest.toISOString() : null,
      latest: stats.latest ? stats.latest.toISOString() : null,
    };
    fs.writeFileSync(outPath, JSON.stringify(json, null, 2), 'utf8');
    if (emitJson) console.log(`\nJSON summary written to: ${outPath}`);
    // Also generate a comprehensive Markdown report
    try {
      function humanMs(ms) {
        if (!ms && ms !== 0) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        const s = (ms / 1000).toFixed(3);
        return `${s}s`;
      }

      const mdLines = [];
      mdLines.push(`# Log Analysis Report`);
      mdLines.push('');
      mdLines.push(`**Source file:** ${stats.file}`);
      mdLines.push('');
      mdLines.push(`- **Total lines:** ${stats.totalLines}`);
      mdLines.push(`- **Time range:** ${json.earliest ?? 'N/A'} → ${json.latest ?? 'N/A'}`);
      mdLines.push(`- **Duration:** ${humanMs(stats.durationMs)}`);
      mdLines.push('');

      // Performance hotspots - dead time zones
      if (stats.performance.gaps && stats.performance.gaps.length > 0) {
        mdLines.push('## ⚠️ Performance Hotspots (Dead Time Zones)');
        mdLines.push('');
        mdLines.push('These gaps indicate periods where NO instrumentation was logging—likely React rendering or other blocking main-thread work.');
        mdLines.push('');
        mdLines.push('| Start | End | Gap Duration |');
        mdLines.push('|---|---|---:|');
        for (const gap of stats.performance.gaps) {
          mdLines.push(`| ${gap.start} | ${gap.end} | **${humanMs(gap.durationMs)}** |`);
        }
        mdLines.push('');
      }

      // Plugins table
      mdLines.push('## Plugins');
      mdLines.push('');
      mdLines.push(`- Mount attempts: ${stats.pluginMounts.attempts}`);
      mdLines.push(`- Mount successes: ${stats.pluginMounts.successes}`);
      mdLines.push('');
      mdLines.push('| Plugin | Attempts | Successes | Avg mount | Last mount |');
      mdLines.push('|---|---:|---:|---:|---:|');
      for (const name of Object.keys(stats.pluginMounts.byPlugin).sort()) {
        const p = stats.pluginMounts.byPlugin[name];
        const avg = (p.durations && p.durations.length) ? Math.round(p.durations.reduce((a,b)=>a+b,0)/p.durations.length) : null;
        const last = (p.durations && p.durations.length) ? p.durations[p.durations.length - 1] : null;
        mdLines.push(`| ${name} | ${p.attempts||0} | ${p.successes||0} | ${avg ? humanMs(avg) : 'N/A'} | ${last ? humanMs(last) : 'N/A'} |`);
      }
      mdLines.push('');

      // Sequences with timestamps (collapsible)
      mdLines.push('## Sequences');
      mdLines.push('');
      mdLines.push(`- Registered sequences: ${stats.sequences.registered}`);
      mdLines.push('');
      mdLines.push('<details>');
      mdLines.push('<summary>Sequence details (click to expand)</summary>');
      mdLines.push('');
      mdLines.push('| Sequence | Count | IDs | First seen | Last seen |');
      mdLines.push('|---|---:|---|---|---|');
      for (const name of Object.keys(stats.sequences.details).sort()) {
        const d = stats.sequences.details[name];
        const first = (d.timestamps && d.timestamps.length) ? d.timestamps[0] : 'N/A';
        const lastT = (d.timestamps && d.timestamps.length) ? d.timestamps[d.timestamps.length - 1] : 'N/A';
        mdLines.push(`| ${name} | ${d.count} | ${d.ids.join(', ') || 'N/A'} | ${first} | ${lastT} |`);
      }
      mdLines.push('');
      mdLines.push('</details>');
      mdLines.push('');

      // Topics top list
      mdLines.push('## Topics / Subscriptions');
      mdLines.push('');
      mdLines.push(`- Total topic subscriptions: ${stats.topics.subscribed}`);
      mdLines.push('');
      mdLines.push('| Topic | Count |');
      mdLines.push('|---|---:|');
      const topicEntries = Object.entries(stats.topics.byTopic).sort((a,b)=>b[1]-a[1]);
      for (const [topic, cnt] of topicEntries) mdLines.push(`| ${topic} | ${cnt} |`);
      mdLines.push('');

      // Beats & Movements summary
      mdLines.push('## Beats & Movements');
      mdLines.push('');
      const beatCount = Math.min(stats.beats.started.length, stats.beats.completed.length);
      mdLines.push(`- Beats started: ${stats.beats.started.length}`);
      mdLines.push(`- Beats completed: ${stats.beats.completed.length}`);
      if (beatCount > 0) {
        const paired = [];
        for (let i=0;i<beatCount;i++) {
          const s = new Date(stats.beats.started[i]);
          const e = new Date(stats.beats.completed[i]);
          paired.push(e.getTime() - s.getTime());
        }
        const avg = Math.round(paired.reduce((a,b)=>a+b,0)/paired.length);
        mdLines.push(`- Beats (avg duration): ${humanMs(avg)}`);
      }
      mdLines.push('');
      const movCount = Math.min(stats.movements.started.length, stats.movements.completed.length);
      mdLines.push(`- Movements started: ${stats.movements.started.length}`);
      mdLines.push(`- Movements completed: ${stats.movements.completed.length}`);
      if (movCount > 0) {
        const paired = [];
        for (let i=0;i<movCount;i++) {
          const s = new Date(stats.movements.started[i]);
          const e = new Date(stats.movements.completed[i]);
          paired.push(e.getTime() - s.getTime());
        }
        const avg = Math.round(paired.reduce((a,b)=>a+b,0)/paired.length);
        mdLines.push(`- Movements (avg duration): ${humanMs(avg)}`);
      }
      mdLines.push('');

      // CSS summary
      mdLines.push('## CSS-related events');
      mdLines.push('');
      mdLines.push(`- css:inject subscriptions: ${stats.css.injectTopics}`);
      mdLines.push(`- control:panel:css:* subscriptions: ${stats.css.controlPanelEvents}`);
      mdLines.push('');

      mdLines.push('---');
      mdLines.push('Generated by scripts/analyze-logs.js');

      const mdOut = path.join(outDir, `log-analysis-${stamp}.md`);
      fs.writeFileSync(mdOut, mdLines.join('\n'), 'utf8');
      console.log(`Markdown summary written to: ${mdOut}`);
    } catch (e) {
      console.error('Failed to write Markdown report:', e?.message || e);
    }
  } catch (e) {
    console.error('Failed to write JSON summary:', e?.message || e);
  }
}

main();
