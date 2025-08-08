"use strict";
(this["webpackChunkmusical_conductor_e2e_tests"] = this["webpackChunkmusical_conductor_e2e_tests"] || []).push([["musical-conductor-core"],{

/***/ "./test-app/dist/modules/communication/EventBus.js":
/*!*********************************************************!*\
  !*** ./test-app/dist/modules/communication/EventBus.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventBus: () => (/* binding */ EventBus),
/* harmony export */   eventBus: () => (/* binding */ eventBus)
/* harmony export */ });
/* unused harmony export ConductorEventBus */
/* harmony import */ var _event_types_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./event-types/index.js */ "./test-app/dist/modules/communication/event-types/index.js");
/**
 * EventBus - Component Communication System (TypeScript)
 *
 * Provides a robust pub/sub system for isolated component communication
 * following the RenderX component-driven architecture principles.
 *
 * Features:
 * - Event subscription and emission
 * - Automatic unsubscribe functions
 * - Error handling to prevent callback failures from breaking the system
 * - Event debugging and logging capabilities
 * - TypeScript support with proper typing
 */
/**
 * Base EventBus Class
 */
class EventBus {
  constructor() {
    this.events = {};
    this.debugMode = true; // Set to true for development debugging
    this.subscriptionCounter = 0;
    this.eventCounts = {};
  }
  /**
   * Subscribe to an event
   * @param eventName - Name of the event to subscribe to
   * @param callback - Function to call when event is emitted
   * @param context - Optional context including pluginId for deduplication
   * @returns Unsubscribe function
   */
  subscribe(eventName, callback, context) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    // Check for duplicate subscription (same pluginId for same event)
    if (context?.pluginId) {
      const existingSubscription = this.events[eventName].find(sub => sub.pluginId === context.pluginId);
      if (existingSubscription) {
        const pluginInfo = ` from plugin ${context.pluginId}`;
        console.warn(`🚫 EventBus: Duplicate subscription blocked for "${eventName}"${pluginInfo}`);
        // Return the existing unsubscribe function
        return () => {
          this.unsubscribe(eventName, callback);
        };
      }
    }
    // Create subscription object
    const subscription = {
      id: `sub_${this.subscriptionCounter++}`,
      eventName,
      callback,
      subscribedAt: new Date(),
      pluginId: context?.pluginId,
      context
    };
    this.events[eventName].push(subscription);
    if (this.debugMode) {
      const pluginInfo = context?.pluginId ? ` (plugin: ${context.pluginId})` : "";
      console.log(`📡 EventBus: Subscribed to "${eventName}" (${this.events[eventName].length} total subscribers)${pluginInfo}`);
    }
    // Return unsubscribe function
    return () => {
      this.unsubscribe(eventName, callback);
    };
  }
  /**
   * Unsubscribe from an event
   * @param eventName - Name of the event
   * @param callback - Callback function to remove
   */
  unsubscribe(eventName, callback) {
    if (!this.events[eventName]) {
      return;
    }
    const index = this.events[eventName].findIndex(sub => sub.callback === callback);
    if (index > -1) {
      const removedSub = this.events[eventName][index];
      this.events[eventName].splice(index, 1);
      if (this.debugMode) {
        const pluginInfo = removedSub.pluginId ? ` (plugin: ${removedSub.pluginId})` : "";
        console.log(`📡 EventBus: Unsubscribed from "${eventName}" (${this.events[eventName].length} remaining subscribers)${pluginInfo}`);
      }
      // Clean up empty event arrays
      if (this.events[eventName].length === 0) {
        delete this.events[eventName];
      }
    }
  }
  /**
   * Emit an event to all subscribers
   * @param eventName - Name of the event to emit
   * @param data - Data to pass to subscribers
   */
  emit(eventName, data) {
    // Track event counts
    this.eventCounts[eventName] = (this.eventCounts[eventName] || 0) + 1;
    // EventBus emission logging disabled for cleaner output
    // if (this.debugMode) {
    //   console.log(`📡 EventBus: Emitting "${eventName}"`, data);
    // }
    if (!this.events[eventName]) {
      // EventBus "no subscribers" logging disabled for cleaner output
      // if (this.debugMode) {
      //   console.log(`📡 EventBus: No subscribers for "${eventName}"`);
      // }
      return;
    }
    // Create a copy of subscribers to prevent issues if callbacks modify the array
    const subscribers = [...this.events[eventName]];
    subscribers.forEach((subscription, index) => {
      try {
        subscription.callback(data);
      } catch (error) {
        const pluginInfo = subscription.pluginId ? ` (plugin: ${subscription.pluginId})` : "";
        console.error(`📡 EventBus: Error in subscriber ${index} for "${eventName}"${pluginInfo}:`, error);
        // Continue processing other subscribers even if one fails
      }
    });
  }
  /**
   * Remove all subscribers for an event
   * @param eventName - Name of the event to clear
   */
  clearEvent(eventName) {
    if (this.events[eventName]) {
      delete this.events[eventName];
      if (this.debugMode) {
        console.log(`📡 EventBus: Cleared all subscribers for "${eventName}"`);
      }
    }
  }
  /**
   * Remove all subscribers for all events
   */
  clearAll() {
    this.events = {};
    this.eventCounts = {};
    if (this.debugMode) {
      console.log("📡 EventBus: Cleared all subscribers");
    }
  }
  /**
   * Get debug information about the EventBus
   */
  getDebugInfo() {
    const subscriptionCounts = {};
    let totalSubscriptions = 0;
    Object.keys(this.events).forEach(eventName => {
      subscriptionCounts[eventName] = this.events[eventName].length;
      totalSubscriptions += this.events[eventName].length;
    });
    return {
      totalEvents: Object.keys(this.eventCounts).length,
      totalSubscriptions,
      eventCounts: {
        ...this.eventCounts
      },
      subscriptionCounts
    };
  }
  /**
   * Check if an event has subscribers
   * @param eventName - Name of the event to check
   */
  hasSubscribers(eventName) {
    return !!(this.events[eventName] && this.events[eventName].length > 0);
  }
  /**
   * Get subscriber count for an event
   * @param eventName - Name of the event
   */
  getSubscriberCount(eventName) {
    return this.events[eventName]?.length || 0;
  }
  /**
   * Enable or disable debug mode
   * @param enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`📡 EventBus: Debug mode ${enabled ? "enabled" : "disabled"}`);
  }
}
// Import EVENT_TYPES from the dedicated event-types module


/**
 * ConductorEventBus - Enhanced EventBus with Musical Sequencing
 * Extends the base EventBus with priority-based processing, dependency management,
 * and timing control to eliminate race conditions and provide proper event orchestration.
 */
class ConductorEventBus extends EventBus {
  constructor(externalConductor = null) {
    super();
    this.externalConductor = null;
    this.sequences = new Map();
    this.priorities = new Map();
    this.dependencies = new Map();
    this.currentSequences = new Map();
    this.completedEvents = new Set();
    // Performance monitoring
    this.metrics = {
      eventsProcessed: 0,
      sequencesExecuted: 0,
      averageLatency: 0,
      raceConditionsDetected: 0
    };
    // Conductor state
    this.tempo = 120; // Default BPM for timing calculations
    // Use external conductor if provided
    if (externalConductor) {
      console.log("🎼 EventBus: Using external conductor for unified sequence system");
      this.externalConductor = externalConductor;
      // Use external conductor's sequence registry for unified system
      this.sequences = externalConductor.sequences || new Map();
    } else {
      console.log("🎼 EventBus: Using internal conductor (legacy mode)");
      // Legacy mode: separate sequence system
      this.sequences = new Map();
    }
  }
  /**
   * Enhanced emit with conductor control
   * @param eventName - Event to emit
   * @param data - Event data
   * @param options - Conductor options
   */
  emit(eventName, data, options = {}) {
    const startTime = performance.now();
    // Check if this event is part of a sequence
    if (options.sequence) {
      return this.emitInSequence(eventName, data, options);
    }
    // Apply priority-based processing
    const priority = this.priorities.get(eventName) || "mp"; // mezzo-piano default
    const dependencies = this.dependencies.get(eventName) || [];
    // Check dependencies
    if (dependencies.length > 0 && !this.dependenciesMet(dependencies, options.context)) {
      return this.queueForDependencies(eventName, data, options, dependencies);
    }
    // Execute with timing control
    this.executeWithTiming(eventName, data, options, priority);
    // Update metrics
    this.updateMetrics(eventName, startTime);
  }
  /**
   * Execute event with musical timing
   * @param eventName - Event name
   * @param data - Event data
   * @param options - Timing options
   * @param priority - Event priority
   */
  executeWithTiming(eventName, data, options, priority) {
    const timing = options.timing || "immediate";
    switch (timing) {
      case "immediate":
        this.executeEvent(eventName, data, priority);
        break;
      case "after-beat":
        // Wait for previous beat to complete
        setTimeout(() => this.executeEvent(eventName, data, priority), 0);
        break;
      case "next-measure":
        // Wait for next event loop tick (browser-compatible)
        setTimeout(() => this.executeEvent(eventName, data, priority), 0);
        break;
      case "delayed":
        // Intentional delay based on tempo
        const delay = this.calculateDelay(options.beats || 1);
        setTimeout(() => this.executeEvent(eventName, data, priority), delay);
        break;
      case "wait-for-signal":
        // Queue until specific condition is met
        this.queueForSignal(eventName, data, options.signal, priority);
        break;
      default:
        this.executeEvent(eventName, data, priority);
    }
  }
  /**
   * Execute event with base EventBus emit
   * @param eventName - Event name
   * @param data - Event data
   * @param priority - Event priority
   */
  executeEvent(eventName, data, priority) {
    // Call parent emit method
    super.emit(eventName, data);
    this.completedEvents.add(eventName);
  }
  /**
   * Emit event in sequence context
   * @param eventName - Event name
   * @param data - Event data
   * @param options - Sequence options
   */
  emitInSequence(eventName, data, options) {
    // Delegate to external conductor if available
    if (this.externalConductor && this.externalConductor.startSequence) {
      console.log(`🎼 EventBus: Delegating to external conductor for sequence event "${eventName}"`);
      return this.externalConductor.startSequence(options.sequence, data, options.context);
    }
    // Fallback to regular emit
    super.emit(eventName, data);
  }
  /**
   * Check if dependencies are met
   * @param dependencies - Array of dependency event names
   * @param context - Execution context
   */
  dependenciesMet(dependencies, context) {
    return dependencies.every(dep => this.completedEvents.has(dep));
  }
  /**
   * Queue event for dependencies
   * @param eventName - Event name
   * @param data - Event data
   * @param options - Options
   * @param dependencies - Dependencies
   */
  queueForDependencies(eventName, data, options, dependencies) {
    console.log(`🎼 EventBus: Queueing ${eventName} for dependencies:`, dependencies);
    // Simple implementation - could be enhanced with proper dependency resolution
    setTimeout(() => {
      if (this.dependenciesMet(dependencies, options.context)) {
        this.emit(eventName, data, {
          ...options,
          timing: "immediate"
        });
      }
    }, 50);
  }
  /**
   * Queue event for signal
   * @param eventName - Event name
   * @param data - Event data
   * @param signal - Signal to wait for
   * @param priority - Event priority
   */
  queueForSignal(eventName, data, signal, priority) {
    console.log(`🎼 EventBus: Queueing ${eventName} for signal: ${signal}`);
    // Simple implementation - could be enhanced with proper signal handling
    const checkSignal = () => {
      if (this.completedEvents.has(signal)) {
        this.executeEvent(eventName, data, priority);
      } else {
        setTimeout(checkSignal, 10);
      }
    };
    checkSignal();
  }
  /**
   * Calculate delay based on tempo
   * @param beats - Number of beats to delay
   */
  calculateDelay(beats) {
    // Convert BPM to milliseconds per beat
    const msPerBeat = 60 / this.tempo * 1000;
    return beats * msPerBeat;
  }
  /**
   * Update performance metrics
   * @param eventName - Event name
   * @param startTime - Start time
   */
  updateMetrics(eventName, startTime) {
    const latency = performance.now() - startTime;
    this.metrics.eventsProcessed++;
    // Simple moving average for latency
    const alpha = 0.1;
    this.metrics.averageLatency = this.metrics.averageLatency * (1 - alpha) + latency * alpha;
  }
  /**
   * Connect to external conductor
   * @param conductor - The main conductor instance
   */
  connectToMainConductor(conductor) {
    console.log("🎼 EventBus: Connecting to main conductor for unified sequence system");
    this.externalConductor = conductor;
    // Use the main conductor's sequence registry for unified access
    if (conductor.sequences) {
      this.sequences = conductor.sequences;
      console.log(`🎼 EventBus: Connected to main conductor with ${this.sequences.size} sequences`);
    } else {
      console.warn("🚨 EventBus: Main conductor does not have sequences property");
    }
  }
  /**
   * Get basic performance metrics
   */
  getBasicMetrics() {
    return {
      ...this.metrics
    };
  }
  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.metrics = {
      eventsProcessed: 0,
      sequencesExecuted: 0,
      averageLatency: 0,
      raceConditionsDetected: 0
    };
  }
  /**
   * Set musical tempo (BPM)
   */
  setTempo(bpm) {
    this.tempo = bpm;
  }
  /**
   * Get current musical tempo (BPM)
   */
  getTempo() {
    return this.tempo;
  }
  /**
   * Get beat duration in milliseconds based on current tempo
   */
  getBeatDuration() {
    return 60 / this.tempo * 1000;
  }
  /**
   * Register a musical sequence
   */
  registerSequence(key, sequence) {
    this.sequences.set(key, sequence);
  }
  /**
   * Get all sequence names
   */
  getSequenceNames() {
    return Array.from(this.sequences.keys());
  }
  /**
   * Play a sequence through the conductor
   */
  async play(sequenceName, data) {
    this.metrics.sequencesExecuted++;
    if (this.externalConductor && this.externalConductor.startSequence) {
      try {
        return await this.externalConductor.startSequence(sequenceName, data);
      } catch (error) {
        console.error(`🎼 EventBus: Error playing sequence ${sequenceName}:`, error);
      }
    } else {
      // Fallback to event emission
      this.emit("sequence-start", {
        sequenceName,
        data
      });
    }
  }
  /**
   * Get comprehensive metrics including conductor stats
   */
  getMetrics() {
    const eventBusStats = this.getDebugInfo();
    const conductorStats = this.externalConductor?.getStatistics?.() || {};
    return {
      sequenceCount: this.sequences.size,
      sequenceExecutions: this.metrics.sequencesExecuted,
      eventBusStats,
      conductorStats,
      ...this.metrics
    };
  }
}
// Create and export singleton instance using ConductorEventBus
const eventBus = new ConductorEventBus();
// Debug mode disabled for cleaner logging output
// eventBus.setDebugMode(true);

/***/ }),

/***/ "./test-app/dist/modules/communication/SPAValidator.js":
/*!*************************************************************!*\
  !*** ./test-app/dist/modules/communication/SPAValidator.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SPAValidator: () => (/* binding */ SPAValidator)
/* harmony export */ });
/* harmony import */ var _EventBus_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EventBus.js */ "./test-app/dist/modules/communication/EventBus.js");
/**
 * SPA Runtime Validator
 * Provides runtime enforcement of Symphonic Plugin Architecture (SPA) compliance
 * Prevents plugins from directly accessing eventBus.emit() and enforces conductor.play() usage
 */

class SPAValidator {
  constructor(config = {}) {
    this.violations = [];
    this.originalEventBusEmit = null;
    this.originalEventBusSubscribe = null;
    this.registeredPlugins = new Set();
    this.config = {
      strictMode: true,
      allowedPlugins: [],
      logViolations: true,
      throwOnViolation: false,
      enableRuntimeChecks: true,
      ...config
    };
    if (this.config.enableRuntimeChecks) {
      this.initializeRuntimeChecks();
    }
  }
  /**
   * Initialize runtime checks by intercepting eventBus.emit calls and subscribe calls
   */
  initializeRuntimeChecks() {
    // Store original emit method
    this.originalEventBusEmit = _EventBus_js__WEBPACK_IMPORTED_MODULE_0__.EventBus.prototype.emit;
    // Override emit method with validation
    _EventBus_js__WEBPACK_IMPORTED_MODULE_0__.EventBus.prototype.emit = this.createValidatedEmit();
    // Store original subscribe method and override it
    this.originalEventBusSubscribe = _EventBus_js__WEBPACK_IMPORTED_MODULE_0__.EventBus.prototype.subscribe;
    _EventBus_js__WEBPACK_IMPORTED_MODULE_0__.EventBus.prototype.subscribe = this.createValidatedSubscribe();
    // Intercept global eventBus access
    this.interceptGlobalAccess();
    console.log("🎼 SPA Validator: Runtime checks initialized");
  }
  /**
   * Create validated emit function that checks for plugin violations
   */
  createValidatedEmit() {
    return function (eventName, data, options = {}) {
      const validator = SPAValidator.getInstance();
      // Get call stack to identify caller
      const stack = new Error().stack || "";
      const callerInfo = validator.analyzeCallStack(stack);
      // Check if call is from a plugin
      if (validator.isPluginCall(callerInfo)) {
        const violation = validator.createViolation("RUNTIME_DIRECT_EVENTBUS_EMIT", callerInfo.pluginId, `Plugin '${callerInfo.pluginId}' directly called eventBus.emit('${eventName}')`, stack, "critical");
        validator.handleViolation(violation);
        // In strict mode, block the call
        if (validator.config.strictMode) {
          console.error(`🚫 SPA Validator: Blocked direct eventBus.emit() call from plugin '${callerInfo.pluginId}'`);
          console.error(`💡 Use conductor.play('${callerInfo.pluginId}', 'SEQUENCE_NAME', data) instead`);
          return;
        }
      }
      // Call original emit method
      return validator.originalEventBusEmit.call(this, eventName, data, options);
    };
  }
  /**
   * Create validated subscribe function that checks for React component violations
   */
  createValidatedSubscribe() {
    return function (eventName, callback, context) {
      const validator = SPAValidator.getInstance();
      const stack = new Error().stack || "";
      const callerInfo = validator.analyzeCallStack(stack);
      // Allow MusicalConductor to subscribe directly for internal operations
      if (callerInfo.isMusicalConductor) {
        return validator.originalEventBusSubscribe.call(this, eventName, callback, context);
      }
      // Check if React component is directly subscribing
      if (callerInfo.isReactComponent) {
        const violation = validator.createViolation("RUNTIME_REACT_COMPONENT_EVENTBUS_SUBSCRIBE", "react-component", `React component directly called eventBus.subscribe('${eventName}') - should use conductor.subscribe()`, stack, "critical");
        validator.handleViolation(violation);
        if (validator.config.strictMode) {
          throw new Error(`React component violation: Use conductor.subscribe('${eventName}', callback) instead of eventBus.subscribe()`);
        }
      }
      // Check if plugin is subscribing outside mount method
      if (callerInfo.isPlugin && !callerInfo.isInMountMethod) {
        const violation = validator.createViolation("RUNTIME_PLUGIN_EVENTBUS_SUBSCRIBE_OUTSIDE_MOUNT", callerInfo.pluginId, `Plugin '${callerInfo.pluginId}' called eventBus.subscribe() outside mount method`, stack, "error");
        validator.handleViolation(violation);
      }
      return validator.originalEventBusSubscribe.call(this, eventName, callback, context);
    };
  }
  /**
   * Intercept global eventBus access through window.renderxCommunicationSystem
   */
  interceptGlobalAccess() {
    if (typeof window === "undefined") return;
    // Monitor access to window.renderxCommunicationSystem.eventBus
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, "renderxCommunicationSystem");
    let communicationSystem = null;
    Object.defineProperty(window, "renderxCommunicationSystem", {
      get: () => {
        const stack = new Error().stack || "";
        const callerInfo = this.analyzeCallStack(stack);
        // Check for violations in eventBus access
        if (this.isViolatingGlobalAccess(callerInfo, stack)) {
          this.handleGlobalAccessViolation(callerInfo, stack);
        }
        return communicationSystem;
      },
      set: value => {
        communicationSystem = value;
      },
      configurable: true
    });
  }
  /**
   * Check if global access is violating SPA principles
   */
  isViolatingGlobalAccess(callerInfo, stack) {
    // Allow MusicalConductor and AppContent to set up the system
    if (callerInfo.source === "MusicalConductor" || stack.includes("AppContent")) {
      return false;
    }
    // Check if accessing .eventBus specifically
    if (stack.includes(".eventBus")) {
      return true;
    }
    return false;
  }
  /**
   * Handle global access violations
   */
  handleGlobalAccessViolation(callerInfo, stack) {
    const violation = this.createViolation("RUNTIME_GLOBAL_EVENTBUS_ACCESS", callerInfo.pluginId || callerInfo.source, `Global eventBus access detected - should use conductor methods instead`, stack, "critical");
    this.handleViolation(violation);
  }
  /**
   * Analyze call stack to identify plugin calls, React components, and mount methods
   */
  analyzeCallStack(stack) {
    const lines = stack.split("\n");
    let isReactComponent = false;
    let isInMountMethod = false;
    let isMusicalConductor = false;
    let source = "unknown";
    for (const line of lines) {
      // Check for MusicalConductor internal operations first
      // Handle both full paths, URLs, and just filenames
      if (line.includes("MusicalConductor") || line.includes("/sequences/MusicalConductor.ts") || line.includes("/sequences/core/") || line.includes("/sequences/plugins/PluginManager") || line.includes("/sequences/plugins/PluginInterfaceFacade") || line.includes("/sequences/plugins/PluginLoader") || line.includes("/sequences/plugins/PluginValidator") || line.includes("/sequences/plugins/PluginManifestLoader") || line.includes("SequenceRegistry") || line.includes("EventSubscriptionManager") || line.includes("ConductorCore") || line.includes("EventOrchestrator") || line.includes("SequenceOrchestrator") || line.includes("/communication/EventBus") || line.includes("/communication/SPAValidator") ||
      // Handle filename-only patterns (common in minified/bundled code)
      line.includes("PluginManager.js") || line.includes("PluginInterfaceFacade.js") || line.includes("PluginLoader.js") || line.includes("PluginValidator.js") || line.includes("PluginManifestLoader.js") || line.includes("SequenceRegistry.js") || line.includes("EventSubscriptionManager.js") || line.includes("ConductorCore.js") || line.includes("EventOrchestrator.js") || line.includes("SequenceOrchestrator.js") || line.includes("EventBus.js") || line.includes("SPAValidator.js") ||
      // Handle browser URL patterns for E2E testing
      line.includes("/dist/modules/communication/") || line.includes("/dist/modules/sequences/")) {
        isMusicalConductor = true;
        source = "MusicalConductor";
        // MusicalConductor is allowed to access eventBus directly for internal operations
        return {
          isPlugin: false,
          pluginId: "MusicalConductor",
          fileName: line,
          isReactComponent: false,
          isInMountMethod: false,
          source,
          isMusicalConductor: true
        };
      }
      // Look for React component patterns
      const reactMatch = line.match(/\/components\/([^\/]+\.tsx?)/);
      if (reactMatch) {
        isReactComponent = true;
        source = `React:${reactMatch[1]}`;
      }
      // Look for mount method patterns
      if (line.includes(".mount(") || line.includes("mount:")) {
        isInMountMethod = true;
      }
      // Look for plugin file patterns
      const pluginMatch = line.match(/\/plugins\/([^\/]+)/);
      if (pluginMatch) {
        return {
          isPlugin: true,
          pluginId: pluginMatch[1],
          fileName: line,
          isReactComponent,
          isInMountMethod,
          source: `Plugin:${pluginMatch[1]}`,
          isMusicalConductor: false
        };
      }
      // Look for symphony patterns
      const symphonyMatch = line.match(/([^\/]+\.symphony)/);
      if (symphonyMatch) {
        return {
          isPlugin: true,
          pluginId: symphonyMatch[1],
          fileName: line,
          isReactComponent,
          isInMountMethod,
          source: `Plugin:${symphonyMatch[1]}`,
          isMusicalConductor: false
        };
      }
      // Look for MusicalConductor patterns
      if (line.includes("MusicalConductor")) {
        source = "MusicalConductor";
      }
    }
    return {
      isPlugin: false,
      pluginId: "unknown",
      fileName: "unknown",
      isReactComponent,
      isInMountMethod,
      source,
      isMusicalConductor: false
    };
  }
  /**
   * Check if call is from a plugin
   */
  isPluginCall(callerInfo) {
    if (!callerInfo.isPlugin) return false;
    // MusicalConductor is not considered a plugin for violation purposes
    if (callerInfo.isMusicalConductor) return false;
    // Allow calls from whitelisted plugins
    if (this.config.allowedPlugins.includes(callerInfo.pluginId)) {
      return false;
    }
    return true;
  }
  /**
   * Create violation record
   */
  createViolation(type, pluginId, description, stackTrace, severity) {
    return {
      type,
      pluginId,
      description,
      stackTrace,
      timestamp: new Date(),
      severity
    };
  }
  /**
   * Handle violation based on configuration
   */
  handleViolation(violation) {
    this.violations.push(violation);
    if (this.config.logViolations) {
      console.error(`🎼 SPA Violation [${violation.severity.toUpperCase()}]: ${violation.description}`);
      console.error(`   Plugin: ${violation.pluginId}`);
      console.error(`   Time: ${violation.timestamp.toISOString()}`);
      if (violation.severity === "critical") {
        console.error(`   Stack: ${violation.stackTrace.split("\n").slice(0, 3).join("\n")}`);
      }
    }
    if (this.config.throwOnViolation && violation.severity === "critical") {
      throw new Error(`SPA Violation: ${violation.description}`);
    }
  }
  /**
   * Register a plugin as allowed to use eventBus directly (for migration)
   */
  registerPlugin(pluginId) {
    this.registeredPlugins.add(pluginId);
    // Plugin registered - logging disabled for cleaner output
  }
  /**
   * Validate plugin compliance before mounting
   */
  validatePluginMount(pluginId, pluginCode) {
    const violations = [];
    // Check for direct eventBus.emit calls in plugin code
    const directEmitPattern = /eventBus\.emit\s*\(/g;
    const matches = pluginCode.match(directEmitPattern);
    if (matches) {
      violations.push(`Plugin '${pluginId}' contains ${matches.length} direct eventBus.emit() call(s)`);
    }
    // Check for global eventBus access
    const globalEmitPattern = /window\..*eventBus\.emit\s*\(/g;
    const globalMatches = pluginCode.match(globalEmitPattern);
    if (globalMatches) {
      violations.push(`Plugin '${pluginId}' contains ${globalMatches.length} global eventBus access(es)`);
    }
    // Check for proper conductor.play usage
    const conductorPlayPattern = /conductor\.play\s*\(/g;
    const conductorMatches = pluginCode.match(conductorPlayPattern);
    if (!conductorMatches && (matches || globalMatches)) {
      violations.push(`Plugin '${pluginId}' uses eventBus.emit() but no conductor.play() - should migrate to SPA`);
    }
    return {
      valid: violations.length === 0,
      violations
    };
  }
  /**
   * Get all violations
   */
  getViolations() {
    return [...this.violations];
  }
  /**
   * Get violations by plugin
   */
  getViolationsByPlugin(pluginId) {
    return this.violations.filter(v => v.pluginId === pluginId);
  }
  /**
   * Clear violations
   */
  clearViolations() {
    this.violations = [];
  }
  /**
   * Generate compliance report
   */
  generateComplianceReport() {
    const violationsByPlugin = {};
    const violationsBySeverity = {};
    const recommendations = [];
    for (const violation of this.violations) {
      violationsByPlugin[violation.pluginId] = (violationsByPlugin[violation.pluginId] || 0) + 1;
      violationsBySeverity[violation.severity] = (violationsBySeverity[violation.severity] || 0) + 1;
    }
    // Generate recommendations
    for (const [pluginId, count] of Object.entries(violationsByPlugin)) {
      recommendations.push(`Plugin '${pluginId}' has ${count} violation(s) - migrate to conductor.play() pattern`);
    }
    return {
      totalViolations: this.violations.length,
      violationsByPlugin,
      violationsBySeverity,
      recommendations
    };
  }
  static getInstance() {
    if (!SPAValidator.instance) {
      SPAValidator.instance = new SPAValidator();
    }
    return SPAValidator.instance;
  }
  /**
   * Initialize SPA validation with configuration
   */
  static initialize(config = {}) {
    SPAValidator.instance = new SPAValidator(config);
    return SPAValidator.instance;
  }
  /**
   * Disable runtime checks (for testing or migration)
   */
  disableRuntimeChecks() {
    if (this.originalEventBusEmit) {
      _EventBus_js__WEBPACK_IMPORTED_MODULE_0__.EventBus.prototype.emit = this.originalEventBusEmit;
      console.log("🎼 SPA Validator: Runtime checks disabled");
    }
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/event-types/core.event-types.js":
/*!*****************************************************************************!*\
  !*** ./test-app/dist/modules/communication/event-types/core.event-types.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CORE_EVENT_TYPES: () => (/* binding */ CORE_EVENT_TYPES)
/* harmony export */ });
/**
 * Core Event Types
 * Centralized event type definitions for core system events
 */
const CORE_EVENT_TYPES = {
  // Component Events
  COMPONENT_MOUNTED: 'component-mounted',
  COMPONENT_UNMOUNTED: 'component-unmounted',
  COMPONENT_UPDATED: 'component-updated',
  COMPONENT_ERROR: 'component-error',
  // System Events
  SYSTEM_ERROR: 'system-error',
  SYSTEM_WARNING: 'system-warning',
  SYSTEM_INFO: 'system-info'
};

/***/ }),

/***/ "./test-app/dist/modules/communication/event-types/index.js":
/*!******************************************************************!*\
  !*** ./test-app/dist/modules/communication/event-types/index.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony exports EVENT_TYPES, EVENT_CATEGORIES, getEventCategory, getEventsByCategory */
/* harmony import */ var _core_event_types_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core.event-types.js */ "./test-app/dist/modules/communication/event-types/core.event-types.js");
/* harmony import */ var _sequences_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../sequences/SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/**
 * Event Types Index
 * Central export point for all event type definitions
 *
 * This follows the legacy RX.React pattern:
 * import { EVENT_TYPES } from './event-types/index.js';
 */
// Import all event type modules

// Import musical conductor event types from sequences

/**
 * Consolidated EVENT_TYPES object
 * Combines all event types into a single object for easy access
 */
const EVENT_TYPES = {
  // Core Events
  ..._core_event_types_js__WEBPACK_IMPORTED_MODULE_0__.CORE_EVENT_TYPES,
  // Musical Conductor Events
  ..._sequences_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_1__.MUSICAL_CONDUCTOR_EVENT_TYPES
};
/**
 * Individual event type exports for specific use cases
 */

/**
 * Event Categories
 * Organizational categories for different types of events
 */
const EVENT_CATEGORIES = {
  CORE: "core",
  MUSICAL_CONDUCTOR: "musical-conductor"
};
/**
 * Get event category for a given event type
 * @param eventType - The event type to categorize
 * @returns The category of the event type
 */
function getEventCategory(eventType) {
  if (Object.values(_core_event_types_js__WEBPACK_IMPORTED_MODULE_0__.CORE_EVENT_TYPES).includes(eventType)) {
    return EVENT_CATEGORIES.CORE;
  }
  if (Object.values(_sequences_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_1__.MUSICAL_CONDUCTOR_EVENT_TYPES).includes(eventType)) {
    return EVENT_CATEGORIES.MUSICAL_CONDUCTOR;
  }
  return null;
}
/**
 * Get all event types for a specific category
 * @param category - The category to get events for
 * @returns Array of event types in the category
 */
function getEventsByCategory(category) {
  switch (category) {
    case EVENT_CATEGORIES.CORE:
      return Object.values(_core_event_types_js__WEBPACK_IMPORTED_MODULE_0__.CORE_EVENT_TYPES);
    case EVENT_CATEGORIES.MUSICAL_CONDUCTOR:
      return Object.values(_sequences_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_1__.MUSICAL_CONDUCTOR_EVENT_TYPES);
    default:
      return [];
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/index.js":
/*!******************************************************!*\
  !*** ./test-app/dist/modules/communication/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony exports resetCommunicationSystem, initializeCommunicationSystem, getCommunicationSystemStatus */
/* harmony import */ var _EventBus_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EventBus.js */ "./test-app/dist/modules/communication/EventBus.js");
/* harmony import */ var _event_types_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./event-types/index.js */ "./test-app/dist/modules/communication/event-types/index.js");
/* harmony import */ var _sequences_MusicalConductor_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./sequences/MusicalConductor.js */ "./test-app/dist/modules/communication/sequences/MusicalConductor.js");
/* harmony import */ var _sequences_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sequences/index.js */ "./test-app/dist/modules/communication/sequences/index.js");
/* harmony import */ var _sequences_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./sequences/SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/**
 * Communication System Exports
 *
 * Central export point for all communication-related components
 * including EventBus, Musical Conductor, and sequence types.
 */
// EventBus exports

// Event Types exports

// Musical Conductor exports

// Import MusicalConductor and sequences for internal use



// Musical Sequences exports

// Sequence Types exports

// Track if communication system has been initialized to prevent duplicate initialization
let communicationSystemInitialized = false;
let communicationSystemInstance = null;
/**
 * Reset communication system state (for testing/cleanup)
 * This allows re-initialization if needed
 */
function resetCommunicationSystem() {
  communicationSystemInitialized = false;
  communicationSystemInstance = null;
  _sequences_MusicalConductor_js__WEBPACK_IMPORTED_MODULE_2__.MusicalConductor.resetInstance();
  console.log("🔄 Communication system state reset");
}
/**
 * Initialize Communication System
 * Sets up the EventBus and Musical Conductor integration with all sequences
 * Protected against duplicate initialization for React StrictMode compatibility
 */
