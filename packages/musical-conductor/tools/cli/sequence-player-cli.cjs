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
    // Query conductor for available sequences
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
          break;
        } catch (err) {
          socket = null;
        }
      }

      if (!socket) {
        console.error('❌ Could not connect to conductor on any port');
        process.exit(1);
      }

      const commandId = `list-${Date.now()}`;
      socket.send(JSON.stringify({
        type: 'list-sequences',
        id: commandId
      }));

      let responseReceived = false;
      const timeout = setTimeout(() => {
        if (!responseReceived) {
          console.error('❌ Timeout waiting for sequence list (5s)');
          process.exit(1);
        }
      }, 5000);

      socket.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());

          if (msg.type === 'sequences-list' && msg.id === commandId) {
            responseReceived = true;
            clearTimeout(timeout);

            console.log("🎵 Available Sequences");
            console.log("═══════════════════════════════════════════════════════════════");
            console.log("ID                              Name                    Beats");
            console.log("───────────────────────────────────────────────────────────────");

            if (msg.sequences && msg.sequences.length > 0) {
              msg.sequences.forEach(seq => {
                const id = seq.id.padEnd(30);
                const name = (seq.name || seq.id).padEnd(23);
                const beats = seq.beats || 0;
                console.log(`${id} ${name} ${beats}`);
              });
            } else {
              console.log("No sequences available");
            }

            socket.close();
            process.exit(0);
          }
        } catch (e) {
          // Ignore parse errors
        }
      });
    })();
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

      const commandId = `cli-${Date.now()}`;
      const handshakeId = `eval-${Date.now()}`;
      let responseReceived = false;
      let playSent = false;
      let sequenceTimeout = null;
      let startTime = 0;

      const hostReadyTimeout = setTimeout(() => {
        if (!playSent) {
          console.error('❌ No active browser host detected for conductor.');
          console.error('   Make sure the app is open in a browser and fully loaded, then retry.');
          process.exit(1);
        }
      }, 5000);

      function sendPlay() {
        if (playSent) return;
        playSent = true;
        startTime = Date.now();
        clearTimeout(hostReadyTimeout);
        socket.send(JSON.stringify({
          type: 'play',
          pluginId,
          sequenceId: parsedArgs.sequence,
          context,
          id: commandId
        }));

        sequenceTimeout = setTimeout(() => {
          if (!responseReceived) {
            console.error('❌ Timeout waiting for sequence response (30s)');
            process.exit(1);
          }
        }, 30000);
      }

      socket.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());

          // Handshake: ensure browser host + conductor are ready before sending play
          if (msg.type === 'eval-result' && msg.id === handshakeId) {
            if (!msg.success || !msg.result) {
              clearTimeout(hostReadyTimeout);
              console.error('❌ Browser host is connected but RenderX.conductor is not ready.');
              console.error('   Wait for the app to finish initializing and try again.');
              process.exit(1);
            }
            console.log('✓ Browser host and conductor are ready');
            sendPlay();
            return;
          }

          // Check if this is the response to our play command
          if (msg.type === 'play-result' && msg.id === commandId) {
            responseReceived = true;
            if (sequenceTimeout) {
              clearTimeout(sequenceTimeout);
            }

            const duration = startTime ? (Date.now() - startTime) : 0;
            console.log(`\n✅ Sequence completed in ${duration}ms`);
            console.log('Result:', JSON.stringify(msg.result, null, 2));

            if (msg.success) {
              console.log('Status: SUCCESS');
              process.exit(0);
            } else {
              console.error('Status: FAILED');
              console.error('Error:', msg.error);
              process.exit(1);
            }
          } else if (msg.type === 'ack' && msg.id === commandId) {
            console.log('✓ Command acknowledged by server');
          } else {
            console.log('WS RECV>', msg);
          }
        } catch (e) {
          console.log('WS RAW>', data.toString());
        }
      });

      // Kick off a small eval to verify the browser host is initialized
      socket.send(JSON.stringify({
        type: 'eval',
        id: handshakeId,
        code: "typeof window !== 'undefined' && !!(window.RenderX && window.RenderX.conductor && window.RenderX.conductor.play)",
      }));
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
              const topic = (event.data && (event.data.topic || event.data.eventName)) || '';
              const prefix = `[${ts}] [${source}] ${level}`;
              if (topic) {
                console.log(`${prefix} [${topic}] ${message}`);
              } else {
                console.log(`${prefix} ${message}`);
              }
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

