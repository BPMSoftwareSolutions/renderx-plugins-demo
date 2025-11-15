#!/usr/bin/env node

/**
 * Sequence Player CLI - CommonJS wrapper
 * 
 * This wrapper avoids circular dependency issues by using dynamic imports
 * and running in a separate context.
 */

const path = require("path");
const fs = require("fs");

// Get the command from process.argv
const command = process.argv[2] || "play";
const args = process.argv.slice(3);

// Simple argument parser
const parseArgs = (args) => {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].substring(2);
      const value = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
      result[key] = value;
      if (value !== true) i++;
    }
  }
  return result;
};

const parsedArgs = parseArgs(args);

// Simple log parser for testing
const parseLog = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    console.log("🎵 Log Parser Report");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`Log File: ${filePath}`);
    console.log("");

    // Extract version information from the log so we know exactly
    // which build/plugins produced this run.
    let manifest = null;
    const versionLines = [];
    const jsonRegex = /VERSIONS_JSON:\s*(\{.*\})/;
    const simpleRegex = /VERSIONS:\s*(.+)$/;

    for (const line of lines) {
      if (!manifest) {
        const jsonMatch = line.match(jsonRegex);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            manifest = parsed;
          } catch {
            // Ignore parse errors and fall back to simple version lines
          }
        }
      }

      const simpleMatch = line.match(simpleRegex);
      if (simpleMatch) {
        versionLines.push(simpleMatch[1].trim());
      }
    }

    if (manifest || versionLines.length > 0) {
      console.log("📦 Version information");
      console.log("───────────────────────────────────────────────────────────────");
      if (manifest) {
        const builtAt = manifest.builtAt || "unknown";
        const commit = manifest.commit || "unknown";
        console.log(`Built at: ${builtAt}  Commit: ${commit}`);
        if (Array.isArray(manifest.packages)) {
          manifest.packages.forEach((pkg) => {
            if (pkg && pkg.name && pkg.version) {
              console.log(`  - ${pkg.name}@${pkg.version}`);
            }
          });
        }
      } else {
        versionLines.forEach((v) => {
          console.log(`  - ${v}`);
        });
      }
      console.log("");
    }

    console.log("📊 Sequences Found");
    console.log("───────────────────────────────────────────────────────────────");

    // Extract sequences from log
    const sequences = new Map();
    const sequenceCompletions = [];
    const completionRegex = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z).*SequenceExecutor: Sequence "([^"]+)" completed/;

    lines.forEach((line) => {
      if (line.includes("sequence:") || line.includes("Sequence:")) {
        const match = line.match(/sequence[:\s]+([a-zA-Z0-9\-_]+)/i);
        if (match) {
          const seqId = match[1];
          if (!sequences.has(seqId)) {
            sequences.set(seqId, { beats: 0, duration: 0 });
          }
        }
      }

      // Extract sequence completion times
      const completionMatch = line.match(completionRegex);
      if (completionMatch) {
        sequenceCompletions.push({
          timestamp: new Date(completionMatch[1]),
          sequenceName: completionMatch[2],
          timeStr: completionMatch[1],
        });
      }
    });

    let index = 1;
    sequences.forEach((data, seqId) => {
      console.log(`${index}. ${seqId} (${data.beats} beats, ${data.duration}ms)`);
      index++;
    });

    console.log("");
    console.log(`Total: ${sequences.size} sequences, ${Array.from(sequences.values()).reduce((sum, s) => sum + s.beats, 0)} beats`);

    // Analyze inter-sequence delays
    if (sequenceCompletions.length > 1) {
      console.log("");
      console.log("⏱️ Inter-Sequence Delays");
      console.log("───────────────────────────────────────────────────────────────");

      let hasDelays = false;
      for (let i = 0; i < sequenceCompletions.length - 1; i++) {
        const current = sequenceCompletions[i];
        const next = sequenceCompletions[i + 1];
        const delayMs = next.timestamp - current.timestamp;

        if (delayMs > 100) {
          hasDelays = true;
          const warning = delayMs > 1000 ? "⚠️ SIGNIFICANT" : "⚠️ SLOW";
          console.log(`${warning}: ${current.sequenceName} → ${next.sequenceName}`);
          console.log(`   Delay: ${delayMs}ms (${(delayMs / 1000).toFixed(2)}s)`);
        }
      }

      if (!hasDelays) {
        console.log("✅ No significant delays detected between sequences");
      }
    }
  } catch (error) {
    console.error(`Error parsing log: ${error.message}`);
    process.exit(1);
  }
};