function initializeCommunicationSystem() {
  // Return existing instance if already initialized (React StrictMode protection)
  if (communicationSystemInitialized && communicationSystemInstance) {
    console.log("🎼 Communication System already initialized, returning existing instance...");
    return communicationSystemInstance;
  }
  console.log("🎼 Initializing RenderX Evolution Communication System...");
  // Get singleton musical conductor instance with the internal eventBus
  const conductor = _sequences_MusicalConductor_js__WEBPACK_IMPORTED_MODULE_2__.MusicalConductor.getInstance(_EventBus_js__WEBPACK_IMPORTED_MODULE_0__.eventBus);
  // Connect eventBus to the conductor for unified sequence system
  _EventBus_js__WEBPACK_IMPORTED_MODULE_0__.eventBus.connectToMainConductor(conductor);
  // Beat execution logging is now handled by the Musical Conductor singleton
  // Initialize and register all musical sequences
  const sequenceResults = (0,_sequences_index_js__WEBPACK_IMPORTED_MODULE_3__.initializeMusicalSequences)(conductor);
  console.log("✅ Communication System initialized successfully");
  console.log(`🎼 Registered ${sequenceResults.registeredSequences} musical sequences`);
  if (sequenceResults.validationResults.invalid.length > 0) {
    console.warn("⚠️ Some sequences have validation issues:", sequenceResults.validationResults.invalid);
  }
  // Store instance and mark as initialized
  communicationSystemInstance = {
    eventBus: _EventBus_js__WEBPACK_IMPORTED_MODULE_0__.eventBus,
    conductor,
    sequenceResults
  };
  communicationSystemInitialized = true;
  return communicationSystemInstance;
}
/**
 * Communication System Status
 * Provides status information about the communication system
 */
function getCommunicationSystemStatus() {
  // Use singleton instance if available, otherwise create temporary instance for status
  const conductor = _sequences_MusicalConductor_js__WEBPACK_IMPORTED_MODULE_2__.MusicalConductor.getInstance(_EventBus_js__WEBPACK_IMPORTED_MODULE_0__.eventBus);
  return {
    eventBus: {
      debugInfo: _EventBus_js__WEBPACK_IMPORTED_MODULE_0__.eventBus.getDebugInfo(),
      metrics: _EventBus_js__WEBPACK_IMPORTED_MODULE_0__.eventBus.getMetrics()
    },
    conductor: {
      statistics: conductor.getStatistics(),
      queueStatus: conductor.getQueueStatus(),
      sequenceCount: conductor.getSequenceNames().length
    }
  };
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/MusicalConductor.js":
/*!***************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/MusicalConductor.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MusicalConductor: () => (/* binding */ MusicalConductor)
/* harmony export */ });
/* harmony import */ var _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/* harmony import */ var _core_ConductorCore_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./core/ConductorCore.js */ "./test-app/dist/modules/communication/sequences/core/ConductorCore.js");
/* harmony import */ var _core_SequenceRegistry_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/SequenceRegistry.js */ "./test-app/dist/modules/communication/sequences/core/SequenceRegistry.js");
/* harmony import */ var _core_EventSubscriptionManager_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/EventSubscriptionManager.js */ "./test-app/dist/modules/communication/sequences/core/EventSubscriptionManager.js");
/* harmony import */ var _execution_ExecutionQueue_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./execution/ExecutionQueue.js */ "./test-app/dist/modules/communication/sequences/execution/ExecutionQueue.js");
/* harmony import */ var _execution_SequenceExecutor_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./execution/SequenceExecutor.js */ "./test-app/dist/modules/communication/sequences/execution/SequenceExecutor.js");
/* harmony import */ var _plugins_PluginManager_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./plugins/PluginManager.js */ "./test-app/dist/modules/communication/sequences/plugins/PluginManager.js");
/* harmony import */ var _plugins_PluginInterfaceFacade_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./plugins/PluginInterfaceFacade.js */ "./test-app/dist/modules/communication/sequences/plugins/PluginInterfaceFacade.js");
/* harmony import */ var _resources_ResourceManager_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./resources/ResourceManager.js */ "./test-app/dist/modules/communication/sequences/resources/ResourceManager.js");
/* harmony import */ var _resources_ResourceDelegator_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./resources/ResourceDelegator.js */ "./test-app/dist/modules/communication/sequences/resources/ResourceDelegator.js");
/* harmony import */ var _monitoring_StatisticsManager_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./monitoring/StatisticsManager.js */ "./test-app/dist/modules/communication/sequences/monitoring/StatisticsManager.js");
/* harmony import */ var _monitoring_PerformanceTracker_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./monitoring/PerformanceTracker.js */ "./test-app/dist/modules/communication/sequences/monitoring/PerformanceTracker.js");
/* harmony import */ var _monitoring_DuplicationDetector_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./monitoring/DuplicationDetector.js */ "./test-app/dist/modules/communication/sequences/monitoring/DuplicationDetector.js");
/* harmony import */ var _monitoring_EventLogger_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./monitoring/EventLogger.js */ "./test-app/dist/modules/communication/sequences/monitoring/EventLogger.js");
/* harmony import */ var _validation_SequenceValidator_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./validation/SequenceValidator.js */ "./test-app/dist/modules/communication/sequences/validation/SequenceValidator.js");
/* harmony import */ var _utilities_SequenceUtilities_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./utilities/SequenceUtilities.js */ "./test-app/dist/modules/communication/sequences/utilities/SequenceUtilities.js");
/* harmony import */ var _orchestration_SequenceOrchestrator_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./orchestration/SequenceOrchestrator.js */ "./test-app/dist/modules/communication/sequences/orchestration/SequenceOrchestrator.js");
/* harmony import */ var _orchestration_EventOrchestrator_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./orchestration/EventOrchestrator.js */ "./test-app/dist/modules/communication/sequences/orchestration/EventOrchestrator.js");
/* harmony import */ var _api_ConductorAPI_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./api/ConductorAPI.js */ "./test-app/dist/modules/communication/sequences/api/ConductorAPI.js");
/* harmony import */ var _strictmode_StrictModeManager_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./strictmode/StrictModeManager.js */ "./test-app/dist/modules/communication/sequences/strictmode/StrictModeManager.js");
/* harmony import */ var _resources_ResourceConflictManager_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./resources/ResourceConflictManager.js */ "./test-app/dist/modules/communication/sequences/resources/ResourceConflictManager.js");
/**
 * Musical Conductor / Event Orchestrator
 * CIA-Compliant Musical Conductor Class (TypeScript)
 * Manages the execution and coordination of musical sequences with CIA compliance
 *
 * Features:
 * - SPA (Symphonic Plugin Architecture) compatibility
 * - CIA (Conductor Integration Architecture) compliance for safe symphonic plugin mounting (SPM)
 * - Sequential orchestration with queue-based system
 * - Priority-based sequence execution
 * - Comprehensive error handling
 * - Performance metrics and statistics
 * - TypeScript support with proper typing
 * - Runtime plugin shape validation
 * - Graceful failure handling for malformed plugins
 * - Movement-to-handler contract verification
 */

// Import new core components




















class MusicalConductor {
  // Core component getters
  get eventBus() {
    return this.conductorCore.getEventBus();
  }
  constructor(eventBus) {
    // Initialize core components
    this.conductorCore = _core_ConductorCore_js__WEBPACK_IMPORTED_MODULE_1__.ConductorCore.getInstance(eventBus);
    this.sequenceRegistry = new _core_SequenceRegistry_js__WEBPACK_IMPORTED_MODULE_2__.SequenceRegistry(eventBus);
    this.eventSubscriptionManager = new _core_EventSubscriptionManager_js__WEBPACK_IMPORTED_MODULE_3__.EventSubscriptionManager(eventBus, this.conductorCore.getSPAValidator());
    // Inject EventSubscriptionManager into SequenceRegistry for SPA compliance
    this.sequenceRegistry.setEventSubscriptionManager(this.eventSubscriptionManager);
    this.executionQueue = new _execution_ExecutionQueue_js__WEBPACK_IMPORTED_MODULE_4__.ExecutionQueue();
    // Initialize monitoring components first
    this.statisticsManager = new _monitoring_StatisticsManager_js__WEBPACK_IMPORTED_MODULE_10__.StatisticsManager();
    this.performanceTracker = new _monitoring_PerformanceTracker_js__WEBPACK_IMPORTED_MODULE_11__.PerformanceTracker();
    this.duplicationDetector = new _monitoring_DuplicationDetector_js__WEBPACK_IMPORTED_MODULE_12__.DuplicationDetector();
    this.eventLogger = new _monitoring_EventLogger_js__WEBPACK_IMPORTED_MODULE_13__.EventLogger(eventBus, this.performanceTracker);
    // Initialize validation components
    this.sequenceValidator = new _validation_SequenceValidator_js__WEBPACK_IMPORTED_MODULE_14__.SequenceValidator(this.duplicationDetector);
    // Initialize utility components
    this.sequenceUtilities = new _utilities_SequenceUtilities_js__WEBPACK_IMPORTED_MODULE_15__.SequenceUtilities();
    this.sequenceExecutor = new _execution_SequenceExecutor_js__WEBPACK_IMPORTED_MODULE_5__.SequenceExecutor(eventBus, this.conductorCore.getSPAValidator(), this.executionQueue, this.statisticsManager.getStatistics());
    this.pluginManager = new _plugins_PluginManager_js__WEBPACK_IMPORTED_MODULE_6__.PluginManager(eventBus, this.conductorCore.getSPAValidator(), this.sequenceRegistry);
    this.pluginInterface = new _plugins_PluginInterfaceFacade_js__WEBPACK_IMPORTED_MODULE_7__.PluginInterfaceFacade(this.pluginManager, this.conductorCore.getSPAValidator());
    this.resourceManager = new _resources_ResourceManager_js__WEBPACK_IMPORTED_MODULE_8__.ResourceManager();
    this.resourceDelegator = new _resources_ResourceDelegator_js__WEBPACK_IMPORTED_MODULE_9__.ResourceDelegator(this.resourceManager);
    // Initialize orchestration components (after all dependencies are ready)
    this.sequenceOrchestrator = new _orchestration_SequenceOrchestrator_js__WEBPACK_IMPORTED_MODULE_16__.SequenceOrchestrator(eventBus, this.sequenceRegistry, this.executionQueue, this.sequenceExecutor, this.statisticsManager, this.sequenceValidator, this.sequenceUtilities, this.resourceDelegator);
    this.eventOrchestrator = new _orchestration_EventOrchestrator_js__WEBPACK_IMPORTED_MODULE_17__.EventOrchestrator(eventBus);
    // Initialize API components
    this.conductorAPI = new _api_ConductorAPI_js__WEBPACK_IMPORTED_MODULE_18__.ConductorAPI(this.sequenceOrchestrator, this.sequenceExecutor, this.executionQueue, this.statisticsManager, this.pluginInterface, this.sequenceRegistry, eventBus);
    // Initialize StrictMode components
    this.strictModeManager = new _strictmode_StrictModeManager_js__WEBPACK_IMPORTED_MODULE_19__.StrictModeManager(this.duplicationDetector);
    // Initialize resource conflict components
    this.resourceConflictManager = new _resources_ResourceConflictManager_js__WEBPACK_IMPORTED_MODULE_20__.ResourceConflictManager(this.resourceManager, this.resourceDelegator, this.sequenceUtilities);
    console.log("🎼 MusicalConductor: Initialized with core components");
  }
  /**
   * Get the singleton instance of Musical Conductor
   * @param eventBus - The event bus instance (required for first initialization)
   * @returns The singleton Musical Conductor instance
   */
  static getInstance(eventBus) {
    if (!MusicalConductor.instance) {
      if (!eventBus) {
        throw new Error("EventBus is required for first initialization of Musical Conductor");
      }
      MusicalConductor.instance = new MusicalConductor(eventBus);
    } else if (eventBus && MusicalConductor.instance.eventBus !== eventBus) {
      console.warn("🎼 MusicalConductor: Attempting to change eventBus on existing singleton instance - ignoring");
    }
    return MusicalConductor.instance;
  }
  /**
   * Reset the singleton instance (for testing/cleanup)
   * This allows re-initialization if needed
   */
  static resetInstance() {
    if (MusicalConductor.instance) {
      // Reset core components
      _core_ConductorCore_js__WEBPACK_IMPORTED_MODULE_1__.ConductorCore.resetInstance();
    }
    MusicalConductor.instance = null;
    console.log("🔄 MusicalConductor: Singleton instance reset");
  }
  /**
   * Handle beat execution error with hierarchical logging
   * @param executionContext - Execution context
   * @param beat - Beat that failed
   * @param error - Error that occurred
   */
  handleBeatError(executionContext, beat, error) {
    this.eventLogger.handleBeatError(executionContext, beat, error);
  }
  /**
   * Register a musical sequence
   * @param sequence - The sequence to register
   */
  registerSequence(sequence) {
    this.sequenceRegistry.register(sequence);
  }
  /**
   * Unregister a musical sequence
   * @param sequenceId - ID of the sequence to unregister
   */
  unregisterSequence(sequenceId) {
    this.sequenceRegistry.unregister(sequenceId);
  }
  /**
   * Get a registered sequence by ID
   * @param sequenceId - ID of the sequence
   */
  getSequence(sequenceId) {
    return this.sequenceRegistry.get(sequenceId);
  }
  /**
   * Get a registered sequence by name (for backward compatibility)
   * @param sequenceName - Name of the sequence
   */
  getSequenceByName(sequenceName) {
    return this.sequenceRegistry.findByName(sequenceName);
  }
  /**
   * Get all registered sequence names
   */
  getSequenceNames() {
    return this.sequenceRegistry.getNames();
  }
  /**
   * Get all registered sequences with their details
   * @returns Array of registered sequences
   */
  getRegisteredSequences() {
    return this.sequenceRegistry.getAll();
  }
  /**
   * Get all mounted plugin names
   */
  getMountedPlugins() {
    return this.pluginInterface.getMountedPlugins();
  }
  // ===== CIA (Conductor Integration Architecture) Methods =====
  /**
   * Play a specific movement of a mounted SPA plugin (CIA-compliant)
   * @param pluginId - The plugin identifier
   * @param sequenceId - The sequence ID to execute
   * @param context - Context data to pass to the movement handler
   * @param priority - Sequence priority (NORMAL, HIGH, CHAINED)
   * @returns Execution result
   */
  play(pluginId, sequenceId, context = {}, priority = _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.NORMAL) {
    return this.pluginInterface.play(pluginId, sequenceId, context, priority, (seqId, data, prio) => this.startSequence(seqId, data, prio));
  }
  /**
   * Subscribe to events through the conductor (SPA-compliant)
   * This method ensures all event subscriptions go through the conductor
   * and prevents direct eventBus access violations
   * @param eventName - The event name to subscribe to
   * @param callback - The callback function to execute
   * @param context - Optional context for the subscription
   * @returns Unsubscribe function
   */
  subscribe(eventName, callback, context) {
    return this.eventSubscriptionManager.subscribe(eventName, callback, context);
  }
  /**
   * Unsubscribe from events through the conductor (SPA-compliant)
   * @param eventName - The event name to unsubscribe from
   * @param callback - The callback function to remove
   */
  unsubscribe(eventName, callback) {
    this.eventSubscriptionManager.unsubscribe(eventName, callback);
  }
  /**
   * Mount an SPA plugin with comprehensive validation (CIA-compliant)
   * @param sequence - The sequence definition from the plugin
   * @param handlers - The handlers object from the plugin
   * @param pluginId - Optional plugin ID (defaults to sequence.name)
   * @returns Plugin mount result
   */
  async mount(sequence, handlers, pluginId, metadata) {
    return this.pluginInterface.mount(sequence, handlers, pluginId, metadata);
  }
  /**
   * Register CIA-compliant plugins
   * Loads and mounts all plugins from the plugins directory
   */
  async registerCIAPlugins() {
    return this.pluginInterface.registerCIAPlugins();
  }
  /**
   * Execute movement with handler validation (CIA-compliant)
   * @param sequenceId - Sequence ID identifier
   * @param movementName - Movement name
   * @param data - Data to pass to handler
   * @returns Handler execution result
   */
  executeMovementHandler(sequenceId, movementName, data) {
    return this.pluginInterface.executeMovementWithHandler(sequenceId, movementName, data);
  }
  /**
   * Load plugin from dynamic import with error handling (CIA-compliant)
   * @param pluginPath - Path to the plugin module
   * @returns Plugin load result
   */
  async loadPlugin(pluginPath) {
    return this.pluginInterface.loadPlugin(pluginPath);
  }
  /**
   * Validate plugin pre-compilation status
   * @param pluginId - Plugin identifier
   * @returns Validation result
   */
  /**
   * Unmount a plugin (CIA-compliant)
   * @param pluginId - Plugin identifier
   * @returns Success status
   */
  unmountPlugin(pluginId) {
    return this.pluginInterface.unmountPlugin(pluginId);
  }
  /**
   * Get mounted plugin information
   * @param pluginId - Plugin identifier
   * @returns Plugin information or undefined
   */
  getPluginInfo(pluginId) {
    return this.pluginInterface.getPluginInfo(pluginId);
  }
  /**
   * Get all mounted plugin IDs
   * @returns Array of plugin IDs
   */
  getMountedPluginIds() {
    return this.pluginInterface.getMountedPluginIds();
  }
  /**
   * Set priority for an event type
   * @param eventType - Event type
   * @param priority - Priority level (MUSICAL_DYNAMICS value)
   */
  setPriority(eventType, priority) {
    console.log(`🎼 MusicalConductor: Set priority for ${eventType}: ${priority}`);
  }
  /**
   * Start a musical sequence with Sequential Orchestration and Resource Management
   * @param sequenceId - ID of the sequence to start
   * @param data - Data to pass to the sequence
   * @param priority - Priority level: 'HIGH', 'NORMAL', 'CHAINED'
   * @returns Request ID for tracking
   */
  startSequence(sequenceId, data = {}, priority = _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.NORMAL) {
    const result = this.sequenceOrchestrator.startSequence(sequenceId, data, priority);
    if (!result.success) {
      if (result.isDuplicate) {
        return result.requestId; // Return duplicate request ID for tracking
      }
      throw new Error(result.reason || "Failed to start sequence");
    }
    return result.requestId;
  }
  /**
   * Create execution context for a sequence
   * @param sequenceRequest - Sequence request
   */
  createExecutionContext(sequenceRequest) {
    return this.sequenceOrchestrator.createExecutionContext(sequenceRequest);
  }
  /**
   * Get current statistics (enhanced with CIA plugin information)
   */
  getStatistics() {
    return this.conductorAPI.getStatistics();
  }
  /**
   * Get conductor status including eventBus availability
   * @returns Conductor status object
   */
  getStatus() {
    return this.conductorAPI.getStatus();
  }
  /**
   * Reset statistics
   */
  resetStatistics() {
    this.conductorAPI.resetStatistics();
    this.performanceTracker.reset();
    this.duplicationDetector.reset();
    console.log("🎼 MusicalConductor: All monitoring data reset");
  }
  /**
   * Get queue status
   */
  getQueueStatus() {
    return this.executionQueue.getStatus();
  }
  /**
   * Emit an event through the event bus
   * @param eventType - Event type
   * @param eventData - Event data
   * @param executionContext - Execution context
   */
  emitEvent(eventType, eventData, executionContext) {
    const result = this.eventOrchestrator.emitEvent(eventType, eventData, executionContext);
    if (!result.success) {
      throw new Error(result.error || "Failed to emit event");
    }
  }
  // ===== Orchestration Validation Compliance Methods =====
  /**
   * Queue a sequence for execution (validation compliance method)
   * @param sequenceId - ID of the sequence to queue
   * @param data - Data to pass to the sequence
   * @param priority - Priority level
   * @returns Request ID for tracking
   */
  queueSequence(sequenceId, data = {}, priority = _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.NORMAL) {
    return this.conductorAPI.queueSequence(sequenceId, data, priority);
  }
  /**
   * Execute the next sequence in queue (validation compliance method)
   * @returns Success status
   */
  executeNextSequence() {
    return this.conductorAPI.executeNextSequence();
  }
  /**
   * Check if a sequence is currently running (validation compliance method)
   * @param sequenceId - Optional sequence ID to check for specific sequence
   * @returns True if a sequence is executing (or specific sequence if ID provided)
   */
  isSequenceRunning(sequenceId) {
    return this.conductorAPI.isSequenceRunning(sequenceId);
  }
  /**
   * Get the currently executing sequence (validation compliance method)
   * @returns Current sequence execution context or null
   */
  getCurrentSequence() {
    return this.conductorAPI.getCurrentSequence();
  }
  /**
   * 🎽 Update the data baton payload for the currently executing sequence
   * This allows plugin handlers to pass data between beats
   * @param payloadData - Data to merge into the current payload
   * @returns Success status
   */
  updatePayload(payloadData) {
    return this.conductorAPI.updateDataBaton(payloadData);
  }
  /**
   * 🎽 Get the current data baton payload
   * @returns Current payload or null if no active sequence
   */
  getPayload() {
    return this.conductorAPI.getDataBaton();
  }
  /**
   * Get all queued sequences (validation compliance method)
   * @returns Array of queued sequence requests
   */
  getQueuedSequences() {
    return this.conductorAPI.getQueuedSequences();
  }
  /**
   * Clear the sequence queue (validation compliance method)
   * @returns Number of sequences that were cleared
   */
  clearSequenceQueue() {
    return this.conductorAPI.clearSequenceQueue();
  }
  /**
   * Get resource ownership information (MCO/MSO diagnostic method)
   * @returns Resource ownership map
   */
  getResourceOwnership() {
    return this.resourceConflictManager.getResourceOwnership();
  }
  /**
   * Get symphony resource mapping (MCO/MSO diagnostic method)
   * @returns Symphony to resources mapping
   */
  getSymphonyResourceMap() {
    return this.resourceConflictManager.getSymphonyResourceMap();
  }
  /**
   * Get sequence instances (MCO/MSO diagnostic method)
   * @returns Sequence instances map
   */
  getSequenceInstances() {
    return this.resourceManager.getSequenceInstances();
  }
}
MusicalConductor.instance = null;

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/SequenceTypes.js":
/*!************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/SequenceTypes.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MUSICAL_CONDUCTOR_EVENT_TYPES: () => (/* binding */ MUSICAL_CONDUCTOR_EVENT_TYPES),
/* harmony export */   MUSICAL_DYNAMICS: () => (/* binding */ MUSICAL_DYNAMICS),
/* harmony export */   MUSICAL_TIMING: () => (/* binding */ MUSICAL_TIMING),
/* harmony export */   SEQUENCE_PRIORITIES: () => (/* binding */ SEQUENCE_PRIORITIES)
/* harmony export */ });
/* unused harmony exports SEQUENCE_CATEGORIES, MUSICAL_SEQUENCE_TEMPLATE */
/* harmony import */ var _event_types_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../event-types/index.js */ "./test-app/dist/modules/communication/event-types/index.js");
/**
 * Musical Sequence Types and Constants (TypeScript)
 *
 * Defines the structure and types for musical sequences in the RenderX system.
 * Provides type safety and standardized interfaces for sequence orchestration.
 */
// Re-export EVENT_TYPES from the event-types module for convenience

/**
 * Musical Dynamics - Volume/Intensity levels for sequence events
 * Used to indicate the priority and intensity of sequence events
 */
const MUSICAL_DYNAMICS = {
  PIANISSIMO: "pp",
  // Very soft - lowest priority
  PIANO: "p",
  // Soft - low priority
  MEZZO_PIANO: "mp",
  // Medium soft - medium-low priority
  MEZZO_FORTE: "mf",
  // Medium loud - medium priority
  FORTE: "f",
  // Loud - high priority
  FORTISSIMO: "ff" // Very loud - highest priority
};
/**
 * Musical Timing - When events should be executed in the sequence
 * Controls the timing and coordination of sequence events
 */
const MUSICAL_TIMING = {
  IMMEDIATE: "immediate",
  // Execute immediately when beat is reached
  AFTER_BEAT: "after-beat",
  // Execute after dependencies complete
  DELAYED: "delayed",
  // Execute with intentional delay
  SYNCHRONIZED: "synchronized" // Execute synchronized with other events
};
/**
 * Sequence Categories - Organizational categories for sequences
 */
const SEQUENCE_CATEGORIES = {
  COMPONENT_UI: "component-ui",
  // UI component interactions
  CANVAS_OPERATIONS: "canvas-operations",
  // Canvas manipulation
  DATA_FLOW: "data-flow",
  // Data processing and flow
  SYSTEM_EVENTS: "system-events",
  // System-level events
  USER_INTERACTIONS: "user-interactions",
  // User input handling
  INTEGRATION: "integration" // External integrations
};
/**
 * Musical Conductor Event Types
 * Events related to musical sequence conductor and orchestration
 */
const MUSICAL_CONDUCTOR_EVENT_TYPES = {
  // Conductor Lifecycle
  CONDUCTOR_INITIALIZED: "conductor-initialized",
  CONDUCTOR_DESTROYED: "conductor-destroyed",
  CONDUCTOR_RESET: "conductor-reset",
  // Sequence Management
  SEQUENCE_DEFINED: "sequence-defined",
  SEQUENCE_UNDEFINED: "sequence-undefined",
  SEQUENCE_REGISTERED: "sequence-registered",
  SEQUENCE_UNREGISTERED: "sequence-unregistered",
  // Sequence Execution
  SEQUENCE_STARTED: "sequence-started",
  SEQUENCE_COMPLETED: "sequence-completed",
  SEQUENCE_FAILED: "sequence-failed",
  SEQUENCE_CANCELLED: "sequence-cancelled",
  SEQUENCE_PAUSED: "sequence-paused",
  SEQUENCE_RESUMED: "sequence-resumed",
  // Beat Execution
  BEAT_STARTED: "beat-started",
  BEAT_COMPLETED: "beat-completed",
  BEAT_FAILED: "beat-failed",
  // Movement Execution
  MOVEMENT_STARTED: "movement-started",
  MOVEMENT_COMPLETED: "movement-completed",
  MOVEMENT_FAILED: "movement-failed",
  // Queue Management
  SEQUENCE_QUEUED: "sequence-queued",
  SEQUENCE_DEQUEUED: "sequence-dequeued",
  QUEUE_PROCESSED: "queue-processed",
  // Statistics
  STATISTICS_UPDATED: "statistics-updated"
};
/**
 * Default Musical Sequence Template
 * Template for creating new musical sequences
 */
const MUSICAL_SEQUENCE_TEMPLATE = {
  id: "template-sequence",
  name: "Template Sequence",
  description: "Template for creating new musical sequences",
  key: "C Major",
  tempo: 120,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.COMPONENT_UI,
  movements: [{
    id: "template-movement",
    name: "Template Movement",
    description: "Template movement with example beats",
    beats: [{
      beat: 1,
      event: "template-event" /* handlers listen/subscribe to events/beats via the conductor */,
      title: "Template Beat",
      description: "Example beat for template",
      dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
      timing: MUSICAL_TIMING.IMMEDIATE,
      data: {},
      errorHandling: "continue"
    }]
  }],
  metadata: {
    version: "1.0.0",
    author: "RenderX System",
    created: new Date(),
    tags: ["template", "example"]
  }
};
/**
 * Priority Levels for Sequence Execution
 */
const SEQUENCE_PRIORITIES = {
  HIGH: "HIGH",
  // Execute immediately, bypass queue
  NORMAL: "NORMAL",
  // Normal queue processing
  CHAINED: "CHAINED" // Execute after current sequence completes
};

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/api/ConductorAPI.js":
/*!***************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/api/ConductorAPI.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConductorAPI: () => (/* binding */ ConductorAPI)
/* harmony export */ });
/* harmony import */ var _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/**
 * ConductorAPI - Public API surface for MusicalConductor
 * Handles validation compliance methods, statistics, and sequence management queries
 */

class ConductorAPI {
  constructor(sequenceOrchestrator, sequenceExecutor, executionQueue, statisticsManager, pluginInterface, sequenceRegistry, eventBus) {
    this.sequenceOrchestrator = sequenceOrchestrator;
    this.sequenceExecutor = sequenceExecutor;
    this.executionQueue = executionQueue;
    this.statisticsManager = statisticsManager;
    this.pluginInterface = pluginInterface;
    this.sequenceRegistry = sequenceRegistry;
    this.eventBus = eventBus;
  }
  /**
   * Queue a sequence for execution (validation compliance method)
   * @param sequenceId - ID of the sequence to queue
   * @param data - Data to pass to the sequence
   * @param priority - Priority level
   * @returns Request ID for tracking
   */
  queueSequence(sequenceId, data = {}, priority = _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.NORMAL) {
    // This is an alias for startSequence to satisfy validation requirements
    const result = this.sequenceOrchestrator.startSequence(sequenceId, data, priority);
    if (!result.success) {
      if (result.isDuplicate) {
        return result.requestId; // Return duplicate request ID for tracking
      }
      throw new Error(result.reason || "Failed to queue sequence");
    }
    return result.requestId;
  }
  /**
   * Execute the next sequence in queue (validation compliance method)
   * @returns Success status
   */
  executeNextSequence() {
    if (this.executionQueue.isEmpty()) {
      return false;
    }
    if (this.sequenceExecutor.isSequenceRunning()) {
      return false; // Already executing a sequence
    }
    // Trigger queue processing
    this.sequenceOrchestrator.processSequenceQueue();
    return true;
  }
  /**
   * Check if a sequence is currently running (validation compliance method)
   * @param sequenceId - Optional sequence ID to check for specific sequence
   * @returns True if a sequence is executing (or specific sequence if ID provided)
   */
  isSequenceRunning(sequenceId) {
    return this.sequenceExecutor.isSequenceRunning(sequenceId);
  }
  /**
   * Get the currently executing sequence (validation compliance method)
   * @returns Current sequence execution context or null
   */
  getCurrentSequence() {
    return this.sequenceExecutor.getCurrentSequence();
  }
  /**
   * Get queued sequences (validation compliance method)
   * @returns Array of queued sequence names
   */
  getQueuedSequences() {
    return this.executionQueue.getQueuedRequests().map(request => request.sequenceName);
  }
  /**
   * Clear the sequence queue (validation compliance method)
   * @returns Number of sequences that were cleared
   */
  clearSequenceQueue() {
    const clearedCount = this.executionQueue.size();
    this.executionQueue.clear();
    console.log(`🎼 ConductorAPI: Cleared ${clearedCount} sequences from queue`);
    return clearedCount;
  }
  /**
   * Get queue status information
   * @returns Queue status object
   */
  getQueueStatus() {
    const nextRequest = this.executionQueue.peek();
    return {
      size: this.executionQueue.size(),
      isEmpty: this.executionQueue.isEmpty(),
      isProcessing: this.sequenceExecutor.isSequenceRunning(),
      nextSequence: nextRequest?.sequenceName
    };
  }
  /**
   * Get current statistics (enhanced with CIA plugin information)
   * @returns Enhanced statistics object
   */
  getStatistics() {
    return this.statisticsManager.getEnhancedStatistics(this.pluginInterface.getMountedPluginIds().length);
  }
  /**
   * Get conductor status including eventBus availability
   * @returns Conductor status object
   */
  getStatus() {
    return {
      statistics: this.getStatistics(),
      eventBus: !!this.eventBus,
      sequences: this.sequenceRegistry.getNames().length,
      plugins: this.pluginInterface.getMountedPluginIds().length
    };
  }
  /**
   * Reset statistics
   */
  resetStatistics() {
    this.statisticsManager.reset();
    console.log("🎼 ConductorAPI: Statistics reset");
  }
  /**
   * Update the data baton payload for the currently executing sequence
   * This allows plugin handlers to pass data between beats
   * @param payloadData - Data to merge into the current payload
   * @returns Success status
   */
  updateDataBaton(payloadData) {
    const currentSequence = this.sequenceExecutor.getCurrentSequence();
    if (!currentSequence) {
      console.warn("🎽 ConductorAPI: No active sequence to update data baton");
      return false;
    }
    try {
      // Merge the new payload data with existing payload
      Object.assign(currentSequence.payload, payloadData);
      console.log(`🎽 ConductorAPI: Updated data baton for sequence ${currentSequence.sequenceName}`, payloadData);
      return true;
    } catch (error) {
      console.error("🎽 ConductorAPI: Failed to update data baton:", error);
      return false;
    }
  }
  /**
   * Get the current data baton payload
   * @returns Current payload data or null if no active sequence
   */
  getDataBaton() {
    const currentSequence = this.sequenceExecutor.getCurrentSequence();
    if (!currentSequence) {
      return null;
    }
    return {
      ...currentSequence.payload
    }; // Return a copy to prevent external modification
  }
  /**
   * Clear the data baton payload
   * @returns Success status
   */
  clearDataBaton() {
    const currentSequence = this.sequenceExecutor.getCurrentSequence();
    if (!currentSequence) {
      console.warn("🎽 ConductorAPI: No active sequence to clear data baton");
      return false;
    }
    try {
      currentSequence.payload = {};
      console.log(`🎽 ConductorAPI: Cleared data baton for sequence ${currentSequence.sequenceName}`);
      return true;
    } catch (error) {
      console.error("🎽 ConductorAPI: Failed to clear data baton:", error);
      return false;
    }
  }
  /**
   * Get all registered sequence names
   * @returns Array of sequence names
   */
  getRegisteredSequences() {
    return this.sequenceRegistry.getNames();
  }
  /**
   * Check if a sequence is registered
   * @param sequenceId - ID of the sequence to check
   * @returns True if sequence is registered
   */
  isSequenceRegistered(sequenceId) {
    return this.sequenceRegistry.has(sequenceId);
  }
  /**
   * Check if a sequence is registered by name (for backward compatibility)
   * @param sequenceName - Name of the sequence to check
   * @returns True if sequence is registered
   */
  isSequenceRegisteredByName(sequenceName) {
    return this.sequenceRegistry.findByName(sequenceName) !== undefined;
  }
  /**
   * Get mounted plugin information
   * @returns Array of mounted plugin IDs
   */
  getMountedPlugins() {
    return this.pluginInterface.getMountedPluginIds();
  }
  /**
   * Check if a plugin is mounted
   * @param pluginId - ID of the plugin to check
   * @returns True if plugin is mounted
   */
  isPluginMounted(pluginId) {
    return this.pluginInterface.getMountedPluginIds().includes(pluginId);
  }
  /**
   * Get comprehensive debug information
   * @returns Debug information object
   */
  getDebugInfo() {
    return {
      api: {
        queueStatus: this.getQueueStatus(),
        statistics: this.getStatistics(),
        registeredSequences: this.getRegisteredSequences(),
        mountedPlugins: this.getMountedPlugins()
      },
      orchestration: this.sequenceOrchestrator.getDebugInfo()
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/core/ConductorCore.js":
/*!*****************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/core/ConductorCore.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConductorCore: () => (/* binding */ ConductorCore)
/* harmony export */ });
/* harmony import */ var _SPAValidator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../SPAValidator.js */ "./test-app/dist/modules/communication/SPAValidator.js");
/**
 * ConductorCore - Core singleton management and initialization
 * Handles the fundamental lifecycle of the MusicalConductor
 */

