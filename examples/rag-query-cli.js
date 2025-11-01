#!/usr/bin/env node

/**
 * RAG Query CLI - Command-line interface for querying telemetry patterns
 * 
 * This CLI allows you to:
 * 1. Query telemetry logs for component behavior patterns
 * 2. Search for specific plugin/sequence mappings
 * 3. Analyze event sequences and timing data
 * 4. Export patterns for use in RAG enrichment
 */

import { ComponentBehaviorExtractor } from '../packages/library/dist/index.js';
import fs from 'fs/promises';
import path from 'path';

// Simple LogLoader implementation for demo purposes
class SimpleLogLoader {
  async loadAndChunk(filePath, options = { chunkSize: 50 }) {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(Boolean);
    const chunks = [];

    for (let i = 0; i < lines.length; i += options.chunkSize) {
      const chunkLines = lines.slice(i, i + options.chunkSize);
      chunks.push({
        lines: chunkLines,
        metadata: {
          timestamp: this.extractTimestamp(chunkLines[0]) || new Date().toISOString(),
          eventType: this.inferEventType(chunkLines),
          sessionId: this.extractSessionId(chunkLines) || 'demo-session'
        }
      });
    }

    return chunks;
  }

  extractTimestamp(line) {
    if (!line) return null;
    const match = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    return match ? match[0] : null;
  }

  inferEventType(lines) {
    const content = lines.join(' ');
    if (content.includes('PluginMounted')) return 'PluginMounted';
    if (content.includes('Sequence')) return 'Sequence';
    if (content.includes('Event')) return 'Event';
    if (content.includes('Beat')) return 'Beat';
    if (content.includes('Routing')) return 'Routing';
    return 'Unknown';
  }

  extractSessionId(lines) {
    const content = lines.join(' ');
    const match = content.match(/session[:\s]+([a-zA-Z0-9\-]+)/i);
    return match ? match[1] : null;
  }
}

class RAGQueryCLI {
  constructor() {
    this.extractor = new ComponentBehaviorExtractor();
    this.logLoader = new SimpleLogLoader();
  }

  async loadTelemetryChunks(logPath) {
    try {
      const fullPath = path.resolve(logPath);
      await fs.access(fullPath);
      return await this.logLoader.loadAndChunk(fullPath, { chunkSize: 50 });
    } catch (error) {
      throw new Error(`Cannot load telemetry log: ${logPath} - ${error.message}`);
    }
  }

  async queryPatterns(logPath, options = {}) {
    console.log(`🔍 Analyzing telemetry log: ${logPath}`);
    
    const chunks = await this.loadTelemetryChunks(logPath);
    console.log(`📊 Loaded ${chunks.length} log chunks`);
    
    const patterns = await this.extractor.extractPatterns(chunks);
    console.log(`🎯 Extracted patterns for ${patterns.length} component types`);
    
    if (options.componentType) {
      const filtered = patterns.filter(p => 
        p.componentType.toLowerCase().includes(options.componentType.toLowerCase())
      );
      return this.displayPatterns(filtered, options);
    }
    
    return this.displayPatterns(patterns, options);
  }

  async queryMappings(logPath, options = {}) {
    console.log(`🔗 Extracting plugin/sequence mappings from: ${logPath}`);
    
    const chunks = await this.loadTelemetryChunks(logPath);
    const mappings = await this.extractor.extractPluginSequenceMappings(chunks);
    
    console.log(`📋 Found ${mappings.length} plugin/sequence mappings`);
    
    if (options.topic) {
      const filtered = mappings.filter(m => 
        m.topic.toLowerCase().includes(options.topic.toLowerCase())
      );
      return this.displayMappings(filtered, options);
    }
    
    if (options.plugin) {
      const filtered = mappings.filter(m => 
        m.pluginId.toLowerCase().includes(options.plugin.toLowerCase())
      );
      return this.displayMappings(filtered, options);
    }
    
    return this.displayMappings(mappings, options);
  }

  async queryEvents(logPath, options = {}) {
    console.log(`🎵 Extracting event sequences from: ${logPath}`);
    
    const chunks = await this.loadTelemetryChunks(logPath);
    const sequences = await this.extractor.extractEventSequences(chunks);
    
    console.log(`🎼 Found ${sequences.length} event sequences`);
    
    return this.displayEventSequences(sequences, options);
  }

  async queryDataFlow(logPath, options = {}) {
    console.log(`🌊 Extracting data flow patterns from: ${logPath}`);
    
    const chunks = await this.loadTelemetryChunks(logPath);
    const patterns = await this.extractor.extractDataFlowPatterns(chunks);
    
    console.log(`📈 Found ${patterns.length} data flow patterns`);
    
    return this.displayDataFlowPatterns(patterns, options);
  }

  displayPatterns(patterns, options) {
    if (patterns.length === 0) {
      console.log('❌ No patterns found');
      return;
    }

    patterns.forEach((pattern, index) => {
      console.log(`\n📦 Pattern ${index + 1}: ${pattern.componentType}`);
      console.log(`   Operations: ${Object.keys(pattern.operations).length}`);
      
      if (options.detailed) {
        Object.entries(pattern.operations).forEach(([op, data]) => {
          console.log(`   • ${op}:`);
          console.log(`     - Frequency: ${data.frequency}`);
          console.log(`     - Avg Duration: ${data.averageDuration?.toFixed(2)}ms`);
          console.log(`     - Plugin Mappings: ${data.pluginSequenceMappings.length}`);
          console.log(`     - Event Sequences: ${data.eventSequences.length}`);
          console.log(`     - Data Flow Patterns: ${data.dataFlowPatterns.length}`);
        });
      }
    });

    if (options.export) {
      this.exportPatterns(patterns, options.export);
    }
  }