// Handle commands
switch (command) {
  case "parse-log":
    if (parsedArgs.file) {
      parseLog(parsedArgs.file);
    } else {
      console.error("Error: --file argument required for parse-log command");
      process.exit(1);
    }
    break;
    
  case "list":
    console.log("🎵 Available Sequences");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("ID                              Name                    Beats");
    console.log("───────────────────────────────────────────────────────────────");
    console.log("canvas-component-create         Canvas Component Create 6");
    console.log("canvas-component-delete         Canvas Component Delete 4");
    console.log("control-panel-ui-init           Control Panel UI Init   8");
    console.log("library-drop-canvas-component   Library Drop Component  5");
    break;
    
  case "play":
    console.error("✅ CLI → Browser connection has been fixed!");
    console.error("");
    console.error("The CLI now connects to the running browser via WebSocket.");
    console.error("");
    console.error("📖 See docs/CLI_BROWSER_CONNECTION_FIX.md for details");
    console.error("");
    console.error("To use the CLI:");
    console.error("  1. Start the dev server:");
    console.error("     npm run dev");
    console.error("");
    console.error("  2. Test the connection:");
    console.error("     node scripts/test-cli-connection.js");
    console.error("");
    console.error("  3. This will create a button on the canvas!");
    console.error("");
    console.error("The TypeScript CLI implementation is in:");
    console.error("  packages/musical-conductor/tools/cli/engines/SequencePlayerEngine.ts");
    process.exit(1);

    if (false && parsedArgs.sequence) {
      // STUB CODE - DO NOT USE
      // This was returning fake 588ms timing data
      const mockServices = parsedArgs.mock ? parsedArgs.mock.split(',').map(s => s.trim()) : [];
      const mockBeats = parsedArgs['mock-beat'] ? parsedArgs['mock-beat'].split(',').map(s => parseInt(s.trim())) : [];
      const unmockServices = parsedArgs.unmock ? parsedArgs.unmock.split(',').map(s => s.trim()) : [];
      const unmockBeats = parsedArgs['unmock-beat'] ? parsedArgs['unmock-beat'].split(',').map(s => parseInt(s.trim())) : [];
      const hasMocking = mockServices.length > 0 || mockBeats.length > 0 || unmockServices.length > 0 || unmockBeats.length > 0;
      const mode = hasMocking ? "selective-mocking" : "full-integration";

      const report = {
        sequenceId: parsedArgs.sequence,
        sequenceName: parsedArgs.sequence.replace(/-/g, " "),
        mode: mode,
        mockServices: mockServices,
        mockBeats: mockBeats,
        unmockServices: unmockServices,
        unmockBeats: unmockBeats,
        startTime: Date.now(),
        endTime: Date.now() + 588,
        duration: 588,
        beats: [
          { beat: 1, event: "resolve-template", duration: 5, isMocked: mockServices.includes('pure') || mockBeats.includes(1), kind: 'pure' },
          { beat: 2, event: "register-instance", duration: 12, isMocked: mockServices.includes('io') || mockBeats.includes(2), kind: 'io' },
          { beat: 3, event: "create-node", duration: 18, isMocked: mockServices.includes('pure') || mockBeats.includes(3), kind: 'pure' },
          { beat: 4, event: "render-react", duration: 512, isMocked: mockServices.includes('stage-crew') || mockBeats.includes(4), kind: 'stage-crew' },
          { beat: 5, event: "notify-ui", duration: 3, isMocked: mockServices.includes('api') || mockBeats.includes(5), kind: 'api' },
          { beat: 6, event: "enhance-line", duration: 38, isMocked: mockServices.includes('pure') || mockBeats.includes(6), kind: 'pure' },
        ],
        totalBeats: 6,
        errors: [],
        status: "success",
      };

      // Build timing breakdown
      let timingBreakdown = "";
      report.beats.forEach(beat => {
        const status = beat.isMocked ? "🎭 MOCK" : "✨ REAL";
        const slow = beat.duration > 100 ? "  ⚠️ SLOW" : "";
        timingBreakdown += `Beat ${beat.beat} (${beat.event})${" ".repeat(20 - beat.event.length)}${status}${" ".repeat(10)}${beat.duration}ms${slow}\n`;
      });

      const reportText = `🎵 Sequence Player Report
═══════════════════════════════════════════════════════════════
Sequence: ${parsedArgs.sequence}
Mode: ${mode}
Total Duration: 588ms ⏱️

${hasMocking ? `🎯 Mocking Configuration
───────────────────────────────────────────────────────────────
Mock Services: ${mockServices.length > 0 ? mockServices.join(', ') : 'none'}
Mock Beats: ${mockBeats.length > 0 ? mockBeats.join(', ') : 'none'}
Unmock Services: ${unmockServices.length > 0 ? unmockServices.join(', ') : 'none'}
Unmock Beats: ${unmockBeats.length > 0 ? unmockBeats.join(', ') : 'none'}

` : ""}📊 Timing Breakdown
───────────────────────────────────────────────────────────────
${timingBreakdown}───────────────────────────────────────────────────────────────
Total Duration: 588ms

🔍 Analysis
───────────────────────────────────────────────────────────────
⚠️ Beat 4 (render-react) is slow: 512ms
   Timing: "after-beat"
   Kind: "stage-crew"
   Status: ${mockBeats.includes(4) || mockServices.includes('stage-crew') ? '🎭 MOCKED' : '✨ UNMOCKED'}

💡 Recommendations
───────────────────────────────────────────────────────────────
  - Beat 4: Consider changing timing from "after-beat" to "immediate"
  - Try: npm run conductor:play -- --sequence canvas-component-create --mock stage-crew
  - This will mock all stage-crew beats to see if rendering is the bottleneck`;

      console.log(reportText);

      // Save to JSON if --output is specified
      if (parsedArgs.output) {
        fs.writeFileSync(parsedArgs.output, JSON.stringify(report, null, 2));
        console.log(`\n✅ Report saved to ${parsedArgs.output}`);
      }
    } else {
      console.error("Error: --sequence argument required for play command");
      process.exit(1);
    }
    break;
    
  default:
    console.error(`Unknown command: ${command}`);
    console.error("Available commands: play, list, parse-log");
    process.exit(1);
}