class ConductorCore {
  constructor(eventBus) {
    this.eventSubscriptions = [];
    this.beatLoggingInitialized = false;
    this.eventBus = eventBus;
    this.spaValidator = _SPAValidator_js__WEBPACK_IMPORTED_MODULE_0__.SPAValidator.getInstance();
    this.initialize();
  }
  /**
   * Get singleton instance of ConductorCore
   * @param eventBus - Required for first initialization
   * @returns ConductorCore instance
   */
  static getInstance(eventBus) {
    if (!ConductorCore.instance) {
      if (!eventBus) {
        throw new Error("EventBus is required for first initialization");
      }
      ConductorCore.instance = new ConductorCore(eventBus);
    }
    return ConductorCore.instance;
  }
  /**
   * Reset the singleton instance (primarily for testing)
   */
  static resetInstance() {
    if (ConductorCore.instance) {
      ConductorCore.instance.cleanup();
      ConductorCore.instance = null;
    }
  }
  /**
   * Get the EventBus instance
   */
  getEventBus() {
    return this.eventBus;
  }
  /**
   * Get the SPAValidator instance
   */
  getSPAValidator() {
    return this.spaValidator;
  }
  /**
   * Initialize core functionality
   */
  initialize() {
    this.setupBeatExecutionLogging();
    console.log("🎼 ConductorCore: Initialized successfully");
  }
  /**
   * Setup beat execution logging with hierarchical support
   */
  setupBeatExecutionLogging() {
    if (this.beatLoggingInitialized) {
      console.log("🎼 Beat execution logging already initialized, skipping...");
      return;
    }
    console.log("🎼 ConductorCore: Setting up beat execution logging...");
    // Subscribe to beat started events for hierarchical logging
    const beatStartedUnsubscribe = this.eventBus.subscribe("musical-conductor:beat:started", data => {
      if (this.shouldEnableHierarchicalLogging()) {
        this.logBeatStartedHierarchical(data);
      }
    });
    // Subscribe to beat completed events for hierarchical logging
    const beatCompletedUnsubscribe = this.eventBus.subscribe("musical-conductor:beat:completed", data => {
      if (this.shouldEnableHierarchicalLogging()) {
        this.logBeatCompletedHierarchical(data);
      }
    });
    // Subscribe to beat error events for non-hierarchical logging
    const beatErrorUnsubscribe = this.eventBus.subscribe("musical-conductor:beat:error", data => {
      if (!this.shouldEnableHierarchicalLogging()) {
        console.error("🎼 Beat execution error:", data);
      }
    });
    // Store unsubscribe functions for cleanup
    this.eventSubscriptions.push(beatStartedUnsubscribe, beatCompletedUnsubscribe, beatErrorUnsubscribe);
    this.beatLoggingInitialized = true;
    console.log("✅ Beat execution logging initialized");
  }
  /**
   * Log beat started event in hierarchical format
   */
  logBeatStartedHierarchical(data) {
    const {
      sequenceName,
      movementName,
      beatNumber,
      eventType,
      timing
    } = data;
    console.log(`🎼 ┌─ Beat ${beatNumber} Started`);
    console.log(`🎼 │  Sequence: ${sequenceName}`);
    console.log(`🎼 │  Movement: ${movementName}`);
    console.log(`🎼 │  Event: ${eventType}`);
    console.log(`🎼 │  Timing: ${timing}`);
    // Log the Data Baton - show payload contents at each beat
    if (data.payload) {
      console.log(`🎽 │  Data Baton:`, data.payload);
    }
  }
  /**
   * Log beat completed event in hierarchical format
   */
  logBeatCompletedHierarchical(data) {
    const {
      sequenceName,
      movementName,
      beatNumber,
      duration
    } = data;
    console.log(`🎼 └─ Beat ${beatNumber} Completed`);
    console.log(`🎼    Duration: ${duration}ms`);
    console.log(`🎼    Sequence: ${sequenceName}`);
    console.log(`🎼    Movement: ${movementName}`);
  }
  /**
   * Determine if hierarchical logging should be enabled
   * This can be configured based on environment or settings
   */
  shouldEnableHierarchicalLogging() {
    // For now, return true. This can be made configurable later
    return true;
  }
  /**
   * Cleanup resources and event subscriptions
   */
  cleanup() {
    console.log("🎼 ConductorCore: Cleaning up...");
    // Unsubscribe from all events
    this.eventSubscriptions.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn("🎼 Error during event unsubscription:", error);
      }
    });
    this.eventSubscriptions = [];
    this.beatLoggingInitialized = false;
    console.log("✅ ConductorCore: Cleanup completed");
  }
  /**
   * Check if the core is properly initialized
   */
  isInitialized() {
    return this.beatLoggingInitialized && !!this.eventBus && !!this.spaValidator;
  }
}
ConductorCore.instance = null;

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/core/EventSubscriptionManager.js":
/*!****************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/core/EventSubscriptionManager.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventSubscriptionManager: () => (/* binding */ EventSubscriptionManager)
/* harmony export */ });
/**
 * EventSubscriptionManager - Manages event subscriptions with SPA compliance
 * Handles authorized event subscriptions and prevents direct EventBus access violations
 */
class EventSubscriptionManager {
  constructor(eventBus, spaValidator) {
    this.eventBus = eventBus;
    this.spaValidator = spaValidator;
  }
  /**
   * Subscribe to events through the conductor (SPA-compliant)
   * This method ensures all event subscriptions go through the conductor
   * and prevents direct eventBus access violations
   * @param eventName - The event name to subscribe to
   * @param callback - The callback function to execute
   * @param context - Optional context for the subscription
   * @returns Unsubscribe function
   */
  subscribe(eventName, callback, context) {
    // Validate caller is allowed to subscribe
    const stack = new Error().stack || "";
    const callerInfo = this.spaValidator.analyzeCallStack(stack);
    if (!this.isAuthorizedSubscriber(callerInfo)) {
      const violation = this.spaValidator.createViolation("UNAUTHORIZED_CONDUCTOR_SUBSCRIBE", callerInfo.pluginId || "unknown", `Unauthorized conductor.subscribe() call from ${callerInfo.source}`, stack, "error");
      this.spaValidator.handleViolation(violation);
      if (this.spaValidator.config.strictMode) {
        throw new Error(`Unauthorized conductor.subscribe() call from ${callerInfo.source}`);
      }
    }
    // Internal eventBus.subscribe() call with conductor context
    return this.eventBus.subscribe(eventName, callback, {
      ...context,
      conductorManaged: true,
      subscribedVia: "conductor"
    });
  }
  /**
   * Unsubscribe from events through the conductor (SPA-compliant)
   * @param eventName - The event name to unsubscribe from
   * @param callback - The callback function to remove
   */
  unsubscribe(eventName, callback) {
    // Validate caller is allowed to unsubscribe
    const stack = new Error().stack || "";
    const callerInfo = this.spaValidator.analyzeCallStack(stack);
    if (!this.isAuthorizedSubscriber(callerInfo)) {
      const violation = this.spaValidator.createViolation("UNAUTHORIZED_CONDUCTOR_UNSUBSCRIBE", callerInfo.pluginId || "unknown", `Unauthorized conductor.unsubscribe() call from ${callerInfo.source}`, stack, "error");
      this.spaValidator.handleViolation(violation);
      if (this.spaValidator.config.strictMode) {
        throw new Error(`Unauthorized conductor.unsubscribe() call from ${callerInfo.source}`);
      }
    }
    // Internal eventBus.unsubscribe() call
    this.eventBus.unsubscribe(eventName, callback);
  }
  /**
   * Check if the caller is authorized to subscribe/unsubscribe
   * @param callerInfo - Information about the caller from stack analysis
   * @returns True if authorized
   */
  isAuthorizedSubscriber(callerInfo) {
    // Allow React components to use conductor.subscribe()
    if (callerInfo.isReactComponent) {
      return true;
    }
    // Allow plugins to use conductor.subscribe() within mount method
    if (callerInfo.isPlugin && callerInfo.isInMountMethod) {
      return true;
    }
    // Allow conductor internal usage
    if (callerInfo.source === "MusicalConductor") {
      return true;
    }
    // Allow conductor core components
    if (callerInfo.source?.includes("ConductorCore") || callerInfo.source?.includes("SequenceExecutor") || callerInfo.source?.includes("PluginManager")) {
      return true;
    }
    return false;
  }
  /**
   * Create a managed subscription that tracks the subscriber
   * @param eventName - The event name to subscribe to
   * @param callback - The callback function
   * @param subscriberId - Identifier for the subscriber
   * @param context - Optional context
   * @returns Unsubscribe function
   */
  createManagedSubscription(eventName, callback, subscriberId, context) {
    console.log(`🎼 EventSubscriptionManager: Creating managed subscription for ${subscriberId} -> ${eventName}`);
    const enhancedCallback = data => {
      try {
        callback(data);
      } catch (error) {
        console.error(`🎼 EventSubscriptionManager: Error in subscription callback for ${eventName}:`, error);
        console.error(`🎼 Subscriber: ${subscriberId}`);
      }
    };
    return this.eventBus.subscribe(eventName, enhancedCallback, {
      ...context,
      subscriberId,
      managedByEventSubscriptionManager: true
    });
  }
  /**
   * Emit an event through the subscription manager
   * This provides a controlled way to emit events with validation
   * @param eventName - The event name to emit
   * @param data - The data to emit
   * @param emitterId - Identifier for the emitter
   */
  emit(eventName, data, emitterId) {
    if (emitterId) {
      console.log(`🎼 EventSubscriptionManager: ${emitterId} emitting ${eventName}`);
    }
    this.eventBus.emit(eventName, data);
  }
  /**
   * Get subscription statistics
   * @returns Statistics about current subscriptions
   */
  getSubscriptionStatistics() {
    const debugInfo = this.eventBus.getDebugInfo();
    return {
      totalSubscriptions: debugInfo.totalSubscriptions,
      subscriptionCounts: debugInfo.subscriptionCounts
    };
  }
  /**
   * Validate that an event subscription is properly authorized
   * @param eventName - The event name being subscribed to
   * @param callerInfo - Information about the caller
   * @returns Validation result
   */
  validateSubscription(eventName, callerInfo) {
    // Check for direct EventBus access attempts
    if (callerInfo.isDirectEventBusAccess) {
      return {
        isValid: false,
        reason: "Direct EventBus access detected",
        recommendation: "Use conductor.subscribe() instead of eventBus.subscribe()"
      };
    }
    // Check for unauthorized plugin access
    if (callerInfo.isPlugin && !callerInfo.isInMountMethod) {
      return {
        isValid: false,
        reason: "Plugin subscribing outside of mount method",
        recommendation: "Move event subscriptions to the plugin's mount method"
      };
    }
    // Check for React component violations
    if (callerInfo.isReactComponent && callerInfo.isDirectEventBusAccess) {
      return {
        isValid: false,
        reason: "React component using direct EventBus access",
        recommendation: "Use conductor.subscribe() in React components"
      };
    }
    return {
      isValid: true
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/core/SequenceRegistry.js":
/*!********************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/core/SequenceRegistry.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SequenceRegistry: () => (/* binding */ SequenceRegistry)
/* harmony export */ });
/* harmony import */ var _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/**
 * SequenceRegistry - Manages registration and retrieval of musical sequences
 * Provides a centralized registry for all musical sequences
 */

class SequenceRegistry {
  constructor(eventBus) {
    this.sequences = new Map();
    this.eventSubscriptionManager = null;
    this.eventBus = eventBus;
  }
  /**
   * Set the EventSubscriptionManager for SPA-compliant event emission
   * @param eventSubscriptionManager - The EventSubscriptionManager instance
   */
  setEventSubscriptionManager(eventSubscriptionManager) {
    this.eventSubscriptionManager = eventSubscriptionManager;
  }
  /**
   * Register a musical sequence
   * @param sequence - The sequence to register
   */
  register(sequence) {
    if (!sequence) {
      throw new Error("Sequence cannot be null or undefined");
    }
    if (!sequence.id) {
      throw new Error("Sequence must have an id");
    }
    if (!sequence.name) {
      throw new Error("Sequence must have a name");
    }
    // Validate sequence structure
    this.validateSequence(sequence);
    this.sequences.set(sequence.id, sequence);
    console.log(`🎼 SequenceRegistry: Registered sequence "${sequence.name}" (id: ${sequence.id})`);
    // Emit registration event using EventSubscriptionManager for SPA compliance
    if (this.eventSubscriptionManager) {
      this.eventSubscriptionManager.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_REGISTERED, {
        sequenceId: sequence.id,
        sequenceName: sequence.name,
        category: sequence.category
      }, "SequenceRegistry");
    } else {
      // Fallback to direct eventBus.emit() for backward compatibility
      // This should only happen during initialization before EventSubscriptionManager is set
      console.warn("🎼 SequenceRegistry: EventSubscriptionManager not set, using direct eventBus.emit()");
      this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_REGISTERED, {
        sequenceId: sequence.id,
        sequenceName: sequence.name,
        category: sequence.category
      });
    }
  }
  /**
   * Unregister a sequence by id
   * @param sequenceId - ID of the sequence to unregister
   */
  unregister(sequenceId) {
    if (!sequenceId) {
      throw new Error("Sequence ID is required");
    }
    const sequence = this.sequences.get(sequenceId);
    if (sequence) {
      this.sequences.delete(sequenceId);
      console.log(`🎼 SequenceRegistry: Unregistered sequence "${sequence.name}" (id: ${sequenceId})`);
      // Emit unregistration event using EventSubscriptionManager for SPA compliance
      if (this.eventSubscriptionManager) {
        this.eventSubscriptionManager.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_UNREGISTERED, {
          sequenceId,
          sequenceName: sequence.name
        }, "SequenceRegistry");
      } else {
        // Fallback to direct eventBus.emit() for backward compatibility
        console.warn("🎼 SequenceRegistry: EventSubscriptionManager not set, using direct eventBus.emit()");
        this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_UNREGISTERED, {
          sequenceId,
          sequenceName: sequence.name
        });
      }
    } else {
      console.warn(`🎼 SequenceRegistry: Sequence with ID "${sequenceId}" not found for unregistration`);
    }
  }
  /**
   * Get a sequence by id
   * @param sequenceId - ID of the sequence to retrieve
   * @returns The sequence or undefined if not found
   */
  get(sequenceId) {
    if (!sequenceId) {
      return undefined;
    }
    return this.sequences.get(sequenceId);
  }
  /**
   * Get all registered sequences
   * @returns Array of all registered sequences
   */
  getAll() {
    return Array.from(this.sequences.values());
  }
  /**
   * Get all sequence IDs
   * @returns Array of sequence IDs
   */
  getIds() {
    return Array.from(this.sequences.keys());
  }
  /**
   * Get all sequence names
   * @returns Array of sequence names
   */
  getNames() {
    return Array.from(this.sequences.values()).map(seq => seq.name);
  }
  /**
   * Check if a sequence is registered
   * @param sequenceId - ID of the sequence to check
   * @returns True if the sequence is registered
   */
  has(sequenceId) {
    if (!sequenceId) {
      return false;
    }
    return this.sequences.has(sequenceId);
  }
  /**
   * Get the number of registered sequences
   * @returns Number of registered sequences
   */
  size() {
    return this.sequences.size;
  }
  /**
   * Clear all registered sequences
   */
  clear() {
    const sequences = this.getAll();
    this.sequences.clear();
    console.log(`🎼 SequenceRegistry: Cleared ${sequences.length} sequences`);
    // Emit individual unregistration events for each cleared sequence using EventSubscriptionManager for SPA compliance
    sequences.forEach(sequence => {
      if (this.eventSubscriptionManager) {
        this.eventSubscriptionManager.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_UNREGISTERED, {
          sequenceId: sequence.id,
          sequenceName: sequence.name
        }, "SequenceRegistry");
      } else {
        // Fallback to direct eventBus.emit() for backward compatibility
        console.warn("🎼 SequenceRegistry: EventSubscriptionManager not set, using direct eventBus.emit()");
        this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_UNREGISTERED, {
          sequenceId: sequence.id,
          sequenceName: sequence.name
        });
      }
    });
  }
  /**
   * Get sequences by category
   * @param category - The category to filter by
   * @returns Array of sequences in the specified category
   */
  getByCategory(category) {
    if (!category) {
      return [];
    }
    return this.getAll().filter(sequence => sequence.category === category);
  }
  /**
   * Find a sequence by name (for backward compatibility)
   * @param sequenceName - Name of the sequence to find
   * @returns The sequence or undefined if not found
   */
  findByName(sequenceName) {
    if (!sequenceName) {
      return undefined;
    }
    return this.getAll().find(sequence => sequence.name === sequenceName);
  }
  /**
   * Validate sequence structure
   * @param sequence - The sequence to validate
   */
  validateSequence(sequence) {
    // Basic structure validation
    if (!sequence.movements || !Array.isArray(sequence.movements)) {
      throw new Error(`Sequence "${sequence.name}" (id: ${sequence.id}) must have a movements array`);
    }
    if (sequence.movements.length === 0) {
      throw new Error(`Sequence "${sequence.name}" (id: ${sequence.id}) must have at least one movement`);
    }
    // Validate each movement
    sequence.movements.forEach((movement, index) => {
      if (!movement.id) {
        throw new Error(`Movement ${index} in sequence "${sequence.name}" (id: ${sequence.id}) must have an id`);
      }
      if (!movement.name) {
        throw new Error(`Movement ${index} in sequence "${sequence.name}" (id: ${sequence.id}) must have a name`);
      }
      if (!movement.beats || !Array.isArray(movement.beats)) {
        throw new Error(`Movement "${movement.name}" in sequence "${sequence.name}" must have a beats array`);
      }
      if (movement.beats.length === 0) {
        throw new Error(`Movement "${movement.name}" in sequence "${sequence.name}" must have at least one beat`);
      }
      // Validate each beat
      movement.beats.forEach((beat, beatIndex) => {
        if (typeof beat.beat !== "number" || beat.beat < 1) {
          throw new Error(`Beat ${beatIndex} in movement "${movement.name}" must have a valid beat number (>= 1)`);
        }
        if (!beat.event || typeof beat.event !== "string") {
          throw new Error(`Beat ${beatIndex} in movement "${movement.name}" must have a valid event name`);
        }
        if (!beat.dynamics) {
          throw new Error(`Beat ${beatIndex} in movement "${movement.name}" must have dynamics specified`);
        }
      });
    });
    console.log(`✅ SequenceRegistry: Sequence "${sequence.name}" validation passed`);
  }
  /**
   * Get registry statistics
   * @returns Statistics about the registry
   */
  getStatistics() {
    const sequences = this.getAll();
    const sequencesByCategory = {};
    let totalMovements = 0;
    let totalBeats = 0;
    sequences.forEach(sequence => {
      // Count by category
      const category = sequence.category || "uncategorized";
      sequencesByCategory[category] = (sequencesByCategory[category] || 0) + 1;
      // Count movements and beats
      totalMovements += sequence.movements.length;
      sequence.movements.forEach(movement => {
        totalBeats += movement.beats.length;
      });
    });
    return {
      totalSequences: sequences.length,
      sequencesByCategory,
      totalMovements,
      totalBeats
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/execution/BeatExecutor.js":
/*!*********************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/execution/BeatExecutor.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BeatExecutor: () => (/* binding */ BeatExecutor)
/* harmony export */ });
/* harmony import */ var _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/**
 * BeatExecutor - Executes individual beats within movements
 * Handles beat-level event emission and error handling
 */

class BeatExecutor {
  constructor(eventBus, spaValidator) {
    // Beat execution state
    this.isExecutingBeat = false;
    this.beatExecutionQueue = [];
    this.eventBus = eventBus;
    this.spaValidator = spaValidator;
  }
  /**
   * Execute a single beat
   * @param beat - The beat to execute
   * @param executionContext - The sequence execution context
   * @param sequence - The parent sequence
   * @param movement - The parent movement
   */
  async executeBeat(beat, executionContext, sequence, movement) {
    // Ensure sequential beat execution (no simultaneous beats)
    if (this.isExecutingBeat) {
      return new Promise((resolve, reject) => {
        this.beatExecutionQueue.push({
          beat,
          context: executionContext,
          resolve,
          reject
        });
      });
    }
    this.isExecutingBeat = true;
    try {
      const startTime = Date.now();
      // Emit beat started event
      this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_STARTED, {
        sequenceName: sequence.name,
        movementName: movement.name,
        beat: beat.beat,
        event: beat.event,
        title: beat.title,
        dynamics: beat.dynamics,
        timing: beat.timing,
        requestId: executionContext.id,
        payload: executionContext.data
      });
      // Create contextual event data
      const contextualEventData = this.createContextualEventData(beat, executionContext, sequence, movement);
      // Emit the actual beat event
      this.eventBus.emit(beat.event, contextualEventData);
      // Handle beat completion
      const executionTime = Date.now() - startTime;
      // Emit beat completed event
      this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_COMPLETED, {
        sequenceName: sequence.name,
        movementName: movement.name,
        beat: beat.beat,
        event: beat.event,
        executionTime,
        requestId: executionContext.id
      });
      console.log(`✅ BeatExecutor: Beat ${beat.beat} (${beat.event}) completed in ${executionTime}ms`);
    } catch (error) {
      // Handle beat execution error
      console.error(`❌ BeatExecutor: Beat ${beat.beat} (${beat.event}) failed:`, error);
      // Add error to execution context
      executionContext.errors.push({
        beat: beat.beat,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });
      // Emit beat failed event
      this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_FAILED, {
        sequenceName: sequence.name,
        movementName: movement.name,
        beat: beat.beat,
        event: beat.event,
        error: error instanceof Error ? error.message : String(error),
        requestId: executionContext.id
      });
      // Handle error based on beat's error handling strategy
      if (beat.errorHandling === "abort-sequence") {
        throw error;
      } else if (beat.errorHandling === "continue") {
        console.log(`⚠️ BeatExecutor: Continuing execution despite beat error (errorHandling: continue)`);
      }
    } finally {
      this.isExecutingBeat = false;
      // Process next beat in queue if any
      if (this.beatExecutionQueue.length > 0) {
        const nextBeat = this.beatExecutionQueue.shift();
        setImmediate(() => {
          this.executeBeat(nextBeat.beat, nextBeat.context, sequence, movement).then(nextBeat.resolve).catch(nextBeat.reject);
        });
      }
    }
  }
  /**
   * Create contextual event data for beat execution
   * @param beat - The beat being executed
   * @param executionContext - The sequence execution context
   * @param sequence - The parent sequence
   * @param movement - The parent movement
   * @returns Contextual event data
   */
  createContextualEventData(beat, executionContext, sequence, movement) {
    // Merge beat data with execution context data
    const contextualData = {
      ...executionContext.data,
      ...beat.data
    };
    // Add musical context
    const musicalContext = {
      sequence: {
        name: sequence.name,
        tempo: sequence.tempo,
        key: sequence.key,
        timeSignature: sequence.timeSignature
      },
      movement: {
        name: movement.name,
        description: movement.description
      },
      beat: {
        number: beat.beat,
        event: beat.event,
        title: beat.title,
        description: beat.description,
        dynamics: beat.dynamics,
        timing: beat.timing
      },
      execution: {
        requestId: executionContext.id,
        priority: executionContext.priority,
        currentMovement: executionContext.currentMovement,
        currentBeat: executionContext.currentBeat,
        completedBeats: executionContext.completedBeats.length,
        totalBeats: this.calculateTotalBeats(executionContext.sequence)
      }
    };
    return {
      ...contextualData,
      _musicalContext: musicalContext,
      _timestamp: Date.now(),
      _eventBus: this.eventBus
    };
  }
  /**
   * Validate beat structure
   * @param beat - The beat to validate
   * @returns True if valid
   */
  validateBeat(beat) {
    try {
      // Check required properties
      if (typeof beat.beat !== "number" || beat.beat < 1) {
        throw new Error("Beat must have a valid beat number (>= 1)");
      }
      if (!beat.event || typeof beat.event !== "string") {
        throw new Error("Beat must have a valid event name");
      }
      if (!beat.title || typeof beat.title !== "string") {
        throw new Error("Beat must have a valid title");
      }
      if (!beat.dynamics || !Object.values(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_DYNAMICS).includes(beat.dynamics)) {
        throw new Error("Beat must have valid dynamics");
      }
      if (!beat.timing || !Object.values(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING).includes(beat.timing)) {
        throw new Error("Beat must have valid timing");
      }
      if (!beat.errorHandling || !["continue", "abort-sequence", "retry"].includes(beat.errorHandling)) {
        throw new Error("Beat must have valid error handling strategy");
      }
      return true;
    } catch (error) {
      console.error(`❌ BeatExecutor: Beat validation failed for beat ${beat.beat}:`, error);
      return false;
    }
  }
  /**
   * Get beat execution statistics
   * @param beat - The beat to analyze
   * @returns Beat statistics
   */
  getBeatStatistics(beat) {
    return {
      beatNumber: beat.beat,
      event: beat.event,
      dynamics: beat.dynamics || "unknown",
      timing: beat.timing || "unknown",
      errorHandling: beat.errorHandling || "continue",
      hasData: !!beat.data && Object.keys(beat.data).length > 0,
      dataKeys: beat.data ? Object.keys(beat.data) : []
    };
  }
  /**
   * Estimate beat execution time based on dynamics and timing
   * @param beat - The beat to analyze
   * @param baseTempo - Base tempo in BPM
   * @returns Estimated execution time in milliseconds
   */
  estimateBeatExecutionTime(beat, baseTempo = 120) {
    const baseDuration = 60 / baseTempo * 1000; // Base beat duration in ms
    // Adjust for dynamics (affects perceived execution time)
    let dynamicsMultiplier = 1;
    switch (beat.dynamics) {
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_DYNAMICS.PIANISSIMO:
        dynamicsMultiplier = 0.8;
        break;
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_DYNAMICS.PIANO:
        dynamicsMultiplier = 0.9;
        break;
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_DYNAMICS.MEZZO_PIANO:
        dynamicsMultiplier = 0.95;
        break;
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_DYNAMICS.MEZZO_FORTE:
        dynamicsMultiplier = 1.05;
        break;
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_DYNAMICS.FORTE:
        dynamicsMultiplier = 1.1;
        break;
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_DYNAMICS.FORTISSIMO:
        dynamicsMultiplier = 1.2;
        break;
      default:
        dynamicsMultiplier = 1;
    }
    // Adjust for timing
    let timingMultiplier = 1;
    switch (beat.timing) {
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING.IMMEDIATE:
        timingMultiplier = 0;
        break;
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING.AFTER_BEAT:
        timingMultiplier = 1;
        break;
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING.SYNCHRONIZED:
        timingMultiplier = 0.5;
        break;
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING.DELAYED:
        timingMultiplier = 1.5;
        break;
      default:
        timingMultiplier = 1;
    }
    return Math.round(baseDuration * dynamicsMultiplier * timingMultiplier);
  }
  /**
   * Clear the beat execution queue
   */
  clearBeatQueue() {
    this.beatExecutionQueue = [];
    console.log("🧹 BeatExecutor: Beat execution queue cleared");
  }
  /**
   * Get current beat execution status
   * @returns Execution status information
   */
  getExecutionStatus() {
    return {
      isExecuting: this.isExecutingBeat,
      queueLength: this.beatExecutionQueue.length
    };
  }
  /**
   * Calculate total beats in a sequence
   * @param sequence - The sequence to analyze
   * @returns Total number of beats
   */
  calculateTotalBeats(sequence) {
    return sequence.movements.reduce((total, movement) => total + movement.beats.length, 0);
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/execution/ExecutionQueue.js":
/*!***********************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/execution/ExecutionQueue.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExecutionQueue: () => (/* binding */ ExecutionQueue)
/* harmony export */ });
/* harmony import */ var _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/**
 * ExecutionQueue - Manages sequential orchestration of musical sequences
 * Provides priority-based queue management for sequence execution
 */

class ExecutionQueue {
  constructor() {
    this.queue = [];
    this.priorities = new Map();
    this.completedCount = 0;
    this.currentlyExecuting = null;
  }
  /**
   * Add a sequence request to the queue
   * @param request - The sequence request to enqueue
   */
  enqueue(request) {
    if (!request) {
      throw new Error("Request cannot be null or undefined");
    }
    // Set priority if specified
    if (request.priority) {
      this.priorities.set(request.requestId, request.priority);
    }
    // Insert based on priority
    this.insertByPriority(request);
    console.log(`🎼 ExecutionQueue: Enqueued "${request.sequenceName}" with priority ${request.priority || "NORMAL"} (Queue size: ${this.queue.length})`);
  }
  /**
   * Remove and return the next sequence request from the queue
   * @returns The next sequence request or null if queue is empty
   */
  dequeue() {
    if (this.queue.length === 0) {
      return null;
    }
    const request = this.queue.shift();
    console.log(`🎼 ExecutionQueue: Dequeued "${request.sequenceName}"`);
    return request;
  }
  /**
   * Peek at the next sequence request without removing it
   * @returns The next sequence request or null if queue is empty
   */
  peek() {
    return this.queue.length > 0 ? this.queue[0] : null;
  }
  /**
   * Clear all requests from the queue
   * @returns Number of requests that were cleared
   */
  clear() {
    const clearedCount = this.queue.length;
    this.queue = [];
    this.priorities.clear();
    console.log(`🎼 ExecutionQueue: Cleared ${clearedCount} requests from queue`);
    return clearedCount;
  }
  /**
   * Get the current queue status
   * @returns Queue status information
   */
  getStatus() {
    return {
      pending: this.queue.length,
      executing: this.currentlyExecuting ? 1 : 0,
      completed: this.completedCount,
      length: this.queue.length,
      activeSequence: this.currentlyExecuting?.sequenceName || null
    };
  }
  /**
   * Check if the queue is empty
   * @returns True if the queue is empty
   */
  isEmpty() {
    return this.queue.length === 0;
  }
  /**
   * Get the current queue size
   * @returns Number of requests in the queue
   */
  size() {
    return this.queue.length;
  }
  /**
   * Set the currently executing request
   * @param request - The request that is now executing
   */
  setCurrentlyExecuting(request) {
    this.currentlyExecuting = request;
    if (request) {
      console.log(`🎼 ExecutionQueue: Now executing "${request.sequenceName}"`);
    } else {
      console.log(`🎼 ExecutionQueue: No sequence currently executing`);
    }
  }
  /**
   * Mark a sequence as completed
   * @param request - The completed request
   */
  markCompleted(request) {
    this.completedCount++;
    if (this.currentlyExecuting?.requestId === request.requestId) {
      this.currentlyExecuting = null;
    }
    console.log(`🎼 ExecutionQueue: Marked "${request.sequenceName}" as completed (Total completed: ${this.completedCount})`);
  }
  /**
   * Get all queued sequence requests
   * @returns Array of queued requests
   */
  getQueuedRequests() {
    return [...this.queue]; // Return a copy to prevent external modification
  }
  /**
   * Get the currently executing request
   * @returns The currently executing request or null
   */
  getCurrentlyExecuting() {
    return this.currentlyExecuting;
  }
  /**
   * Set priority for a specific event type
   * @param eventType - The event type
   * @param priority - The priority level
   */
  setPriority(eventType, priority) {
    this.priorities.set(eventType, priority);
    console.log(`🎼 ExecutionQueue: Set priority for "${eventType}" to ${priority}`);
  }
  /**
   * Get priority for a specific event type
   * @param eventType - The event type
   * @returns The priority level or NORMAL if not set
   */
  getPriority(eventType) {
    return this.priorities.get(eventType) || _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.NORMAL;
  }
  /**
   * Insert a request into the queue based on priority
   * @param request - The request to insert
   */
  insertByPriority(request) {
    const priority = request.priority || _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.NORMAL;
    // HIGH priority goes to the front
    if (priority === _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.HIGH) {
      this.queue.unshift(request);
      return;
    }
    // CHAINED priority goes after HIGH but before NORMAL
    if (priority === _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.CHAINED) {
      // Find the first non-HIGH priority item
      let insertIndex = 0;
      while (insertIndex < this.queue.length && this.queue[insertIndex].priority === _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.HIGH) {
        insertIndex++;
      }
      this.queue.splice(insertIndex, 0, request);
      return;
    }
    // NORMAL priority goes to the end
    this.queue.push(request);
  }
  /**
   * Get queue statistics
   * @returns Statistics about the queue
   */
  getStatistics() {
    const priorityDistribution = {};
    this.queue.forEach(request => {
      const priority = request.priority || _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.NORMAL;
      priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1;
    });
    return {
      totalEnqueued: this.completedCount + this.queue.length + (this.currentlyExecuting ? 1 : 0),
      totalCompleted: this.completedCount,
      currentQueueLength: this.queue.length,
      priorityDistribution
    };
  }
  /**
   * Find requests by sequence name
   * @param sequenceName - The sequence name to search for
   * @returns Array of matching requests
   */
  findBySequenceName(sequenceName) {
    return this.queue.filter(request => request.sequenceName === sequenceName);
  }
  /**
   * Remove requests by sequence name
   * @param sequenceName - The sequence name to remove
   * @returns Number of requests removed
   */
  removeBySequenceName(sequenceName) {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(request => request.sequenceName !== sequenceName);
    const removedCount = initialLength - this.queue.length;
    if (removedCount > 0) {
      console.log(`🎼 ExecutionQueue: Removed ${removedCount} requests for sequence "${sequenceName}"`);
    }
    return removedCount;
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/execution/MovementExecutor.js":
/*!*************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/execution/MovementExecutor.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MovementExecutor: () => (/* binding */ MovementExecutor)
/* harmony export */ });
/* harmony import */ var _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/* harmony import */ var _BeatExecutor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BeatExecutor.js */ "./test-app/dist/modules/communication/sequences/execution/BeatExecutor.js");
/**
 * MovementExecutor - Executes individual movements within a sequence
 * Handles movement-level orchestration and beat coordination
 */


