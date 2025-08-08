/**
 * MusicalConductor E2E Test Application (Cached Version)
 *
 * This application demonstrates and tests MusicalConductor functionality
 * with aggressive module caching for optimal E2E test performance
 */

// Import module cache system
import "./module-cache.js";

// Performance tracking
window.performanceMetrics = {
  startTime: performance.now(),
  moduleLoadStart: null,
  moduleLoadEnd: null,
  httpRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
};

// Global state
let conductor = null;
let eventBus = null;
let communicationSystem = null;
let eventCount = 0;
let sequenceCount = 0;
let pluginCount = 0;
let errorCount = 0;

// DOM elements
const statusEl = document.getElementById("status");
const logContainer = document.getElementById("log-container");
const eventCountEl = document.getElementById("event-count");
const sequenceCountEl = document.getElementById("sequence-count");
const pluginCountEl = document.getElementById("plugin-count");
const errorCountEl = document.getElementById("error-count");

// Performance metric elements
const moduleLoadTimeEl = document.getElementById("module-load-time");
const httpRequestsEl = document.getElementById("http-requests");
const totalLoadTimeEl = document.getElementById("total-load-time");
const cacheHitRatioEl = document.getElementById("cache-hit-ratio");

// Logging utility
function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const logEntry = document.createElement("div");
  logEntry.className = `log-entry ${type}`;
  logEntry.textContent = `[${timestamp}] ${message}`;
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;

  // Also log to browser console with emoji prefixes
  const emoji =
    type === "error"
      ? "❌"
      : type === "warn"
      ? "⚠️"
      : type === "info"
      ? "ℹ️"
      : "📝";
  console.log(`${emoji} [E2E-TEST-CACHED] ${message}`);

  if (type === "error") {
    errorCount++;
    updateMetrics();
  }
}

// Update metrics display
function updateMetrics() {
  eventCountEl.textContent = eventCount;
  sequenceCountEl.textContent = sequenceCount;
  pluginCountEl.textContent = pluginCount;
  errorCountEl.textContent = errorCount;

  // Update performance metrics
  const cacheStats = window.MusicalConductorCache.getStats();
  httpRequestsEl.textContent = cacheStats.httpRequests;
  cacheHitRatioEl.textContent = `${cacheStats.cacheHitRatio.toFixed(1)}%`;

  if (window.performanceMetrics.moduleLoadEnd) {
    const moduleLoadTime =
      window.performanceMetrics.moduleLoadEnd -
      window.performanceMetrics.moduleLoadStart;
    moduleLoadTimeEl.textContent = `${moduleLoadTime.toFixed(2)}ms`;
  }

  const totalLoadTime = performance.now() - window.performanceMetrics.startTime;
  totalLoadTimeEl.textContent = `${totalLoadTime.toFixed(2)}ms`;
}

// Status update utility
function updateStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  log(message, type);
}

