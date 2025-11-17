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

// CLI utilities
const cliUtils = require('./cli-utils.cjs');
const parseArgs = cliUtils.parseArgs;
const parseContextString = cliUtils.parseContextString;

// Parse args uses CLI utils

const parsedArgs = parseArgs(args);

// Simple log parser removed from the wrapper; not needed for this CLI flow

// Handle commands
switch (command) {
  case "parse-log":
    console.error("Error: parse-log command has been removed. Use the log analysis tools instead.");
    process.exit(1);
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
    // Lightweight play implementation so we can trigger sequences from CLI
    if (!parsedArgs.sequence) {
      console.error("Error: --sequence required for play");
      process.exit(1);
    }

    (async function () {
      const WebSocket = require('ws');
      const ports = [5173, 5174, 5175, 5176, 5177];
      let socket = null;

      for (const port of ports) {
        try {
          socket = new WebSocket(`ws://localhost:${port}/conductor-ws`);
          await new Promise((resolve, reject) => {
            socket.once('open', resolve);
            socket.once('error', reject);
            setTimeout(() => reject(new Error('timeout')), 2000);
          });
          console.log('✅ Connected to conductor on port', port);
          break;
        } catch (err) {
          socket = null;
        }
      }

      if (!socket) {
        console.error('❌ Could not connect to conductor on any port (5173/5174/5175)');
        process.exit(1);
      }

      const pluginId = parsedArgs.plugin || 'LibraryComponentPlugin';

      // Accept --context (JSON or JS-like object) or --context-file <file>

      let context = {};
      if (parsedArgs['context-base64']) {
        const raw = Buffer.from(parsedArgs['context-base64'], 'base64').toString('utf-8');
        try { context = JSON.parse(raw); } catch (err) { console.error('Failed to parse --context-base64:', err.message); process.exit(1); }
      }

      if (parsedArgs['context-file']) {
        try {
          context = cliUtils.parseContextFile(parsedArgs['context-file']);
        } catch (err) {
          console.error('Failed to load context file:', err.message);
          process.exit(1);
        }
      } else if (parsedArgs.context) {
        try {
          context = parseContextString(parsedArgs.context);
        } catch (err) {
          console.error('Failed to parse context:', err.message);
          process.exit(1);
        }
      }

      socket.send(JSON.stringify({
        type: 'play',
        pluginId,
        sequenceId: parsedArgs.sequence,
        context,
        id: `cli-${Date.now()}`
      }));

      socket.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          console.log('WS RECV>', msg);
        } catch (e) {
          console.log('WS RAW>', data.toString());
        }
      });
    })();
    break;

  case "observe":
    (async function () {
      const WebSocket = require('ws');
      const ports = [5173, 5174, 5175, 5176, 5177];
      let socket = null;

      for (const port of ports) {
        try {
          socket = new WebSocket(`ws://localhost:${port}/conductor-ws`);
          await new Promise((resolve, reject) => {
            socket.once('open', resolve);
            socket.once('error', reject);
            setTimeout(() => reject(new Error('timeout')), 2000);
          });
          console.log('✅ Connected to diagnostics stream on port', port);
          break;
        } catch (err) {
          socket = null;
        }
      }

      if (!socket) {
        console.error('❌ Could not connect to conductor on any port (5173/5174/5175)');
        process.exit(1);
      }

      // Allow a convenience alias '-all' or '--all' to explicitly show all diagnostics
      // (some users historically passed single-dash flags). If present, treat as no filters
      // and enable verbose output so `event.data` is printed.
      if (args.includes('-all') || args.includes('--all')) {
        parsedArgs.verbose = true;
        parsedArgs.topic = undefined;
        parsedArgs.source = undefined;
        parsedArgs.level = undefined;
      }

      const filters = {};
      if (parsedArgs.topic && parsedArgs.topic !== true) filters.topic = parsedArgs.topic;
      if (parsedArgs.level && parsedArgs.level !== true) filters.level = parsedArgs.level;
      if (parsedArgs.source && parsedArgs.source !== true) filters.source = parsedArgs.source;

      const subscriptionId = `diag-${Date.now()}`;

      socket.send(JSON.stringify({
        type: 'diagnostics:subscribe',
        filters,
        id: subscriptionId
      }));

      console.log('🔍 Subscribed to diagnostics stream (Ctrl+C to exit)...');

      socket.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'diagnostics:subscribed') {
            console.log('✅ Diagnostics subscription established', msg.id || '');
            return;
          }
          if (msg.type === 'diagnostics:event') {
            const event = msg.event || {};
            if (parsedArgs.json) {
              console.log(JSON.stringify(event));
            } else {
              const ts = event.timestamp || new Date().toISOString();
              const level = (event.level || '').toUpperCase();
              const source = event.source || 'Unknown';
              const message = event.message || '';
              const prefix = `[${ts}] [${source}] ${level}`;
              console.log(`${prefix} ${message}`);
            }
            if (parsedArgs.verbose && event.data) {
              try {
                console.log('  data:', JSON.stringify(event.data, null, 2));
              } catch {
                console.log('  data:', event.data);
              }
            }
            return;
          }

          console.log('WS RECV>', msg);
        } catch (e) {
          console.log('WS RAW>', data.toString());
        }
      });

      socket.on('close', () => {
        console.log('❌ Diagnostics WebSocket connection closed');
        process.exit(0);
      });

      socket.on('error', (err) => {
        console.error('❌ Diagnostics WebSocket error', err && err.message ? err.message : err);
      });
    })();
    break;


  default:
    console.error(`Unknown command: ${command}`);
    console.error("Available commands: play, list, observe");
    process.exit(1);
}