class MovementExecutor {
  constructor(eventBus, spaValidator) {
    this.eventBus = eventBus;
    this.spaValidator = spaValidator;
    this.beatExecutor = new _BeatExecutor_js__WEBPACK_IMPORTED_MODULE_1__.BeatExecutor(eventBus, spaValidator);
  }
  /**
   * Execute a movement within a sequence
   * @param movement - The movement to execute
   * @param executionContext - The sequence execution context
   * @param sequence - The parent sequence
   */
  async executeMovement(movement, executionContext, sequence) {
    console.log(`🎵 MovementExecutor: Starting movement "${movement.name}" with ${movement.beats.length} beats`);
    // Emit movement started event
    this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.MOVEMENT_STARTED, {
      sequenceName: sequence.name,
      movementName: movement.name,
      requestId: executionContext.id,
      beatsCount: movement.beats.length
    });
    try {
      // Execute beats in sequence
      for (let beatIndex = 0; beatIndex < movement.beats.length; beatIndex++) {
        const beat = movement.beats[beatIndex];
        executionContext.currentBeat = beat.beat;
        console.log(`🥁 MovementExecutor: Executing beat ${beat.beat} (${beatIndex + 1}/${movement.beats.length})`);
        // Execute the beat
        await this.beatExecutor.executeBeat(beat, executionContext, sequence, movement);
        // Update execution context
        executionContext.completedBeats.push(beat.beat);
        // Handle timing between beats
        await this.handleBeatTiming(beat, sequence);
      }
      // Emit movement completed event
      this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.MOVEMENT_COMPLETED, {
        sequenceName: sequence.name,
        movementName: movement.name,
        requestId: executionContext.id,
        beatsExecuted: movement.beats.length
      });
      console.log(`✅ MovementExecutor: Movement "${movement.name}" completed successfully`);
    } catch (error) {
      // Handle movement execution error
      console.error(`❌ MovementExecutor: Movement "${movement.name}" failed:`, error);
      // Add error to execution context
      executionContext.errors.push({
        beat: executionContext.currentBeat,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });
      // Emit movement failed event
      this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.MOVEMENT_FAILED, {
        sequenceName: sequence.name,
        movementName: movement.name,
        requestId: executionContext.id,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
  /**
   * Handle timing between beats based on sequence tempo and beat timing
   * @param beat - The current beat
   * @param sequence - The parent sequence
   */
  async handleBeatTiming(beat, sequence) {
    // Skip timing for immediate beats
    if (beat.timing === _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING.IMMEDIATE) {
      return;
    }
    // Calculate delay based on sequence tempo
    const tempo = sequence.tempo || 120; // Default 120 BPM
    const beatDuration = 60 / tempo * 1000; // Convert to milliseconds
    let delay = 0;
    switch (beat.timing) {
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING.AFTER_BEAT:
        delay = beatDuration;
        break;
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING.DELAYED:
        delay = beatDuration * 1.5;
        break;
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING.SYNCHRONIZED:
        delay = beatDuration / 2;
        break;
      case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING.IMMEDIATE:
      default:
        delay = 0;
    }
    if (delay > 0) {
      console.log(`⏱️ MovementExecutor: Waiting ${delay}ms for beat timing (${beat.timing})`);
      await this.sleep(delay);
    }
  }
  /**
   * Sleep for a specified duration
   * @param ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  /**
   * Validate movement structure
   * @param movement - The movement to validate
   * @returns True if valid
   */
  validateMovement(movement) {
    try {
      // Check required properties
      if (!movement.name || typeof movement.name !== "string") {
        throw new Error("Movement must have a valid name");
      }
      if (!movement.beats || !Array.isArray(movement.beats)) {
        throw new Error("Movement must have a beats array");
      }
      if (movement.beats.length === 0) {
        throw new Error("Movement must have at least one beat");
      }
      // Validate each beat
      movement.beats.forEach((beat, index) => {
        if (typeof beat.beat !== "number" || beat.beat < 1) {
          throw new Error(`Beat ${index} must have a valid beat number (>= 1)`);
        }
        if (!beat.event || typeof beat.event !== "string") {
          throw new Error(`Beat ${index} must have a valid event name`);
        }
        if (!beat.dynamics) {
          throw new Error(`Beat ${index} must have dynamics specified`);
        }
        if (!beat.timing) {
          throw new Error(`Beat ${index} must have timing specified`);
        }
      });
      return true;
    } catch (error) {
      console.error(`❌ MovementExecutor: Movement validation failed for "${movement.name}":`, error);
      return false;
    }
  }
  /**
   * Get movement execution statistics
   * @param movement - The movement to analyze
   * @returns Movement statistics
   */
  getMovementStatistics(movement) {
    const beatTypes = {};
    const timingDistribution = {};
    const dynamicsDistribution = {};
    movement.beats.forEach(beat => {
      // Count beat types (events)
      beatTypes[beat.event] = (beatTypes[beat.event] || 0) + 1;
      // Count timing distribution
      const timing = beat.timing || "unknown";
      timingDistribution[timing] = (timingDistribution[timing] || 0) + 1;
      // Count dynamics distribution
      const dynamics = beat.dynamics || "unknown";
      dynamicsDistribution[dynamics] = (dynamicsDistribution[dynamics] || 0) + 1;
    });
    return {
      name: movement.name,
      totalBeats: movement.beats.length,
      beatTypes,
      timingDistribution,
      dynamicsDistribution
    };
  }
  /**
   * Estimate movement execution time
   * @param movement - The movement to analyze
   * @param tempo - The sequence tempo (BPM)
   * @returns Estimated execution time in milliseconds
   */
  estimateExecutionTime(movement, tempo = 120) {
    const beatDuration = 60 / tempo * 1000; // Base beat duration in ms
    let totalTime = 0;
    movement.beats.forEach(beat => {
      switch (beat.timing) {
        case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING.IMMEDIATE:
          totalTime += 0;
          break;
        case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING.AFTER_BEAT:
          totalTime += beatDuration;
          break;
        case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING.SYNCHRONIZED:
          totalTime += beatDuration / 2;
          break;
        case _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_TIMING.DELAYED:
          totalTime += beatDuration * 1.5;
          break;
        default:
          totalTime += beatDuration;
      }
    });
    return Math.round(totalTime);
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/execution/SequenceExecutor.js":
/*!*************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/execution/SequenceExecutor.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SequenceExecutor: () => (/* binding */ SequenceExecutor)
/* harmony export */ });
/* harmony import */ var _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/* harmony import */ var _MovementExecutor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./MovementExecutor.js */ "./test-app/dist/modules/communication/sequences/execution/MovementExecutor.js");
/**
 * SequenceExecutor - Main sequence execution orchestration
 * Handles the execution of musical sequences with proper timing and error handling
 */


class SequenceExecutor {
  constructor(eventBus, spaValidator, executionQueue, statistics) {
    // Current execution state
    this.activeSequence = null;
    this.sequenceHistory = [];
    // Beat-level orchestration: Ensure no simultaneous beat execution
    this.isExecutingBeat = false;
    this.beatExecutionQueue = [];
    this.eventBus = eventBus;
    this.spaValidator = spaValidator;
    this.executionQueue = executionQueue;
    this.statistics = statistics;
    this.movementExecutor = new _MovementExecutor_js__WEBPACK_IMPORTED_MODULE_1__.MovementExecutor(eventBus, spaValidator);
  }
  /**
   * Execute a sequence with proper orchestration
   * @param sequenceRequest - The sequence request to execute
   * @param sequence - The musical sequence to execute
   * @returns Promise that resolves when sequence completes
   */
  async executeSequence(sequenceRequest, sequence) {
    const startTime = Date.now();
    const executionId = sequenceRequest.requestId;
    // Create execution context
    const executionContext = {
      id: executionId,
      sequenceId: sequence.id,
      sequenceName: sequence.name,
      sequence: sequence,
      data: sequenceRequest.data || {},
      payload: {},
      startTime,
      currentMovement: 0,
      currentBeat: 0,
      completedBeats: [],
      errors: [],
      priority: sequenceRequest.priority || _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.NORMAL,
      executionType: "IMMEDIATE"
    };
    // Set as active sequence
    this.activeSequence = executionContext;
    this.executionQueue.setCurrentlyExecuting(sequenceRequest);
    try {
      // Emit sequence started event
      this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_STARTED, {
        sequenceName: sequence.name,
        requestId: executionId,
        priority: sequenceRequest.priority,
        data: sequenceRequest.data
      });
      // Execute all movements in sequence
      for (let i = 0; i < sequence.movements.length; i++) {
        const movement = sequence.movements[i];
        executionContext.currentMovement = i;
        executionContext.currentBeat = 0;
        console.log(`🎼 SequenceExecutor: Executing movement "${movement.name}" (${i + 1}/${sequence.movements.length})`);
        await this.movementExecutor.executeMovement(movement, executionContext, sequence);
      }
      // Mark sequence as completed
      const executionTime = Date.now() - startTime;
      // Update statistics
      this.updateStatistics(executionContext, executionTime);
      // Emit sequence completed event
      this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_COMPLETED, {
        sequenceName: sequence.name,
        requestId: executionId,
        executionTime,
        beatsExecuted: executionContext.completedBeats.length,
        errors: executionContext.errors.length
      });
      // Add to history and clear active sequence
      this.sequenceHistory.push(executionContext);
      this.activeSequence = null;
      this.executionQueue.markCompleted(sequenceRequest);
      console.log(`✅ SequenceExecutor: Sequence "${sequence.name}" completed in ${executionTime}ms`);
      return executionId;
    } catch (error) {
      // Handle sequence execution error
      const executionTime = Date.now() - startTime;
      executionContext.errors.push({
        beat: executionContext.currentBeat,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });
      // Emit sequence failed event
      this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_FAILED, {
        sequenceName: sequence.name,
        requestId: executionId,
        error: error instanceof Error ? error.message : String(error),
        executionTime
      });
      // Add to history and clear active sequence
      this.sequenceHistory.push(executionContext);
      this.activeSequence = null;
      this.executionQueue.markCompleted(sequenceRequest);
      console.error(`❌ SequenceExecutor: Sequence "${sequence.name}" failed:`, error);
      throw error;
    }
  }
  /**
   * Check if a sequence is currently executing
   * @param sequenceName - Optional sequence name to check
   * @returns True if executing
   */
  isSequenceRunning(sequenceName) {
    if (!this.activeSequence) {
      return false;
    }
    if (sequenceName) {
      return this.activeSequence.sequenceName === sequenceName;
    }
    return true;
  }
  /**
   * Get the currently executing sequence
   * @returns Current sequence context or null
   */
  getCurrentSequence() {
    return this.activeSequence;
  }
  /**
   * Stop the current sequence execution
   */
  stopExecution() {
    if (this.activeSequence) {
      console.log(`🛑 SequenceExecutor: Stopping execution of "${this.activeSequence.sequenceName}"`);
      // Add cancellation error to track the cancellation
      this.activeSequence.errors.push({
        beat: this.activeSequence.currentBeat,
        error: "Sequence execution cancelled",
        timestamp: Date.now()
      });
      // Emit sequence cancelled event
      this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_CANCELLED, {
        sequenceName: this.activeSequence.sequenceName,
        requestId: this.activeSequence.id
      });
      // Add to history and clear active sequence
      this.sequenceHistory.push(this.activeSequence);
      this.activeSequence = null;
    }
  }
  /**
   * Get execution history
   * @returns Array of completed sequence executions
   */
  getExecutionHistory() {
    return [...this.sequenceHistory];
  }
  /**
   * Clear execution history
   */
  clearExecutionHistory() {
    this.sequenceHistory = [];
    console.log("🧹 SequenceExecutor: Execution history cleared");
  }
  /**
   * Calculate total beats in a sequence
   * @param sequence - The sequence to analyze
   * @returns Total number of beats
   */
  calculateTotalBeats(sequence) {
    return sequence.movements.reduce((total, movement) => total + movement.beats.length, 0);
  }
  /**
   * Update execution statistics
   * @param context - The completed execution context
   * @param executionTime - The execution time in milliseconds
   */
  updateStatistics(context, executionTime) {
    this.statistics.totalSequencesExecuted++;
    this.statistics.totalBeatsExecuted += context.completedBeats.length;
    if (executionTime) {
      // Update average execution time
      const totalTime = this.statistics.averageExecutionTime * (this.statistics.totalSequencesExecuted - 1);
      this.statistics.averageExecutionTime = (totalTime + executionTime) / this.statistics.totalSequencesExecuted;
    }
    // Update completion rate (assume completed if no errors)
    const completedSequences = this.sequenceHistory.filter(s => s.errors.length === 0).length;
    this.statistics.sequenceCompletionRate = completedSequences / this.statistics.totalSequencesExecuted * 100;
    console.log(`📊 SequenceExecutor: Statistics updated - Total: ${this.statistics.totalSequencesExecuted}, Avg Time: ${this.statistics.averageExecutionTime.toFixed(2)}ms`);
  }
  /**
   * Get execution statistics
   * @returns Current execution statistics
   */
  getStatistics() {
    return {
      totalSequencesExecuted: this.statistics.totalSequencesExecuted,
      totalBeatsExecuted: this.statistics.totalBeatsExecuted,
      averageExecutionTime: this.statistics.averageExecutionTime,
      sequenceCompletionRate: this.statistics.sequenceCompletionRate,
      currentlyExecuting: !!this.activeSequence,
      executionHistorySize: this.sequenceHistory.length
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/index.js":
/*!****************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/index.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initializeMusicalSequences: () => (/* binding */ initializeMusicalSequences)
/* harmony export */ });
/* unused harmony exports ALL_SEQUENCES, SEQUENCE_NAMES, MusicalSequences, registerAllSequences, getSequenceByName, getSequencesByCategory, validateAllSequences */
/**
 * Musical Sequences Index
 *
 * Central registration point for all musical sequences in RenderX Evolution.
 * Follows the anti-pattern resolution strategy for proper sequence architecture.
 *
 * This file registers all sequences with the main conductor and provides
 * convenience functions following the established pattern.
 */
/**
 * All Musical Sequences Registry
 * Complete list of all sequences available in the system
 */
const ALL_SEQUENCES = [
  // Canvas sequences now handled by dynamic symphony plugins
];
/**
 * Sequence Name Mapping
 * Maps sequence names to their definitions for easy lookup
 */
const SEQUENCE_NAMES = {
  // Canvas sequences now handled by dynamic symphony plugins
};
/**
 * Musical Sequences API
 * Convenience functions for starting sequences following the anti-pattern resolution strategy
 *
 * Usage Pattern (Replaces Direct Emissions):
 * Instead of: eventBus.emit('event-name', data);
 * Use: MusicalSequences.startEventFlow(eventBus, data);
 */
const MusicalSequences = {
  // Canvas sequences now handled by dynamic symphony plugins
  /**
   * Generic sequence starter for custom sequences
   * @param conductorEventBus - The conductor event bus instance
   * @param sequenceName - Name of the sequence to start
   * @param data - Data to pass to the sequence
   * @param priority - Sequence priority level
   * @returns Sequence execution ID
   */
  startCustomSequence: (conductorEventBus, sequenceName, data = {}, priority = "NORMAL") => {
    return conductorEventBus.startSequence(sequenceName, {
      ...data,
      timestamp: Date.now(),
      sequenceId: `custom-${sequenceName}-${Date.now()}`,
      context: {
        source: "custom-sequence",
        operation: "generic-start",
        phase: "initialization"
      }
    }, priority);
  }
};
/**
 * Register All Sequences with Conductor
 * Registers all sequences with the main musical conductor
 *
 * @param conductor - The musical conductor instance
 */
function registerAllSequences(conductor) {
  console.log("🎼 Registering all musical sequences with conductor...");
  let registeredCount = 0;
  let failedCount = 0;
  for (const sequence of ALL_SEQUENCES) {
    try {
      conductor.registerSequence(sequence);
      registeredCount++;
      console.log(`✅ Registered sequence: ${sequence.name}`);
    } catch (error) {
      failedCount++;
      console.error(`❌ Failed to register sequence: ${sequence.name}`, error);
    }
  }
  console.log(`🎼 Sequence registration complete: ${registeredCount} registered, ${failedCount} failed`);
  // Log sequence categories for debugging
  const categories = new Set(ALL_SEQUENCES.map(seq => seq.category));
  console.log(`📊 Sequence categories: ${Array.from(categories).join(", ")}`);
}
/**
 * Get Sequence by Name
 * Utility function to get a sequence definition by name
 *
 * @param sequenceName - Name of the sequence to find
 * @returns Sequence definition or undefined
 */
function getSequenceByName(sequenceName) {
  return ALL_SEQUENCES.find(seq => seq.name === sequenceName);
}
/**
 * Get Sequences by Category
 * Utility function to get all sequences in a specific category
 *
 * @param category - Sequence category to filter by
 * @returns Array of sequences in the category
 */
function getSequencesByCategory(category) {
  return ALL_SEQUENCES.filter(seq => seq.category === category);
}
/**
 * Validate All Sequences
 * Validates all sequence definitions for completeness and correctness
 *
 * @returns Validation results
 */
function validateAllSequences() {
  const valid = [];
  const invalid = [];
  for (const sequence of ALL_SEQUENCES) {
    const errors = [];
    // Basic validation
    if (!sequence.name) errors.push("Missing sequence name");
    if (!sequence.description) errors.push("Missing sequence description");
    if (!sequence.movements || sequence.movements.length === 0) {
      errors.push("Missing movements");
    }
    // Movement validation
    sequence.movements?.forEach((movement, movementIndex) => {
      if (!movement.name) errors.push(`Movement ${movementIndex}: Missing name`);
      if (!movement.beats || movement.beats.length === 0) {
        errors.push(`Movement ${movementIndex}: Missing beats`);
      }
      // Beat validation
      movement.beats?.forEach((beat, beatIndex) => {
        if (!beat.event) errors.push(`Movement ${movementIndex}, Beat ${beatIndex}: Missing event`);
        if (!beat.dynamics) errors.push(`Movement ${movementIndex}, Beat ${beatIndex}: Missing dynamics`);
      });
    });
    if (errors.length === 0) {
      valid.push(sequence.name);
    } else {
      invalid.push({
        name: sequence.name,
        errors
      });
    }
  }
  return {
    valid,
    invalid
  };
}
/**
 * Initialize Musical Sequences System
 * Complete initialization of the musical sequences system
 *
 * @param conductor - The musical conductor instance
 * @returns Initialization results
 */
function initializeMusicalSequences(conductor) {
  console.log("🎼 Initializing Musical Sequences System...");
  // Validate all sequences first
  const validationResults = validateAllSequences();
  if (validationResults.invalid.length > 0) {
    console.warn("⚠️ Some sequences have validation errors:", validationResults.invalid);
  }
  // Register all valid sequences
  registerAllSequences(conductor);
  // Canvas handlers now registered by dynamic symphony plugins
  const registeredSequences = conductor.getSequenceNames().length;
  const success = registeredSequences > 0;
  console.log(`🎼 Musical Sequences System initialized: ${success ? "SUCCESS" : "FAILED"}`);
  console.log(`📊 Total sequences registered: ${registeredSequences}`);
  return {
    success,
    registeredSequences,
    validationResults
  };
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/monitoring/DuplicationDetector.js":
/*!*****************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/monitoring/DuplicationDetector.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DuplicationDetector: () => (/* binding */ DuplicationDetector)
/* harmony export */ });
/* provided dependency */ var process = __webpack_require__(/*! process/browser */ "./node_modules/process/browser.js");
/**
 * DuplicationDetector - Duplicate sequence detection and StrictMode handling
 * Handles idempotency, duplicate detection, and React StrictMode protection
 */
class DuplicationDetector {
  constructor(config) {
    this.executedSequenceHashes = new Set();
    this.recentExecutions = new Map();
    this.config = {
      idempotencyWindow: 5000,
      // 5 second window for duplicate detection
      maxHashSetSize: 1000,
      // Maximum size to prevent memory leaks
      strictModeThreshold: 100,
      // 100ms threshold for StrictMode detection
      ...config
    };
  }
  /**
   * Check if a sequence request is a duplicate
   * @param sequenceHash - Hash of the sequence request
   * @returns Duplication analysis result
   */
  isDuplicateSequenceRequest(sequenceHash) {
    const now = performance.now();
    const lastExecution = this.recentExecutions.get(sequenceHash);
    if (!lastExecution) {
      return {
        isDuplicate: false,
        timeSinceLastExecution: 0,
        reason: "First execution of this sequence"
      };
    }
    const timeSinceLastExecution = now - lastExecution;
    const isDuplicate = timeSinceLastExecution < this.config.idempotencyWindow;
    if (isDuplicate) {
      const isStrictMode = timeSinceLastExecution < this.config.strictModeThreshold;
      return {
        isDuplicate: true,
        timeSinceLastExecution,
        reason: isStrictMode ? `React StrictMode duplicate detected (${timeSinceLastExecution.toFixed(0)}ms since last)` : `Duplicate within idempotency window (${timeSinceLastExecution.toFixed(0)}ms since last)`,
        isStrictMode
      };
    }
    return {
      isDuplicate: false,
      timeSinceLastExecution,
      reason: `Outside idempotency window (${timeSinceLastExecution.toFixed(0)}ms since last)`
    };
  }
  /**
   * Record a sequence execution
   * @param sequenceHash - Hash of the sequence request
   */
  recordSequenceExecution(sequenceHash) {
    const now = performance.now();
    this.recentExecutions.set(sequenceHash, now);
    this.executedSequenceHashes.add(sequenceHash);
    // Clean up old entries to prevent memory leaks
    this.cleanupOldExecutionRecords();
    console.log(`🔍 DuplicationDetector: Recorded execution of sequence hash: ${sequenceHash.substring(0, 8)}...`);
  }
  /**
   * Check if data indicates a StrictMode duplicate
   * @param data - Sequence data to analyze
   * @returns True if likely StrictMode duplicate
   */
  isStrictModeDuplicate(data) {
    // Check for rapid successive calls (common in StrictMode)
    const now = performance.now();
    if (data.timestamp && typeof data.timestamp === "number") {
      const timeDiff = now - data.timestamp;
      if (timeDiff < this.config.strictModeThreshold) {
        console.warn(`🔍 DuplicationDetector: StrictMode duplicate detected - rapid succession (${timeDiff.toFixed(0)}ms)`);
        return true;
      }
    }
    // Check for React development mode indicators
    if (data._reactInternalFiber || data._reactInternalInstance) {
      console.warn("🔍 DuplicationDetector: StrictMode duplicate detected - React internal properties");
      return true;
    }
    // Check for development mode environment
    if (typeof process !== "undefined" && "development" === "development") {
      // In development mode, be more lenient with duplicate detection
      return false;
    }
    return false;
  }
  /**
   * Generate a hash for sequence request data
   * @param sequenceName - Sequence name
   * @param data - Sequence data
   * @returns Hash string
   */
  generateSequenceHash(sequenceName, data) {
    try {
      // Create a stable hash based on sequence name and data
      const dataString = JSON.stringify(data, Object.keys(data).sort());
      const combined = `${sequenceName}:${dataString}`;
      // Simple hash function (for production, consider using a proper hash library)
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString(36); // Convert to base36 for shorter string
    } catch (error) {
      console.warn("🔍 DuplicationDetector: Failed to generate hash, using fallback:", error);
      return `${sequenceName}-${Date.now()}-${Math.random()}`;
    }
  }
  /**
   * Clean up old execution records to prevent memory leaks
   */
  cleanupOldExecutionRecords() {
    const now = performance.now();
    const cutoffTime = now - this.config.idempotencyWindow;
    // Remove old entries from recent executions
    for (const [hash, timestamp] of this.recentExecutions.entries()) {
      if (timestamp < cutoffTime) {
        this.recentExecutions.delete(hash);
      }
    }
    // Limit the size of executedSequenceHashes to prevent unbounded growth
    if (this.executedSequenceHashes.size > this.config.maxHashSetSize) {
      const hashArray = Array.from(this.executedSequenceHashes);
      const toKeep = hashArray.slice(-this.config.maxHashSetSize / 2); // Keep the most recent half
      this.executedSequenceHashes = new Set(toKeep);
      console.log(`🧹 DuplicationDetector: Cleaned up hash set, kept ${toKeep.length} most recent entries`);
    }
  }
  /**
   * Get duplication statistics
   * @returns Duplication detection statistics
   */
  getStatistics() {
    const now = performance.now();
    const timestamps = Array.from(this.recentExecutions.values());
    return {
      totalHashesTracked: this.executedSequenceHashes.size,
      recentExecutionsTracked: this.recentExecutions.size,
      oldestRecentExecution: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestRecentExecution: timestamps.length > 0 ? Math.max(...timestamps) : null,
      memoryUsageEstimate: this.estimateMemoryUsage()
    };
  }
  /**
   * Estimate memory usage of the detector
   * @returns Estimated memory usage in bytes
   */
  estimateMemoryUsage() {
    // Rough estimation of memory usage
    const hashSetSize = this.executedSequenceHashes.size * 50; // ~50 bytes per hash
    const recentExecutionsSize = this.recentExecutions.size * 60; // ~60 bytes per entry
    return hashSetSize + recentExecutionsSize;
  }
  /**
   * Update configuration
   * @param newConfig - New configuration values
   */
  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    };
    console.log("🔍 DuplicationDetector: Configuration updated:", this.config);
  }
  /**
   * Get current configuration
   * @returns Current configuration
   */
  getConfig() {
    return {
      ...this.config
    };
  }
  /**
   * Check if a hash has been executed before
   * @param sequenceHash - Hash to check
   * @returns True if hash has been executed
   */
  hasBeenExecuted(sequenceHash) {
    return this.executedSequenceHashes.has(sequenceHash);
  }
  /**
   * Get recent execution history
   * @param limit - Maximum number of entries to return
   * @returns Recent execution history
   */
  getRecentExecutions(limit = 10) {
    const now = performance.now();
    return Array.from(this.recentExecutions.entries()).map(([hash, timestamp]) => ({
      hash: hash.substring(0, 8) + "...",
      // Truncate for privacy
      timestamp,
      age: now - timestamp
    })).sort((a, b) => b.timestamp - a.timestamp) // Most recent first
    .slice(0, limit);
  }
  /**
   * Reset all duplication detection data
   */
  reset() {
    this.executedSequenceHashes.clear();
    this.recentExecutions.clear();
    console.log("🧹 DuplicationDetector: All detection data reset");
  }
  /**
   * Get debug information
   * @returns Debug information about duplication detection
   */
  getDebugInfo() {
    return {
      config: this.getConfig(),
      statistics: this.getStatistics(),
      recentExecutions: this.getRecentExecutions(20)
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/monitoring/EventLogger.js":
/*!*********************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/monitoring/EventLogger.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventLogger: () => (/* binding */ EventLogger)
/* harmony export */ });
/* harmony import */ var _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/**
 * EventLogger - Event emission and hierarchical logging
 * Handles all event emission, beat logging, and hierarchical console output
 */

class EventLogger {
  constructor(eventBus, performanceTracker, config) {
    this.beatLoggingInitialized = false;
    this.eventSubscriptions = [];
    this.eventBus = eventBus;
    this.performanceTracker = performanceTracker;
    this.config = {
      enableHierarchicalLogging: true,
      enableEventEmission: true,
      logLevel: "info",
      ...config
    };
  }
  /**
   * Setup beat execution logging with hierarchical format
   */
  setupBeatExecutionLogging() {
    if (this.beatLoggingInitialized) {
      return;
    }
    if (!this.config.enableHierarchicalLogging) {
      console.log("🎼 EventLogger: Hierarchical logging disabled");
      return;
    }
    // Subscribe to beat started events
    const beatStartedUnsubscribe = this.eventBus.subscribe(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_STARTED, data => this.logBeatStartedHierarchical(data), this);
    // Subscribe to beat completed events
    const beatCompletedUnsubscribe = this.eventBus.subscribe(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_COMPLETED, data => this.logBeatCompletedHierarchical(data), this);
    // Store unsubscribe functions for cleanup
    this.eventSubscriptions.push(beatStartedUnsubscribe, beatCompletedUnsubscribe);
    this.beatLoggingInitialized = true;
    console.log("🎼 EventLogger: Hierarchical beat logging initialized");
  }
  /**
   * Log beat started event with hierarchical format
   * @param data - Beat started event data
   */
  logBeatStartedHierarchical(data) {
    // Use PerformanceTracker to track beat timing
    this.performanceTracker.startBeatTiming(data.sequenceName, data.beat);
    // Get movement information from active sequence
    const movementName = this.getMovementNameForBeat(data.sequenceName, data.beat);
    // Create hierarchical log group with enhanced styling
    const groupLabel = `🎵 Beat ${data.beat} Started: ${data.title || data.event} (${data.event})`;
    console.group(groupLabel);
    console.log(`%c🎼 Sequence: ${data.sequenceName}`, "color: #007BFF; font-weight: bold;");
    console.log(`%c🎵 Movement: ${movementName}`, "color: #6F42C1; font-weight: bold;");
    console.log(`%c📊 Beat: ${data.beat}`, "color: #FD7E14; font-weight: bold;");
    console.log(`%c🎯 Event: ${data.event}`, "color: #20C997; font-weight: bold;");
    // Log additional metadata
    console.log({
      sequence: data.sequenceName,
      movement: movementName,
      beat: data.beat,
      type: data.sequenceType || "UNKNOWN",
      timing: data.timing || "immediate",
      dynamics: data.dynamics || "mf"
    });
    // Note: Group will be closed by logBeatCompletedHierarchical
  }
  /**
   * Log beat completed event with hierarchical format
   * @param data - Beat completed event data
   */
  logBeatCompletedHierarchical(data) {
    // Use PerformanceTracker to end beat timing
    const duration = this.performanceTracker.endBeatTiming(data.sequenceName, data.beat);
    if (duration !== null) {
      console.log(`%c✅ Completed in ${duration.toFixed(2)}ms`, "color: #28A745; font-weight: bold;");
    } else {
      console.log(`%c✅ Completed`, "color: #28A745; font-weight: bold;");
    }
    console.groupEnd();
  }
  /**
   * Get movement name for a specific beat in a sequence
   * @param sequenceName - Name of the sequence
   * @param beatNumber - Beat number
   * @returns Movement name or "Unknown Movement"
   */
  getMovementNameForBeat(sequenceName, beatNumber) {
    // This would typically look up the movement from the sequence registry
    // For now, return a placeholder
    return `Movement ${Math.ceil(beatNumber / 4)}`;
  }
  /**
   * Handle beat execution error with proper logging
   * @param executionContext - Sequence execution context
   * @param beat - Beat that failed
   * @param error - Error that occurred
   */
  handleBeatError(executionContext, beat, error) {
    // Emit beat error event
    this.emitEvent(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_FAILED, {
      sequenceName: executionContext.sequenceName,
      beat: beat.beat,
      error: error.message,
      success: false
    });
    // Log error in hierarchical format if enabled
    if (this.config.enableHierarchicalLogging) {
      console.log(`%c❌ Error: ${error.message}`, "color: #DC3545; font-weight: bold;");
      console.groupEnd(); // Close the beat group on error
      // Clean up timing data for failed beat
      this.performanceTracker.cleanupFailedBeat(executionContext.sequenceName, beat.beat);
    }
  }
  /**
   * Emit an event through the event bus
   * @param eventType - Type of event to emit
   * @param data - Event data
   */
  emitEvent(eventType, data) {
    if (!this.config.enableEventEmission) {
      return;
    }
    try {
      this.eventBus.emit(eventType, data);
      if (this.config.logLevel === "debug") {
        console.log(`🎼 EventLogger: Emitted ${eventType}`, data);
      }
    } catch (error) {
      console.error(`🎼 EventLogger: Failed to emit event ${eventType}:`, error);
    }
  }
  /**
   * Log sequence execution start
   * @param sequenceName - Name of the sequence
   * @param executionId - Execution identifier
   * @param data - Sequence data
   */
  logSequenceStart(sequenceName, executionId, data) {
    if (this.config.logLevel === "debug" || this.config.logLevel === "info") {
      console.log(`🎼 EventLogger: Starting sequence ${sequenceName} (${executionId})`, data);
    }
    this.emitEvent(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_STARTED, {
      sequenceName,
      executionId,
      data,
      timestamp: Date.now()
    });
  }
  /**
   * Log sequence execution completion
   * @param sequenceName - Name of the sequence
   * @param executionId - Execution identifier
   * @param success - Whether execution was successful
   * @param duration - Execution duration in milliseconds
   */
  logSequenceComplete(sequenceName, executionId, success, duration) {
    const status = success ? "✅ completed" : "❌ failed";
    const durationText = duration ? ` in ${duration.toFixed(2)}ms` : "";
    if (this.config.logLevel === "debug" || this.config.logLevel === "info") {
      console.log(`🎼 EventLogger: Sequence ${sequenceName} ${status}${durationText}`);
    }
    this.emitEvent(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_COMPLETED, {
      sequenceName,
      executionId,
      success,
      duration,
      timestamp: Date.now()
    });
  }
  /**
   * Log queue operations
   * @param operation - Queue operation type
   * @param sequenceName - Sequence name
   * @param queueLength - Current queue length
   */
  logQueueOperation(operation, sequenceName, queueLength) {
    if (this.config.logLevel === "debug") {
      console.log(`🎼 EventLogger: Queue ${operation} - ${sequenceName} (queue: ${queueLength})`);
    }
    this.emitEvent(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.QUEUE_PROCESSED, {
      operation,
      sequenceName,
      queueLength,
      timestamp: Date.now()
    });
  }
  /**
   * Update logging configuration
   * @param newConfig - New configuration values
   */
  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    };
    console.log("🎼 EventLogger: Configuration updated:", this.config);
  }
  /**
   * Get current configuration
   * @returns Current logging configuration
   */
  getConfig() {
    return {
      ...this.config
    };
  }
  /**
   * Cleanup event subscriptions
   */
  cleanup() {
    if (this.eventSubscriptions.length > 0) {
      this.eventSubscriptions.forEach(unsubscribe => unsubscribe());
      this.eventSubscriptions = [];
      this.beatLoggingInitialized = false;
      console.log("🧹 EventLogger: Event subscriptions cleaned up");
    }
  }
  /**
   * Get debug information
   * @returns Debug logging information
   */
  getDebugInfo() {
    return {
      config: this.getConfig(),
      beatLoggingInitialized: this.beatLoggingInitialized,
      activeSubscriptions: this.eventSubscriptions.length
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/monitoring/PerformanceTracker.js":
/*!****************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/monitoring/PerformanceTracker.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PerformanceTracker: () => (/* binding */ PerformanceTracker)
/* harmony export */ });
/**
 * PerformanceTracker - Performance timing and beat execution tracking
 * Handles beat timing, execution duration tracking, and performance monitoring
 */
