// Vite config: ensure dev prebundle for header + host-sdk; bundle host-sdk in prod so preview works
import path from 'node:path';
import fs from 'node:fs';
import react from '@vitejs/plugin-react';
import { WebSocketServer } from 'ws';

// Plugin to detect stale code from rebuilt packages and force HMR invalidation
function staleCodeDetectionPlugin() {
  let server;
  const packageDistTimestamps = new Map();
  const PACKAGES = [
    'packages/components',
    'packages/musical-conductor',
    'packages/host-sdk',
    'packages/manifest-tools',
    'domains/renderx-web/ui-plugins/canvas',
    'domains/renderx-web/runtime/canvas-component',
    'domains/renderx-web/ui-plugins/control-panel',
    'domains/renderx-web/ui-plugins/header',
    'domains/renderx-web/ui-plugins/library',
    'domains/renderx-web/runtime/library-component',
  ];

  // Initialize timestamps on startup
  function initializeTimestamps() {
    PACKAGES.forEach(pkg => {
      const distPath = path.resolve(process.cwd(), pkg, 'dist');
      if (fs.existsSync(distPath)) {
        const stat = fs.statSync(distPath);
        packageDistTimestamps.set(pkg, stat.mtimeMs);
      }
    });
  }

  // Check if any package dist has been updated
  function checkForStaleCode() {
    let hasUpdates = false;
    const updatedPackages = [];

    PACKAGES.forEach(pkg => {
      const distPath = path.resolve(process.cwd(), pkg, 'dist');
      if (fs.existsSync(distPath)) {
        const stat = fs.statSync(distPath);
        const lastKnownTime = packageDistTimestamps.get(pkg);

        if (lastKnownTime && stat.mtimeMs > lastKnownTime) {
          hasUpdates = true;
          updatedPackages.push(pkg);
          packageDistTimestamps.set(pkg, stat.mtimeMs);
        }
      }
    });

    return { hasUpdates, updatedPackages };
  }

  return {
    name: 'stale-code-detection',
    apply: 'serve',
    configResolved() {
      initializeTimestamps();
    },
    configureServer(srv) {
      server = srv;

      // Check for stale code every 500ms
      const checkInterval = setInterval(() => {
        const { hasUpdates, updatedPackages } = checkForStaleCode();

        if (hasUpdates) {
          console.log(`\n🔄 Detected rebuilt packages: ${updatedPackages.join(', ')}`);
          console.log('🧹 Clearing Vite cache and forcing full reload...\n');

          // Clear Vite's module cache
          server.moduleGraph.clear();

          // Force full page reload via HMR
          server.ws.send({
            type: 'full',
            event: 'full-reload',
            payload: { path: '*' }
          });
        }
      }, 500);

      // Clean up interval on server close
      server.httpServer?.on('close', () => clearInterval(checkInterval));
    },
  };
}