// Initialize MusicalConductor using cached modules
async function initializeConductor() {
  try {
    updateStatus("Checking for cached MusicalConductor instance...", "info");

    // Check for cached conductor first
    const cachedConductor =
      window.MusicalConductorCache.getCachedConductor("main");
    if (cachedConductor) {
      log("🚀 Using cached MusicalConductor instance!");
      conductor = cachedConductor.conductor;
      eventBus = cachedConductor.eventBus;
      communicationSystem = cachedConductor.communicationSystem;

      // Update metrics
      pluginCount = cachedConductor.sequences.length;
      updateMetrics();

      // Set up event listeners
      setupEventListeners();

      updateStatus("MusicalConductor loaded from cache instantly!", "success");

      // Enable test buttons
      document
        .querySelectorAll("button:not(#init-conductor)")
        .forEach((btn) => {
          btn.disabled = false;
        });

      // Print cache performance
      window.MusicalConductorCache.printPerformanceReport();

      return true;
    }

    updateStatus("Loading MusicalConductor with module caching...", "info");
    window.performanceMetrics.moduleLoadStart = performance.now();

    // Use cached import for better performance
    const {
      initializeCommunicationSystem,
      MusicalConductor,
      EventBus,
      SPAValidator,
    } = await window.MusicalConductorCache.cachedImport(
      "./dist/modules/communication/index.js"
    );

    window.performanceMetrics.moduleLoadEnd = performance.now();

    const moduleLoadTime =
      window.performanceMetrics.moduleLoadEnd -
      window.performanceMetrics.moduleLoadStart;
    log(`✅ MusicalConductor modules loaded in ${moduleLoadTime.toFixed(2)}ms`);

    // Initialize the communication system
    communicationSystem = initializeCommunicationSystem();
    conductor = communicationSystem.conductor;
    eventBus = communicationSystem.eventBus;

    log(`🎼 Communication system initialized`);
    log(
      `📊 Registered sequences: ${communicationSystem.sequenceResults.registeredSequences}`
    );

    // Register CIA plugins for E2E testing
    log(`🔌 Registering CIA plugins...`);
    try {
      await conductor.registerCIAPlugins();
      log(`✅ CIA plugins registered successfully`);

      // Get updated sequence count after plugin registration
      const sequences = conductor.getRegisteredSequences();
      log(`📊 Total sequences after plugin registration: ${sequences.length}`);

      // Update plugin count
      pluginCount = sequences.length;
      updateMetrics();
    } catch (pluginError) {
      log(`⚠️ Plugin registration failed: ${pluginError.message}`, "warn");
      log(`ℹ️ Continuing with core sequences only`, "info");
    }

    // Cache the conductor for future use
    window.MusicalConductorCache.cacheConductor(
      "main",
      conductor,
      eventBus,
      communicationSystem
    );

    // Set up event listeners for testing
    setupEventListeners();

    updateStatus(
      "MusicalConductor initialized successfully with caching!",
      "success"
    );

    // Enable test buttons
    document.querySelectorAll("button:not(#init-conductor)").forEach((btn) => {
      btn.disabled = false;
    });

    // Final performance update
    updateMetrics();

    // Log performance summary
    const totalTime = performance.now() - window.performanceMetrics.startTime;
    log(`🚀 Total initialization time: ${totalTime.toFixed(2)}ms`);

    // Print cache performance
    window.MusicalConductorCache.printPerformanceReport();

    return true;
  } catch (error) {
    log(`❌ Failed to initialize MusicalConductor: ${error.message}`, "error");
    updateStatus("Failed to initialize MusicalConductor", "error");
    console.error("Initialization error:", error);
    return false;
  }
}

// Set up event listeners for testing
function setupEventListeners() {
  if (!eventBus) return;

  // Listen to all MusicalConductor events
  const eventTypes = [
    "musical-conductor:beat:started",
    "musical-conductor:beat:completed",
    "musical-conductor:beat:error",
    "musical-conductor:sequence:started",
    "musical-conductor:sequence:completed",
    "musical-conductor:sequence:error",
  ];

  eventTypes.forEach((eventType) => {
    eventBus.subscribe(eventType, (data) => {
      log(`🎵 Event: ${eventType}`, "info");
      eventCount++;
      updateMetrics();
    });
  });

  log("📡 Event listeners set up for MusicalConductor events");
}

// Test EventBus functionality
function testEventBus() {
  if (!eventBus) {
    log("❌ EventBus not initialized", "error");
    return;
  }

  log("🧪 Testing EventBus functionality...");

  // Test basic pub/sub
  const testEvent = "e2e-test-event";
  let receivedData = null;

  const unsubscribe = eventBus.subscribe(testEvent, (data) => {
    receivedData = data;
    log(`📨 Received test event with data: ${JSON.stringify(data)}`);
    eventCount++;
    updateMetrics();
  });

  // Emit test event
  const testData = { message: "Hello from E2E test!", timestamp: Date.now() };
  eventBus.emit(testEvent, testData);

  // Verify data was received
  setTimeout(() => {
    if (receivedData && receivedData.message === testData.message) {
      log("✅ EventBus test passed - data received correctly");
    } else {
      log("❌ EventBus test failed - data not received", "error");
    }
    unsubscribe();
  }, 100);
}

// Test sequence execution
function testSequences() {
  if (!conductor) {
    log("❌ Conductor not initialized", "error");
    return;
  }

  log("🧪 Testing sequence execution...");

  try {
    // Get available sequences
    const sequences = conductor.getRegisteredSequences();
    log(`📋 Available sequences: ${sequences.length}`);

    if (sequences.length > 0) {
      const firstSequence = sequences[0];
      log(`🎵 Testing sequence: ${firstSequence}`);

      // Start the sequence
      const requestId = conductor.startSequence(firstSequence, {
        testData: "E2E test execution",
        timestamp: Date.now(),
      });

      log(`🚀 Started sequence with request ID: ${requestId}`);
      sequenceCount++;
      updateMetrics();
    } else {
      log("⚠️ No sequences available for testing", "warn");
    }
  } catch (error) {
    log(`❌ Sequence test failed: ${error.message}`, "error");
  }
}