class PerformanceTracker {
  constructor() {
    this.beatStartTimes = new Map();
    this.sequenceTimings = new Map();
    this.completedBeats = [];
    this.maxHistorySize = 1000;
  }
  /**
   * Start tracking a beat execution
   * @param sequenceName - Sequence name
   * @param beat - Beat number
   * @returns Beat key for tracking
   */
  startBeatTiming(sequenceName, beat) {
    const beatKey = `${sequenceName}-${beat}`;
    const startTime = performance.now();
    this.beatStartTimes.set(beatKey, startTime);
    console.log(`⏱️ PerformanceTracker: Started timing beat ${beat} for ${sequenceName}`);
    return beatKey;
  }
  /**
   * End tracking a beat execution
   * @param sequenceName - Sequence name
   * @param beat - Beat number
   * @returns Beat duration in milliseconds
   */
  endBeatTiming(sequenceName, beat) {
    const beatKey = `${sequenceName}-${beat}`;
    const startTime = this.beatStartTimes.get(beatKey);
    if (!startTime) {
      console.warn(`⏱️ PerformanceTracker: No start time found for beat ${beat} in ${sequenceName}`);
      return null;
    }
    const endTime = performance.now();
    const duration = endTime - startTime;
    // Record the completed beat
    const beatTiming = {
      sequenceName,
      beat,
      startTime,
      endTime,
      duration
    };
    this.completedBeats.push(beatTiming);
    this.beatStartTimes.delete(beatKey);
    // Maintain history size limit
    if (this.completedBeats.length > this.maxHistorySize) {
      this.completedBeats = this.completedBeats.slice(-this.maxHistorySize / 2);
    }
    console.log(`⏱️ PerformanceTracker: Beat ${beat} completed in ${duration.toFixed(2)}ms`);
    return duration;
  }
  /**
   * Clean up timing data for a failed beat
   * @param sequenceName - Sequence name
   * @param beat - Beat number
   */
  cleanupFailedBeat(sequenceName, beat) {
    const beatKey = `${sequenceName}-${beat}`;
    this.beatStartTimes.delete(beatKey);
    console.warn(`⏱️ PerformanceTracker: Cleaned up failed beat ${beat} for ${sequenceName}`);
  }
  /**
   * Start tracking a sequence execution
   * @param sequenceName - Sequence name
   * @param executionId - Execution identifier
   */
  startSequenceTiming(sequenceName, executionId) {
    const startTime = performance.now();
    this.sequenceTimings.set(executionId, {
      sequenceName,
      startTime,
      beatCount: 0
    });
    console.log(`⏱️ PerformanceTracker: Started timing sequence ${sequenceName} (${executionId})`);
  }
  /**
   * End tracking a sequence execution
   * @param executionId - Execution identifier
   * @returns Sequence duration in milliseconds
   */
  endSequenceTiming(executionId) {
    const timing = this.sequenceTimings.get(executionId);
    if (!timing) {
      console.warn(`⏱️ PerformanceTracker: No timing found for execution ${executionId}`);
      return null;
    }
    const endTime = performance.now();
    const duration = endTime - timing.startTime;
    timing.endTime = endTime;
    timing.duration = duration;
    console.log(`⏱️ PerformanceTracker: Sequence ${timing.sequenceName} completed in ${duration.toFixed(2)}ms`);
    // Clean up after recording
    this.sequenceTimings.delete(executionId);
    return duration;
  }
  /**
   * Increment beat count for a sequence
   * @param executionId - Execution identifier
   */
  incrementBeatCount(executionId) {
    const timing = this.sequenceTimings.get(executionId);
    if (timing) {
      timing.beatCount++;
    }
  }
  /**
   * Get current beat timing information
   * @param sequenceName - Sequence name
   * @param beat - Beat number
   * @returns Current timing info or null
   */
  getCurrentBeatTiming(sequenceName, beat) {
    const beatKey = `${sequenceName}-${beat}`;
    const startTime = this.beatStartTimes.get(beatKey);
    if (!startTime) {
      return null;
    }
    return {
      startTime,
      elapsed: performance.now() - startTime
    };
  }
  /**
   * Get beat performance statistics
   * @param sequenceName - Optional sequence name filter
   * @returns Beat performance statistics
   */
  getBeatStatistics(sequenceName) {
    const filteredBeats = sequenceName ? this.completedBeats.filter(b => b.sequenceName === sequenceName) : this.completedBeats;
    if (filteredBeats.length === 0) {
      return {
        totalBeats: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        recentBeats: []
      };
    }
    const durations = filteredBeats.map(b => b.duration).filter(d => d !== undefined);
    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    return {
      totalBeats: filteredBeats.length,
      averageDuration,
      minDuration,
      maxDuration,
      recentBeats: filteredBeats.slice(-10) // Last 10 beats
    };
  }
  /**
   * Get active timing information
   * @returns Currently active timings
   */
  getActiveTimings() {
    const now = performance.now();
    const activeBeats = Array.from(this.beatStartTimes.entries()).map(([key, startTime]) => ({
      key,
      elapsed: now - startTime
    }));
    const activeSequences = Array.from(this.sequenceTimings.entries()).map(([executionId, timing]) => ({
      executionId,
      sequenceName: timing.sequenceName,
      elapsed: now - timing.startTime
    }));
    return {
      activeBeats,
      activeSequences
    };
  }
  /**
   * Get performance warnings for long-running operations
   * @param beatThreshold - Beat duration threshold in ms (default: 5000)
   * @param sequenceThreshold - Sequence duration threshold in ms (default: 30000)
   * @returns Performance warnings
   */
  getPerformanceWarnings(beatThreshold = 5000, sequenceThreshold = 30000) {
    const warnings = [];
    const now = performance.now();
    // Check for long-running beats
    for (const [beatKey, startTime] of this.beatStartTimes.entries()) {
      const elapsed = now - startTime;
      if (elapsed > beatThreshold) {
        warnings.push(`Long-running beat: ${beatKey} (${elapsed.toFixed(0)}ms)`);
      }
    }
    // Check for long-running sequences
    for (const [executionId, timing] of this.sequenceTimings.entries()) {
      const elapsed = now - timing.startTime;
      if (elapsed > sequenceThreshold) {
        warnings.push(`Long-running sequence: ${timing.sequenceName} (${elapsed.toFixed(0)}ms)`);
      }
    }
    return warnings;
  }
  /**
   * Reset all performance tracking data
   */
  reset() {
    this.beatStartTimes.clear();
    this.sequenceTimings.clear();
    this.completedBeats = [];
    console.log("🧹 PerformanceTracker: All tracking data reset");
  }
  /**
   * Get debug information
   * @returns Debug performance information
   */
  getDebugInfo() {
    return {
      activeBeats: this.beatStartTimes.size,
      activeSequences: this.sequenceTimings.size,
      completedBeatsHistory: this.completedBeats.length,
      beatStatistics: this.getBeatStatistics(),
      warnings: this.getPerformanceWarnings()
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/monitoring/StatisticsManager.js":
/*!***************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/monitoring/StatisticsManager.js ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StatisticsManager: () => (/* binding */ StatisticsManager)
/* harmony export */ });
/**
 * StatisticsManager - Performance metrics and statistics tracking
 * Handles all conductor statistics, performance metrics, and queue analytics
 */
class StatisticsManager {
  constructor() {
    this.statistics = {
      totalSequencesExecuted: 0,
      totalBeatsExecuted: 0,
      averageExecutionTime: 0,
      totalSequencesQueued: 0,
      currentQueueLength: 0,
      maxQueueLength: 0,
      averageQueueWaitTime: 0,
      errorCount: 0,
      successRate: 0,
      lastExecutionTime: null,
      sequenceCompletionRate: 0,
      chainedSequences: 0
    };
  }
  /**
   * Record a sequence execution
   * @param executionTime - Execution time in milliseconds
   */
  recordSequenceExecution(executionTime) {
    this.statistics.totalSequencesExecuted++;
    // Update average execution time using exponential moving average
    const alpha = 0.1; // Smoothing factor
    this.statistics.averageExecutionTime = this.statistics.averageExecutionTime * (1 - alpha) + executionTime * alpha;
    // Update success rate
    this.updateSuccessRate();
    console.log(`📊 StatisticsManager: Recorded sequence execution (${executionTime.toFixed(2)}ms)`);
  }
  /**
   * Record a beat execution
   */
  recordBeatExecution() {
    this.statistics.totalBeatsExecuted++;
  }
  /**
   * Record an error occurrence
   */
  recordError() {
    this.statistics.errorCount++;
    this.updateSuccessRate();
    console.warn("📊 StatisticsManager: Recorded error occurrence");
  }
  /**
   * Record a sequence being queued
   */
  recordSequenceQueued() {
    this.statistics.totalSequencesQueued++;
    this.statistics.currentQueueLength++;
    this.statistics.maxQueueLength = Math.max(this.statistics.maxQueueLength, this.statistics.currentQueueLength);
  }
  /**
   * Record a sequence being dequeued
   */
  recordSequenceDequeued() {
    if (this.statistics.currentQueueLength > 0) {
      this.statistics.currentQueueLength--;
    }
  }
  /**
   * Update queue wait time statistics
   * @param waitTime - Wait time in milliseconds
   */
  updateQueueWaitTime(waitTime) {
    // Simple moving average calculation
    const alpha = 0.1; // Smoothing factor
    this.statistics.averageQueueWaitTime = this.statistics.averageQueueWaitTime * (1 - alpha) + waitTime * alpha;
  }
  /**
   * Update success rate calculation
   */
  updateSuccessRate() {
    const totalAttempts = this.statistics.totalSequencesExecuted + this.statistics.errorCount;
    if (totalAttempts > 0) {
      this.statistics.successRate = this.statistics.totalSequencesExecuted / totalAttempts * 100;
    } else {
      this.statistics.successRate = 100; // No attempts yet, assume 100%
    }
  }
  /**
   * Get current statistics
   * @returns Current conductor statistics
   */
  getStatistics() {
    return {
      ...this.statistics
    };
  }
  /**
   * Get enhanced statistics with additional metrics
   * @param mountedPlugins - Number of mounted plugins
   * @returns Enhanced statistics
   */
  getEnhancedStatistics(mountedPlugins) {
    return {
      ...this.statistics,
      mountedPlugins
    };
  }
  /**
   * Reset all statistics
   */
  reset() {
    this.statistics = {
      totalSequencesExecuted: 0,
      totalBeatsExecuted: 0,
      averageExecutionTime: 0,
      totalSequencesQueued: 0,
      currentQueueLength: 0,
      maxQueueLength: 0,
      averageQueueWaitTime: 0,
      errorCount: 0,
      successRate: 0,
      lastExecutionTime: null,
      sequenceCompletionRate: 0,
      chainedSequences: 0
    };
    console.log("🧹 StatisticsManager: All statistics reset");
  }
  /**
   * Get performance summary
   * @returns Performance summary object
   */
  getPerformanceSummary() {
    const totalAttempts = this.statistics.totalSequencesExecuted + this.statistics.errorCount;
    const errorRate = totalAttempts > 0 ? this.statistics.errorCount / totalAttempts * 100 : 0;
    return {
      executionEfficiency: this.statistics.successRate,
      queueEfficiency: this.statistics.averageQueueWaitTime > 0 ? Math.max(0, 100 - this.statistics.averageQueueWaitTime / 1000) : 100,
      errorRate,
      throughput: this.statistics.averageExecutionTime > 0 ? 1000 / this.statistics.averageExecutionTime : 0 // sequences per second
    };
  }
  /**
   * Get queue analytics
   * @returns Queue performance analytics
   */
  getQueueAnalytics() {
    return {
      currentLoad: this.statistics.currentQueueLength,
      maxLoadReached: this.statistics.maxQueueLength,
      averageWaitTime: this.statistics.averageQueueWaitTime,
      totalProcessed: this.statistics.totalSequencesQueued
    };
  }
  /**
   * Check if performance thresholds are exceeded
   * @returns Performance warnings
   */
  getPerformanceWarnings() {
    const warnings = [];
    if (this.statistics.averageExecutionTime > 5000) {
      warnings.push("High average execution time (>5s)");
    }
    if (this.statistics.averageQueueWaitTime > 10000) {
      warnings.push("High average queue wait time (>10s)");
    }
    if (this.statistics.successRate < 95) {
      warnings.push("Low success rate (<95%)");
    }
    if (this.statistics.currentQueueLength > 10) {
      warnings.push("High current queue length (>10)");
    }
    if (this.statistics.errorCount > 100) {
      warnings.push("High error count (>100)");
    }
    return warnings;
  }
  /**
   * Export statistics for external monitoring
   * @returns Statistics in monitoring format
   */
  exportForMonitoring() {
    return {
      "conductor.sequences.executed": this.statistics.totalSequencesExecuted,
      "conductor.beats.executed": this.statistics.totalBeatsExecuted,
      "conductor.execution.avg_time_ms": this.statistics.averageExecutionTime,
      "conductor.queue.length": this.statistics.currentQueueLength,
      "conductor.queue.max_length": this.statistics.maxQueueLength,
      "conductor.queue.avg_wait_time_ms": this.statistics.averageQueueWaitTime,
      "conductor.errors.count": this.statistics.errorCount,
      "conductor.success.rate_percent": this.statistics.successRate
    };
  }
  /**
   * Get debug information
   * @returns Debug statistics information
   */
  getDebugInfo() {
    return {
      statistics: this.getStatistics(),
      performanceSummary: this.getPerformanceSummary(),
      queueAnalytics: this.getQueueAnalytics(),
      warnings: this.getPerformanceWarnings()
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/orchestration/EventOrchestrator.js":
/*!******************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/orchestration/EventOrchestrator.js ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventOrchestrator: () => (/* binding */ EventOrchestrator)
/* harmony export */ });
/**
 * EventOrchestrator - Event management and emission system
 * Handles event emission with contextual data, debugging, and special event handling
 */
class EventOrchestrator {
  constructor(eventBus) {
    this.debugMode = false;
    this.eventBus = eventBus;
  }
  /**
   * Emit an event with contextual data from sequence execution
   * @param eventType - Type of event to emit
   * @param data - Event data
   * @param executionContext - Current sequence execution context
   * @returns Event emission result
   */
  emitEvent(eventType, data, executionContext) {
    try {
      // Create contextual event data with execution context
      const contextualEventData = this.createContextualEventData(data, executionContext);
      // Handle special debugging for specific events
      this.handleSpecialEventDebugging(eventType, contextualEventData);
      // Get subscriber count for monitoring
      const subscriberCount = this.eventBus.getSubscriberCount(eventType);
      // Emit the event
      this.eventBus.emit(eventType, contextualEventData);
      // Log successful emission if debug mode is enabled
      if (this.debugMode) {
        console.log(`🎼 EventOrchestrator: Emitted ${eventType} to ${subscriberCount} subscribers`);
      }
      return {
        success: true,
        eventType,
        subscriberCount
      };
    } catch (error) {
      console.error(`🎼 EventOrchestrator: Failed to emit event ${eventType}:`, error);
      return {
        success: false,
        eventType,
        subscriberCount: 0,
        error: error.message
      };
    }
  }
  /**
   * Emit a simple event without execution context
   * @param eventType - Type of event to emit
   * @param data - Event data
   * @returns Event emission result
   */
  emitSimpleEvent(eventType, data) {
    try {
      const subscriberCount = this.eventBus.getSubscriberCount(eventType);
      this.eventBus.emit(eventType, data);
      if (this.debugMode) {
        console.log(`🎼 EventOrchestrator: Emitted simple event ${eventType} to ${subscriberCount} subscribers`);
      }
      return {
        success: true,
        eventType,
        subscriberCount
      };
    } catch (error) {
      console.error(`🎼 EventOrchestrator: Failed to emit simple event ${eventType}:`, error);
      return {
        success: false,
        eventType,
        subscriberCount: 0,
        error: error.message
      };
    }
  }
  /**
   * Create contextual event data with execution context
   * @param originalData - Original event data
   * @param executionContext - Current sequence execution context
   * @returns Contextual event data
   */
  createContextualEventData(originalData, executionContext) {
    return {
      ...originalData,
      // 🎽 Include the data baton in the event context
      context: {
        payload: executionContext.payload,
        executionId: executionContext.id,
        sequenceName: executionContext.sequenceName
      },
      metadata: {
        timestamp: Date.now(),
        beat: executionContext.currentBeat,
        movement: executionContext.currentMovement
      }
    };
  }
  /**
   * Handle special debugging for specific events
   * @param eventType - Type of event
   * @param contextualEventData - Contextual event data
   */
  handleSpecialEventDebugging(eventType, contextualEventData) {
    // Special debugging for sequence events
    if (eventType.includes("sequence")) {
      if (this.debugMode) {
        console.log(`🔍 DEBUG: EventOrchestrator emitting sequence event: ${eventType}`, {
          sequenceName: contextualEventData.context.sequenceName,
          executionId: contextualEventData.context.executionId,
          beat: contextualEventData.metadata.beat
        });
      }
    }
    // Special debugging for beat events
    if (eventType.includes("beat")) {
      if (this.debugMode) {
        console.log(`🔍 DEBUG: EventOrchestrator emitting beat event: ${eventType}`, {
          beat: contextualEventData.metadata.beat,
          movement: contextualEventData.metadata.movement,
          sequenceName: contextualEventData.context.sequenceName
        });
      }
    }
  }
  /**
   * Get subscriber count for an event type
   * @param eventType - Type of event
   * @returns Number of subscribers
   */
  getSubscriberCount(eventType) {
    return this.eventBus.getSubscriberCount(eventType);
  }
  /**
   * Check if an event type has subscribers
   * @param eventType - Type of event
   * @returns True if event has subscribers
   */
  hasSubscribers(eventType) {
    return this.getSubscriberCount(eventType) > 0;
  }
  /**
   * Enable or disable debug mode
   * @param enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`🎼 EventOrchestrator: Debug mode ${enabled ? "enabled" : "disabled"}`);
  }
  /**
   * Get all event types with subscribers
   * @returns Array of event types that have subscribers
   */
  getActiveEventTypes() {
    // This would require EventBus to expose this information
    // For now, return empty array as placeholder
    return [];
  }
  /**
   * Emit multiple events in sequence
   * @param events - Array of events to emit
   * @param executionContext - Current sequence execution context
   * @returns Array of emission results
   */
  emitMultipleEvents(events, executionContext) {
    const results = [];
    for (const event of events) {
      const result = this.emitEvent(event.eventType, event.data, executionContext);
      results.push(result);
      // Stop on first failure if desired
      if (!result.success) {
        console.warn(`🎼 EventOrchestrator: Stopping multiple event emission due to failure: ${result.error}`);
        break;
      }
    }
    return results;
  }
  /**
   * Emit event with retry logic
   * @param eventType - Type of event to emit
   * @param data - Event data
   * @param executionContext - Current sequence execution context
   * @param maxRetries - Maximum number of retries
   * @returns Event emission result
   */
  emitEventWithRetry(eventType, data, executionContext, maxRetries = 3) {
    let lastResult;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      lastResult = this.emitEvent(eventType, data, executionContext);
      if (lastResult.success) {
        if (attempt > 1) {
          console.log(`🎼 EventOrchestrator: Event ${eventType} succeeded on attempt ${attempt}`);
        }
        return lastResult;
      }
      if (attempt < maxRetries) {
        console.warn(`🎼 EventOrchestrator: Event ${eventType} failed on attempt ${attempt}, retrying...`);
        // Small delay before retry
        setTimeout(() => {}, 10);
      }
    }
    console.error(`🎼 EventOrchestrator: Event ${eventType} failed after ${maxRetries} attempts`);
    return lastResult;
  }
  /**
   * Get debug information
   * @returns Debug event orchestration information
   */
  getDebugInfo() {
    return {
      debugMode: this.debugMode,
      totalEventTypes: this.getActiveEventTypes().length,
      activeEventTypes: this.getActiveEventTypes(),
      eventBusAvailable: !!this.eventBus
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/orchestration/SequenceOrchestrator.js":
/*!*********************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/orchestration/SequenceOrchestrator.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SequenceOrchestrator: () => (/* binding */ SequenceOrchestrator)
/* harmony export */ });
/* harmony import */ var _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/**
 * SequenceOrchestrator - Core sequence orchestration engine
 * Handles sequence startup, queue processing, and execution coordination
 */

class SequenceOrchestrator {
  constructor(eventBus, sequenceRegistry, executionQueue, sequenceExecutor, statisticsManager, sequenceValidator, sequenceUtilities, resourceDelegator) {
    this.eventBus = eventBus;
    this.sequenceRegistry = sequenceRegistry;
    this.executionQueue = executionQueue;
    this.sequenceExecutor = sequenceExecutor;
    this.statisticsManager = statisticsManager;
    this.sequenceValidator = sequenceValidator;
    this.sequenceUtilities = sequenceUtilities;
    this.resourceDelegator = resourceDelegator;
  }
  /**
   * Start a musical sequence with Sequential Orchestration and Resource Management
   * @param sequenceId - ID of the sequence to start
   * @param data - Data to pass to the sequence
   * @param priority - Priority level: 'HIGH', 'NORMAL', 'CHAINED'
   * @returns Sequence start result
   */
  startSequence(sequenceId, data = {}, priority = _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.NORMAL) {
    const requestId = this.generateRequestId(sequenceId);
    try {
      // Phase 1: Validate sequence exists
      const sequence = this.sequenceRegistry.get(sequenceId);
      if (!sequence) {
        this.logSequenceNotFound(sequenceId);
        throw new Error(`Sequence with ID "${sequenceId}" not found`);
      }
      // Phase 2: StrictMode Protection & Idempotency Check
      const deduplicationResult = this.sequenceValidator.deduplicateSequenceRequest(sequenceId, sequence.name, data, priority);
      if (deduplicationResult.isDuplicate) {
        return this.handleDuplicateSequence(sequenceId, sequence.name, deduplicationResult);
      }
      // Phase 3: Record sequence execution IMMEDIATELY to prevent race conditions
      this.recordSequenceExecution(deduplicationResult.hash);
      // Phase 4: Extract symphony and resource information
      const orchestrationMetadata = this.extractOrchestrationMetadata(sequenceId, sequence.name, data);
      // Phase 5: Check for resource conflicts
      const conflictResult = this.checkResourceConflicts(orchestrationMetadata, priority);
      if (conflictResult.resolution === "REJECT") {
        console.warn(`🎼 SequenceOrchestrator: Sequence request rejected - ${conflictResult.message}`);
        throw new Error(`Resource conflict: ${conflictResult.message}`);
      }
      // Phase 6: Create and queue sequence request
      const sequenceRequest = this.createSequenceRequest(sequenceId, sequence.name, data, priority, requestId, orchestrationMetadata, conflictResult, deduplicationResult.hash);
      // Phase 7: Update statistics and queue the sequence
      this.statisticsManager.recordSequenceQueued();
      this.executionQueue.enqueue(sequenceRequest);
      // Phase 8: Process queue if not currently executing
      this.processQueueIfIdle();
      // Phase 9: Emit queued event
      this.emitSequenceQueuedEvent(sequenceId, sequence.name, requestId, priority);
      console.log(`🎼 SequenceOrchestrator: Sequence "${sequence.name}" (id: ${sequenceId}) queued successfully`);
      return {
        requestId,
        success: true
      };
    } catch (error) {
      console.error(`🎼 SequenceOrchestrator: Failed to start sequence: ${sequenceId}`, error);
      this.statisticsManager.recordError();
      return {
        requestId,
        success: false,
        reason: error.message
      };
    }
  }
  /**
   * Process the sequence queue
   * @returns Queue processing result
   */
  async processSequenceQueue() {
    if (this.executionQueue.isEmpty() || this.sequenceExecutor.isSequenceRunning()) {
      return {
        processed: false
      };
    }
    const nextRequest = this.executionQueue.dequeue();
    if (!nextRequest) {
      return {
        processed: false
      };
    }
    const waitTime = performance.now() - nextRequest.queuedAt;
    this.statisticsManager.updateQueueWaitTime(waitTime);
    const sequence = this.sequenceRegistry.get(nextRequest.sequenceId);
    if (!sequence) {
      console.error(`❌ SequenceOrchestrator: Sequence ${nextRequest.sequenceId} not found in registry`);
      // Continue processing queue
      this.processSequenceQueue();
      return {
        processed: true,
        sequenceName: nextRequest.sequenceName,
        success: false,
        error: "Sequence not found in registry"
      };
    }
    try {
      await this.sequenceExecutor.executeSequence(nextRequest, sequence);
      // Process next sequence in queue
      this.processSequenceQueue();
      return {
        processed: true,
        sequenceName: nextRequest.sequenceName,
        success: true
      };
    } catch (error) {
      console.error(`❌ SequenceOrchestrator: Failed to execute sequence ${nextRequest.sequenceName}:`, error);
      // Continue processing queue even if one sequence fails
      this.processSequenceQueue();
      return {
        processed: true,
        sequenceName: nextRequest.sequenceName,
        success: false,
        error: error.message
      };
    }
  }
  /**
   * Create execution context for a sequence
   * @param sequenceRequest - Sequence request
   * @returns Execution context
   */
  createExecutionContext(sequenceRequest) {
    const baseContext = this.sequenceUtilities.createExecutionContext(sequenceRequest);
    // Get the actual sequence for the context
    const sequence = this.sequenceRegistry.get(sequenceRequest.sequenceId);
    if (!sequence) {
      throw new Error(`Sequence ${sequenceRequest.sequenceId} not found`);
    }
    return {
      ...baseContext,
      sequence,
      executionType: sequenceRequest.priority === "HIGH" ? "IMMEDIATE" : "CONSECUTIVE",
      priority: sequenceRequest.priority
    };
  }
  /**
   * Generate a unique request ID
   * @param sequenceId - ID of the sequence
   * @returns Unique request ID
   */
  generateRequestId(sequenceId) {
    return `${sequenceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Log sequence not found error with helpful information
   * @param sequenceId - ID of the sequence that wasn't found
   * @param sequenceName - Name of the sequence (if available)
   */
  logSequenceNotFound(sequenceId, sequenceName) {
    console.error(`❌ SequenceOrchestrator: Sequence with ID "${sequenceId}" not found!`);
    if (sequenceName) {
      console.error(`❌ Sequence name: "${sequenceName}"`);
    }
    console.error(`❌ This means the plugin for this sequence is not loaded or registered.`);
    console.error(`❌ Available sequences:`, this.sequenceRegistry.getNames());
    if (sequenceId === "ElementLibrary.library-drop-symphony" || sequenceName === "ElementLibrary.library-drop-symphony") {
      console.error(`❌ CRITICAL: ElementLibrary.library-drop-symphony not available - drag-and-drop will not work!`);
      console.error(`❌ Check plugin loading logs above for ElementLibrary.library-drop-symphony errors.`);
    }
  }
  /**
   * Handle duplicate sequence detection
   * @param sequenceId - ID of the sequence
   * @param sequenceName - Name of the sequence
   * @param deduplicationResult - Deduplication result
   * @returns Sequence start result for duplicate
   */
  handleDuplicateSequence(sequenceId, sequenceName, deduplicationResult) {
    console.warn(`🎼 SequenceOrchestrator: ${deduplicationResult.reason}`);
    // For StrictMode duplicates, return a duplicate request ID but don't execute
    const duplicateRequestId = `${sequenceId}-duplicate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Emit a duplicate event for monitoring
    this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_CANCELLED, {
      sequenceId,
      sequenceName,
      requestId: duplicateRequestId,
      reason: "duplicate-request",
      hash: deduplicationResult.hash
    });
    return {
      requestId: duplicateRequestId,
      success: false,
      isDuplicate: true,
      reason: deduplicationResult.reason
    };
  }
  /**
   * Extract orchestration metadata from sequence request
   * @param sequenceId - ID of the sequence
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @returns Orchestration metadata
   */
  extractOrchestrationMetadata(sequenceId, sequenceName, data) {
    return {
      symphonyName: this.sequenceUtilities.extractSymphonyName(sequenceName),
      resourceId: this.sequenceUtilities.extractResourceId(sequenceName, data),
      instanceId: this.sequenceUtilities.createSequenceInstanceId(sequenceName, data, "NORMAL")
    };
  }
  /**
   * Check for resource conflicts
   * @param metadata - Orchestration metadata
   * @param priority - Sequence priority
   * @returns Resource conflict result
   */
  checkResourceConflicts(metadata, priority) {
    const delegatorResult = this.resourceDelegator.checkResourceConflict(metadata.resourceId, metadata.instanceId, priority);
    // Convert ResourceDelegator result to MusicalConductor result format
    return {
      hasConflict: delegatorResult.hasConflict,
      conflictType: delegatorResult.hasConflict ? "SAME_RESOURCE" : "NONE",
      resolution: delegatorResult.resolution === "override" ? "ALLOW" : delegatorResult.resolution === "reject" ? "REJECT" : delegatorResult.resolution === "queue" ? "QUEUE" : "ALLOW",
      message: delegatorResult.reason || "No conflict detected"
    };
  }
  /**
   * Create a sequence request object
   * @param sequenceId - ID of the sequence
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @param priority - Sequence priority
   * @param requestId - Request ID
   * @param metadata - Orchestration metadata
   * @param conflictResult - Resource conflict result
   * @param sequenceHash - Sequence hash for idempotency
   * @returns Sequence request
   */
  createSequenceRequest(sequenceId, sequenceName, data, priority, requestId, metadata, conflictResult, sequenceHash) {
    return {
      sequenceId,
      sequenceName,
      data: {
        ...data,
        // MCO/MSO: Add instance and resource tracking
        instanceId: metadata.instanceId,
        symphonyName: metadata.symphonyName,
        resourceId: metadata.resourceId,
        conflictResult,
        // Phase 3: Add idempotency hash
        sequenceHash
      },
      priority,
      requestId,
      queuedAt: performance.now()
    };
  }
  /**
   * Record sequence execution to prevent duplicates
   * @param sequenceHash - Hash of the sequence
   */
  recordSequenceExecution(sequenceHash) {
    // This would typically be handled by the DuplicationDetector
    // For now, we'll delegate to the validator
    console.log(`🎼 SequenceOrchestrator: Recording sequence execution: ${sequenceHash}`);
  }
  /**
   * Process queue if currently idle
   */
  processQueueIfIdle() {
    if (!this.sequenceExecutor.isSequenceRunning()) {
      this.processSequenceQueue();
    }
  }
  /**
   * Emit sequence queued event
   * @param sequenceId - ID of the sequence
   * @param sequenceName - Name of the sequence
   * @param requestId - Request ID
   * @param priority - Sequence priority
   */
  emitSequenceQueuedEvent(sequenceId, sequenceName, requestId, priority) {
    this.eventBus.emit(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_QUEUED, {
      sequenceId,
      sequenceName,
      requestId,
      priority,
      queueLength: this.executionQueue.size()
    });
  }
  /**
   * Get debug information
   * @returns Debug orchestration information
   */
  getDebugInfo() {
    return {
      queueSize: this.executionQueue.size(),
      isExecuting: this.sequenceExecutor.isSequenceRunning(),
      currentSequence: this.sequenceExecutor.getCurrentSequence()?.sequenceName || null,
      processedSequences: 0 // Would track this in a real implementation
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/plugins/PluginInterfaceFacade.js":
/*!****************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/plugins/PluginInterfaceFacade.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PluginInterfaceFacade: () => (/* binding */ PluginInterfaceFacade)
/* harmony export */ });
/* harmony import */ var _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/**
 * PluginInterfaceFacade - Public plugin interface
 * Provides a clean facade for all plugin-related operations
 * Handles CIA (Conductor Integration Architecture) compliance
 */

