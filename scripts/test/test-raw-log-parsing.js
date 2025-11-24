/**
 * Test raw log parsing to see what LogAnalyzer produces
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directly test the LogAnalyzer
try {
  // Dynamically import the built LogAnalyzer
  const logAnalyzerModule = await import('./dist/ui/telemetry/LogAnalyzer.js').catch(err => {
    console.log('⚠️  Could not import dist version:', err.message);
    console.log('Checking dist structure...');
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      const dirs = fs.readdirSync(distDir);
      console.log('Available in dist:', dirs);
    }
    return null;
  });

  if (!logAnalyzerModule) {
    // Fallback: read and parse the TypeScript source directly
    console.log('Using direct TypeScript parsing...');
    const logContent = fs.readFileSync('.logs/web-variant-localhost-1762811808902.log', 'utf8');
    
    // Simple parser that mimics LogAnalyzer
    const lines = logContent.split('\n');
    // events object is prepared but not used in current implementation
    // const events = {
    //   pluginMounts: { byPlugin: {} },
    //   topics: {},
    //   sequences: {},
    //   performance: { gaps: [] },
    //   earliest: null,
    //   latest: null,
    //   durationMs: 0,
    // };

    const timestampPattern = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/;
    const pluginPattern = /\[PLUGIN\]\s*(\w+)\s*Mount/;
    const topicPattern = /EventBus:\s*(\S+)\s*(?:published|subscribed)/i;

    console.log('\n📊 Parsing raw log...');
    let timestamps = [];
    let pluginMounts = {};
    let topicNames = new Set();

    lines.forEach((line, _idx) => {
      const tsMatch = line.match(timestampPattern);
      if (tsMatch) {
        timestamps.push(tsMatch[1]);
      }

      const pluginMatch = line.match(pluginPattern);
      if (pluginMatch) {
        const plugin = pluginMatch[1];
        if (!pluginMounts[plugin]) {
          pluginMounts[plugin] = [];
        }
        if (tsMatch) {
          pluginMounts[plugin].push(tsMatch[1]);
        }
      }

      const topicMatch = line.match(topicPattern);
      if (topicMatch) {
        topicNames.add(topicMatch[1]);
      }
    });

    console.log('\n✅ Parsed Results:');
    console.log('Total timestamps found:', timestamps.length);
    console.log('Plugins:', Object.keys(pluginMounts).length, 'unique');
    console.log('Topics:', topicNames.size, 'unique');
    console.log('\nSample plugins found:');
    Object.keys(pluginMounts).slice(0, 5).forEach(p => {
      console.log(`  ${p}: ${pluginMounts[p].length} mounts`);
    });
    console.log('\nSample topics found:');
    Array.from(topicNames).slice(0, 10).forEach(t => {
      console.log(`  ${t}`);
    });
  }
} catch (err) {
  console.error('Error:', err);
}