// Test plugin system
async function testPlugins() {
  if (!conductor) {
    log("❌ Conductor not initialized", "error");
    return;
  }

  log("🧪 Testing plugin system...");

  try {
    // Test CIA plugins that were auto-registered
    const sequences = conductor.getRegisteredSequences();
    log(`📋 Available sequences: ${sequences.length}`);

    // Test E2E Sample Plugin
    if (sequences.includes("E2E Sample Testing Symphony No. 1")) {
      log("🧪 Testing E2E Sample Plugin...");
      const sampleResult = conductor.startSequence(
        "E2E Sample Testing Symphony No. 1",
        {
          testData: "E2E Sample Plugin test execution",
          timestamp: Date.now(),
        }
      );
      log(`🚀 E2E Sample Plugin started with ID: ${sampleResult}`);
      sequenceCount++;
    }

    updateMetrics();
    log(`✅ Plugin system testing completed`);
  } catch (error) {
    log(`❌ Plugin test failed: ${error.message}`, "error");
  }
}

// Test SPA validation
function testSPAValidation() {
  if (!eventBus) {
    log("❌ EventBus not initialized", "error");
    return;
  }

  log("🧪 Testing SPA validation...");

  try {
    // This should trigger SPA validation warnings
    log(
      "⚠️ Attempting direct eventBus.emit() call (should be caught by SPA validator)"
    );

    // Direct emit call - this should be caught by SPA validator
    eventBus.emit("direct-emit-test", {
      message: "This is a direct emit call for testing SPA validation",
      timestamp: Date.now(),
    });

    eventCount++;
    updateMetrics();

    log("📝 Check browser console for SPA validation warnings");
  } catch (error) {
    log(`❌ SPA validation test failed: ${error.message}`, "error");
  }
}

// Clear logs and reset cache stats
function clearLogs() {
  logContainer.innerHTML = '<div class="log-entry info">Logs cleared</div>';
  eventCount = 0;
  sequenceCount = 0;
  errorCount = 0;
  updateMetrics();
  log("🧹 Logs cleared");

  // Print current cache performance
  window.MusicalConductorCache.printPerformanceReport();
}

// Show cache statistics
function showCacheStats() {
  const stats = window.MusicalConductorCache.getStats();

  log("📊 Current Cache Statistics:");
  log(`   Cache Hits: ${stats.cacheHits}`);
  log(`   Cache Misses: ${stats.cacheMisses}`);
  log(`   Hit Ratio: ${stats.cacheHitRatio.toFixed(1)}%`);
  log(`   Modules Cached: ${stats.modulesCached}`);
  log(`   Conductors Cached: ${stats.conductorsCached}`);
  log(`   HTTP Requests: ${stats.httpRequests}`);
  log(`   Total Load Time: ${stats.totalLoadTime.toFixed(2)}ms`);

  window.MusicalConductorCache.printPerformanceReport();
}

// Event listeners for buttons
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("init-conductor")
    .addEventListener("click", initializeConductor);
  document
    .getElementById("test-eventbus")
    .addEventListener("click", testEventBus);
  document
    .getElementById("test-sequences")
    .addEventListener("click", testSequences);
  document
    .getElementById("test-plugins")
    .addEventListener("click", testPlugins);
  document
    .getElementById("test-spa-validation")
    .addEventListener("click", testSPAValidation);
  document.getElementById("clear-logs").addEventListener("click", clearLogs);

  // Add cache stats button if it exists
  const cacheStatsBtn = document.getElementById("show-cache-stats");
  if (cacheStatsBtn) {
    cacheStatsBtn.addEventListener("click", showCacheStats);
  }

  // Disable test buttons initially
  document.querySelectorAll("button:not(#init-conductor)").forEach((btn) => {
    btn.disabled = true;
  });

  log("🚀 E2E Test Application loaded and ready (cached version)");
  log("📦 Module cache system active");
  updateMetrics();
});

// Global error handler
window.addEventListener("error", (event) => {
  log(`💥 Global error: ${event.error.message}`, "error");
  console.error("Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  log(`💥 Unhandled promise rejection: ${event.reason}`, "error");
  console.error("Unhandled rejection:", event.reason);
});

// Export for testing
window.E2ETestApp = {
  initializeConductor,
  testEventBus,
  testSequences,
  testPlugins,
  testSPAValidation,
  clearLogs,
  showCacheStats,
  getConductor: () => conductor,
  getEventBus: () => eventBus,
  getMetrics: () => ({
    eventCount,
    sequenceCount,
    pluginCount,
    errorCount,
  }),
  getPerformanceMetrics: () => window.performanceMetrics,
  getCacheStats: () => window.MusicalConductorCache.getStats(),
};