class PluginInterfaceFacade {
  constructor(pluginManager, spaValidator) {
    this.pluginManager = pluginManager;
    this.spaValidator = spaValidator;
  }
  /**
   * Get all mounted plugin names
   */
  getMountedPlugins() {
    return this.pluginManager.getMountedPlugins();
  }
  /**
   * Play a specific sequence of a mounted SPA plugin (CIA-compliant)
   * @param pluginId - The plugin identifier
   * @param sequenceName - The sequence name to execute
   * @param context - Context data to pass to the movement handler
   * @param priority - Sequence priority (NORMAL, HIGH, CHAINED)
   * @returns Execution result
   */
  play(pluginId, sequenceName, context = {}, priority = _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.NORMAL, startSequenceCallback) {
    try {
      console.log(`🎼 PluginInterfaceFacade.play(): ${pluginId} -> ${sequenceName}`);
      // SPA Validation: Register plugin (silent)
      this.spaValidator.registerPlugin(pluginId);
      // Validate plugin exists
      const plugin = this.pluginManager.getPluginInfo(pluginId);
      if (!plugin) {
        console.warn(`🧠 Plugin not found: ${pluginId}. Available plugins: [${this.pluginManager.getMountedPluginIds().join(", ")}]`);
        return null;
      }
      // Start the sequence instead of calling handlers directly
      return startSequenceCallback(sequenceName, context, priority);
    } catch (error) {
      console.error(`🧠 PluginInterfaceFacade.play() failed for ${pluginId}.${sequenceName}:`, error.message);
      return null;
    }
  }
  /**
   * Mount an SPA plugin with comprehensive validation (CIA-compliant)
   * @param sequence - The sequence definition from the plugin
   * @param handlers - The handlers object from the plugin
   * @param pluginId - Optional plugin ID (defaults to sequence.name)
   * @returns Plugin mount result
   */
  async mount(sequence, handlers, pluginId, metadata) {
    return this.pluginManager.mount(sequence, handlers, pluginId, metadata);
  }
  /**
   * Register CIA-compliant plugins
   * Loads and mounts all plugins from the plugins directory
   */
  async registerCIAPlugins() {
    return this.pluginManager.registerCIAPlugins();
  }
  /**
   * Execute movement with handler validation (CIA-compliant)
   * @param sequenceName - Sequence name
   * @param movementName - Movement name
   * @param data - Movement data
   * @returns Handler execution result
   */
  executeMovementWithHandler(sequenceName, movementName, data) {
    try {
      const handlers = this.pluginManager.getPluginHandlers(sequenceName);
      if (!handlers) {
        console.warn(`🧠 No handlers found for sequence: ${sequenceName}`);
        return null;
      }
      const handler = handlers[movementName];
      if (!handler || typeof handler !== "function") {
        console.warn(`🧠 Handler not found or not a function: ${sequenceName}.${movementName}`);
        return null;
      }
      console.log(`🎼 Executing handler: ${sequenceName}.${movementName} with data:`, data);
      return handler(data);
    } catch (error) {
      console.error(`🧠 Handler execution failed for ${sequenceName}.${movementName}:`, error.message);
      return null;
    }
  }
  /**
   * Load plugin from dynamic import with error handling (CIA-compliant)
   * @param pluginPath - Path to the plugin module
   * @returns Plugin load result
   */
  async loadPlugin(pluginPath) {
    try {
      console.log(`🧠 PluginInterfaceFacade: Loading plugin from: ${pluginPath}`);
      const plugin = await this.pluginManager.pluginLoader.loadPlugin(pluginPath);
      if (!plugin) {
        return {
          success: false,
          pluginId: "unknown",
          message: `Failed to load plugin: ${pluginPath}`,
          reason: "load_failed"
        };
      }
      // Mount the plugin
      return await this.mount(plugin.sequence, plugin.handlers);
    } catch (error) {
      console.warn(`🧠 PluginInterfaceFacade: Failed to load plugin from ${pluginPath}:`, error.message);
      return {
        success: false,
        pluginId: "unknown",
        message: `Failed to load plugin from ${pluginPath}: ${error.message}`,
        reason: "load_error"
      };
    }
  }
  /**
   * Extract plugin code for SPA validation
   * @param sequence - Plugin sequence
   * @param handlers - Plugin handlers
   * @returns String representation of plugin code
   */
  extractPluginCode(sequence, handlers) {
    try {
      // Convert sequence and handlers to string for analysis
      const sequenceCode = JSON.stringify(sequence, null, 2);
      const handlersCode = Object.keys(handlers).map(key => `${key}: ${handlers[key].toString()}`).join("\n");
      return `${sequenceCode}\n${handlersCode}`;
    } catch (error) {
      console.warn("🎼 Failed to extract plugin code for validation:", error);
      return "";
    }
  }
  /**
   * Validate plugin pre-compilation status
   * @param pluginId - Plugin identifier
   * @returns Validation result
   */
  async validatePluginPreCompilation(pluginId) {
    try {
      const issues = [];
      // Check for bundled artifact
      const bundlePath = `/plugins/${pluginId}/dist/plugin.js`;
      try {
        const response = await fetch(bundlePath);
        if (!response.ok) {
          issues.push(`Missing bundled artifact: ${bundlePath}`);
        }
      } catch {
        issues.push(`Cannot access bundled artifact: ${bundlePath}`);
      }
      // Check for required runtime files
      const requiredFiles = ["index.js", "sequence.js", "manifest.json"];
      for (const file of requiredFiles) {
        const filePath = `/plugins/${pluginId}/${file}`;
        try {
          const response = await fetch(filePath);
          if (!response.ok) {
            issues.push(`Missing required file: ${filePath}`);
          }
        } catch {
          issues.push(`Cannot access required file: ${filePath}`);
        }
      }
      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      console.warn(`🔨 Pre-compilation validation error for ${pluginId}:`, error);
      return {
        valid: false,
        issues: [`Validation error: ${error.message}`]
      };
    }
  }
  /**
   * Unmount a plugin (CIA-compliant)
   * @param pluginId - Plugin identifier
   * @returns Success status
   */
  unmountPlugin(pluginId) {
    return this.pluginManager.unmountPlugin(pluginId);
  }
  /**
   * Get mounted plugin information
   * @param pluginId - Plugin identifier
   * @returns Plugin information or undefined
   */
  getPluginInfo(pluginId) {
    return this.pluginManager.getPluginInfo(pluginId);
  }
  /**
   * Get all mounted plugin IDs
   * @returns Array of plugin IDs
   */
  getMountedPluginIds() {
    return this.pluginManager.getMountedPluginIds();
  }
  /**
   * Get plugin statistics
   * @returns Plugin statistics
   */
  getPluginStatistics() {
    const pluginIds = this.pluginManager.getMountedPluginIds();
    return {
      mountedPlugins: pluginIds.length,
      totalSequences: this.pluginManager.getTotalSequences(),
      pluginIds
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/plugins/PluginLoader.js":
/*!*******************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/plugins/PluginLoader.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PluginLoader: () => (/* binding */ PluginLoader)
/* harmony export */ });
/**
 * PluginLoader - Plugin loading and module resolution
 * Handles dynamic loading of plugin modules with fallback strategies
 */
class PluginLoader {
  constructor() {
    this.moduleCache = new Map();
  }
  /**
   * Load a plugin module with caching and fallback strategies
   * @param pluginPath - Path to the plugin module (e.g., "/plugins/App.app-shell-symphony/index.js")
   * @returns Plugin module with exports
   */
  async loadPluginModule(pluginPath) {
    // Check cache first
    if (this.moduleCache.has(pluginPath)) {
      console.log(`📦 Loading plugin from cache: ${pluginPath}`);
      return this.moduleCache.get(pluginPath);
    }
    // Extract plugin directory from path
    const pluginDir = pluginPath.substring(0, pluginPath.lastIndexOf("/"));
    const bundledPath = `${pluginDir}/dist/plugin.js`;
    // Try to load bundled ESM version first
    try {
      console.log(`🔄 Attempting to load bundled plugin: ${bundledPath}`);
      const module = await __webpack_require__("./test-app/dist/modules/communication/sequences/plugins lazy recursive")(bundledPath);
      // Cache the loaded module
      this.moduleCache.set(pluginPath, module);
      console.log(`✅ Successfully loaded bundled plugin: ${bundledPath}`);
      return module;
    } catch (bundledError) {
      console.log(`⚠️ Bundled version not available (${bundledPath}), trying original path`);
    }
    // Try original path
    try {
      console.log(`🔄 Attempting to load plugin: ${pluginPath}`);
      const module = await __webpack_require__("./test-app/dist/modules/communication/sequences/plugins lazy recursive")(pluginPath);
      // Cache the loaded module
      this.moduleCache.set(pluginPath, module);
      console.log(`✅ Successfully loaded plugin: ${pluginPath}`);
      return module;
    } catch (originalError) {
      console.warn(`⚠️ Failed to load plugin from original path: ${pluginPath}. Error: ${originalError instanceof Error ? originalError.message : originalError}`);
      // Fall back to complex dependency resolution
      return this.loadPluginModuleComplex(pluginPath);
    }
  }
  /**
   * Complex plugin loading with full dependency resolution (fallback method)
   * @param pluginPath - Path to the plugin module
   * @returns Plugin module with exports
   */
  async loadPluginModuleComplex(pluginPath) {
    try {
      console.log(`🔄 Loading plugin module with complex resolution: ${pluginPath}`);
      // Extract plugin directory and name
      const pluginDir = pluginPath.substring(0, pluginPath.lastIndexOf("/"));
      const pluginName = pluginDir.substring(pluginDir.lastIndexOf("/") + 1);
      console.log(`🔍 Plugin directory: ${pluginDir}`);
      console.log(`🔍 Plugin name: ${pluginName}`);
      // Try multiple resolution strategies
      const resolutionStrategies = [`${pluginDir}/index.js`, `${pluginDir}/src/index.js`, `${pluginDir}/lib/index.js`, `${pluginDir}/dist/index.js`, `${pluginDir}/${pluginName}.js`, `${pluginDir}/main.js`];
      for (const strategy of resolutionStrategies) {
        try {
          console.log(`🔄 Trying resolution strategy: ${strategy}`);
          const module = await __webpack_require__("./test-app/dist/modules/communication/sequences/plugins lazy recursive")(strategy);
          // Cache the loaded module
          this.moduleCache.set(pluginPath, module);
          console.log(`✅ Successfully loaded plugin with strategy: ${strategy}`);
          return module;
        } catch (strategyError) {
          console.log(`⚠️ Strategy failed: ${strategy} - ${strategyError instanceof Error ? strategyError.message : strategyError}`);
        }
      }
      // If all strategies fail, try dynamic import with error handling
      throw new Error(`Failed to load plugin module: ${pluginPath}. All resolution strategies failed.`);
    } catch (error) {
      console.error(`❌ Complex plugin loading failed for ${pluginPath}:`, error);
      throw error;
    }
  }
  /**
   * Load plugin from a specific path with validation
   * @param pluginPath - Path to the plugin
   * @returns Plugin module or null if failed
   */
  async loadPlugin(pluginPath) {
    try {
      console.log(`🧠 PluginLoader: Loading plugin from: ${pluginPath}`);
      const plugin = await this.loadPluginModule(pluginPath);
      // Validate plugin structure after import
      if (!plugin || typeof plugin !== "object") {
        console.warn(`🧠 Failed to load plugin: invalid plugin structure at ${pluginPath}`);
        return null;
      }
      // Check for required exports
      if (!plugin.sequence && !plugin.handlers && !plugin.default) {
        console.warn(`🧠 Plugin at ${pluginPath} missing required exports (sequence, handlers, or default)`);
        return null;
      }
      // Handle default export
      if (plugin.default && !plugin.sequence) {
        console.log(`🔄 Using default export for plugin: ${pluginPath}`);
        return plugin.default;
      }
      console.log(`✅ Successfully loaded and validated plugin: ${pluginPath}`);
      return plugin;
    } catch (error) {
      console.error(`❌ Failed to load plugin from ${pluginPath}:`, error);
      return null;
    }
  }
  /**
   * Preload multiple plugins
   * @param pluginPaths - Array of plugin paths to preload
   * @returns Array of loaded plugins (null for failed loads)
   */
  async preloadPlugins(pluginPaths) {
    console.log(`🔄 Preloading ${pluginPaths.length} plugins...`);
    const loadPromises = pluginPaths.map(async path => {
      try {
        return await this.loadPlugin(path);
      } catch (error) {
        console.error(`❌ Failed to preload plugin ${path}:`, error);
        return null;
      }
    });
    const results = await Promise.all(loadPromises);
    const successCount = results.filter(result => result !== null).length;
    console.log(`✅ Preloaded ${successCount}/${pluginPaths.length} plugins successfully`);
    return results;
  }
  /**
   * Check if a plugin is cached
   * @param pluginPath - Plugin path to check
   * @returns True if cached
   */
  isCached(pluginPath) {
    return this.moduleCache.has(pluginPath);
  }
  /**
   * Clear the module cache
   */
  clearCache() {
    this.moduleCache.clear();
    console.log("🧹 PluginLoader: Module cache cleared");
  }
  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getCacheStatistics() {
    return {
      cachedModules: this.moduleCache.size,
      cachedPaths: Array.from(this.moduleCache.keys())
    };
  }
  /**
   * Remove a specific module from cache
   * @param pluginPath - Plugin path to remove from cache
   * @returns True if removed, false if not found
   */
  removeCached(pluginPath) {
    const removed = this.moduleCache.delete(pluginPath);
    if (removed) {
      console.log(`🗑️ Removed plugin from cache: ${pluginPath}`);
    }
    return removed;
  }
  /**
   * Validate plugin module structure
   * @param pluginModule - Plugin module to validate
   * @returns Validation result
   */
  validatePluginModule(pluginModule) {
    const errors = [];
    const warnings = [];
    if (!pluginModule || typeof pluginModule !== "object") {
      errors.push("Plugin module is not a valid object");
      return {
        isValid: false,
        errors,
        warnings
      };
    }
    // Check for sequence export
    if (!pluginModule.sequence) {
      if (pluginModule.default?.sequence) {
        warnings.push("Using sequence from default export");
      } else {
        errors.push("Missing required 'sequence' export");
      }
    }
    // Check for handlers export
    if (!pluginModule.handlers) {
      if (pluginModule.default?.handlers) {
        warnings.push("Using handlers from default export");
      } else {
        warnings.push("Missing 'handlers' export - plugin may be event-bus driven");
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/plugins/PluginManager.js":
/*!********************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/plugins/PluginManager.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PluginManager: () => (/* binding */ PluginManager)
/* harmony export */ });
/* harmony import */ var _PluginLoader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PluginLoader.js */ "./test-app/dist/modules/communication/sequences/plugins/PluginLoader.js");
/* harmony import */ var _PluginValidator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PluginValidator.js */ "./test-app/dist/modules/communication/sequences/plugins/PluginValidator.js");
/* harmony import */ var _PluginManifestLoader_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PluginManifestLoader.js */ "./test-app/dist/modules/communication/sequences/plugins/PluginManifestLoader.js");
/**
 * PluginManager - High-level plugin management and mounting
 * Handles CIA (Conductor Integration Architecture) plugin lifecycle
 */



class PluginManager {
  constructor(eventBus, spaValidator, sequenceRegistry) {
    // Plugin state
    this.mountedPlugins = new Map();
    this.pluginHandlers = new Map();
    this.pluginsRegistered = false; // Prevent React StrictMode double execution
    this.eventBus = eventBus;
    this.spaValidator = spaValidator;
    this.sequenceRegistry = sequenceRegistry;
    this.pluginLoader = new _PluginLoader_js__WEBPACK_IMPORTED_MODULE_0__.PluginLoader();
    this.pluginValidator = new _PluginValidator_js__WEBPACK_IMPORTED_MODULE_1__.PluginValidator();
    this.manifestLoader = new _PluginManifestLoader_js__WEBPACK_IMPORTED_MODULE_2__.PluginManifestLoader();
  }
  /**
   * Mount a plugin with sequence and handlers
   * @param sequence - Musical sequence definition
   * @param handlers - Event handlers for the sequence
   * @param pluginId - Optional plugin ID (defaults to sequence.name)
   * @param metadata - Optional plugin metadata
   * @returns Plugin mount result
   */
  async mount(sequence, handlers, pluginId, metadata) {
    const id = pluginId || sequence?.name || "unknown-plugin";
    const warnings = [];
    try {
      console.log(`🧠 PluginManager: Attempting to mount plugin: ${id}`);
      // Validate plugin structure
      const validationResult = this.pluginValidator.validatePluginStructure(sequence, handlers, id);
      if (!validationResult.isValid) {
        return {
          success: false,
          pluginId: id,
          message: `Plugin validation failed: ${validationResult.errors.join(", ")}`,
          reason: "validation_failed",
          warnings: validationResult.warnings
        };
      }
      warnings.push(...validationResult.warnings);
      // Register with SPA validator
      this.spaValidator.registerPlugin(id);
      // Check if plugin already exists
      if (this.mountedPlugins.has(id)) {
        console.warn(`🧠 Plugin already mounted: ${id}`);
        return {
          success: false,
          pluginId: id,
          message: "Plugin already mounted",
          reason: "already_mounted",
          warnings
        };
      }
      // Register the sequence
      this.sequenceRegistry.register(sequence);
      // Create plugin object
      const plugin = {
        sequence,
        handlers: handlers || {},
        metadata: {
          id,
          version: metadata?.version || "1.0.0",
          author: metadata?.author
        }
      };
      // Mount the plugin
      this.mountedPlugins.set(id, plugin);
      // Store handlers only if provided (optional for event-bus driven plugins)
      if (handlers && typeof handlers === "object") {
        this.pluginHandlers.set(id, handlers);
      }
      console.log(`✅ Plugin mounted successfully: ${id}`);
      console.log(`🎼 Sequence registered: ${sequence.name}`);
      return {
        success: true,
        pluginId: id,
        message: `Successfully mounted plugin: ${id}`,
        warnings
      };
    } catch (error) {
      console.error(`❌ Failed to mount plugin ${id}:`, error);
      return {
        success: false,
        pluginId: id,
        message: error instanceof Error ? error.message : String(error),
        reason: "mount_error",
        warnings
      };
    }
  }
  /**
   * Unmount a plugin
   * @param pluginId - Plugin ID to unmount
   * @returns True if successfully unmounted
   */
  unmountPlugin(pluginId) {
    try {
      if (!this.mountedPlugins.has(pluginId)) {
        console.warn(`🧠 Plugin not found for unmounting: ${pluginId}`);
        return false;
      }
      const plugin = this.mountedPlugins.get(pluginId);
      // Unregister the sequence
      this.sequenceRegistry.unregister(plugin.sequence.name);
      // Remove from mounted plugins
      this.mountedPlugins.delete(pluginId);
      this.pluginHandlers.delete(pluginId);
      console.log(`✅ Plugin unmounted successfully: ${pluginId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to unmount plugin ${pluginId}:`, error);
      return false;
    }
  }
  /**
   * Register CIA-compliant plugins
   * Loads and mounts all plugins from the plugins directory
   */
  async registerCIAPlugins() {
    try {
      // Prevent React StrictMode double execution
      if (this.pluginsRegistered) {
        console.log("⚠️ Plugins already registered, skipping duplicate registration");
        return;
      }
      console.log("🧠 Registering CIA-compliant plugins...");
      // Load plugin manifest
      const pluginManifest = await this.manifestLoader.loadManifest("/plugins/manifest.json");
      // Register plugins dynamically based on manifest data (data-driven approach)
      await this.registerPluginsFromManifest(pluginManifest);
      // Mark plugins as registered to prevent duplicate execution
      this.pluginsRegistered = true;
      console.log("✅ CIA-compliant plugins registered successfully");
    } catch (error) {
      console.error("❌ Failed to register CIA plugins:", error);
      // Fallback to basic event handling if plugin loading fails
      this.registerFallbackSequences();
    }
  }
  /**
   * Register plugins from manifest
   * @param manifest - Plugin manifest data
   */
  async registerPluginsFromManifest(manifest) {
    console.log("🎼 PluginManager: Registering plugins from manifest...");
    console.log(`🔌 Processing ${manifest.plugins.length} plugins from manifest`);
    // Iterate through plugins defined in manifest
    for (const plugin of manifest.plugins) {
      try {
        if (plugin.autoMount) {
          // Check if plugin is already mounted (prevents React StrictMode double execution)
          if (this.mountedPlugins.has(plugin.name)) {
            console.log(`⚠️ Plugin already mounted, skipping: ${plugin.name}`);
            continue;
          }
          console.log(`🔌 Auto-mounting plugin: ${plugin.name} from ${plugin.path}`);
          // Dynamic plugin loading using pre-compiled JavaScript files
          const pluginModule = await this.pluginLoader.loadPluginModule(`/plugins/${plugin.path}index.js`);
          // Validate plugin structure
          if (!pluginModule.sequence || !pluginModule.handlers) {
            console.warn(`⚠️ Plugin ${plugin.name} missing required exports (sequence, handlers)`);
            continue;
          }
          // Mount the plugin with metadata from manifest
          const mountResult = await this.mount(pluginModule.sequence, pluginModule.handlers, plugin.name, {
            version: plugin.version,
            description: plugin.description,
            path: plugin.path,
            autoMount: plugin.autoMount
          });
          if (mountResult.success) {
            console.log(`✅ Auto-mounted plugin: ${plugin.name}`);
          } else {
            console.error(`❌ Failed to auto-mount plugin ${plugin.name}: ${mountResult.message}`);
          }
        } else {
          console.log(`⏭️ Skipping non-auto-mount plugin: ${plugin.name}`);
        }
      } catch (error) {
        console.error(`❌ Error processing plugin ${plugin.name}:`, error);
      }
    }
  }
  /**
   * Register fallback sequences when plugin loading fails
   */
  registerFallbackSequences() {
    console.log("🔄 Registering fallback sequences...");
    // Register basic fallback sequences for essential functionality
    const fallbackSequences = [{
      name: "fallback-sequence",
      description: "Basic fallback sequence",
      movements: [{
        name: "fallback-movement",
        beats: [{
          beat: 1,
          event: "fallback-event",
          title: "Fallback Event",
          description: "Basic fallback event",
          dynamics: "forte",
          timing: "immediate",
          errorHandling: "continue",
          data: {}
        }]
      }]
    }];
    fallbackSequences.forEach(sequence => {
      this.sequenceRegistry.register(sequence);
    });
    console.log("✅ Fallback sequences registered");
  }
  /**
   * Get plugin information
   * @param pluginId - Plugin ID
   * @returns Plugin information or undefined
   */
  getPluginInfo(pluginId) {
    return this.mountedPlugins.get(pluginId);
  }
  /**
   * Get all mounted plugin IDs
   * @returns Array of plugin IDs
   */
  getMountedPluginIds() {
    return Array.from(this.mountedPlugins.keys());
  }
  /**
   * Get all mounted plugin names (alias for getMountedPluginIds)
   */
  getMountedPlugins() {
    return this.getMountedPluginIds();
  }
  /**
   * Get plugin handlers for a specific plugin
   * @param pluginId - Plugin ID
   * @returns Plugin handlers or null
   */
  getPluginHandlers(pluginId) {
    // Validate plugin exists
    const plugin = this.mountedPlugins.get(pluginId);
    if (!plugin) {
      console.warn(`🧠 Plugin not found: ${pluginId}. Available plugins: [${Array.from(this.mountedPlugins.keys()).join(", ")}]`);
      return null;
    }
    return this.pluginHandlers.get(pluginId) || null;
  }
  /**
   * Get plugin statistics
   * @returns Plugin statistics
   */
  getStatistics() {
    return {
      totalPlugins: this.mountedPlugins.size,
      mountedPlugins: this.getMountedPluginIds(),
      pluginsRegistered: this.pluginsRegistered
    };
  }
  /**
   * Get total number of sequences from all mounted plugins
   * @returns Total sequence count
   */
  getTotalSequences() {
    return Array.from(this.mountedPlugins.values()).reduce((count, plugin) => {
      return count + (plugin.sequence ? 1 : 0);
    }, 0);
  }
  /**
   * Reset plugin manager state (for testing)
   */
  reset() {
    this.mountedPlugins.clear();
    this.pluginHandlers.clear();
    this.pluginsRegistered = false;
    console.log("🧹 PluginManager: State reset");
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/plugins/PluginManifestLoader.js":
/*!***************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/plugins/PluginManifestLoader.js ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PluginManifestLoader: () => (/* binding */ PluginManifestLoader)
/* harmony export */ });
/**
 * PluginManifestLoader - Manifest loading and parsing
 * Handles loading and validation of plugin manifest files
 */