export default {
  server: {
    port: 5173,
    // Ensure source maps are served correctly in dev mode
    sourcemap: true,
    // Disable caching to ensure fresh source maps on every request
    middlewareMode: false,
    // Force module invalidation on file changes
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    },
  },
  plugins: [
    staleCodeDetectionPlugin(),
    react({
      // Ensure consistent JSX runtime between dev and production
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      // Enable fast refresh for better dev experience
      fastRefresh: true
    }),
    // WebSocket server for CLI communication
    {
      name: 'conductor-websocket',
      configureServer(server) {
        const wss = new WebSocketServer({ noServer: true });
        const diagnosticClients = new Set();

        // Forward diagnostics events from browser HMR channel to any subscribed CLI clients
        server.ws.on('diagnostics:event', (event) => {
          try {
            diagnosticClients.forEach((client) => {
              try {
                const filters = (client).__diagnosticsFilters || {};
                const level = (event && event.level) || undefined;
                const source = (event && event.source) || undefined;
                const data = (event && event.data) || {};
                const topic = (data && (data.topic || data.eventName)) || '';

                if (filters.level && level && filters.level !== level) {
                  return;
                }
                if (filters.source && source && filters.source !== source) {
                  return;
                }
                if (filters.topic && typeof topic === 'string' && !topic.includes(filters.topic)) {
                  return;
                }

                client.send(
                  JSON.stringify({
                    type: 'diagnostics:event',
                    event,
                  }),
                );
              } catch (err) {
                console.error('❌ Failed to send diagnostics event to CLI client', err);
              }
            });
          } catch (err) {
            console.error('❌ Diagnostics forwarding error', err);
          }
        });

        server.httpServer?.on('upgrade', (request, socket, head) => {
          if (request.url === '/conductor-ws') {
            wss.handleUpgrade(request, socket, head, (ws) => {
              wss.emit('connection', ws, request);
            });
          }
        });

        wss.on('connection', (ws) => {
          console.log('🎼 CLI connected to conductor WebSocket');

          // Listen for responses from browser to forward back to CLI
          const responseHandler = (data) => {
            console.log('📨 Received response from browser:', data);
            ws.send(JSON.stringify(data));
          };

          // Register handler for browser responses
          server.ws.on('conductor:cli-response', responseHandler);

          ws.on('message', (data) => {
            try {
              const message = JSON.parse(data.toString());
              console.log('📨 Received from CLI:', message);

              if (message.type === 'diagnostics:subscribe') {
                (ws).__diagnosticsFilters = message.filters || {};
                diagnosticClients.add(ws);
                ws.send(
                  JSON.stringify({
                    type: 'diagnostics:subscribed',
                    id: message.id,
                  }),
                );
                return;
              }

              // Broadcast to all browser clients
              server.ws.send('conductor:cli-command', message);

              // Send acknowledgment back to CLI (for non-eval commands)
              if (message.type !== 'eval') {
                ws.send(JSON.stringify({ type: 'ack', id: message.id }));
              }
            } catch (error) {
              console.error('❌ WebSocket message error:', error);
              ws.send(JSON.stringify({ type: 'error', error: error.message }));
            }
          });

          ws.on('close', () => {
            console.log('🎼 CLI disconnected from conductor WebSocket');
            diagnosticClients.delete(ws);
            // Clean up response handler
            server.ws.off('conductor:cli-response', responseHandler);
          });
        });
      },
    },
    {
      name: 'fix-sdk-plugin-manifest-raw',
      enforce: 'pre',
      resolveId(id, _importer) {
        // The SDK imports the plugin manifest via a relative path from node_modules:
        //   ../../../public/plugins/plugin-manifest.json?raw
        // In production build, Rollup may fail to resolve this from node_modules. Redirect it to the app's public path.
        if (id.endsWith('public/plugins/plugin-manifest.json?raw')) {
          return path.resolve(process.cwd(), 'public/plugins/plugin-manifest.json?raw');
        }
        // The SDK resolves feature flags via a relative path from within node_modules
        if (id.endsWith('data/feature-flags.json')) {
          return path.resolve(process.cwd(), 'data/feature-flags.json');
        }
        return null;
      },
    },
  ],
  define: {
    // Inject environment variables for secure configuration
    '__CONFIG_OPENAI_API_KEY__': JSON.stringify(process.env.OPENAI_API_KEY || ''),
    '__CONFIG_OPENAI_MODEL__': JSON.stringify(process.env.OPENAI_MODEL || 'gpt-3.5-turbo'),
  },
  resolve: {
    alias: {
      // Host SDK alias (legacy import name)
      "@renderx/host-sdk": "@renderx-plugins/host-sdk",
      // Resolve musical-conductor from workspace to fix import resolution in host-sdk dist files
      "musical-conductor": path.resolve(process.cwd(), "packages/musical-conductor/dist/src/index.js"),
      // SDK deep import shims → map to host-provided vendor helpers
      "../../vendor/vendor-symphony-loader": path.resolve(process.cwd(), "src/vendor/vendor-symphony-loader.ts"),
      "../../../data/feature-flags.json": path.resolve(process.cwd(), "data/feature-flags.json"),
      // Silence Node core module warnings in browser build by aliasing to empty stubs
      // Order matters: more specific paths must come first
      "fs/promises": path.resolve(process.cwd(), "src/shims/empty-promises.js"),
      "node:fs/promises": path.resolve(process.cwd(), "src/shims/empty-promises.js"),
      "fs": path.resolve(process.cwd(), "src/shims/empty.js"),
      "node:fs": path.resolve(process.cwd(), "src/shims/empty.js"),
      "path": path.resolve(process.cwd(), "src/shims/empty.js"),
      "node:path": path.resolve(process.cwd(), "src/shims/empty.js"),
    },
    // Ensure a single React instance across host and plugins
    dedupe: ["react", "react-dom", "@renderx-plugins/host-sdk"],
  },
  optimizeDeps: {
    // Allow Vite to discover and pre-bundle dependencies that need CommonJS-to-ESM transformation
    include: [
      // Pre-bundle React plugins that might have CommonJS dependencies
      "@renderx-web/header",
      "@renderx-web/library",
      "@renderx-web/library-component",
      "@renderx-web/control-panel",
      "@renderx-web/canvas-component",
      // Include any other dependencies that might need transformation
      "musical-conductor"
    ],
    exclude: [
      // Only exclude host-sdk and its subpaths to avoid dynamic import resolution issues
      "@renderx-plugins/host-sdk",
      "@renderx-plugins/host-sdk/core/conductor/conductor",
      "@renderx-plugins/host-sdk/core/conductor/sequence-registration",
      "@renderx-plugins/host-sdk/core/conductor/runtime-loaders",
      "@renderx-plugins/host-sdk/core/manifests/interactionManifest",
      "@renderx-plugins/host-sdk/core/manifests/topicsManifest",
      "@renderx-plugins/host-sdk/core/startup/startupValidation",
      "@renderx-plugins/host-sdk/core/events/EventRouter",
      "@renderx-plugins/host-sdk/core/environment/feature-flags",
      "@renderx-web/canvas-component",
      "gif.js.optimized"
    ],
    // Enable discovery but be selective about what gets optimized
    noDiscovery: false,
    esbuildOptions: {
      // Ensure proper CommonJS-to-ESM transformation
      format: 'esm',
      target: 'es2022', // Updated to support top-level await
      plugins: [
        {
          name: 'dep-scan-externalize-host-sdk',
          setup(build) {
            build.onResolve({ filter: /^@renderx-plugins\/host-sdk(\/.+)?$/ }, _args => ({ external: true }));
            return undefined;
          },
        },
      ],
    },
    // Force dependency re-bundling in CI to avoid stale optimization issues
    force: process.env.CI === "true",
  },
  build: {
    // Enable source maps in production for debugging
    sourcemap: true,
    rollupOptions: {
      // Include a stable-named vendor entry that bundles the workspace Control Panel for preview/E2E
      input: {
        main: "index.html",
        "vendor-control-panel": "src/vendor/vendor-control-panel.ts",
        // Ensure the test harness page is built and available in preview at /test-plugin-loading.html
        "test-plugin-loading": "src/test-plugin-loading.html",
      },
      output: {
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === "vendor-control-panel"
            ? "assets/vendor-control-panel.js"
            : "assets/[name]-[hash].js",
      },
      // Do NOT externalize host-sdk for this app; we need it bundled for preview/E2E
      // external: ['@renderx-plugins/host-sdk']
    },
  },
};