  displayMappings(mappings, options) {
    if (mappings.length === 0) {
      console.log('❌ No mappings found');
      return;
    }

    console.log('\n🔗 Plugin/Sequence Mappings:');
    mappings.forEach((mapping, index) => {
      console.log(`${index + 1}. ${mapping.topic}`);
      console.log(`   → ${mapping.pluginId}::${mapping.sequenceId}`);
      if (options.detailed && mapping.sequenceName) {
        console.log(`   Name: ${mapping.sequenceName}`);
      }
    });

    if (options.export) {
      this.exportMappings(mappings, options.export);
    }
  }

  displayEventSequences(sequences, options) {
    if (sequences.length === 0) {
      console.log('❌ No event sequences found');
      return;
    }

    console.log('\n🎵 Event Sequences:');
    sequences.forEach((seq, index) => {
      console.log(`${index + 1}. Sequence: ${seq.sequenceId || 'Unknown'}`);
      console.log(`   Movements: ${seq.movements.length}`);
      console.log(`   Total Duration: ${seq.totalDuration?.toFixed(2)}ms`);
      
      if (options.detailed) {
        seq.movements.forEach((movement, mIndex) => {
          console.log(`   Movement ${mIndex + 1}: ${movement.name}`);
          console.log(`     Beats: ${movement.beats.length}`);
          movement.beats.forEach((beat, bIndex) => {
            console.log(`     Beat ${bIndex + 1}: ${beat.event} (${beat.duration?.toFixed(2)}ms)`);
          });
        });
      }
    });

    if (options.export) {
      this.exportEventSequences(sequences, options.export);
    }
  }

  displayDataFlowPatterns(patterns, options) {
    if (patterns.length === 0) {
      console.log('❌ No data flow patterns found');
      return;
    }

    console.log('\n🌊 Data Flow Patterns:');
    patterns.forEach((pattern, index) => {
      console.log(`${index + 1}. Sequence: ${pattern.sequenceId || 'Unknown'}`);
      console.log(`   Changes: ${pattern.changes.length}`);
      
      if (options.detailed) {
        pattern.changes.forEach((change, cIndex) => {
          console.log(`   Change ${cIndex + 1}: ${change.operation} - ${change.field}`);
          if (change.value) {
            console.log(`     Value: ${JSON.stringify(change.value).substring(0, 100)}...`);
          }
        });
      }
    });

    if (options.export) {
      this.exportDataFlowPatterns(patterns, options.export);
    }
  }

  async exportPatterns(patterns, filePath) {
    await fs.writeFile(filePath, JSON.stringify(patterns, null, 2));
    console.log(`✅ Exported ${patterns.length} patterns to: ${filePath}`);
  }

  async exportMappings(mappings, filePath) {
    await fs.writeFile(filePath, JSON.stringify(mappings, null, 2));
    console.log(`✅ Exported ${mappings.length} mappings to: ${filePath}`);
  }

  async exportEventSequences(sequences, filePath) {
    await fs.writeFile(filePath, JSON.stringify(sequences, null, 2));
    console.log(`✅ Exported ${sequences.length} event sequences to: ${filePath}`);
  }

  async exportDataFlowPatterns(patterns, filePath) {
    await fs.writeFile(filePath, JSON.stringify(patterns, null, 2));
    console.log(`✅ Exported ${patterns.length} data flow patterns to: ${filePath}`);
  }
}

// Simple CLI Setup
const cli = new RAGQueryCLI();

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🔍 RAG Query CLI - Query telemetry logs for component behavior patterns

Usage:
  node examples/rag-query-cli.js <command> <logPath> [options]

Commands:
  patterns <logPath>    Extract component behavior patterns
  mappings <logPath>    Extract plugin/sequence mappings
  events <logPath>      Extract event sequences
  dataflow <logPath>    Extract data flow patterns
  help                  Show this help

Options:
  -d, --detailed        Show detailed information
  -t, --type <type>     Filter by component type (patterns only)
  --topic <topic>       Filter by topic (mappings only)
  --plugin <plugin>     Filter by plugin (mappings only)
  -e, --export <file>   Export results to JSON file

Examples:
  node examples/rag-query-cli.js patterns examples/sample-telemetry.log
  node examples/rag-query-cli.js patterns examples/sample-telemetry.log -d -t button
  node examples/rag-query-cli.js mappings examples/sample-telemetry.log --topic library
  node examples/rag-query-cli.js events examples/sample-telemetry.log -d
    `);
    return;
  }

  const command = args[0];
  const logPath = args[1];

  if (command === 'help') {
    console.log('Help shown above');
    return;
  }

  if (!logPath) {
    console.error('❌ Error: Log path is required');
    process.exit(1);
  }

  // Parse simple options
  const options = {
    detailed: args.includes('-d') || args.includes('--detailed'),
    componentType: getOptionValue(args, '-t') || getOptionValue(args, '--type'),
    topic: getOptionValue(args, '--topic'),
    plugin: getOptionValue(args, '--plugin'),
    export: getOptionValue(args, '-e') || getOptionValue(args, '--export')
  };

  try {
    switch (command) {
      case 'patterns':
        await cli.queryPatterns(logPath, options);
        break;
      case 'mappings':
        await cli.queryMappings(logPath, options);
        break;
      case 'events':
        await cli.queryEvents(logPath, options);
        break;
      case 'dataflow':
        await cli.queryDataFlow(logPath, options);
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function getOptionValue(args, option) {
  const index = args.indexOf(option);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
}

main();