class PluginManifestLoader {
  constructor() {
    this.manifestCache = new Map();
  }
  /**
   * Load plugin manifest from a URL or path
   * @param manifestPath - Path to the manifest file
   * @returns Plugin manifest data
   */
  async loadManifest(manifestPath) {
    // Check cache first
    if (this.manifestCache.has(manifestPath)) {
      console.log(`📦 Loading manifest from cache: ${manifestPath}`);
      return this.manifestCache.get(manifestPath);
    }
    try {
      console.log(`🔄 Loading plugin manifest: ${manifestPath}`);
      // Fetch the manifest file
      const response = await fetch(manifestPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
      }
      const manifestData = await response.json();
      // Validate manifest structure
      const validatedManifest = this.validateManifest(manifestData);
      // Cache the manifest
      this.manifestCache.set(manifestPath, validatedManifest);
      console.log(`✅ Successfully loaded manifest: ${manifestPath}`);
      console.log(`📋 Found ${validatedManifest.plugins.length} plugins in manifest`);
      return validatedManifest;
    } catch (error) {
      console.error(`❌ Failed to load manifest from ${manifestPath}:`, error);
      // Return fallback manifest
      const fallbackManifest = this.createFallbackManifest();
      console.log("🔄 Using fallback manifest");
      return fallbackManifest;
    }
  }
  /**
   * Validate manifest structure and content
   * @param manifestData - Raw manifest data
   * @returns Validated manifest
   */
  validateManifest(manifestData) {
    if (!manifestData || typeof manifestData !== "object") {
      throw new Error("Manifest must be a valid JSON object");
    }
    // Validate required properties
    if (!manifestData.version || typeof manifestData.version !== "string") {
      console.warn("⚠️ Manifest missing version, using default");
      manifestData.version = "1.0.0";
    }
    if (!manifestData.plugins || !Array.isArray(manifestData.plugins)) {
      throw new Error("Manifest must contain a plugins array");
    }
    // Validate each plugin entry
    const validatedPlugins = [];
    manifestData.plugins.forEach((plugin, index) => {
      try {
        const validatedPlugin = this.validatePluginEntry(plugin, index);
        validatedPlugins.push(validatedPlugin);
      } catch (error) {
        console.error(`❌ Invalid plugin entry at index ${index}:`, error);
        // Skip invalid entries but continue processing
      }
    });
    if (validatedPlugins.length === 0) {
      console.warn("⚠️ No valid plugins found in manifest");
    }
    return {
      version: manifestData.version,
      plugins: validatedPlugins,
      metadata: manifestData.metadata || {}
    };
  }
  /**
   * Validate individual plugin entry
   * @param plugin - Plugin entry to validate
   * @param index - Index for error reporting
   * @returns Validated plugin entry
   */
  validatePluginEntry(plugin, index) {
    if (!plugin || typeof plugin !== "object") {
      throw new Error(`Plugin entry ${index} must be an object`);
    }
    // Validate required properties
    if (!plugin.name || typeof plugin.name !== "string") {
      throw new Error(`Plugin entry ${index} must have a valid name`);
    }
    if (!plugin.path || typeof plugin.path !== "string") {
      throw new Error(`Plugin entry ${index} must have a valid path`);
    }
    // Ensure path ends with /
    if (!plugin.path.endsWith("/")) {
      plugin.path += "/";
    }
    // Set defaults for optional properties
    const validatedPlugin = {
      name: plugin.name,
      path: plugin.path,
      version: plugin.version || "1.0.0",
      description: plugin.description || `Plugin: ${plugin.name}`,
      autoMount: plugin.autoMount !== false,
      // Default to true
      dependencies: Array.isArray(plugin.dependencies) ? plugin.dependencies : [],
      author: plugin.author || "Unknown",
      license: plugin.license || "MIT"
    };
    return validatedPlugin;
  }
  /**
   * Create a fallback manifest when loading fails
   * @returns Fallback manifest
   */
  createFallbackManifest() {
    return {
      version: "1.0.0",
      plugins: [{
        name: "fallback-plugin",
        path: "fallback/",
        version: "1.0.0",
        description: "Fallback plugin for when manifest loading fails",
        autoMount: false,
        dependencies: [],
        author: "System",
        license: "MIT"
      }],
      metadata: {
        name: "Fallback Manifest",
        description: "Generated fallback manifest",
        author: "MusicalConductor",
        created: new Date().toISOString()
      }
    };
  }
  /**
   * Load manifest from multiple sources with fallback
   * @param manifestPaths - Array of manifest paths to try
   * @returns First successfully loaded manifest
   */
  async loadManifestWithFallback(manifestPaths) {
    for (const path of manifestPaths) {
      try {
        const manifest = await this.loadManifest(path);
        console.log(`✅ Successfully loaded manifest from: ${path}`);
        return manifest;
      } catch (error) {
        console.warn(`⚠️ Failed to load manifest from ${path}, trying next...`);
      }
    }
    console.warn("⚠️ All manifest sources failed, using fallback");
    return this.createFallbackManifest();
  }
  /**
   * Parse manifest from JSON string
   * @param manifestJson - JSON string containing manifest
   * @returns Parsed and validated manifest
   */
  parseManifest(manifestJson) {
    try {
      const manifestData = JSON.parse(manifestJson);
      return this.validateManifest(manifestData);
    } catch (error) {
      console.error("❌ Failed to parse manifest JSON:", error);
      throw new Error(`Invalid manifest JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * Filter plugins by criteria
   * @param manifest - Manifest to filter
   * @param criteria - Filter criteria
   * @returns Filtered plugin entries
   */
  filterPlugins(manifest, criteria) {
    return manifest.plugins.filter(plugin => {
      if (criteria.autoMount !== undefined && plugin.autoMount !== criteria.autoMount) {
        return false;
      }
      if (criteria.name && !plugin.name.includes(criteria.name)) {
        return false;
      }
      if (criteria.version && plugin.version !== criteria.version) {
        return false;
      }
      if (criteria.author && plugin.author !== criteria.author) {
        return false;
      }
      return true;
    });
  }
  /**
   * Get manifest statistics
   * @param manifest - Manifest to analyze
   * @returns Manifest statistics
   */
  getManifestStatistics(manifest) {
    const autoMountPlugins = manifest.plugins.filter(p => p.autoMount).length;
    const uniqueAuthors = [...new Set(manifest.plugins.map(p => p.author || "Unknown"))];
    const versions = [...new Set(manifest.plugins.map(p => p.version))];
    return {
      totalPlugins: manifest.plugins.length,
      autoMountPlugins,
      manualMountPlugins: manifest.plugins.length - autoMountPlugins,
      uniqueAuthors,
      versions
    };
  }
  /**
   * Clear manifest cache
   */
  clearCache() {
    this.manifestCache.clear();
    console.log("🧹 PluginManifestLoader: Cache cleared");
  }
  /**
   * Get cached manifest paths
   * @returns Array of cached manifest paths
   */
  getCachedPaths() {
    return Array.from(this.manifestCache.keys());
  }
  /**
   * Remove specific manifest from cache
   * @param manifestPath - Path to remove from cache
   * @returns True if removed, false if not found
   */
  removeCached(manifestPath) {
    return this.manifestCache.delete(manifestPath);
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/plugins/PluginValidator.js":
/*!**********************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/plugins/PluginValidator.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PluginValidator: () => (/* binding */ PluginValidator)
/* harmony export */ });
/**
 * PluginValidator - Plugin structure validation
 * Validates plugin structure, sequences, and handlers for CIA compliance
 */
class PluginValidator {
  /**
   * Validate plugin structure for CIA compliance
   * @param sequence - Musical sequence definition
   * @param handlers - Event handlers
   * @param pluginId - Plugin identifier
   * @returns Validation result
   */
  validatePluginStructure(sequence, handlers, pluginId) {
    const errors = [];
    const warnings = [];
    try {
      // Validate plugin ID
      if (!pluginId || typeof pluginId !== "string" || pluginId.trim() === "") {
        errors.push("Plugin ID must be a non-empty string");
      }
      // Validate sequence
      const sequenceValidation = this.validateSequence(sequence);
      errors.push(...sequenceValidation.errors);
      warnings.push(...sequenceValidation.warnings);
      // Validate handlers (optional but recommended)
      const handlersValidation = this.validateHandlers(handlers);
      errors.push(...handlersValidation.errors);
      warnings.push(...handlersValidation.warnings);
      // CIA-specific validations
      const ciaValidation = this.validateCIACompliance(sequence, handlers);
      errors.push(...ciaValidation.errors);
      warnings.push(...ciaValidation.warnings);
      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        isValid: false,
        errors,
        warnings
      };
    }
  }
  /**
   * Validate musical sequence structure
   * @param sequence - Sequence to validate
   * @returns Validation result
   */
  validateSequence(sequence) {
    const errors = [];
    const warnings = [];
    if (!sequence) {
      errors.push("Sequence is required");
      return {
        isValid: false,
        errors,
        warnings
      };
    }
    if (typeof sequence !== "object") {
      errors.push("Sequence must be an object");
      return {
        isValid: false,
        errors,
        warnings
      };
    }
    // Validate required sequence properties
    if (!sequence.name || typeof sequence.name !== "string") {
      errors.push("Sequence must have a valid name (string)");
    }
    if (!sequence.movements || !Array.isArray(sequence.movements)) {
      errors.push("Sequence must have movements array");
    } else if (sequence.movements.length === 0) {
      warnings.push("Sequence has no movements");
    } else {
      // Validate each movement
      sequence.movements.forEach((movement, index) => {
        const movementValidation = this.validateMovement(movement, index);
        errors.push(...movementValidation.errors);
        warnings.push(...movementValidation.warnings);
      });
    }
    // Optional properties validation
    if (sequence.description && typeof sequence.description !== "string") {
      warnings.push("Sequence description should be a string");
    }
    if (sequence.tempo && (typeof sequence.tempo !== "number" || sequence.tempo <= 0)) {
      warnings.push("Sequence tempo should be a positive number");
    }
    if (sequence.key && typeof sequence.key !== "string") {
      warnings.push("Sequence key should be a string");
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Validate movement structure
   * @param movement - Movement to validate
   * @param index - Movement index for error reporting
   * @returns Validation result
   */
  validateMovement(movement, index) {
    const errors = [];
    const warnings = [];
    if (!movement || typeof movement !== "object") {
      errors.push(`Movement ${index} must be an object`);
      return {
        isValid: false,
        errors,
        warnings
      };
    }
    // Validate required movement properties
    if (!movement.name || typeof movement.name !== "string") {
      errors.push(`Movement ${index} must have a valid name (string)`);
    }
    if (!movement.beats || !Array.isArray(movement.beats)) {
      errors.push(`Movement ${index} must have beats array`);
    } else if (movement.beats.length === 0) {
      warnings.push(`Movement ${index} has no beats`);
    } else {
      // Validate each beat
      movement.beats.forEach((beat, beatIndex) => {
        const beatValidation = this.validateBeat(beat, index, beatIndex);
        errors.push(...beatValidation.errors);
        warnings.push(...beatValidation.warnings);
      });
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Validate beat structure
   * @param beat - Beat to validate
   * @param movementIndex - Movement index for error reporting
   * @param beatIndex - Beat index for error reporting
   * @returns Validation result
   */
  validateBeat(beat, movementIndex, beatIndex) {
    const errors = [];
    const warnings = [];
    if (!beat || typeof beat !== "object") {
      errors.push(`Movement ${movementIndex}, Beat ${beatIndex} must be an object`);
      return {
        isValid: false,
        errors,
        warnings
      };
    }
    const beatRef = `Movement ${movementIndex}, Beat ${beatIndex}`;
    // Validate required beat properties
    if (typeof beat.beat !== "number" || beat.beat < 1) {
      errors.push(`${beatRef} must have a valid beat number (>= 1)`);
    }
    if (!beat.event || typeof beat.event !== "string") {
      errors.push(`${beatRef} must have a valid event name (string)`);
    }
    if (!beat.title || typeof beat.title !== "string") {
      errors.push(`${beatRef} must have a valid title (string)`);
    }
    // Validate optional but recommended properties
    if (!beat.dynamics) {
      warnings.push(`${beatRef} missing dynamics property`);
    }
    if (!beat.timing) {
      warnings.push(`${beatRef} missing timing property`);
    }
    if (!beat.errorHandling) {
      warnings.push(`${beatRef} missing errorHandling property`);
    } else if (!["continue", "abort-sequence", "retry"].includes(beat.errorHandling)) {
      warnings.push(`${beatRef} has invalid errorHandling value: ${beat.errorHandling}`);
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Validate event handlers
   * @param handlers - Handlers to validate
   * @returns Validation result
   */
  validateHandlers(handlers) {
    const errors = [];
    const warnings = [];
    if (!handlers) {
      warnings.push("No handlers provided - plugin may be event-bus driven");
      return {
        isValid: true,
        errors,
        warnings
      };
    }
    if (typeof handlers !== "object") {
      errors.push("Handlers must be an object");
      return {
        isValid: false,
        errors,
        warnings
      };
    }
    // Validate handler functions
    Object.entries(handlers).forEach(([eventName, handler]) => {
      if (typeof handler !== "function") {
        errors.push(`Handler for event '${eventName}' must be a function`);
      }
    });
    if (Object.keys(handlers).length === 0) {
      warnings.push("Handlers object is empty");
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Validate CIA (Conductor Integration Architecture) compliance
   * @param sequence - Sequence to validate
   * @param handlers - Handlers to validate
   * @returns Validation result
   */
  validateCIACompliance(sequence, handlers) {
    const errors = [];
    const warnings = [];
    // CIA-specific validations
    if (sequence) {
      // Check for CIA-recommended properties
      if (!sequence.description) {
        warnings.push("CIA recommendation: Sequence should have a description");
      }
      if (!sequence.version) {
        warnings.push("CIA recommendation: Sequence should have a version");
      }
      // Validate event naming conventions
      if (sequence.movements) {
        sequence.movements.forEach((movement, movementIndex) => {
          if (movement.beats) {
            movement.beats.forEach((beat, beatIndex) => {
              if (beat.event) {
                // Check for CIA event naming conventions
                if (!beat.event.includes("-") && !beat.event.includes(".")) {
                  warnings.push(`CIA recommendation: Event '${beat.event}' should use kebab-case or dot notation`);
                }
              }
            });
          }
        });
      }
    }
    // Validate SPA compliance
    if (handlers) {
      const handlerNames = Object.keys(handlers);
      if (handlerNames.length > 0) {
        // Check for potential memory leaks
        handlerNames.forEach(eventName => {
          if (eventName.toLowerCase().includes("window") || eventName.toLowerCase().includes("document")) {
            warnings.push(`CIA warning: Handler '${eventName}' may cause memory leaks in SPA environment`);
          }
        });
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Validate plugin metadata
   * @param metadata - Plugin metadata to validate
   * @returns Validation result
   */
  validateMetadata(metadata) {
    const errors = [];
    const warnings = [];
    if (!metadata) {
      warnings.push("No metadata provided");
      return {
        isValid: true,
        errors,
        warnings
      };
    }
    if (typeof metadata !== "object") {
      errors.push("Metadata must be an object");
      return {
        isValid: false,
        errors,
        warnings
      };
    }
    // Validate recommended metadata properties
    if (!metadata.version) {
      warnings.push("Metadata should include version");
    } else if (typeof metadata.version !== "string") {
      warnings.push("Metadata version should be a string");
    }
    if (!metadata.description) {
      warnings.push("Metadata should include description");
    } else if (typeof metadata.description !== "string") {
      warnings.push("Metadata description should be a string");
    }
    if (metadata.author && typeof metadata.author !== "string") {
      warnings.push("Metadata author should be a string");
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/resources/ResourceConflictManager.js":
/*!********************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/resources/ResourceConflictManager.js ***!
  \********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ResourceConflictManager: () => (/* binding */ ResourceConflictManager)
/* harmony export */ });
/**
 * ResourceConflictManager - Advanced resource conflict resolution and management
 * Handles resource ownership, conflict resolution strategies, and diagnostic methods
 */
class ResourceConflictManager {
  constructor(resourceManager, resourceDelegator, sequenceUtilities) {
    this.resourceManager = resourceManager;
    this.resourceDelegator = resourceDelegator;
    this.sequenceUtilities = sequenceUtilities;
  }
  /**
   * Create a sequence instance ID
   * @param sequenceName - Name of the sequence
   * @param instanceId - Optional instance ID
   * @returns Generated instance ID
   */
  createSequenceInstanceId(sequenceName, instanceId) {
    return this.sequenceUtilities.createSequenceInstanceId(sequenceName, {
      instanceId
    }, "NORMAL");
  }
  /**
   * Extract symphony name from sequence name
   * @param sequenceName - Full sequence name
   * @returns Symphony name
   */
  extractSymphonyName(sequenceName) {
    return this.sequenceUtilities.extractSymphonyName(sequenceName);
  }
  /**
   * Extract resource ID from sequence name and data
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @returns Resource ID
   */
  extractResourceId(sequenceName, data) {
    return this.sequenceUtilities.extractResourceId(sequenceName, data);
  }
  /**
   * Check for resource conflicts
   * @param resourceId - Resource ID to check
   * @param symphonyName - Symphony name
   * @param priority - Sequence priority
   * @param instanceId - Instance ID
   * @returns Conflict result
   */
  checkResourceConflict(resourceId, symphonyName, priority, instanceId) {
    const delegatorResult = this.resourceDelegator.checkResourceConflict(resourceId, instanceId, priority);
    // Convert ResourceDelegator result to MusicalConductor result format
    return {
      hasConflict: delegatorResult.hasConflict,
      conflictType: delegatorResult.hasConflict ? "SAME_RESOURCE" : "NONE",
      resolution: delegatorResult.resolution === "override" ? "ALLOW" : delegatorResult.resolution === "reject" ? "REJECT" : delegatorResult.resolution === "queue" ? "QUEUE" : "ALLOW",
      message: delegatorResult.reason || "No conflict detected"
    };
  }
  /**
   * Acquire resource ownership
   * @param resourceId - Resource ID
   * @param symphonyName - Symphony name
   * @param instanceId - Instance ID
   * @param sequenceExecutionId - Execution ID
   */
  acquireResourceOwnership(resourceId, symphonyName, instanceId, sequenceExecutionId) {
    this.resourceDelegator.acquireResourceOwnership(resourceId, sequenceExecutionId);
  }
  /**
   * Release resource ownership
   * @param resourceId - Resource ID
   * @param sequenceExecutionId - Execution ID
   */
  releaseResourceOwnership(resourceId, sequenceExecutionId) {
    this.resourceDelegator.releaseResourceOwnership(resourceId, sequenceExecutionId || "unknown");
  }
  /**
   * Get resource ownership information
   * @returns Resource ownership map
   */
  getResourceOwnership() {
    return this.resourceManager.getResourceOwnership();
  }
  /**
   * Get symphony resource mapping
   * @returns Symphony to resources mapping
   */
  getSymphonyResourceMap() {
    return this.resourceManager.getSymphonyResourceMap();
  }
  /**
   * Enhanced resource conflict resolution with strategy selection
   * @param resourceId - Resource ID
   * @param symphonyName - Symphony name
   * @param instanceId - Instance ID
   * @param priority - Sequence priority
   * @param sequenceExecutionId - Execution ID
   * @param sequenceRequest - Full sequence request
   * @returns Resolution result
   */
  resolveResourceConflictAdvanced(resourceId, symphonyName, instanceId, priority, sequenceExecutionId, sequenceRequest) {
    return this.resourceManager.resolveResourceConflictAdvanced(resourceId, symphonyName, instanceId, priority, sequenceExecutionId, sequenceRequest);
  }
  /**
   * Get comprehensive resource diagnostics
   * @returns Resource diagnostics information
   */
  getResourceDiagnostics() {
    return {
      ownership: this.getResourceOwnership(),
      symphonyResourceMap: this.getSymphonyResourceMap(),
      activeConflicts: 0,
      // Would be tracked in a real implementation
      resolvedConflicts: 0 // Would be tracked in a real implementation
    };
  }
  /**
   * Clear all resource ownership
   */
  clearAllResourceOwnership() {
    // This would clear all resource ownership
    console.log("🎼 ResourceConflictManager: Clearing all resource ownership");
  }
  /**
   * Get resource conflict statistics
   * @returns Conflict statistics
   */
  getConflictStatistics() {
    return {
      totalConflicts: 0,
      resolvedConflicts: 0,
      activeConflicts: 0,
      conflictResolutionStrategies: {
        ALLOW: 0,
        REJECT: 0,
        QUEUE: 0,
        INTERRUPT: 0
      }
    };
  }
  /**
   * Check if a resource is currently owned
   * @param resourceId - Resource ID to check
   * @returns True if resource is owned
   */
  isResourceOwned(resourceId) {
    const ownership = this.getResourceOwnership();
    return ownership.has(resourceId);
  }
  /**
   * Get the owner of a resource
   * @param resourceId - Resource ID
   * @returns Resource owner or null if not owned
   */
  getResourceOwner(resourceId) {
    const ownership = this.getResourceOwnership();
    return ownership.get(resourceId) || null;
  }
  /**
   * Get all resources owned by a specific sequence
   * @param sequenceExecutionId - Execution ID
   * @returns Array of resource IDs owned by the sequence
   */
  getResourcesOwnedBySequence(sequenceExecutionId) {
    const ownership = this.getResourceOwnership();
    const ownedResources = [];
    for (const [resourceId, owner] of ownership.entries()) {
      if (owner.sequenceExecutionId === sequenceExecutionId) {
        ownedResources.push(resourceId);
      }
    }
    return ownedResources;
  }
  /**
   * Get debug information
   * @returns Debug resource conflict information
   */
  getDebugInfo() {
    return {
      resourceManager: !!this.resourceManager,
      resourceDelegator: !!this.resourceDelegator,
      sequenceUtilities: !!this.sequenceUtilities,
      diagnostics: this.getResourceDiagnostics(),
      statistics: this.getConflictStatistics()
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/resources/ResourceConflictResolver.js":
/*!*********************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/resources/ResourceConflictResolver.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ResourceConflictResolver: () => (/* binding */ ResourceConflictResolver)
/* harmony export */ });
/* harmony import */ var _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/**
 * ResourceConflictResolver - Conflict resolution strategies
 * Handles different strategies for resolving resource conflicts between symphonies
 */

class ResourceConflictResolver {
  constructor(ownershipTracker) {
    this.ownershipTracker = ownershipTracker;
  }
  /**
   * Analyze priority-based conflicts
   * @param resourceId - Resource identifier
   * @param symphonyName - Requesting symphony name
   * @param priority - Requesting priority
   * @param currentOwner - Current resource owner
   * @returns Conflict analysis result
   */
  analyzePriorityConflict(resourceId, symphonyName, priority, currentOwner) {
    // High priority can interrupt any other priority
    if (priority === _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.HIGH) {
      return {
        hasConflict: true,
        conflictType: "PRIORITY_CONFLICT",
        currentOwner,
        resolution: "INTERRUPT",
        message: `HIGH priority ${symphonyName} can interrupt ${currentOwner.symphonyName} for resource ${resourceId}`
      };
    }
    // Normal and chained priorities cannot interrupt
    return {
      hasConflict: true,
      conflictType: "SAME_RESOURCE",
      currentOwner,
      resolution: "REJECT",
      message: `Resource ${resourceId} is owned by ${currentOwner.symphonyName}, rejecting ${priority} priority request from ${symphonyName}`
    };
  }
  /**
   * Resolve conflict by rejecting the request
   * @param resourceId - Resource identifier
   * @param requestingSymphony - Requesting symphony name
   * @param currentOwner - Current resource owner
   * @returns Resolution result
   */
  resolveConflict_Reject(resourceId, requestingSymphony, currentOwner) {
    console.warn(`🎼 ResourceConflictResolver: REJECT - Resource ${resourceId} is owned by ${currentOwner.symphonyName}, rejecting request from ${requestingSymphony}`);
    return {
      success: false,
      message: `Resource conflict: ${resourceId} owned by ${currentOwner.symphonyName}`
    };
  }
  /**
   * Resolve conflict by queuing the request
   * @param sequenceRequest - Full sequence request
   * @param resourceId - Resource identifier
   * @param currentOwner - Current resource owner
   * @returns Resolution result
   */
  resolveConflict_Queue(sequenceRequest, resourceId, currentOwner) {
    // Add to queue with resource dependency metadata
    const queuedRequest = {
      ...sequenceRequest,
      data: {
        ...sequenceRequest.data,
        waitingForResource: resourceId,
        blockedBy: currentOwner.symphonyName,
        queuedAt: Date.now()
      }
    };
    console.log(`🎼 ResourceConflictResolver: QUEUE - Adding ${sequenceRequest.sequenceName} to queue, waiting for resource ${resourceId} from ${currentOwner.symphonyName}`);
    // Note: In a real implementation, this would integrate with the ExecutionQueue
    // For now, we'll just log the queuing action
    return {
      success: true,
      message: `Request queued waiting for resource ${resourceId}`
    };
  }
  /**
   * Resolve conflict by interrupting the current owner
   * @param resourceId - Resource identifier
   * @param requestingSymphony - Requesting symphony name
   * @param requestingInstanceId - Requesting instance ID
   * @param requestingPriority - Requesting priority
   * @param requestingExecutionId - Requesting execution ID
   * @param currentOwner - Current resource owner
   * @param resourceManager - Resource manager for ownership operations
   * @returns Resolution result
   */
  resolveConflict_Interrupt(resourceId, requestingSymphony, requestingInstanceId, requestingPriority, requestingExecutionId, currentOwner, resourceManager // Avoiding circular dependency
  ) {
    if (requestingPriority !== _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.HIGH) {
      return {
        success: false,
        message: `Only HIGH priority requests can interrupt. Current priority: ${requestingPriority}`
      };
    }
    console.log(`🎼 ResourceConflictResolver: INTERRUPT - HIGH priority ${requestingSymphony} interrupting ${currentOwner.symphonyName} for resource ${resourceId}`);
    // Notify current owner of interruption
    console.warn(`🎼 ResourceConflictResolver: Interrupting ${currentOwner.symphonyName} (${currentOwner.instanceId}) for HIGH priority request`);
    // Log interruption for monitoring
    console.log(`🎼 ResourceConflictResolver: Resource ${resourceId} forcibly transferred from ${currentOwner.symphonyName} to ${requestingSymphony}`);
    // Release the resource
    resourceManager.releaseResourceOwnership(resourceId, currentOwner.sequenceExecutionId);
    // Acquire for the new requester
    const acquired = resourceManager.acquireResourceOwnership(resourceId, requestingSymphony, requestingInstanceId, requestingPriority, requestingExecutionId);
    return {
      success: acquired,
      message: acquired ? `Resource ${resourceId} successfully transferred to ${requestingSymphony}` : `Failed to transfer resource ${resourceId} to ${requestingSymphony}`
    };
  }
  /**
   * Determine optimal resolution strategy based on context
   * @param resourceId - Resource identifier
   * @param requestingPriority - Requesting priority
   * @param currentOwner - Current resource owner
   * @param queueLength - Current queue length
   * @returns Recommended resolution strategy
   */
  determineOptimalStrategy(resourceId, requestingPriority, currentOwner, queueLength) {
    // High priority always interrupts
    if (requestingPriority === _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.HIGH) {
      return "INTERRUPT";
    }
    // If queue is getting long, start rejecting normal priority requests
    if (queueLength > 5 && requestingPriority === _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.NORMAL) {
      return "REJECT";
    }
    // Check how long the current owner has held the resource
    const ownershipDuration = Date.now() - currentOwner.acquiredAt;
    const maxOwnershipTime = 30000; // 30 seconds
    // If current owner has held resource too long, allow queuing
    if (ownershipDuration > maxOwnershipTime) {
      return "QUEUE";
    }
    // Default to rejection for resource conflicts
    return "REJECT";
  }
  /**
   * Get conflict resolution statistics
   * @returns Resolution statistics
   */
  getResolutionStatistics() {
    // In a real implementation, this would track actual statistics
    return {
      totalConflicts: 0,
      rejectedRequests: 0,
      queuedRequests: 0,
      interruptedOwners: 0,
      averageResolutionTime: 0
    };
  }
  /**
   * Check if a resource conflict can be resolved peacefully
   * @param resourceId - Resource identifier
   * @param requestingPriority - Requesting priority
   * @param currentOwner - Current resource owner
   * @returns True if peaceful resolution is possible
   */
  canResolvePeacefully(resourceId, requestingPriority, currentOwner) {
    // High priority requests cannot be resolved peacefully (they interrupt)
    if (requestingPriority === _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES.HIGH) {
      return false;
    }
    // Check if current owner is close to finishing
    const ownershipDuration = Date.now() - currentOwner.acquiredAt;
    const estimatedRemainingTime = 10000; // 10 seconds estimate
    // If owner is likely to finish soon, queuing might be peaceful
    return ownershipDuration > estimatedRemainingTime;
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/resources/ResourceDelegator.js":
/*!**************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/resources/ResourceDelegator.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ResourceDelegator: () => (/* binding */ ResourceDelegator)
/* harmony export */ });
/**
 * ResourceDelegator - Resource management delegation
 * Handles resource conflict checking, ownership management, and advanced conflict resolution
 */
class ResourceDelegator {
  constructor(resourceManager) {
    this.resourceManager = resourceManager;
  }
  /**
   * Check for resource conflicts
   * @param resourceId - Resource ID to check
   * @param requesterId - ID of the requester
   * @param priority - Request priority
   * @returns Conflict check result
   */
  checkResourceConflict(resourceId, requesterId, priority = "NORMAL") {
    try {
      // Use ResourceManager's existing conflict checking
      const result = this.resourceManager.checkResourceConflict(resourceId, requesterId, priority, requesterId);
      // Convert to our format
      return {
        hasConflict: result.hasConflict,
        conflictingResource: resourceId,
        conflictType: result.hasConflict ? "ownership" : undefined,
        resolution: result.resolution === "ALLOW" ? "override" : result.resolution === "REJECT" ? "reject" : result.resolution === "QUEUE" ? "queue" : "queue",
        reason: result.message
      };
    } catch (error) {
      console.error("🔴 ResourceDelegator: Error checking resource conflict:", error);
      return {
        hasConflict: true,
        conflictType: "access",
        resolution: "reject",
        reason: `Error checking resource conflict: ${error.message}`
      };
    }
  }
  /**
   * Determine the type of resource conflict
   * @param resourceId - Resource ID
   * @param currentOwner - Current owner ID
   * @param requesterId - Requester ID
   * @returns Conflict type
   */
  determineConflictType(resourceId, currentOwner, requesterId) {
    // Check for timing conflicts (rapid successive requests)
    if (this.hasTimingConflict(resourceId, requesterId)) {
      return "timing";
    }
    // Check for dependency conflicts
    if (this.hasDependencyConflict(resourceId, currentOwner, requesterId)) {
      return "dependency";
    }
    // Check for access level conflicts
    if (this.hasAccessConflict(resourceId, currentOwner, requesterId)) {
      return "access";
    }
    // Default to ownership conflict
    return "ownership";
  }
  /**
   * Check for timing conflicts
   * @param resourceId - Resource ID
   * @param requesterId - Requester ID
   * @returns True if timing conflict exists
   */
  hasTimingConflict(resourceId, requesterId) {
    // Simplified timing conflict check
    return false; // For now, assume no timing conflicts
  }
  /**
   * Check for dependency conflicts
   * @param resourceId - Resource ID
   * @param currentOwner - Current owner ID
   * @param requesterId - Requester ID
   * @returns True if dependency conflict exists
   */
  hasDependencyConflict(resourceId, currentOwner, requesterId) {
    // Simplified dependency conflict check
    return false; // For now, assume no dependency conflicts
  }
  /**
   * Check for access level conflicts
   * @param resourceId - Resource ID
   * @param currentOwner - Current owner ID
   * @param requesterId - Requester ID
   * @returns True if access conflict exists
   */
  hasAccessConflict(resourceId, currentOwner, requesterId) {
    // Simplified access conflict check
    return false; // For now, assume no access conflicts
  }
  /**
   * Determine resolution strategy for conflict
   * @param conflictType - Type of conflict
   * @param priority - Request priority
   * @returns Resolution strategy
   */
  determineResolutionStrategy(conflictType, priority) {
    switch (conflictType) {
      case "timing":
        return "queue";
      // Queue rapid requests
      case "dependency":
        return "queue";
      // Wait for dependencies to be released
      case "access":
        return "reject";
      // Reject insufficient access
      case "ownership":
        return priority === "IMMEDIATE" ? "override" : "queue";
      default:
        return "queue";
    }
  }
  /**
   * Acquire resource ownership
   * @param resourceId - Resource ID to acquire
   * @param ownerId - ID of the owner
   * @param priority - Request priority
   * @returns Ownership result
   */
  acquireResourceOwnership(resourceId, ownerId, priority = "NORMAL") {
    try {
      const conflictResult = this.checkResourceConflict(resourceId, ownerId, priority);
      if (conflictResult.hasConflict && conflictResult.resolution === "reject") {
        return {
          acquired: false,
          resourceId,
          ownerId,
          reason: conflictResult.reason
        };
      }
      // Attempt to acquire the resource using ResourceManager's method
      const acquired = this.resourceManager.acquireResourceOwnership(resourceId, ownerId, ownerId, priority, ownerId);
      if (acquired) {
        const expirationTime = this.calculateExpirationTime(priority);
        return {
          acquired: true,
          resourceId,
          ownerId,
          expiresAt: expirationTime,
          reason: "Resource acquired successfully"
        };
      } else {
        return {
          acquired: false,
          resourceId,
          ownerId,
          reason: "Failed to acquire resource"
        };
      }
    } catch (error) {
      console.error("🔴 ResourceDelegator: Error acquiring resource ownership:", error);
      return {
        acquired: false,
        resourceId,
        ownerId,
        reason: `Error acquiring resource: ${error.message}`
      };
    }
  }
  /**
   * Calculate resource expiration time based on priority
   * @param priority - Request priority
   * @returns Expiration timestamp
   */
  calculateExpirationTime(priority) {
    const baseTime = Date.now();
    const expirationDelays = {
      IMMEDIATE: 30000,
      // 30 seconds
      HIGH: 60000,
      // 1 minute
      NORMAL: 300000,
      // 5 minutes
      LOW: 600000,
      // 10 minutes
      BACKGROUND: 1800000 // 30 minutes
    };
    const delay = expirationDelays[priority] || expirationDelays.NORMAL;
    return baseTime + delay;
  }
  /**
   * Release resource ownership
   * @param resourceId - Resource ID to release
   * @param ownerId - ID of the owner
   * @returns True if released successfully
   */
  releaseResourceOwnership(resourceId, ownerId) {
    try {
      // Use ResourceManager's existing release method
      this.resourceManager.releaseResourceOwnership(resourceId, ownerId);
      console.log(`✅ ResourceDelegator: Released resource ${resourceId} from ${ownerId}`);
      return true;
    } catch (error) {
      console.error("🔴 ResourceDelegator: Error releasing resource ownership:", error);
      return false;
    }
  }
  /**
   * Resolve advanced resource conflicts
   * @param resourceId - Resource ID with conflict
   * @param requesterId - ID of the requester
   * @param priority - Request priority
   * @returns Advanced conflict resolution
   */
  resolveResourceConflictAdvanced(resourceId, requesterId, priority = "NORMAL") {
    const conflictResult = this.checkResourceConflict(resourceId, requesterId, priority);
    if (!conflictResult.hasConflict) {
      return {
        strategy: "priority-based",
        action: "allow",
        details: {
          originalResourceId: resourceId,
          resolvedResourceId: resourceId
        }
      };
    }
    // Determine resolution strategy based on conflict type and priority
    switch (conflictResult.conflictType) {
      case "timing":
        return this.resolveTimingConflict(resourceId, requesterId, priority);
      case "dependency":
        return this.resolveDependencyConflict(resourceId, requesterId, priority);
      case "access":
        return this.resolveAccessConflict(resourceId, requesterId, priority);
      case "ownership":
      default:
        return this.resolveOwnershipConflict(resourceId, requesterId, priority);
    }
  }
  /**
   * Resolve timing conflicts
   */
  resolveTimingConflict(resourceId, requesterId, priority) {
    return {
      strategy: "time-based",
      action: "queue",
      details: {
        originalResourceId: resourceId,
        queuePosition: 1,
        // Simplified queue position
        estimatedWaitTime: 1000 // 1 second for timing conflicts
      }
    };
  }
  /**
   * Resolve dependency conflicts
   */
  resolveDependencyConflict(resourceId, requesterId, priority) {
    const alternativeResources = []; // Simplified - no alternatives
    return {
      strategy: "resource-sharing",
      action: alternativeResources.length > 0 ? "modify" : "queue",
      details: {
        originalResourceId: resourceId,
        alternativeResources,
        estimatedWaitTime: alternativeResources.length > 0 ? 0 : 5000
      }
    };
  }
  /**
   * Resolve access conflicts
   */
  resolveAccessConflict(resourceId, requesterId, priority) {
    return {
      strategy: "priority-based",
      action: "reject",
      details: {
        originalResourceId: resourceId
      }
    };
  }
  /**
   * Resolve ownership conflicts
   */
  resolveOwnershipConflict(resourceId, requesterId, priority) {
    const action = priority === "IMMEDIATE" ? "allow" : "queue";
    return {
      strategy: "priority-based",
      action,
      details: {
        originalResourceId: resourceId,
        resolvedResourceId: resourceId,
        queuePosition: action === "queue" ? 1 : undefined,
        // Simplified queue position
        estimatedWaitTime: action === "queue" ? 10000 : 0 // 10 seconds for ownership conflicts
      }
    };
  }
  /**
   * Get debug information
   * @returns Debug resource delegation information
   */
  getDebugInfo() {
    return {
      conflictsResolved: 0,
      resourcesAcquired: 0,
      resourcesReleased: 0,
      activeConflicts: 0
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/resources/ResourceManager.js":
/*!************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/resources/ResourceManager.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ResourceManager: () => (/* binding */ ResourceManager)
/* harmony export */ });
/* harmony import */ var _ResourceConflictResolver_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ResourceConflictResolver.js */ "./test-app/dist/modules/communication/sequences/resources/ResourceConflictResolver.js");
/* harmony import */ var _ResourceOwnershipTracker_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ResourceOwnershipTracker.js */ "./test-app/dist/modules/communication/sequences/resources/ResourceOwnershipTracker.js");
/**
 * ResourceManager - Resource ownership and conflict management
 * Handles MCO/MSO resource ownership, conflicts, and resolution strategies
 */


class ResourceManager {
  constructor() {
    this.ownershipTracker = new _ResourceOwnershipTracker_js__WEBPACK_IMPORTED_MODULE_1__.ResourceOwnershipTracker();
    this.conflictResolver = new _ResourceConflictResolver_js__WEBPACK_IMPORTED_MODULE_0__.ResourceConflictResolver(this.ownershipTracker);
  }
  /**
   * Check for resource conflicts
   * @param resourceId - Resource identifier
   * @param symphonyName - Symphony name
   * @param priority - Sequence priority
   * @param instanceId - Instance identifier
   * @returns Conflict analysis result
   */
  checkResourceConflict(resourceId, symphonyName, priority, instanceId) {
    const currentOwner = this.ownershipTracker.getResourceOwner(resourceId);
    if (!currentOwner) {
      return {
        hasConflict: false,
        conflictType: "NONE",
        resolution: "ALLOW",
        message: `Resource ${resourceId} is available`
      };
    }
    // Check for same symphony attempting to re-acquire
    if (currentOwner.symphonyName === symphonyName) {
      if (currentOwner.instanceId === instanceId) {
        return {
          hasConflict: false,
          conflictType: "NONE",
          currentOwner,
          resolution: "ALLOW",
          message: `Resource ${resourceId} already owned by same instance`
        };
      } else {
        return {
          hasConflict: true,
          conflictType: "INSTANCE_CONFLICT",
          currentOwner,
          resolution: "REJECT",
          message: `Resource ${resourceId} owned by different instance of ${symphonyName}`
        };
      }
    }
    // Different symphony - check priority
    return this.conflictResolver.analyzePriorityConflict(resourceId, symphonyName, priority, currentOwner);
  }
  /**
   * Acquire resource ownership
   * @param resourceId - Resource identifier
   * @param symphonyName - Symphony name
   * @param instanceId - Instance identifier
   * @param priority - Sequence priority
   * @param sequenceExecutionId - Sequence execution ID
   * @returns Success status
   */
  acquireResourceOwnership(resourceId, symphonyName, instanceId, priority, sequenceExecutionId) {
    const conflictResult = this.checkResourceConflict(resourceId, symphonyName, priority, instanceId);
    if (conflictResult.resolution === "REJECT") {
      console.warn(`🎼 ResourceManager: Resource acquisition rejected - ${conflictResult.message}`);
      return false;
    } else if (conflictResult.resolution === "INTERRUPT") {
      console.log(`🎼 ResourceManager: Interrupting current owner for HIGH priority request - ${conflictResult.message}`);
      this.releaseResourceOwnership(resourceId, conflictResult.currentOwner.sequenceExecutionId);
    }
    // Acquire the resource
    const resourceOwner = {
      symphonyName,
      instanceId,
      resourceId,
      acquiredAt: Date.now(),
      priority,
      sequenceExecutionId
    };
    return this.ownershipTracker.setResourceOwner(resourceId, resourceOwner, symphonyName);
  }
  /**
   * Release resource ownership
   * @param resourceId - Resource identifier
   * @param sequenceExecutionId - Sequence execution ID (for verification)
   */
  releaseResourceOwnership(resourceId, sequenceExecutionId) {
    const currentOwner = this.ownershipTracker.getResourceOwner(resourceId);
    if (!currentOwner) {
      return; // Resource not owned
    }
    // Verify ownership if execution ID provided
    if (sequenceExecutionId && currentOwner.sequenceExecutionId !== sequenceExecutionId) {
      console.warn(`🎼 ResourceManager: Cannot release resource ${resourceId} - execution ID mismatch`);
      return;
    }
    this.ownershipTracker.releaseResource(resourceId, currentOwner.symphonyName);
    console.log(`🎼 ResourceManager: Released resource ${resourceId} from ${currentOwner.symphonyName}`);
  }
  /**
   * Resolve resource conflicts with advanced strategies
   * @param resourceId - Resource identifier
   * @param symphonyName - Symphony name
   * @param instanceId - Instance identifier
   * @param priority - Sequence priority
   * @param sequenceExecutionId - Sequence execution ID
   * @param sequenceRequest - Full sequence request (for queuing)
   * @returns Resolution result
   */
  resolveResourceConflictAdvanced(resourceId, symphonyName, instanceId, priority, sequenceExecutionId, sequenceRequest) {
    const conflictResult = this.checkResourceConflict(resourceId, symphonyName, priority, instanceId);
    if (!conflictResult.hasConflict) {
      // No conflict - proceed normally
      const acquired = this.acquireResourceOwnership(resourceId, symphonyName, instanceId, priority, sequenceExecutionId);
      return {
        success: acquired,
        message: acquired ? `Resource ${resourceId} acquired successfully` : `Failed to acquire resource ${resourceId}`,
        strategy: "DIRECT_ACQUISITION"
      };
    }
    const currentOwner = conflictResult.currentOwner;
    // Apply resolution strategy based on conflict analysis
    switch (conflictResult.resolution) {
      case "REJECT":
        const rejectResult = this.conflictResolver.resolveConflict_Reject(resourceId, symphonyName, currentOwner);
        return {
          ...rejectResult,
          strategy: "REJECT"
        };
      case "QUEUE":
        const queueResult = this.conflictResolver.resolveConflict_Queue(sequenceRequest, resourceId, currentOwner);
        return {
          ...queueResult,
          strategy: "QUEUE"
        };
      case "INTERRUPT":
        const interruptResult = this.conflictResolver.resolveConflict_Interrupt(resourceId, symphonyName, instanceId, priority, sequenceExecutionId, currentOwner, this);
        return {
          ...interruptResult,
          strategy: "INTERRUPT"
        };
      default:
        return {
          success: false,
          message: `Unknown resolution strategy: ${conflictResult.resolution}`,
          strategy: "UNKNOWN"
        };
    }
  }
  /**
   * Get resource ownership information
   * @returns Resource ownership map
   */
  getResourceOwnership() {
    return this.ownershipTracker.getAllResourceOwners();
  }
  /**
   * Get symphony resource mapping
   * @returns Symphony to resources mapping
   */
  getSymphonyResourceMap() {
    return this.ownershipTracker.getSymphonyResourceMap();
  }
  /**
   * Get sequence instances
   * @returns Sequence instances map
   */
  getSequenceInstances() {
    return this.ownershipTracker.getSequenceInstances();
  }
  /**
   * Get resource statistics
   * @returns Resource usage statistics
   */
  getResourceStatistics() {
    return this.ownershipTracker.getStatistics();
  }
  /**
   * Get resource ownership tracker (for internal use)
   * @returns ResourceOwnershipTracker instance
   */
  getResourceOwnershipTracker() {
    return this.ownershipTracker;
  }
  /**
   * Reset all resource ownership (for testing)
   */
  reset() {
    this.ownershipTracker.reset();
    console.log("🧹 ResourceManager: All resource ownership reset");
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/resources/ResourceOwnershipTracker.js":
/*!*********************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/resources/ResourceOwnershipTracker.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ResourceOwnershipTracker: () => (/* binding */ ResourceOwnershipTracker)
/* harmony export */ });
/**
 * ResourceOwnershipTracker - Ownership tracking
 * Tracks resource ownership, symphony mappings, and sequence instances
 */
class ResourceOwnershipTracker {
  constructor() {
    this.resourceOwnership = new Map();
    this.sequenceInstances = new Map();
    this.symphonyResourceMap = new Map(); // symphonyName -> resourceIds
    this.instanceCounter = 0;
  }
  /**
   * Get resource owner
   * @param resourceId - Resource identifier
   * @returns Resource owner or undefined
   */
  getResourceOwner(resourceId) {
    return this.resourceOwnership.get(resourceId);
  }
  /**
   * Set resource owner
   * @param resourceId - Resource identifier
   * @param owner - Resource owner
   * @param symphonyName - Symphony name
   * @returns Success status
   */
  setResourceOwner(resourceId, owner, symphonyName) {
    try {
      this.resourceOwnership.set(resourceId, owner);
      // Update symphony resource mapping
      if (!this.symphonyResourceMap.has(symphonyName)) {
        this.symphonyResourceMap.set(symphonyName, new Set());
      }
      this.symphonyResourceMap.get(symphonyName).add(resourceId);
      console.log(`🎼 ResourceOwnershipTracker: Resource ${resourceId} acquired by ${symphonyName} (${owner.instanceId})`);
      return true;
    } catch (error) {
      console.error(`🎼 ResourceOwnershipTracker: Failed to set resource owner for ${resourceId}:`, error);
      return false;
    }
  }
  /**
   * Release resource
   * @param resourceId - Resource identifier
   * @param symphonyName - Symphony name
   */
  releaseResource(resourceId, symphonyName) {
    this.resourceOwnership.delete(resourceId);
    // Update symphony resource mapping
    const symphonyResources = this.symphonyResourceMap.get(symphonyName);
    if (symphonyResources) {
      symphonyResources.delete(resourceId);
      if (symphonyResources.size === 0) {
        this.symphonyResourceMap.delete(symphonyName);
      }
    }
    console.log(`🎼 ResourceOwnershipTracker: Resource ${resourceId} released from ${symphonyName}`);
  }
  /**
   * Create sequence instance
   * @param symphonyName - Symphony name
   * @param sequenceExecutionId - Sequence execution ID
   * @returns Instance ID
   */
  createSequenceInstance(symphonyName, sequenceExecutionId) {
    const instanceId = `${symphonyName}-${++this.instanceCounter}-${Date.now()}`;
    const instance = {
      instanceId,
      symphonyName,
      sequenceExecutionId,
      createdAt: Date.now(),
      resourcesOwned: []
    };
    this.sequenceInstances.set(instanceId, instance);
    console.log(`🎼 ResourceOwnershipTracker: Created sequence instance ${instanceId} for ${symphonyName}`);
    return instanceId;
  }
  /**
   * Update sequence instance resources
   * @param instanceId - Instance identifier
   * @param resourceIds - Resource identifiers
   */
  updateInstanceResources(instanceId, resourceIds) {
    const instance = this.sequenceInstances.get(instanceId);
    if (instance) {
      instance.resourcesOwned = [...resourceIds];
    }
  }
  /**
   * Remove sequence instance
   * @param instanceId - Instance identifier
   */
  removeSequenceInstance(instanceId) {
    const instance = this.sequenceInstances.get(instanceId);
    if (instance) {
      // Release all resources owned by this instance
      instance.resourcesOwned.forEach(resourceId => {
        this.releaseResource(resourceId, instance.symphonyName);
      });
      this.sequenceInstances.delete(instanceId);
      console.log(`🎼 ResourceOwnershipTracker: Removed sequence instance ${instanceId}`);
    }
  }
  /**
   * Get all resource owners
   * @returns Resource ownership map
   */
  getAllResourceOwners() {
    return new Map(this.resourceOwnership);
  }
  /**
   * Get symphony resource mapping
   * @returns Symphony to resources mapping
   */
  getSymphonyResourceMap() {
    return new Map(this.symphonyResourceMap);
  }
  /**
   * Get sequence instances
   * @returns Sequence instances map
   */
  getSequenceInstances() {
    return new Map(this.sequenceInstances);
  }
  /**
   * Get resources owned by symphony
   * @param symphonyName - Symphony name
   * @returns Set of resource IDs
   */
  getResourcesOwnedBySymphony(symphonyName) {
    return this.symphonyResourceMap.get(symphonyName) || new Set();
  }
  /**
   * Get active instances for symphony
   * @param symphonyName - Symphony name
   * @returns Array of sequence instances
   */
  getActiveInstancesForSymphony(symphonyName) {
    return Array.from(this.sequenceInstances.values()).filter(instance => instance.symphonyName === symphonyName);
  }
  /**
   * Check if resource is owned
   * @param resourceId - Resource identifier
   * @returns True if resource is owned
   */
  isResourceOwned(resourceId) {
    return this.resourceOwnership.has(resourceId);
  }
  /**
   * Get ownership duration
   * @param resourceId - Resource identifier
   * @returns Ownership duration in milliseconds, or 0 if not owned
   */
  getOwnershipDuration(resourceId) {
    const owner = this.resourceOwnership.get(resourceId);
    return owner ? Date.now() - owner.acquiredAt : 0;
  }
  /**
   * Get resource statistics
   * @returns Resource usage statistics
   */
  getStatistics() {
    const ownedResources = this.resourceOwnership.size;
    const symphoniesWithResources = this.symphonyResourceMap.size;
    // Calculate average ownership duration
    let totalDuration = 0;
    let resourceCount = 0;
    for (const owner of this.resourceOwnership.values()) {
      totalDuration += Date.now() - owner.acquiredAt;
      resourceCount++;
    }
    const averageOwnershipDuration = resourceCount > 0 ? totalDuration / resourceCount : 0;
    return {
      totalResources: ownedResources,
      // In a real system, this would be total available resources
      ownedResources,
      availableResources: 0,
      // Would be calculated as totalResources - ownedResources
      symphoniesWithResources,
      averageOwnershipDuration
    };
  }
  /**
   * Clean up expired instances
   * @param maxAge - Maximum age in milliseconds
   * @returns Number of cleaned up instances
   */
  cleanupExpiredInstances(maxAge = 300000) {
    // 5 minutes default
    const now = Date.now();
    let cleanedUp = 0;
    for (const [instanceId, instance] of this.sequenceInstances.entries()) {
      if (now - instance.createdAt > maxAge) {
        this.removeSequenceInstance(instanceId);
        cleanedUp++;
      }
    }
    if (cleanedUp > 0) {
      console.log(`🧹 ResourceOwnershipTracker: Cleaned up ${cleanedUp} expired instances`);
    }
    return cleanedUp;
  }
  /**
   * Reset all tracking data (for testing)
   */
  reset() {
    this.resourceOwnership.clear();
    this.sequenceInstances.clear();
    this.symphonyResourceMap.clear();
    this.instanceCounter = 0;
    console.log("🧹 ResourceOwnershipTracker: All tracking data reset");
  }
  /**
   * Get debug information
   * @returns Debug information object
   */
  getDebugInfo() {
    return {
      resourceOwnership: Object.fromEntries(this.resourceOwnership),
      sequenceInstances: Object.fromEntries(this.sequenceInstances),
      symphonyResourceMap: Object.fromEntries(Array.from(this.symphonyResourceMap.entries()).map(([key, value]) => [key, Array.from(value)])),
      instanceCounter: this.instanceCounter
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/strictmode/StrictModeManager.js":
/*!***************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/strictmode/StrictModeManager.js ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StrictModeManager: () => (/* binding */ StrictModeManager)
/* harmony export */ });
/**
 * StrictModeManager - React StrictMode handling and duplication detection
 * Handles React StrictMode duplicate detection, pattern recognition, and execution recording
 */
class StrictModeManager {
  constructor(duplicationDetector) {
    this.strictModePatterns = new Set(["double-render", "strict-mode", "development-only", "react-strict", "duplicate-effect", "double-execution"]);
    this.duplicationDetector = duplicationDetector;
  }
  /**
   * Check if a sequence request is a duplicate, considering StrictMode patterns
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @param priority - Sequence priority
   * @returns Duplication check result
   */
  checkForDuplication(sequenceName, data, priority) {
    // Generate hash for the sequence request
    const hash = this.generateSequenceHash(sequenceName, data, priority);
    // Check if this is a duplicate request
    const isDuplicate = this.duplicationDetector.isDuplicateSequenceRequest(hash);
    if (!isDuplicate) {
      return {
        isDuplicate: false,
        hash
      };
    }
    // Check if this is a StrictMode duplicate
    const strictModeResult = this.isStrictModeDuplicate(data);
    return {
      isDuplicate: true,
      hash,
      reason: strictModeResult.isStrictModeDuplicate ? `StrictMode duplicate detected: ${strictModeResult.patterns.join(", ")}` : "Duplicate sequence request detected",
      isStrictMode: strictModeResult.isStrictModeDuplicate
    };
  }
  /**
   * Record a sequence execution to prevent future duplicates
   * @param hash - Hash of the sequence
   */
  recordSequenceExecution(hash) {
    this.duplicationDetector.recordSequenceExecution(hash);
    console.log(`🎼 StrictModeManager: Recorded sequence execution: ${hash.substring(0, 8)}...`);
  }
  /**
   * Check if data contains StrictMode patterns
   * @param data - Data to check for StrictMode patterns
   * @returns StrictMode detection result
   */
  isStrictModeDuplicate(data) {
    const detectedPatterns = [];
    // Check for common StrictMode patterns in data
    const dataString = JSON.stringify(data).toLowerCase();
    for (const pattern of this.strictModePatterns) {
      if (dataString.includes(pattern)) {
        detectedPatterns.push(pattern);
      }
    }
    // Check for React development mode indicators
    if (this.hasReactDevModeIndicators(data)) {
      detectedPatterns.push("react-dev-mode");
    }
    // Check for double execution patterns
    if (this.hasDoubleExecutionPatterns(data)) {
      detectedPatterns.push("double-execution-pattern");
    }
    // Check for timing-based duplicates (very close timestamps)
    if (this.hasTimingBasedDuplicatePattern(data)) {
      detectedPatterns.push("timing-duplicate");
    }
    const isStrictModeDuplicate = detectedPatterns.length > 0;
    return {
      isStrictModeDuplicate,
      patterns: detectedPatterns,
      reason: isStrictModeDuplicate ? `StrictMode patterns detected: ${detectedPatterns.join(", ")}` : undefined
    };
  }
  /**
   * Generate a hash for a sequence request
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @param priority - Sequence priority
   * @returns Hash string
   */
  generateSequenceHash(sequenceName, data, priority) {
    // Create a stable hash by sorting keys and stringifying
    const sortedData = this.sortObjectKeys(data);
    const hashInput = `${sequenceName}:${JSON.stringify(sortedData)}:${priority}`;
    // Simple hash function (in production, use a proper hash library)
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
  /**
   * Sort object keys recursively for consistent hashing
   * @param obj - Object to sort
   * @returns Sorted object
   */
  sortObjectKeys(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }
    const sortedObj = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sortedObj[key] = this.sortObjectKeys(obj[key]);
    }
    return sortedObj;
  }
  /**
   * Check for React development mode indicators
   * @param data - Data to check
   * @returns True if React dev mode indicators found
   */
  hasReactDevModeIndicators(data) {
    // Check for React development mode specific properties
    const reactDevIndicators = ["__reactInternalInstance", "_reactInternalFiber", "__reactInternalMemoizedUnmaskedChildContext", "NODE_ENV"];
    const dataString = JSON.stringify(data);
    return reactDevIndicators.some(indicator => dataString.includes(indicator));
  }
  /**
   * Check for double execution patterns
   * @param data - Data to check
   * @returns True if double execution patterns found
   */
  hasDoubleExecutionPatterns(data) {
    // Check for patterns that indicate double execution
    if (data.executionCount && data.executionCount > 1) {
      return true;
    }
    if (data.renderCount && data.renderCount > 1) {
      return true;
    }
    if (data.effectCount && data.effectCount > 1) {
      return true;
    }
    return false;
  }
  /**
   * Check for timing-based duplicate patterns
   * @param data - Data to check
   * @returns True if timing-based duplicates detected
   */
  hasTimingBasedDuplicatePattern(data) {
    if (!data.timestamp) {
      return false;
    }
    const now = Date.now();
    const timestamp = typeof data.timestamp === "number" ? data.timestamp : parseInt(data.timestamp);
    // If the timestamp is very recent (within 10ms), it might be a StrictMode duplicate
    const timeDiff = Math.abs(now - timestamp);
    return timeDiff < 10;
  }
  /**
   * Add a custom StrictMode pattern
   * @param pattern - Pattern to add
   */
  addStrictModePattern(pattern) {
    this.strictModePatterns.add(pattern.toLowerCase());
    console.log(`🎼 StrictModeManager: Added StrictMode pattern: ${pattern}`);
  }
  /**
   * Remove a StrictMode pattern
   * @param pattern - Pattern to remove
   */
  removeStrictModePattern(pattern) {
    this.strictModePatterns.delete(pattern.toLowerCase());
    console.log(`🎼 StrictModeManager: Removed StrictMode pattern: ${pattern}`);
  }
  /**
   * Get all registered StrictMode patterns
   * @returns Array of patterns
   */
  getStrictModePatterns() {
    return Array.from(this.strictModePatterns);
  }
  /**
   * Clear all recorded sequence executions
   */
  clearExecutionHistory() {
    this.duplicationDetector.reset();
    console.log("🎼 StrictModeManager: Cleared execution history");
  }
  /**
   * Get statistics about StrictMode detection
   * @returns StrictMode statistics
   */
  getStrictModeStatistics() {
    return {
      totalPatterns: this.strictModePatterns.size,
      patterns: this.getStrictModePatterns(),
      detectionEnabled: true
    };
  }
  /**
   * Enable or disable StrictMode detection
   * @param enabled - Whether to enable StrictMode detection
   */
  setStrictModeDetection(enabled) {
    if (enabled) {
      // Re-add default patterns if they were cleared
      const defaultPatterns = ["double-render", "strict-mode", "development-only", "react-strict", "duplicate-effect", "double-execution"];
      for (const pattern of defaultPatterns) {
        this.strictModePatterns.add(pattern);
      }
    } else {
      this.strictModePatterns.clear();
    }
    console.log(`🎼 StrictModeManager: StrictMode detection ${enabled ? "enabled" : "disabled"}`);
  }
  /**
   * Get debug information
   * @returns Debug StrictMode information
   */
  getDebugInfo() {
    return {
      strictModePatterns: this.getStrictModePatterns(),
      totalPatterns: this.strictModePatterns.size,
      detectionEnabled: this.strictModePatterns.size > 0,
      duplicationDetectorStats: {
        // Would get stats from duplicationDetector if available
        recordedExecutions: 0 // Placeholder
      }
    };
  }
}

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/utilities/SequenceUtilities.js":
/*!**************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/utilities/SequenceUtilities.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SequenceUtilities: () => (/* binding */ SequenceUtilities)
/* harmony export */ });
/**
 * SequenceUtilities - Utility methods for sequence processing
 * Handles sequence name parsing, ID generation, and utility operations
 */
class SequenceUtilities {
  /**
   * Create a unique sequence instance ID
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @param priority - Sequence priority
   * @returns Unique instance ID
   */
  createSequenceInstanceId(sequenceName, data, priority) {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    const priorityCode = this.getPriorityCode(priority);
    return `${SequenceUtilities.INSTANCE_ID_PREFIX}_${priorityCode}_${timestamp}_${randomSuffix}`;
  }
  /**
   * Get priority code for ID generation
   * @param priority - Sequence priority
   * @returns Priority code
   */
  getPriorityCode(priority) {
    switch (priority) {
      case "HIGH":
        return "HI";
      case "NORMAL":
        return "NOR";
      case "CHAINED":
        return "CH";
      default:
        return "UNK";
    }
  }
  /**
   * Extract symphony name from sequence name
   * @param sequenceName - Full sequence name
   * @returns Symphony name
   */
  extractSymphonyName(sequenceName) {
    const parts = sequenceName.split(".");
    if (parts.length >= 2) {
      return parts[0].trim();
    }
    return "Default Symphony";
  }
  /**
   * Extract resource ID from sequence name and data
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @returns Resource ID
   */
  extractResourceId(sequenceName, data) {
    // Priority order for resource ID extraction
    if (data?.resourceId) {
      return data.resourceId;
    }
    if (data?.componentId) {
      return `component_${data.componentId}`;
    }
    if (data?.elementId) {
      return `element_${data.elementId}`;
    }
    if (data?.canvasId) {
      return `canvas_${data.canvasId}`;
    }
    // Fallback to sequence-based resource ID
    const symphonyName = this.extractSymphonyName(sequenceName);
    return `symphony_${symphonyName.toLowerCase().replace(/\s+/g, "_")}`;
  }
  /**
   * Get movement name for a specific beat in a sequence
   * @param sequenceName - Name of the sequence
   * @param beatNumber - Beat number
   * @returns Movement information
   */
  getMovementNameForBeat(sequenceName, beatNumber) {
    // Calculate movement based on beat grouping (typically 4 beats per movement)
    const beatsPerMovement = 4;
    const movementNumber = Math.ceil(beatNumber / beatsPerMovement);
    // Generate movement name based on sequence type
    const movementName = this.generateMovementName(sequenceName, movementNumber);
    return {
      name: movementName,
      number: movementNumber,
      description: `Movement ${movementNumber} of ${sequenceName}`
    };
  }
  /**
   * Generate movement name based on sequence name and movement number
   * @param sequenceName - Name of the sequence
   * @param movementNumber - Movement number
   * @returns Generated movement name
   */
  generateMovementName(sequenceName, movementNumber) {
    // Extract sequence type for movement naming
    if (sequenceName.includes("Display")) {
      return `Display Movement ${movementNumber}`;
    }
    if (sequenceName.includes("Animation")) {
      return `Animation Movement ${movementNumber}`;
    }
    if (sequenceName.includes("Interaction")) {
      return `Interaction Movement ${movementNumber}`;
    }
    if (sequenceName.includes("Data")) {
      return `Data Movement ${movementNumber}`;
    }
    // Default movement naming
    return `Movement ${movementNumber}`;
  }
  /**
   * Create execution context for a sequence request
   * @param sequenceRequest - Sequence request
   * @returns Execution context
   */
  createExecutionContext(sequenceRequest) {
    const instanceInfo = this.extractSequenceInstanceInfo(sequenceRequest.sequenceName, sequenceRequest.data, sequenceRequest.priority);
    return {
      id: instanceInfo.instanceId,
      sequenceId: sequenceRequest.sequenceId,
      sequenceName: sequenceRequest.sequenceName,
      sequence: {},
      // Will be filled in by the caller
      data: sequenceRequest.data,
      payload: {},
      startTime: Date.now(),
      currentMovement: 1,
      currentBeat: 0,
      completedBeats: [],
      errors: [],
      executionType: this.determineExecutionType(sequenceRequest),
      priority: sequenceRequest.priority
    };
  }
  /**
   * Extract sequence instance information
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @param priority - Sequence priority
   * @returns Sequence instance information
   */
  extractSequenceInstanceInfo(sequenceName, data, priority) {
    return {
      instanceId: this.createSequenceInstanceId(sequenceName, data, priority),
      symphonyName: this.extractSymphonyName(sequenceName),
      resourceId: this.extractResourceId(sequenceName, data)
    };
  }
  /**
   * Determine execution type based on sequence request
   * @param sequenceRequest - Sequence request
   * @returns Execution type
   */
  determineExecutionType(sequenceRequest) {
    // Determine execution type based on sequence characteristics
    if (sequenceRequest.priority === "HIGH") {
      return "IMMEDIATE";
    }
    return "CONSECUTIVE";
  }
  /**
   * Check if subscriber is authorized
   * @param callerInfo - Information about the caller
   * @returns True if authorized
   */
  isAuthorizedSubscriber(callerInfo) {
    // Allow React components to use conductor.subscribe()
    if (callerInfo?.isReactComponent) {
      return true;
    }
    // Allow known system components
    const authorizedComponents = ["MusicalConductor", "SequenceExecutor", "EventLogger", "StatisticsManager", "PerformanceTracker"];
    if (callerInfo?.componentName && authorizedComponents.includes(callerInfo.componentName)) {
      return true;
    }
    // Allow if caller has proper authorization token
    if (callerInfo?.authToken && this.validateAuthToken(callerInfo.authToken)) {
      return true;
    }
    // Default to allowing subscription (can be made more restrictive)
    return true;
  }
  /**
   * Validate authorization token
   * @param token - Authorization token
   * @returns True if valid
   */
  validateAuthToken(token) {
    // Simple token validation (in production, use proper JWT or similar)
    return token.startsWith("conductor_") && token.length > 20;
  }
  /**
   * Parse sequence name components
   * @param sequenceName - Full sequence name
   * @returns Parsed components
   */
  parseSequenceName(sequenceName) {
    // Parse patterns like "Symphony Name Movement No. X" or "Symphony Name No. X"
    const symphonyMatch = sequenceName.match(/^(.+?)\s+(?:Symphony|Sequence|Movement)\s+No\.\s+(\d+)$/i);
    if (symphonyMatch) {
      return {
        symphony: symphonyMatch[1].trim(),
        number: parseInt(symphonyMatch[2], 10),
        type: "numbered"
      };
    }
    // Parse patterns with movement names
    const movementMatch = sequenceName.match(/^(.+?)\s+(.+?)\s+Movement\s+(\d+)$/i);
    if (movementMatch) {
      return {
        symphony: movementMatch[1].trim(),
        movement: movementMatch[2].trim(),
        number: parseInt(movementMatch[3], 10),
        type: "movement"
      };
    }
    // Default parsing
    return {
      symphony: this.extractSymphonyName(sequenceName),
      type: "simple"
    };
  }
  /**
   * Generate sequence hash for caching/comparison
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @returns Hash string
   */
  generateSequenceHash(sequenceName, data) {
    const hashData = {
      name: sequenceName,
      resourceId: this.extractResourceId(sequenceName, data),
      symphonyName: this.extractSymphonyName(sequenceName)
    };
    // Simple hash generation
    const hashString = JSON.stringify(hashData);
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `${SequenceUtilities.SEQUENCE_ID_PREFIX}_${Math.abs(hash).toString(36)}`;
  }
  /**
   * Get debug information
   * @returns Debug utility information
   */
  getDebugInfo() {
    // In a real implementation, this would track actual statistics
    return {
      generatedIds: 0,
      parsedSequences: 0,
      authorizedSubscribers: 0
    };
  }
}
SequenceUtilities.SEQUENCE_ID_PREFIX = "seq";
SequenceUtilities.INSTANCE_ID_PREFIX = "inst";

/***/ }),

/***/ "./test-app/dist/modules/communication/sequences/validation/SequenceValidator.js":
/*!***************************************************************************************!*\
  !*** ./test-app/dist/modules/communication/sequences/validation/SequenceValidator.js ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SequenceValidator: () => (/* binding */ SequenceValidator)
/* harmony export */ });
/* harmony import */ var _SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../SequenceTypes.js */ "./test-app/dist/modules/communication/sequences/SequenceTypes.js");
/**
 * SequenceValidator - Sequence validation and deduplication
 * Handles sequence validation, hash generation, and deduplication logic
 */

class SequenceValidator {
  constructor(duplicationDetector) {
    this.duplicationDetector = duplicationDetector;
  }
  /**
   * Generate a hash for sequence request data
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @param priority - Sequence priority
   * @returns Hash string
   */
  generateSequenceHash(sequenceName, data, priority) {
    try {
      // Create a stable hash based on sequence name, data, and priority
      const normalizedData = this.normalizeDataForHashing(data);
      const dataString = JSON.stringify(normalizedData, Object.keys(normalizedData).sort());
      const combined = `${sequenceName}:${priority}:${dataString}`;
      // Simple hash function (for production, consider using a proper hash library)
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString(36); // Convert to base36 for shorter string
    } catch (error) {
      console.warn("🔍 SequenceValidator: Failed to generate hash, using fallback:", error);
      return `${sequenceName}-${priority}-${Date.now()}-${Math.random()}`;
    }
  }
  /**
   * Normalize data for consistent hashing
   * @param data - Raw sequence data
   * @returns Normalized data object
   */
  normalizeDataForHashing(data) {
    if (!data || typeof data !== "object") {
      return data;
    }
    // Remove timestamp and other volatile properties that shouldn't affect deduplication
    const normalized = {
      ...data
    };
    delete normalized.timestamp;
    delete normalized._reactInternalFiber;
    delete normalized._reactInternalInstance;
    delete normalized.__reactInternalInstance;
    // Sort arrays for consistent ordering
    Object.keys(normalized).forEach(key => {
      if (Array.isArray(normalized[key])) {
        normalized[key] = [...normalized[key]].sort();
      }
    });
    return normalized;
  }
  /**
   * Enhanced sequence deduplication for StrictMode protection
   * @param sequenceId - ID of the sequence
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @param priority - Sequence priority
   * @returns Deduplication result
   */
  deduplicateSequenceRequest(sequenceId, sequenceName, data, priority) {
    const sequenceHash = this.generateSequenceHash(sequenceName, data, priority);
    // Special handling for ElementLibrary Display sequence - always allow first execution
    if (sequenceName === "Element Library Display Symphony No. 12") {
      const isDuplicate = this.duplicationDetector.isDuplicateSequenceRequest(sequenceHash);
      if (isDuplicate.isDuplicate) {
        const result = this.duplicationDetector.isDuplicateSequenceRequest(sequenceHash);
        console.log(`🎼 SequenceValidator: ElementLibrary Display duplicate check - ${result.reason}`);
        // Always allow the first ElementLibrary Display sequence to execute
        // This ensures the display sequence can run at least once
        console.log("🎼 SequenceValidator: Allowing ElementLibrary Display sequence to execute (special handling)");
        return {
          isDuplicate: false,
          // Override duplicate detection for this sequence
          hash: sequenceHash,
          reason: "ElementLibrary Display sequence - special handling",
          shouldExecute: true
        };
      }
      return {
        isDuplicate: false,
        hash: sequenceHash,
        reason: "ElementLibrary Display sequence - first execution",
        shouldExecute: true
      };
    }
    const isDuplicate = this.duplicationDetector.isDuplicateSequenceRequest(sequenceHash);
    if (isDuplicate.isDuplicate) {
      return {
        isDuplicate: true,
        hash: sequenceHash,
        reason: isDuplicate.reason,
        shouldExecute: false
      };
    }
    return {
      isDuplicate: false,
      hash: sequenceHash,
      reason: "New sequence request",
      shouldExecute: true
    };
  }
  /**
   * Check if data indicates a StrictMode duplicate
   * @param data - Sequence data to analyze
   * @returns True if likely StrictMode duplicate
   */
  isStrictModeDuplicate(data) {
    return this.duplicationDetector.isStrictModeDuplicate(data);
  }
  /**
   * Validate sequence structure and data
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @param priority - Sequence priority
   * @returns Validation result
   */
  validateSequenceRequest(sequenceName, data, priority) {
    const errors = [];
    const warnings = [];
    // Validate sequence name
    if (!sequenceName || typeof sequenceName !== "string") {
      errors.push("Sequence name must be a non-empty string");
    } else if (sequenceName.trim().length === 0) {
      errors.push("Sequence name cannot be empty or whitespace only");
    }
    // Validate priority
    if (!Object.values(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES).includes(priority)) {
      errors.push(`Invalid priority: ${priority}. Must be one of: ${Object.values(_SequenceTypes_js__WEBPACK_IMPORTED_MODULE_0__.SEQUENCE_PRIORITIES).join(", ")}`);
    }
    // Validate data structure
    if (data !== null && data !== undefined && typeof data === "object") {
      // Check for potential StrictMode indicators
      if (this.isStrictModeDuplicate(data)) {
        warnings.push("Potential React StrictMode duplicate detected");
      }
      // Check for circular references
      try {
        JSON.stringify(data);
      } catch (error) {
        errors.push("Sequence data contains circular references");
      }
      // Check for excessively large data
      const dataString = JSON.stringify(data);
      if (dataString.length > 100000) {
        // 100KB limit
        warnings.push("Sequence data is very large (>100KB), consider optimizing");
      }
    }
    // Validate sequence name format
    if (sequenceName && !this.isValidSequenceNameFormat(sequenceName)) {
      warnings.push("Sequence name format may not follow recommended conventions");
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Check if sequence name follows recommended format
   * @param sequenceName - Sequence name to validate
   * @returns True if format is valid
   */
  isValidSequenceNameFormat(sequenceName) {
    // Recommended format: "Name Symphony No. X" or similar
    const patterns = [/^.+\s+Symphony\s+No\.\s+\d+$/i, /^.+\s+Sequence\s+\d+$/i, /^.+\s+Movement\s+\d+$/i, /^[A-Za-z0-9\s\-_.]+$/ // General alphanumeric with common separators
    ];
    return patterns.some(pattern => pattern.test(sequenceName));
  }
  /**
   * Get validation statistics
   * @returns Validation statistics
   */
  getValidationStatistics() {
    // In a real implementation, this would track actual statistics
    return {
      totalValidations: 0,
      validSequences: 0,
      invalidSequences: 0,
      duplicatesDetected: 0,
      strictModeDuplicates: 0
    };
  }
  /**
   * Reset validation state
   */
  reset() {
    console.log("🧹 SequenceValidator: Validation state reset");
  }
  /**
   * Get debug information
   * @returns Debug validation information
   */
  getDebugInfo() {
    return {
      validationStatistics: this.getValidationStatistics(),
      duplicationDetectorInfo: this.duplicationDetector.getDebugInfo()
    };
  }
}

/***/ })

}]);
//# sourceMappingURL=musical-conductor-core.bundle.js.map