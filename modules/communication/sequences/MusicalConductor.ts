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

import { EventBus, EventCallback, UnsubscribeFunction } from "../EventBus";
import { SPAValidator } from "../SPAValidator";
import type {
  MusicalSequence,
  SequenceExecutionContext,
  ConductorStatistics,
  SequenceRequest,
  SequencePriority,
  SequenceBeat,
  SequenceMovement,
} from "./SequenceTypes";
import {
  MUSICAL_TIMING,
  MUSICAL_DYNAMICS,
  MUSICAL_CONDUCTOR_EVENT_TYPES,
  SEQUENCE_PRIORITIES,
} from "./SequenceTypes";

// CIA (Conductor Integration Architecture) interfaces for SPA plugin mounting
export interface SPAPlugin {
  sequence: MusicalSequence;
  handlers: Record<string, Function>;
  metadata?: {
    id: string;
    version: string;
    author?: string;
  };
}

export interface PluginMountResult {
  success: boolean;
  pluginId: string;
  message: string;
  warnings?: string[];
}

// MCO/MSO Resource Ownership and Instance Management Interfaces
export interface ResourceOwner {
  symphonyName: string;
  instanceId: string;
  resourceId: string;
  acquiredAt: number;
  priority: SequencePriority;
  sequenceExecutionId: string;
}

export interface SequenceInstance {
  instanceId: string;
  sequenceName: string;
  symphonyName: string;
  createdAt: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "FAILED";
  resourcesOwned: string[];
}

export interface ResourceConflictResult {
  hasConflict: boolean;
  conflictType:
    | "NONE"
    | "SAME_RESOURCE"
    | "PRIORITY_CONFLICT"
    | "INSTANCE_CONFLICT";
  currentOwner?: ResourceOwner;
  resolution: "ALLOW" | "REJECT" | "QUEUE" | "INTERRUPT";
  message: string;
}

export class MusicalConductor {
  private static instance: MusicalConductor | null = null;

  private eventBus: EventBus;
  private sequences: Map<string, MusicalSequence> = new Map();

  // Sequential Orchestration: Replace concurrent execution with queue-based system
  private activeSequence: SequenceExecutionContext | null = null;
  private sequenceQueue: SequenceRequest[] = [];
  private sequenceHistory: SequenceExecutionContext[] = [];
  private priorities: Map<string, string> = new Map();

  // Beat-level orchestration: Ensure no simultaneous beat execution
  private isExecutingBeat: boolean = false;
  private beatExecutionQueue: Array<{
    executionContext: SequenceExecutionContext;
    beat: SequenceBeat;
    resolve: () => void;
    reject: (error: Error) => void;
  }> = [];

  // Handler-Coordinated Beat Execution tracking
  private processingBeats = new Map<
    string,
    {
      sequenceName: string;
      beatNumber: number;
      startTime: number;
      completeBeat: (data?: any) => void;
      timeoutId?: NodeJS.Timeout;
    }
  >();

  // CIA (Conductor Integration Architecture) properties for SPA plugin mounting
  private mountedPlugins: Map<string, SPAPlugin> = new Map();
  private pluginHandlers: Map<string, Record<string, Function>> = new Map();
  private pluginsRegistered: boolean = false; // Prevent React StrictMode double execution

  // MCO/MSO Resource Ownership and Instance Management
  private resourceOwnership: Map<string, ResourceOwner> = new Map();
  private sequenceInstances: Map<string, SequenceInstance> = new Map();
  private symphonyResourceMap: Map<string, Set<string>> = new Map(); // symphonyName -> resourceIds
  private instanceCounter: number = 0;

  // Phase 3: StrictMode Protection & Idempotency
  private executedSequenceHashes: Set<string> = new Set(); // Track executed sequences to prevent duplicates
  private recentExecutions: Map<string, number> = new Map(); // Track recent executions with timestamps
  private idempotencyWindow: number = 5000; // 5 second window for duplicate detection

  // Enhanced statistics for queue management
  private statistics: ConductorStatistics = {
    totalSequencesExecuted: 0,
    totalBeatsExecuted: 0,
    averageExecutionTime: 0,
    errorCount: 0,
    lastExecutionTime: null,
    totalSequencesQueued: 0,
    maxQueueLength: 0,
    currentQueueLength: 0,
    averageQueueWaitTime: 0,
    sequenceCompletionRate: 0,
    chainedSequences: 0,
  };

  // SPA Validation
  private spaValidator: SPAValidator;

  // Beat execution logging state
  private beatLoggingInitialized: boolean = false;
  private eventSubscriptions: Array<() => void> = []; // Store unsubscribe functions

  // Enhanced logging configuration
  private static readonly ENABLE_HIERARCHICAL_LOGGING: boolean = true;
  private beatStartTimes: Map<string, number> = new Map(); // Track beat start times for duration calculation

  private constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.spaValidator = SPAValidator.getInstance();
    console.log(
      "🔍 MusicalConductor: Constructor called - setting up beat logging...",
      "EventBus instance:",
      eventBus.constructor.name
    );
    this.setupBeatExecutionLogging();
    console.log(
      "🎼 MusicalConductor: CIA-compliant conductor with Sequential Orchestration and SPA validation initialized (Singleton)"
    );
  }

  /**
   * Get the singleton instance of Musical Conductor
   * @param eventBus - The event bus instance (required for first initialization)
   * @returns The singleton Musical Conductor instance
   */
  public static getInstance(eventBus?: EventBus): MusicalConductor {
    if (!MusicalConductor.instance) {
      if (!eventBus) {
        throw new Error(
          "EventBus is required for first initialization of Musical Conductor"
        );
      }
      MusicalConductor.instance = new MusicalConductor(eventBus);
    } else if (eventBus && MusicalConductor.instance.eventBus !== eventBus) {
      console.warn(
        "🎼 MusicalConductor: Attempting to change eventBus on existing singleton instance - ignoring"
      );
    }
    return MusicalConductor.instance;
  }

  /**
   * Reset the singleton instance (for testing/cleanup)
   * This allows re-initialization if needed
   */
  public static resetInstance(): void {
    if (MusicalConductor.instance) {
      MusicalConductor.instance.cleanupEventSubscriptions();
    }
    MusicalConductor.instance = null;
    console.log("🔄 MusicalConductor: Singleton instance reset");
  }

  /**
   * Set up beat execution logging
   * Protected against duplicate initialization within the singleton
   */
  private setupBeatExecutionLogging(): void {
    if (this.beatLoggingInitialized) {
      console.log(
        "🎼 Beat execution logging already initialized in conductor, skipping..."
      );
      return;
    }

    console.log("🎼 Setting up beat execution logging in conductor...");

    // Check current subscriber count before adding
    const beatStartedCount = this.eventBus.getSubscriberCount(
      MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_STARTED
    );
    const sequenceStartedCount = this.eventBus.getSubscriberCount(
      MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_STARTED
    );
    console.log(
      `🔍 Current subscribers - BEAT_STARTED: ${beatStartedCount}, SEQUENCE_STARTED: ${sequenceStartedCount}`
    );

    // Clean up any existing subscriptions first (React StrictMode protection)
    this.cleanupEventSubscriptions();

    // Listen for beat started events
    const beatStartedUnsubscribe = this.eventBus.subscribe(
      MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_STARTED,
      (data: any) => {
        if (MusicalConductor.ENABLE_HIERARCHICAL_LOGGING) {
          this.logBeatStartedHierarchical(data);
        } else {
          console.log(
            `🎵 Beat ${data.beat} Started: ${data.title || "No title"} (${
              data.event
            }) - ${data.sequenceName}`
          );
        }
      }
    );
    this.eventSubscriptions.push(beatStartedUnsubscribe);

    // Listen for beat completed events
    const beatCompletedUnsubscribe = this.eventBus.subscribe(
      MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_COMPLETED,
      (data: any) => {
        if (MusicalConductor.ENABLE_HIERARCHICAL_LOGGING) {
          this.logBeatCompletedHierarchical(data);
        } else {
          console.log(
            `🎵 Beat ${data.beat} Completed: ${data.event} - ${data.sequenceName}`
          );
        }
      }
    );
    this.eventSubscriptions.push(beatCompletedUnsubscribe);

    // Listen for beat failed events
    const beatFailedUnsubscribe = this.eventBus.subscribe(
      MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_FAILED,
      (data: any) => {
        if (!MusicalConductor.ENABLE_HIERARCHICAL_LOGGING) {
          console.error(
            `🎵 Beat ${data.beat} Failed: ${data.event} - ${data.sequenceName} (${data.error})`
          );
        }
        // Note: Hierarchical logging for errors is handled in handleBeatError method
      }
    );
    this.eventSubscriptions.push(beatFailedUnsubscribe);

    // Listen for sequence started events
    const sequenceStartedUnsubscribe = this.eventBus.subscribe(
      MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_STARTED,
      (data: any) => {
        console.log(
          `🎼 Sequence Started: ${data.sequenceName} (ID: ${data.requestId})`
        );
      }
    );
    this.eventSubscriptions.push(sequenceStartedUnsubscribe);

    // Listen for sequence completed events
    const sequenceCompletedUnsubscribe = this.eventBus.subscribe(
      MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_COMPLETED,
      (data: any) => {
        console.log(
          `🎼 Sequence Completed: ${
            data.sequenceName
          } (${data.executionTime.toFixed(2)}ms, ${data.beatsExecuted} beats, ${
            data.errors
          } errors)`
        );
      }
    );
    this.eventSubscriptions.push(sequenceCompletedUnsubscribe);

    this.beatLoggingInitialized = true;

    // Check final subscriber counts
    const finalBeatStartedCount = this.eventBus.getSubscriberCount(
      MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_STARTED
    );
    const finalSequenceStartedCount = this.eventBus.getSubscriberCount(
      MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_STARTED
    );
    console.log(
      `🔍 Final subscribers - BEAT_STARTED: ${finalBeatStartedCount}, SEQUENCE_STARTED: ${finalSequenceStartedCount}`
    );

    console.log("✅ Beat execution logging set up successfully in conductor");
  }

  /**
   * Clean up event subscriptions (React StrictMode protection)
   */
  private cleanupEventSubscriptions(): void {
    if (this.eventSubscriptions.length > 0) {
      console.log(
        `🧹 Cleaning up ${this.eventSubscriptions.length} event subscriptions`
      );
      this.eventSubscriptions.forEach((unsubscribe) => unsubscribe());
      this.eventSubscriptions = [];
    }
  }

  /**
   * Log beat started event with hierarchical format
   * @param data - Beat started event data
   */
  private logBeatStartedHierarchical(data: any): void {
    const beatKey = `${data.sequenceName}-${data.beat}`;
    const startTime = performance.now();
    this.beatStartTimes.set(beatKey, startTime);

    // Get movement information from active sequence
    const movementName = this.getMovementNameForBeat(
      data.sequenceName,
      data.beat
    );

    // Create hierarchical log group with enhanced styling
    const groupLabel = `🎵 Beat ${data.beat} Started: ${
      data.title || data.event
    } (${data.event})`;
    console.group(`%c${groupLabel}`, "color: #4A90E2; font-weight: bold;");
    console.log(`🔸 Movement: ${movementName}`);
    console.log(`📥 Context:`, {
      sequence: data.sequenceName,
      event: data.event,
      beat: data.beat,
      type: data.sequenceType || "UNKNOWN",
      timing: data.timing || "immediate",
      dynamics: data.dynamics || "mf",
    });

    // 🎽 Log the Data Baton - show payload contents at each beat
    if (this.activeSequence?.payload) {
      console.log(`🎽 Baton:`, this.activeSequence.payload);
    } else {
      console.log(`🎽 Baton: (empty)`);
    }
  }

  /**
   * Log beat completed event with hierarchical format
   * @param data - Beat completed event data
   */
  private logBeatCompletedHierarchical(data: any): void {
    const beatKey = `${data.sequenceName}-${data.beat}`;
    const startTime = this.beatStartTimes.get(beatKey);

    if (startTime) {
      const duration = (performance.now() - startTime).toFixed(2);
      console.log(
        `%c✅ Completed in ${duration}ms`,
        "color: #28A745; font-weight: bold;"
      );
      this.beatStartTimes.delete(beatKey);
    } else {
      console.log(`%c✅ Completed`, "color: #28A745; font-weight: bold;");
    }

    console.groupEnd();
  }

  /**
   * Get movement name for a specific beat in a sequence
   * @param sequenceName - Name of the sequence
   * @param beatNumber - Beat number
   * @returns Movement name or fallback
   */
  private getMovementNameForBeat(
    sequenceName: string,
    beatNumber: number
  ): string {
    const sequence = this.sequences.get(sequenceName);
    if (!sequence) {
      return "Unknown Movement";
    }

    // Find the movement that contains this beat
    for (const movement of sequence.movements) {
      const beatExists = movement.beats.some(
        (beat) => beat.beat === beatNumber
      );
      if (beatExists) {
        return movement.name;
      }
    }

    return "Unknown Movement";
  }

  /**
   * Handle beat execution error with hierarchical logging
   * @param executionContext - Execution context
   * @param beat - Beat that failed
   * @param error - Error that occurred
   */
  private handleBeatError(
    executionContext: SequenceExecutionContext,
    beat: SequenceBeat,
    error: Error
  ): void {
    // Emit beat failed event
    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_FAILED, {
      sequenceName: executionContext.sequenceName,
      beat: beat.beat,
      event: beat.event,
      sequenceType: executionContext.executionType,
      movement: executionContext.currentMovement,
      error: error.message,
      success: false,
    });

    // Log error in hierarchical format if enabled
    if (MusicalConductor.ENABLE_HIERARCHICAL_LOGGING) {
      console.log(
        `%c❌ Error: ${error.message}`,
        "color: #DC3545; font-weight: bold;"
      );
      console.groupEnd(); // Close the beat group on error

      // Clean up timing data for failed beat
      const beatKey = `${executionContext.sequenceName}-${beat.beat}`;
      this.beatStartTimes.delete(beatKey);
    }
  }

  /**
   * Register a musical sequence
   * @param sequence - The sequence to register
   */
  registerSequence(sequence: MusicalSequence): void {
    this.sequences.set(sequence.name, sequence);
    console.log(`🎼 MusicalConductor: Registered sequence "${sequence.name}"`);

    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_REGISTERED, {
      sequenceName: sequence.name,
      category: sequence.category,
    });
  }

  /**
   * Unregister a musical sequence
   * @param sequenceName - Name of the sequence to unregister
   */
  unregisterSequence(sequenceName: string): void {
    if (this.sequences.has(sequenceName)) {
      this.sequences.delete(sequenceName);
      console.log(
        `🎼 MusicalConductor: Unregistered sequence "${sequenceName}"`
      );

      this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_UNREGISTERED, {
        sequenceName,
      });
    }
  }

  /**
   * Get a registered sequence
   * @param sequenceName - Name of the sequence
   */
  getSequence(sequenceName: string): MusicalSequence | undefined {
    return this.sequences.get(sequenceName);
  }

  /**
   * Get all registered sequence names
   */
  getSequenceNames(): string[] {
    return Array.from(this.sequences.keys());
  }

  /**
   * Get all registered sequences with their details
   * @returns Array of registered sequences
   */
  getRegisteredSequences(): MusicalSequence[] {
    return Array.from(this.sequences.values());
  }

  /**
   * Get all mounted plugin names
   */
  getMountedPlugins(): string[] {
    return Array.from(this.mountedPlugins.keys());
  }

  // ===== CIA (Conductor Integration Architecture) Methods =====

  /**
   * Play a specific movement of a mounted SPA plugin (CIA-compliant)
   * @param pluginId - The plugin identifier
   * @param sequenceName - The sequence name to execute (renamed from sequenceId for consistency)
   * @param context - Context data to pass to the movement handler
   * @param priority - Sequence priority (NORMAL, HIGH, CHAINED)
   * @returns Execution result
   */
  play(
    pluginId: string,
    sequenceName: string,
    context: any = {},
    priority: SequencePriority = SEQUENCE_PRIORITIES.NORMAL
  ): any {
    try {
      console.log(`🎼 MusicalConductor.play(): ${pluginId} -> ${sequenceName}`);

      // SPA Validation: Register plugin (silent)
      this.spaValidator.registerPlugin(pluginId);

      // Validate plugin exists
      const plugin = this.mountedPlugins.get(pluginId);
      if (!plugin) {
        console.warn(
          `🧠 Plugin not found: ${pluginId}. Available plugins: [${Array.from(
            this.mountedPlugins.keys()
          ).join(", ")}]`
        );
        return null;
      }

      // Start the sequence instead of calling handlers directly
      return this.startSequence(sequenceName, context, priority);
    } catch (error) {
      console.error(
        `🧠 MusicalConductor.play() failed for ${pluginId}.${sequenceName}:`,
        (error as Error).message
      );
      return null;
    }
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
  subscribe(eventName: string, callback: EventCallback, context?: any): UnsubscribeFunction {
    // Validate caller is allowed to subscribe
    const stack = new Error().stack || "";
    const callerInfo = this.spaValidator.analyzeCallStack(stack);

    if (!this.isAuthorizedSubscriber(callerInfo)) {
      const violation = this.spaValidator.createViolation(
        "UNAUTHORIZED_CONDUCTOR_SUBSCRIBE",
        callerInfo.pluginId || "unknown",
        `Unauthorized conductor.subscribe() call from ${callerInfo.source}`,
        stack,
        "error"
      );
      this.spaValidator.handleViolation(violation);

      if (this.spaValidator.config.strictMode) {
        throw new Error(`Unauthorized conductor.subscribe() call from ${callerInfo.source}`);
      }
    }

    // Internal eventBus.subscribe() call with conductor context
    return this.eventBus.subscribe(eventName, callback, {
      ...context,
      conductorManaged: true,
      subscribedVia: 'conductor'
    });
  }

  /**
   * Unsubscribe from events through the conductor (SPA-compliant)
   * @param eventName - The event name to unsubscribe from
   * @param callback - The callback function to remove
   */
  unsubscribe(eventName: string, callback: EventCallback): void {
    // Validate caller is allowed to unsubscribe
    const stack = new Error().stack || "";
    const callerInfo = this.spaValidator.analyzeCallStack(stack);

    if (!this.isAuthorizedSubscriber(callerInfo)) {
      const violation = this.spaValidator.createViolation(
        "UNAUTHORIZED_CONDUCTOR_UNSUBSCRIBE",
        callerInfo.pluginId || "unknown",
        `Unauthorized conductor.unsubscribe() call from ${callerInfo.source}`,
        stack,
        "error"
      );
      this.spaValidator.handleViolation(violation);

      if (this.spaValidator.config.strictMode) {
        throw new Error(`Unauthorized conductor.unsubscribe() call from ${callerInfo.source}`);
      }
    }

    // Internal eventBus.unsubscribe() call
    this.eventBus.unsubscribe(eventName, callback);
  }

  /**
   * Check if the caller is authorized to use conductor subscription methods
   * @param callerInfo - Information about the caller from stack analysis
   * @returns True if authorized, false otherwise
   */
  private isAuthorizedSubscriber(callerInfo: any): boolean {
    // Allow React components to use conductor.subscribe()
    if (callerInfo.isReactComponent) {
      return true;
    }

    // Allow plugins to use conductor.subscribe() within mount method
    if (callerInfo.isPlugin && callerInfo.isInMountMethod) {
      return true;
    }

    // Allow conductor internal usage
    if (callerInfo.source === 'MusicalConductor') {
      return true;
    }

    return false;
  }

  /**
   * Mount an SPA plugin with comprehensive validation (CIA-compliant)
   * @param sequence - The sequence definition from the plugin
   * @param handlers - The handlers object from the plugin
   * @param pluginId - Optional plugin ID (defaults to sequence.name)
   * @returns Plugin mount result
   */
  async mount(
    sequence: any,
    handlers: any,
    pluginId?: string,
    metadata?: any
  ): Promise<PluginMountResult> {
    const id = pluginId || sequence?.name || "unknown-plugin";
    const warnings: string[] = [];

    try {
      console.log(`🧠 MusicalConductor: Attempting to mount plugin: ${id}`);

      // SPA Validation: Check plugin compliance before mounting
      const pluginCode = this.extractPluginCode(sequence, handlers);
      const spaValidation = this.spaValidator.validatePluginMount(
        id,
        pluginCode
      );

      if (!spaValidation.valid) {
        console.error(
          `🎼 SPA Validation failed for plugin ${id}:`,
          spaValidation.violations
        );
        return {
          success: false,
          pluginId: id,
          message: `SPA validation failed: ${spaValidation.violations.join(
            ", "
          )}`,
          warnings: spaValidation.violations,
        };
      }

      // Pre-Compilation Validation: Check if plugin is properly compiled
      const preCompilationValidation = await this.validatePluginPreCompilation(
        id
      );
      if (!preCompilationValidation.valid) {
        console.warn(
          `🔨 Pre-compilation validation failed for plugin ${id}:`,
          preCompilationValidation.issues
        );
        // Don't fail mounting for pre-compilation issues, but log warnings
        warnings.push(...preCompilationValidation.issues);
      }

      // Validate sequence
      if (!sequence) {
        console.error("🧠 Mount failed: sequence is required");
        return {
          success: false,
          pluginId: id,
          message: "Mount failed: sequence is required",
        };
      }

      if (!sequence.movements || !Array.isArray(sequence.movements)) {
        console.error("🧠 Mount failed: sequence.movements must be an array");
        return {
          success: false,
          pluginId: id,
          message: "Mount failed: sequence.movements must be an array",
        };
      }

      // Note: handlers are optional - plugins use event bus for beat execution
      // Handlers are only needed for legacy direct movement calls

      // Validate movement-to-handler mapping
      for (const movement of sequence.movements) {
        if (!movement.name) {
          console.warn("🧠 Movement missing name, skipping validation");
          warnings.push("Movement missing name, skipping validation");
          continue;
        }

        // Only validate handlers if they are provided (optional for event-driven plugins)
        if (handlers && typeof handlers === "object") {
          if (!(movement.name in handlers)) {
            console.warn(`🧠 Missing handler for movement: ${movement.name}`);
            warnings.push(`Missing handler for movement: ${movement.name}`);
          }

          if (
            handlers[movement.name] &&
            typeof handlers[movement.name] !== "function"
          ) {
            console.error(`🧠 Handler for ${movement.name} is not a function`);
            return {
              success: false,
              pluginId: id,
              message: `Handler for ${movement.name} is not a function`,
            };
          }
        }
      }

      // Create plugin object
      const plugin: SPAPlugin = {
        sequence,
        handlers,
        metadata: {
          id,
          version: sequence.metadata?.version || "1.0.0",
          author: sequence.metadata?.author,
        },
      };

      // Mount the plugin
      this.mountedPlugins.set(id, plugin);

      // Store handlers only if provided (optional for event-bus driven plugins)
      if (handlers && typeof handlers === "object") {
        this.pluginHandlers.set(id, handlers);
      }

      // Register the sequence with the existing conductor system
      this.registerSequence(sequence);

      console.log(`🧠 MusicalConductor: Successfully mounted plugin: ${id}`);

      return {
        success: true,
        pluginId: id,
        message: `Successfully mounted plugin: ${id}`,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      console.error("🧠 MusicalConductor: Mount failed with error:", error);
      return {
        success: false,
        pluginId: id,
        message: `Mount failed with error: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Register CIA-compliant plugins
   * Loads and mounts all plugins from the plugins directory
   */
  async registerCIAPlugins(): Promise<void> {
    try {
      // Prevent React StrictMode double execution
      if (this.pluginsRegistered) {
        console.log(
          "⚠️ Plugins already registered, skipping duplicate registration"
        );
        return;
      }

      console.log("🧠 Registering CIA-compliant plugins...");

      // Load plugin manifest - this is the ONLY source of truth
      const pluginManifest = await this.loadPluginManifest();
      console.log(
        "📋 Plugin manifest loaded with",
        pluginManifest.statistics.totalPlugins,
        "plugins across",
        pluginManifest.statistics.totalDomains,
        "domains"
      );

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

  private async loadPluginManifest() {
    try {
      console.log("🎼 MusicalConductor: Loading plugin manifest...");
      const response = await fetch("/plugins/plugin-manifest.json");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error(
          "🎼 MusicalConductor: Expected JSON but got:",
          contentType,
          text.substring(0, 100)
        );
        throw new Error(`Expected JSON but got ${contentType}`);
      }

      const manifest = await response.json();

      // Validate manifest structure
      if (!manifest.domains || !manifest.plugins) {
        throw new Error("Invalid plugin manifest structure");
      }

      console.log("✅ Plugin manifest loaded successfully");
      return manifest;
    } catch (error) {
      console.error("❌ Failed to load plugin manifest:", error);
      // Return default manifest structure
      return {
        domains: {},
        plugins: [],
        statistics: { totalPlugins: 0, totalDomains: 0 },
      };
    }
  }

  private async registerPluginsFromManifest(manifest: any) {
    console.log(
      "🎼 MusicalConductor: Registering plugins from manifest (data-driven)..."
    );

    // Debug: Check if ElementLibrary.library-drop-symphony is in the manifest
    const elementLibraryPlugin = manifest.plugins.find(
      (p) => p.name === "ElementLibrary.library-drop-symphony"
    );
    if (elementLibraryPlugin) {
      console.log(
        "🔍 DEBUG: ElementLibrary.library-drop-symphony found in manifest:",
        elementLibraryPlugin
      );
    } else {
      console.error(
        "🚨 DEBUG: ElementLibrary.library-drop-symphony NOT found in manifest!"
      );
      console.error(
        "🚨 Available plugins:",
        manifest.plugins.map((p) => p.name)
      );
    }

    // Debug: Log all plugins being processed
    console.log(
      "🔍 DEBUG: Starting plugin loop, total plugins:",
      manifest.plugins.length
    );
    manifest.plugins.forEach((p, index) => {
      console.log(
        `🔍 DEBUG: Plugin ${index + 1}: ${p.name} (autoMount: ${p.autoMount})`
      );
    });

    // Iterate through plugins defined in manifest
    for (const plugin of manifest.plugins) {
      try {
        console.log(`🔍 DEBUG: Processing plugin: ${plugin.name}`);

        // Special debugging for ElementLibrary plugin
        if (plugin.name === "ElementLibrary.library-drop-symphony") {
          console.log(
            "🔍 DEBUG: *** FOUND ElementLibrary.library-drop-symphony in loop! ***"
          );
          console.log("🔍 DEBUG: Plugin config:", plugin);
          console.log("🔍 DEBUG: autoMount:", plugin.autoMount);
        }

        if (plugin.autoMount) {
          // Check if plugin is already mounted (prevents React StrictMode double execution)
          if (this.mountedPlugins.has(plugin.name)) {
            console.log(`⚠️ Plugin already mounted, skipping: ${plugin.name}`);
            continue;
          }

          // TEMPORARY: Skip problematic plugins that block ElementLibrary loading
          if (plugin.name === "Component.element-selection-symphony") {
            console.log(
              `⏭️ TEMP SKIP: Skipping ${plugin.name} due to dependency issues`
            );
            continue;
          }

          // TEMPORARY: Skip visual-selection-tools to allow ElementLibrary.library-drop-symphony to load
          if (plugin.name === "Component.visual-selection-tools-symphony") {
            console.log(
              `⏭️ TEMP SKIP: Skipping ${plugin.name} to allow ElementLibrary.library-drop-symphony to load`
            );
            continue;
          }

          console.log(
            `🔌 Loading plugin: ${plugin.name} (${plugin.domain} domain)`
          );

          // Special error handling for JsonLoader to prevent it from crashing the loop
          if (plugin.name === "JsonLoader.json-component-symphony") {
            console.log(
              "🔍 DEBUG: JsonLoader.json-component-symphony - applying enhanced error handling"
            );
            try {
              const pluginPath = `/plugins/./${plugin.path}/index.js`;
              const pluginModule = await this.loadPluginModule(pluginPath);

              // Validate plugin structure
              if (!pluginModule.sequence || !pluginModule.handlers) {
                console.error(
                  `❌ JsonLoader missing required exports (sequence, handlers)`
                );
                continue;
              }

              // Mount using correct CIA format
              await this.mount(
                pluginModule.sequence,
                pluginModule.handlers,
                plugin.name,
                {
                  domain: plugin.domain,
                  functionality: plugin.functionality,
                  priority: plugin.priority,
                  isCore: plugin.isCore,
                }
              );

              // Call the plugin's CIA mount method if available
              if (
                pluginModule.CIAPlugin &&
                typeof pluginModule.CIAPlugin.mount === "function"
              ) {
                console.log("🔍 DEBUG: Calling JsonLoader CIAPlugin.mount()");
                pluginModule.CIAPlugin.mount(this);
              }

              console.log(`✅ Plugin registered: ${plugin.name}`);
            } catch (error) {
              console.error(
                `❌ JsonLoader.json-component-symphony failed but continuing plugin loading:`,
                error
              );
              console.error(
                `❌ Components may not load in ElementLibrary, but other plugins will continue`
              );
              // Continue with next plugin instead of crashing
              continue;
            }
            continue; // Skip the normal loading process since we handled it above
          }

          // Special debugging for ElementLibrary plugin
          if (plugin.name === "ElementLibrary.library-drop-symphony") {
            console.log(
              "🔍 DEBUG: ElementLibrary.library-drop-symphony plugin loading started"
            );
            console.log("🔍 DEBUG: Plugin config:", plugin);
          }

          // Dynamic plugin loading using pre-compiled JavaScript files
          const pluginModule = await this.loadPluginModule(
            `/plugins/${plugin.path}index.js`
          );

          // Register the plugin using manifest metadata
          await this.mount(
            pluginModule.sequence,
            pluginModule.handlers,
            plugin.name,
            {
              domain: plugin.domain,
              functionality: plugin.functionality,
              priority: plugin.priority,
              isCore: plugin.isCore,
            }
          );

          // Call the plugin's CIA mount method if available
          if (
            pluginModule.CIAPlugin &&
            typeof pluginModule.CIAPlugin.mount === "function"
          ) {
            try {
              const mountResult = pluginModule.CIAPlugin.mount(
                this,
                this.eventBus
              );
              if (!mountResult) {
                console.warn(
                  `⚠️ Plugin ${plugin.name} mount method returned false`
                );
              }
            } catch (error) {
              console.error(
                `❌ Plugin ${plugin.name} mount method failed:`,
                error
              );
            }
          }

          console.log(`✅ Plugin registered: ${plugin.name}`);
        } else {
          console.log(`⏭️  Skipping plugin: ${plugin.name} (autoMount: false)`);
        }
      } catch (error) {
        console.error(`❌ Failed to load plugin ${plugin.name}:`, error);
        console.error(`❌ Plugin ${plugin.name} will not be available for use`);
        console.error(
          `❌ Error type: ${
            error instanceof Error ? error.constructor.name : typeof error
          }`
        );
        console.error(
          `❌ Error message: ${
            error instanceof Error ? error.message : String(error)
          }`
        );

        // Special debugging for ElementLibrary plugin
        if (plugin.name === "ElementLibrary.library-drop-symphony") {
          console.error(
            "🔍 CRITICAL: ElementLibrary.library-drop-symphony plugin loading FAILED"
          );
          console.error(
            "🔍 This means drag-and-drop from library will not work!"
          );
          console.error("🔍 Error details:", error);
          console.error(
            "🔍 Error stack:",
            error instanceof Error ? error.stack : "No stack"
          );
        }

        // Continue with other plugins - don't fail entire registration
      }
    }

    console.log("✅ Data-driven plugin registration completed");
  }

  private registerFallbackSequences() {
    // Register basic event handlers for core functionality
    console.log("🎼 MusicalConductor: Registering fallback sequences...");

    // Basic drag and drop functionality
    this.eventBus.subscribe("canvas:element:drag:start", (data: any) => {
      console.log("🎼 Fallback: Canvas drag start", data);
    });

    this.eventBus.subscribe("canvas:element:drag:end", (data: any) => {
      console.log("🎼 Fallback: Canvas drag end", data);
    });

    // Basic component loading
    this.eventBus.subscribe("component:loading:start", (data: any) => {
      console.log("🎼 Fallback: Component loading start", data);
    });

    console.log("✅ MusicalConductor: Fallback sequences registered");
  }

  /**
   * Execute movement with handler validation (CIA-compliant)
   * @param sequenceName - Sequence name identifier
   * @param movementName - Movement name
   * @param data - Data to pass to handler
   * @returns Handler execution result
   */
  executeMovementHandler(
    sequenceName: string,
    movementName: string,
    data: any
  ): any {
    try {
      const handlers = this.pluginHandlers.get(sequenceName);

      if (!handlers) {
        console.warn(`🧠 No handlers found for sequence: ${sequenceName}`);
        return null;
      }

      if (!(movementName in handlers)) {
        console.warn(`🧠 Missing handler for movement: ${movementName}`);
        return null;
      }

      const handler = handlers[movementName];
      if (typeof handler !== "function") {
        console.error(`🧠 Handler for ${movementName} is not a function`);
        return null;
      }

      console.log(
        `🧠 MusicalConductor: Executing handler for movement: ${movementName}`
      );
      return handler(data);
    } catch (error) {
      console.error(
        `🧠 MusicalConductor: Handler execution failed for ${movementName}:`,
        error
      );
      return null;
    }
  }

  /**
   * Load plugin module - tries bundled ESM first, falls back to complex dependency resolution
   * @param pluginPath - Path to the plugin module (e.g., "/plugins/App.app-shell-symphony/index.js")
   * @returns Plugin module with exports
   */
  private async loadPluginModule(pluginPath: string): Promise<any> {
    // Extract plugin directory from path
    const pluginDir = pluginPath.substring(0, pluginPath.lastIndexOf("/"));
    const bundledPath = `${pluginDir}/dist/plugin.js`;

    // Try to load bundled ESM version first
    try {
      console.log(`🔗 Attempting to load bundled plugin: ${bundledPath}`);

      // Fetch the bundled ESM code
      const response = await fetch(bundledPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const bundledCode = await response.text();
      console.log(
        `📦 Bundled plugin code fetched (${bundledCode.length} chars)`
      );

      // Create a blob URL for the self-contained ESM code
      const blob = new Blob([bundledCode], {
        type: "application/javascript",
      });
      const blobUrl = URL.createObjectURL(blob);

      try {
        // Use dynamic import with the blob URL
        const plugin = await import(/* @vite-ignore */ blobUrl);
        console.log(`✅ Loaded bundled plugin:`, Object.keys(plugin));
        return plugin;
      } finally {
        // Clean up the blob URL
        URL.revokeObjectURL(blobUrl);
      }
    } catch (bundleError) {
      console.log(
        `⚠️ Bundled plugin not found, falling back to complex loading: ${bundleError.message}`
      );
      // Fall back to complex dependency resolution
      return this.loadPluginModuleComplex(pluginPath);
    }
  }

  /**
   * Complex plugin loading with full dependency resolution (fallback method)
   * @param pluginPath - Path to the plugin module
   * @returns Plugin module with exports
   */
  private async loadPluginModuleComplex(pluginPath: string): Promise<any> {
    try {
      console.log(
        `🔄 Loading plugin module with complex resolution: ${pluginPath}`
      );

      // Extract plugin directory from path
      const pluginDir = pluginPath.substring(0, pluginPath.lastIndexOf("/"));
      const moduleCache = new Map<string, any>();

      // Helper function to load dependencies recursively
      const loadDependency = async (relativePath: string): Promise<any> => {
        const absolutePath = `${pluginDir}/${relativePath.replace("./", "")}`;
        // Handle different file extensions:
        // - .js files: use as-is
        // - .ts/.tsx files: convert to .js
        // - no extension: add .js
        let fullPath: string;
        if (absolutePath.endsWith(".js")) {
          fullPath = absolutePath;
        } else if (
          absolutePath.endsWith(".ts") ||
          absolutePath.endsWith(".tsx")
        ) {
          fullPath = absolutePath.replace(/\.tsx?$/, ".js");
        } else {
          fullPath = `${absolutePath}.js`;
        }

        if (moduleCache.has(fullPath)) {
          return moduleCache.get(fullPath);
        }

        console.log(`📦 Loading dependency: ${relativePath} -> ${fullPath}`);

        // Fetch dependency code
        const depResponse = await fetch(fullPath);
        if (!depResponse.ok) {
          throw new Error(
            `HTTP ${depResponse.status}: ${depResponse.statusText}`
          );
        }

        const depCode = await depResponse.text();
        console.log(`📦 Dependency code fetched (${depCode.length} chars)`);

        // Create CommonJS environment for dependency
        const depModuleExports: any = {};
        const depModule = { exports: depModuleExports };

        // Nested require function for dependencies
        const nestedRequire = (nestedPath: string) => {
          const resolvedPath = `${pluginDir}/${nestedPath.replace("./", "")}`;
          // Handle different file extensions:
          // - .js files: use as-is
          // - .ts/.tsx files: convert to .js
          // - no extension: add .js
          let fullResolvedPath: string;
          if (resolvedPath.endsWith(".js")) {
            fullResolvedPath = resolvedPath;
          } else if (
            resolvedPath.endsWith(".ts") ||
            resolvedPath.endsWith(".tsx")
          ) {
            fullResolvedPath = resolvedPath.replace(/\.tsx?$/, ".js");
          } else {
            fullResolvedPath = `${resolvedPath}.js`;
          }

          if (moduleCache.has(fullResolvedPath)) {
            return moduleCache.get(fullResolvedPath);
          }
          console.warn(
            `⚠️ Nested dependency not found in cache: ${nestedPath}`
          );
          return {};
        };

        // Execute dependency
        const depWrappedCode = `
          (function(exports, require, module, console) {
            ${depCode}
            return module.exports;
          })
        `;

        const depModuleFactory = eval(depWrappedCode);
        const depResult = depModuleFactory(
          depModuleExports,
          nestedRequire,
          depModule,
          console
        );

        // Cache result
        moduleCache.set(fullPath, depResult);
        console.log(
          `✅ Dependency loaded: ${fullPath}`,
          Object.keys(depResult)
        );
        return depResult;
      };

      // Load main plugin first to discover dependencies
      const response = await fetch(pluginPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const pluginCode = await response.text();
      console.log(`📦 Plugin code fetched (${pluginCode.length} chars)`);

      // Extract dependencies from the plugin code
      const extractDependencies = (code: string): string[] => {
        const requireRegex = /require\s*\(\s*["']([^"']+)["']\s*\)/g;
        const dependencies: string[] = [];
        let match;

        while ((match = requireRegex.exec(code)) !== null) {
          const dep = match[1];
          if (dep.startsWith("./") || dep.startsWith("../")) {
            dependencies.push(dep);
          }
        }

        return [...new Set(dependencies)]; // Remove duplicates
      };

      const dependencies = extractDependencies(pluginCode);
      console.log("🔍 Discovered dependencies:", dependencies);

      // Pre-load all discovered dependencies
      console.log("🔄 Pre-loading discovered dependencies...");
      for (const dep of dependencies) {
        try {
          await loadDependency(dep);
        } catch (e) {
          console.log(`⚠️ Failed to load dependency ${dep}:`, e);
        }
      }

      // Create synchronous require function using pre-loaded modules
      const require = (relativePath: string) => {
        const absolutePath = `${pluginDir}/${relativePath.replace("./", "")}`;
        // Handle different file extensions:
        // - .js files: use as-is
        // - .ts/.tsx files: convert to .js
        // - no extension: add .js
        let fullPath: string;
        if (absolutePath.endsWith(".js")) {
          fullPath = absolutePath;
        } else if (
          absolutePath.endsWith(".ts") ||
          absolutePath.endsWith(".tsx")
        ) {
          fullPath = absolutePath.replace(/\.tsx?$/, ".js");
        } else {
          fullPath = `${absolutePath}.js`;
        }

        if (moduleCache.has(fullPath)) {
          console.log(`📋 Using cached module: ${relativePath}`);
          return moduleCache.get(fullPath);
        }

        console.warn(`⚠️ Module not found in cache: ${relativePath}`);
        return {};
      };

      // Plugin code already fetched above for dependency discovery

      // Create CommonJS environment for main plugin
      const moduleExports: any = {};
      const module = { exports: moduleExports };

      // Execute main plugin
      const wrappedCode = `
        (function(exports, require, module, console) {
          ${pluginCode}
          return module.exports;
        })
      `;

      const moduleFactory = eval(wrappedCode);
      const pluginModule = moduleFactory(
        moduleExports,
        require,
        module,
        console
      );

      console.log(`✅ Plugin module loaded:`, Object.keys(pluginModule));
      return pluginModule;
    } catch (error) {
      console.error(`❌ Failed to load plugin module ${pluginPath}:`, error);

      // Enhanced error handling with specific diagnostics
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("Cannot use import statement")) {
        throw new Error(
          `Plugin ${pluginPath} uses ES modules. Please recompile with CommonJS format.`
        );
      }

      if (errorMessage.includes("is not a function")) {
        throw new Error(
          `Plugin ${pluginPath} has missing dependencies. Check require() calls.`
        );
      }

      if (errorMessage.includes("HTTP 404")) {
        throw new Error(`Plugin file not found: ${pluginPath}`);
      }

      throw error;
    }
  }

  /**
   * Load plugin from dynamic import with error handling (CIA-compliant)
   * @param pluginPath - Path to the plugin module
   * @returns Plugin load result
   */
  async loadPlugin(pluginPath: string): Promise<PluginMountResult> {
    try {
      console.log(`🧠 MusicalConductor: Loading plugin from: ${pluginPath}`);

      const plugin = await this.loadPluginModule(pluginPath);

      // Validate plugin structure after import
      if (!plugin || typeof plugin !== "object") {
        console.warn(
          `🧠 Failed to load plugin: invalid plugin structure at ${pluginPath}`
        );
        return {
          success: false,
          pluginId: "unknown",
          message: `Failed to load plugin: invalid plugin structure at ${pluginPath}`,
        };
      }

      if (!plugin.sequence || !plugin.handlers) {
        console.warn(
          `🧠 Plugin missing required exports (sequence, handlers): ${pluginPath}`
        );
        return {
          success: false,
          pluginId: plugin.sequence?.name || "unknown",
          message: `Plugin missing required exports (sequence, handlers): ${pluginPath}`,
        };
      }

      // Mount the plugin
      return await this.mount(plugin.sequence, plugin.handlers);
    } catch (error) {
      console.warn(
        `🧠 MusicalConductor: Failed to load plugin from ${pluginPath}:`,
        (error as Error).message
      );
      return {
        success: false,
        pluginId: "unknown",
        message: `Failed to load plugin from ${pluginPath}: ${
          (error as Error).message
        }`,
      };
    }
  }

  /**
   * Extract plugin code for SPA validation
   * @param sequence - Plugin sequence
   * @param handlers - Plugin handlers
   * @returns String representation of plugin code
   */
  private extractPluginCode(sequence: any, handlers: any): string {
    try {
      // Convert sequence and handlers to string for analysis
      const sequenceCode = JSON.stringify(sequence, null, 2);
      const handlersCode = handlers
        ? Object.keys(handlers)
            .map((key) => {
              const handler = handlers[key];
              return typeof handler === "function" ? handler.toString() : "";
            })
            .join("\n")
        : "";

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
  private async validatePluginPreCompilation(
    pluginId: string
  ): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const issues: string[] = [];

      // Check for bundled artifact
      const bundlePath = `/plugins/${pluginId}/dist/plugin.js`;
      try {
        const response = await fetch(bundlePath);
        if (!response.ok) {
          issues.push(`Missing bundled artifact: ${bundlePath}`);
        }
      } catch (error) {
        issues.push(`Cannot access bundled artifact: ${bundlePath}`);
      }

      // Check for required runtime files
      const requiredFiles = ["index.js", "sequence.js", "manifest.json"];
      for (const file of requiredFiles) {
        const filePath = `/plugins/${pluginId}/${file}`;
        try {
          const response = await fetch(filePath);
          if (!response.ok) {
            issues.push(`Missing required file: ${file}`);
          }
        } catch (error) {
          issues.push(`Cannot access required file: ${file}`);
        }
      }

      return {
        valid: issues.length === 0,
        issues,
      };
    } catch (error) {
      console.warn(
        `🔨 Pre-compilation validation error for ${pluginId}:`,
        error
      );
      return {
        valid: false,
        issues: [
          `Pre-compilation validation error: ${(error as Error).message}`,
        ],
      };
    }
  }

  /**
   * Unmount a plugin (CIA-compliant)
   * @param pluginId - Plugin identifier
   * @returns Success status
   */
  unmountPlugin(pluginId: string): boolean {
    try {
      if (!this.mountedPlugins.has(pluginId)) {
        console.warn(`🧠 Plugin not found for unmounting: ${pluginId}`);
        return false;
      }

      const plugin = this.mountedPlugins.get(pluginId)!;

      // Unregister the sequence
      this.unregisterSequence(plugin.sequence.name);

      // Remove from mounted plugins
      this.mountedPlugins.delete(pluginId);
      this.pluginHandlers.delete(pluginId);

      console.log(
        `🧠 MusicalConductor: Successfully unmounted plugin: ${pluginId}`
      );
      return true;
    } catch (error) {
      console.error(
        `🧠 MusicalConductor: Failed to unmount plugin ${pluginId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Get mounted plugin information
   * @param pluginId - Plugin identifier
   * @returns Plugin information or undefined
   */
  getPluginInfo(pluginId: string): SPAPlugin | undefined {
    return this.mountedPlugins.get(pluginId);
  }

  /**
   * Get all mounted plugin IDs
   * @returns Array of plugin IDs
   */
  getMountedPluginIds(): string[] {
    return Array.from(this.mountedPlugins.keys());
  }

  // ===== MCO/MSO Resource Ownership and Instance Management Methods =====

  /**
   * Create a unique sequence instance ID
   * @param sequenceName - Name of the sequence
   * @param instanceId - Optional custom instance ID
   * @returns Unique instance ID
   */
  private createSequenceInstanceId(
    sequenceName: string,
    instanceId?: string
  ): string {
    if (instanceId) {
      return `${sequenceName}-${instanceId}`;
    }
    this.instanceCounter++;
    return `${sequenceName}-instance-${this.instanceCounter}-${Date.now()}`;
  }

  /**
   * Extract symphony name from sequence name (e.g., "JsonLoader.json-component-symphony" -> "JsonLoader")
   * @param sequenceName - Full sequence name
   * @returns Symphony name
   */
  private extractSymphonyName(sequenceName: string): string {
    const parts = sequenceName.split(".");
    return parts[0] || sequenceName;
  }

  /**
   * Extract resource ID from sequence data or generate one
   * @param sequenceName - Sequence name
   * @param data - Sequence data
   * @returns Resource ID
   */
  private extractResourceId(
    sequenceName: string,
    data: Record<string, any>
  ): string {
    // Check for explicit resource ID in data
    if (data.resourceId) {
      return data.resourceId;
    }

    // Check for component-related resources
    if (data.componentId) {
      return `component-${data.componentId}`;
    }

    if (data.elementId) {
      return `element-${data.elementId}`;
    }

    if (data.canvasId) {
      return `canvas-${data.canvasId}`;
    }

    // Default to sequence-based resource
    return `sequence-${sequenceName}`;
  }

  /**
   * Check if there's a resource conflict for a sequence request
   * @param resourceId - Resource identifier
   * @param symphonyName - Symphony requesting the resource
   * @param priority - Request priority
   * @param instanceId - Instance identifier
   * @returns Conflict analysis result
   */
  private checkResourceConflict(
    resourceId: string,
    symphonyName: string,
    priority: SequencePriority,
    instanceId: string
  ): ResourceConflictResult {
    const currentOwner = this.resourceOwnership.get(resourceId);

    if (!currentOwner) {
      return {
        hasConflict: false,
        conflictType: "NONE",
        resolution: "ALLOW",
        message: `Resource ${resourceId} is available`,
      };
    }

    // Same symphony, same instance - allow (idempotency)
    if (
      currentOwner.symphonyName === symphonyName &&
      currentOwner.instanceId === instanceId
    ) {
      return {
        hasConflict: false,
        conflictType: "NONE",
        resolution: "ALLOW",
        message: `Same symphony instance ${instanceId} already owns resource ${resourceId}`,
      };
    }

    // Same symphony, different instance - queue instead of reject
    if (currentOwner.symphonyName === symphonyName) {
      return {
        hasConflict: true,
        conflictType: "INSTANCE_CONFLICT",
        currentOwner,
        resolution: "QUEUE",
        message: `Symphony ${symphonyName} already has another instance using resource ${resourceId}, request will be queued`,
      };
    }

    // Different symphony - check priority
    if (
      priority === SEQUENCE_PRIORITIES.HIGH &&
      currentOwner.priority !== SEQUENCE_PRIORITIES.HIGH
    ) {
      return {
        hasConflict: true,
        conflictType: "PRIORITY_CONFLICT",
        currentOwner,
        resolution: "INTERRUPT",
        message: `HIGH priority request can interrupt current owner of resource ${resourceId}`,
      };
    }

    // Different symphony, same or lower priority - queue
    return {
      hasConflict: true,
      conflictType: "SAME_RESOURCE",
      currentOwner,
      resolution: "QUEUE",
      message: `Resource ${resourceId} is owned by ${currentOwner.symphonyName}, request will be queued`,
    };
  }

  /**
   * Acquire resource ownership for a sequence instance
   * @param resourceId - Resource identifier
   * @param symphonyName - Symphony name
   * @param instanceId - Instance identifier
   * @param priority - Request priority
   * @param sequenceExecutionId - Sequence execution ID
   * @returns Success status
   */
  private acquireResourceOwnership(
    resourceId: string,
    symphonyName: string,
    instanceId: string,
    priority: SequencePriority,
    sequenceExecutionId: string
  ): boolean {
    const conflictResult = this.checkResourceConflict(
      resourceId,
      symphonyName,
      priority,
      instanceId
    );

    if (conflictResult.resolution === "REJECT") {
      console.warn(
        `🎼 MCO: Resource acquisition rejected - ${conflictResult.message}`
      );
      return false;
    }

    if (conflictResult.resolution === "INTERRUPT") {
      console.log(
        `🎼 MCO: Interrupting current owner for HIGH priority request - ${conflictResult.message}`
      );
      this.releaseResourceOwnership(
        resourceId,
        conflictResult.currentOwner!.sequenceExecutionId
      );
    }

    // Acquire the resource
    const resourceOwner: ResourceOwner = {
      symphonyName,
      instanceId,
      resourceId,
      acquiredAt: performance.now(),
      priority,
      sequenceExecutionId,
    };

    this.resourceOwnership.set(resourceId, resourceOwner);

    // Update symphony resource mapping
    if (!this.symphonyResourceMap.has(symphonyName)) {
      this.symphonyResourceMap.set(symphonyName, new Set());
    }
    this.symphonyResourceMap.get(symphonyName)!.add(resourceId);

    // Resource acquired - internal logging disabled
    return true;
  }

  /**
   * Release resource ownership
   * @param resourceId - Resource identifier
   * @param sequenceExecutionId - Sequence execution ID (for verification)
   */
  private releaseResourceOwnership(
    resourceId: string,
    sequenceExecutionId?: string
  ): void {
    const currentOwner = this.resourceOwnership.get(resourceId);

    if (!currentOwner) {
      return; // Resource not owned
    }

    // Verify ownership if execution ID provided
    if (
      sequenceExecutionId &&
      currentOwner.sequenceExecutionId !== sequenceExecutionId
    ) {
      console.warn(
        `🎼 MCO: Cannot release resource ${resourceId} - ownership mismatch`
      );
      return;
    }

    // Release the resource
    this.resourceOwnership.delete(resourceId);

    // Update symphony resource mapping
    const symphonyResources = this.symphonyResourceMap.get(
      currentOwner.symphonyName
    );
    if (symphonyResources) {
      symphonyResources.delete(resourceId);
      if (symphonyResources.size === 0) {
        this.symphonyResourceMap.delete(currentOwner.symphonyName);
      }
    }

    // Resource released - internal logging disabled
  }

  /**
   * Set priority for an event type
   * @param eventType - Event type
   * @param priority - Priority level (MUSICAL_DYNAMICS value)
   */
  setPriority(eventType: string, priority: string): void {
    this.priorities.set(eventType, priority);
    console.log(
      `🎼 MusicalConductor: Set priority for ${eventType}: ${priority}`
    );
  }

  /**
   * Start a musical sequence with Sequential Orchestration and Resource Management
   * @param sequenceName - Name of the sequence to start
   * @param data - Data to pass to the sequence
   * @param priority - Priority level: 'HIGH', 'NORMAL', 'CHAINED'
   * @returns Request ID for tracking
   */
  startSequence(
    sequenceName: string,
    data: Record<string, any> = {},
    priority: SequencePriority = SEQUENCE_PRIORITIES.NORMAL
  ): string {
    const requestId = `${sequenceName}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      const sequence = this.sequences.get(sequenceName);
      if (!sequence) {
        console.error(
          `❌ MusicalConductor: Sequence "${sequenceName}" not found!`
        );
        console.error(
          `❌ This means the plugin for "${sequenceName}" is not loaded or registered.`
        );
        console.error(
          `❌ Available sequences:`,
          Array.from(this.sequences.keys())
        );
        if (sequenceName === "ElementLibrary.library-drop-symphony") {
          console.error(
            `❌ CRITICAL: ElementLibrary.library-drop-symphony not available - drag-and-drop will not work!`
          );
          console.error(
            `❌ Check plugin loading logs above for ElementLibrary.library-drop-symphony errors.`
          );
        }
        throw new Error(`Sequence "${sequenceName}" not found`);
      }

      // Phase 3: StrictMode Protection & Idempotency Check
      const deduplicationResult = this.deduplicateSequenceRequest(
        sequenceName,
        data,
        priority
      );

      if (deduplicationResult.isDuplicate) {
        console.warn(`🎼 MCO: ${deduplicationResult.message}`);

        // For StrictMode duplicates, return the original request ID pattern but don't execute
        const duplicateRequestId = `${sequenceName}-duplicate-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Emit a duplicate event for monitoring
        this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_CANCELLED, {
          sequenceName,
          requestId: duplicateRequestId,
          reason: "duplicate-request",
          hash: deduplicationResult.hash,
        });

        return duplicateRequestId;
      }

      // Phase 3: Record sequence execution IMMEDIATELY to prevent race conditions
      this.recordSequenceExecution(deduplicationResult.hash);

      // MCO/MSO: Extract symphony and resource information
      const symphonyName = this.extractSymphonyName(sequenceName);
      const resourceId = this.extractResourceId(sequenceName, data);
      const instanceId = this.createSequenceInstanceId(
        sequenceName,
        data.instanceId
      );

      // MCO/MSO: Check for resource conflicts
      const conflictResult = this.checkResourceConflict(
        resourceId,
        symphonyName,
        priority,
        instanceId
      );

      if (conflictResult.resolution === "REJECT") {
        console.warn(
          `🎼 MCO: Sequence request rejected - ${conflictResult.message}`
        );
        throw new Error(`Resource conflict: ${conflictResult.message}`);
      }

      // Create sequence request with MCO/MSO metadata and idempotency hash
      const sequenceRequest: SequenceRequest = {
        sequenceName,
        data: {
          ...data,
          // MCO/MSO: Add instance and resource tracking
          instanceId,
          symphonyName,
          resourceId,
          conflictResult,
          // Phase 3: Add idempotency hash
          sequenceHash: deduplicationResult.hash,
        },
        priority,
        requestId,
        queuedAt: performance.now(),
      };

      // Update statistics
      this.statistics.totalSequencesQueued++;
      this.statistics.currentQueueLength++;
      this.statistics.maxQueueLength = Math.max(
        this.statistics.maxQueueLength,
        this.statistics.currentQueueLength
      );

      // Starting sequence - internal logging disabled for cleaner output

      console.log(
        `🔍 DEBUG: ${sequenceName} - priority: ${priority}, activeSequence: ${
          this.activeSequence?.sequenceName || "none"
        }`
      );

      if (priority === SEQUENCE_PRIORITIES.HIGH) {
        // HIGH priority: Execute immediately, bypassing queue
        console.log(
          `🔍 DEBUG: ${sequenceName} - HIGH priority, executing immediately`
        );
        this.executeSequenceImmediately(sequenceRequest);
      } else if (
        priority === SEQUENCE_PRIORITIES.CHAINED &&
        this.activeSequence
      ) {
        // CHAINED priority: Add to front of queue to execute after current sequence
        console.log(
          `🔍 DEBUG: ${sequenceName} - CHAINED sequence, adding to front of queue`
        );
        this.sequenceQueue.unshift(sequenceRequest);
        this.statistics.chainedSequences++;
      } else {
        // NORMAL priority: Add to queue or execute immediately
        if (this.activeSequence) {
          // CONSECUTIVE sequence - adding to queue
          console.log(
            `🔍 DEBUG: ${sequenceName} - CONSECUTIVE sequence, adding to queue (activeSequence: ${this.activeSequence?.sequenceName})`
          );
          this.sequenceQueue.push(sequenceRequest);
        } else {
          // IMMEDIATE sequence - executing now
          console.log(
            `🔍 DEBUG: ${sequenceName} - IMMEDIATE sequence, executing now`
          );
          this.sequenceQueue.push(sequenceRequest);
          this.processSequenceQueue();
        }
      }

      this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_QUEUED, {
        sequenceName,
        requestId,
        priority,
        queueLength: this.sequenceQueue.length,
      });

      return requestId;
    } catch (error) {
      console.error(
        `🎼 MusicalConductor: Failed to start sequence: ${sequenceName}`,
        error
      );
      this.statistics.errorCount++;
      throw error;
    }
  }

  /**
   * Execute sequence immediately (no queue) with Advanced Resource Conflict Resolution
   * @param sequenceRequest - Sequence request object
   */
  private executeSequenceImmediately(sequenceRequest: SequenceRequest): void {
    console.log(
      `🔍 DEBUG: executeSequenceImmediately called for ${sequenceRequest.sequenceName}`
    );

    const executionContext = this.createExecutionContext(sequenceRequest);
    console.log(
      `🔍 DEBUG: Created execution context for ${sequenceRequest.sequenceName}`
    );

    // MCO/MSO: Use advanced resource conflict resolution
    const { instanceId, symphonyName, resourceId } = sequenceRequest.data;
    console.log(
      `🔍 DEBUG: Resolving resource conflict for ${sequenceRequest.sequenceName} - resourceId: ${resourceId}`
    );

    const resolutionResult = this.resolveResourceConflictAdvanced(
      resourceId,
      symphonyName,
      instanceId,
      sequenceRequest.priority,
      executionContext.id,
      sequenceRequest
    );

    console.log(
      `🔍 DEBUG: Resource conflict resolution result for ${sequenceRequest.sequenceName}:`,
      resolutionResult
    );

    if (!resolutionResult.success) {
      console.error(
        `🎼 MCO: Resource conflict resolution failed (${resolutionResult.strategy}): ${resolutionResult.message}`
      );

      // If the strategy was QUEUE, don't fail the sequence - it's been queued
      if (resolutionResult.strategy === "QUEUE") {
        console.log(
          `🎼 MCO: Sequence ${sequenceRequest.sequenceName} successfully queued for later execution`
        );
        return;
      }

      // For REJECT or other failures, fail the sequence
      this.failSequence(
        executionContext,
        new Error(`Resource conflict: ${resolutionResult.message}`)
      );
      return;
    }

    console.log(
      `🔍 DEBUG: Setting active sequence to ${sequenceRequest.sequenceName}`
    );
    this.activeSequence = executionContext;

    console.log(
      `🔍 DEBUG: About to call executeSequence for ${sequenceRequest.sequenceName}`
    );
    // Starting sequence immediately - internal logging disabled
    this.executeSequence(executionContext);
    console.log(
      `🔍 DEBUG: executeSequence called for ${sequenceRequest.sequenceName}`
    );
  }

  /**
   * Create execution context for a sequence
   * @param sequenceRequest - Sequence request
   */
  private createExecutionContext(
    sequenceRequest: SequenceRequest
  ): SequenceExecutionContext {
    const sequence = this.sequences.get(sequenceRequest.sequenceName)!;

    // Determine execution type based on whether there was an active sequence when this was queued
    const executionType = this.activeSequence ? "CONSECUTIVE" : "IMMEDIATE";

    return {
      id: sequenceRequest.requestId,
      sequenceName: sequenceRequest.sequenceName,
      sequence,
      data: sequenceRequest.data,
      payload: {}, // 🎽 Initialize the data baton as empty object
      startTime: performance.now(),
      currentMovement: 0,
      currentBeat: 0,
      completedBeats: [],
      errors: [],
      priority: sequenceRequest.priority,
      executionType,
      queuedAt: sequenceRequest.queuedAt,
    };
  }

  /**
   * Process next sequence in queue
   */
  private processSequenceQueue(): void {
    if (this.sequenceQueue.length > 0 && this.activeSequence === null) {
      const nextSequence = this.sequenceQueue.shift()!;
      const waitTime = performance.now() - nextSequence.queuedAt;

      // Update queue wait time statistics
      this.updateQueueWaitTimeStatistics(waitTime);

      // Processing queued sequence - internal logging disabled
      this.executeSequenceImmediately(nextSequence);
    } else if (this.sequenceQueue.length === 0) {
      // Queue is empty - conductor is idle
    }
  }

  /**
   * Update queue wait time statistics
   * @param waitTime - Wait time in milliseconds
   */
  private updateQueueWaitTimeStatistics(waitTime: number): void {
    // Simple moving average calculation
    const alpha = 0.1; // Smoothing factor
    this.statistics.averageQueueWaitTime =
      this.statistics.averageQueueWaitTime * (1 - alpha) + waitTime * alpha;
  }

  /**
   * Get current statistics (enhanced with CIA plugin information)
   */
  getStatistics(): ConductorStatistics & { mountedPlugins: number } {
    return {
      ...this.statistics,
      mountedPlugins: this.mountedPlugins.size,
    };
  }

  /**
   * Get conductor status including eventBus availability
   * @returns Conductor status object
   */
  getStatus(): { statistics: ConductorStatistics & { mountedPlugins: number }; eventBus: boolean; sequences: number; plugins: number } {
    return {
      statistics: this.getStatistics(),
      eventBus: !!this.eventBus,
      sequences: this.sequences.size,
      plugins: this.mountedPlugins.size
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.statistics = {
      totalSequencesExecuted: 0,
      totalBeatsExecuted: 0,
      averageExecutionTime: 0,
      errorCount: 0,
      lastExecutionTime: null,
      totalSequencesQueued: 0,
      maxQueueLength: 0,
      currentQueueLength: this.sequenceQueue.length,
      averageQueueWaitTime: 0,
      sequenceCompletionRate: 0,
      chainedSequences: 0,
    };

    console.log("🎼 MusicalConductor: Statistics reset");
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { length: number; activeSequence: string | null } {
    return {
      length: this.sequenceQueue.length,
      activeSequence: this.activeSequence?.sequenceName || null,
    };
  }

  /**
   * Execute a musical sequence
   * @param executionContext - Execution context
   */
  private async executeSequence(
    executionContext: SequenceExecutionContext
  ): Promise<void> {
    console.log(
      `🔍 DEBUG: executeSequence STARTED for ${executionContext.sequenceName}`
    );

    try {
      const { sequence, data } = executionContext;
      console.log(
        `🔍 DEBUG: About to emit SEQUENCE_STARTED event for ${executionContext.sequenceName}`
      );

      this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_STARTED, {
        sequenceName: executionContext.sequenceName,
        requestId: executionContext.id,
        startTime: executionContext.startTime,
      });

      console.log(
        `🎼 Sequence Started: ${executionContext.sequenceName} (ID: ${executionContext.id})`
      );

      // Execute all movements
      for (
        let movementIndex = 0;
        movementIndex < sequence.movements.length;
        movementIndex++
      ) {
        const movement = sequence.movements[movementIndex];
        executionContext.currentMovement = movementIndex;

        console.log(
          `🎼 MusicalConductor: Executing movement ${movementIndex}: ${movement.name}`
        );

        // Execute all beats in the movement
        await this.executeMovement(executionContext, movement);
      }

      // Mark sequence as completed
      this.completeSequence(executionContext);
    } catch (error) {
      console.error(`🎼 MusicalConductor: Sequence execution failed:`, error);
      this.failSequence(executionContext, error as Error);
    }
  }

  /**
   * Execute a movement within a sequence
   * @param executionContext - Execution context
   * @param movement - Movement to execute
   */
  private async executeMovement(
    executionContext: SequenceExecutionContext,
    movement: SequenceMovement
  ): Promise<void> {
    // Sort beats by beat number to ensure proper order
    const sortedBeats = [...movement.beats].sort((a, b) => a.beat - b.beat);

    for (const beat of sortedBeats) {
      executionContext.currentBeat = beat.beat;

      try {
        await this.executeBeat(executionContext, beat);
        executionContext.completedBeats.push(beat.beat);
        this.statistics.totalBeatsExecuted++;
      } catch (error) {
        console.error(
          `🎼 MusicalConductor: Error executing beat ${beat.beat}:`,
          error
        );
        executionContext.errors.push({
          beat: beat.beat,
          error: (error as Error).message,
          timestamp: Date.now(),
        });

        // Decide whether to continue or abort based on error handling strategy
        if (beat.errorHandling === "abort-sequence") {
          throw error;
        }
        // For other strategies, log and continue
      }
    }
  }

  /**
   * Execute a single beat with orchestration
   * @param executionContext - Execution context
   * @param beat - Beat to execute
   */
  private async executeBeat(
    executionContext: SequenceExecutionContext,
    beat: SequenceBeat
  ): Promise<void> {
    // Use beat-level orchestration to prevent simultaneous execution
    return new Promise<void>((resolve, reject) => {
      this.beatExecutionQueue.push({
        executionContext,
        beat,
        resolve,
        reject,
      });

      this.processBeatQueue();
    });
  }

  /**
   * Process beat execution queue to ensure serialized execution
   */
  private async processBeatQueue(): Promise<void> {
    if (this.isExecutingBeat || this.beatExecutionQueue.length === 0) {
      return;
    }

    this.isExecutingBeat = true;
    const { executionContext, beat, resolve, reject } =
      this.beatExecutionQueue.shift()!;

    try {
      await this.executeActualBeat(executionContext, beat);
      resolve();
    } catch (error) {
      reject(error as Error);
    } finally {
      this.isExecutingBeat = false;
      // Process next beat in queue
      if (this.beatExecutionQueue.length > 0) {
        this.processBeatQueue();
      }
    }
  }

  /**
   * Execute the actual beat logic with Handler-Coordinated Beat Execution
   * @param executionContext - Execution context
   * @param beat - Beat to execute
   */
  private async executeActualBeat(
    executionContext: SequenceExecutionContext,
    beat: SequenceBeat
  ): Promise<void> {
    const { event, data = {}, timing = MUSICAL_TIMING.IMMEDIATE } = beat;

    // Merge beat data with execution context data
    const eventData = {
      ...executionContext.data,
      ...data,
      beat: beat.beat,
      movement: executionContext.currentMovement,
      sequence: {
        id: executionContext.id,
        name: executionContext.sequenceName,
      },
    };

    // Log beat start with Data Baton information
    console.log(`🎵 Beat ${beat.beat} Started: ${beat.title} (${event})`);
    console.log(
      `🔸 Movement: ${
        executionContext.sequence?.movements?.[
          executionContext.currentMovement || 0
        ]?.name || "Unknown"
      }`
    );
    console.log(
      `📥 Context: {sequence: '${executionContext.sequenceName}', event: '${event}', beat: ${beat.beat}, ...}`
    );
    console.log(
      `🎽 Baton: ${
        executionContext.payload &&
        Object.keys(executionContext.payload).length > 0
          ? JSON.stringify(executionContext.payload)
          : "(empty)"
      }`
    );

    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_STARTED, {
      sequenceName: executionContext.sequenceName,
      beat: beat.beat,
      event,
      title: beat.title,
      sequenceType: executionContext.executionType,
      movement: executionContext.currentMovement,
      timing: timing,
      dynamics: beat.dynamics,
    });

    // Handler-Coordinated Beat Execution: Use completion callback system
    return new Promise<void>((resolve, reject) => {
      const completeBeat = (data?: any) => {
        try {
          // Log beat completion
          console.log(
            `🎯 Beat ${beat.beat} execution completed for sequence ${executionContext.sequenceName}`
          );

          // Emit beat completed event
          this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_COMPLETED, {
            sequenceName: executionContext.sequenceName,
            beat: beat.beat,
            event,
            sequenceType: executionContext.executionType,
            movement: executionContext.currentMovement,
            success: true,
            completionData: data,
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      try {
        // Handle timing for Handler-Coordinated Beat Execution
        if (timing === MUSICAL_TIMING.IMMEDIATE) {
          this.emitEventWithCompletion(
            event,
            eventData,
            executionContext,
            completeBeat
          );
        } else if (timing === MUSICAL_TIMING.SYNCHRONIZED) {
          // Execute synchronized with other events - treat as immediate
          this.emitEventWithCompletion(
            event,
            eventData,
            executionContext,
            completeBeat
          );
        } else if (timing === MUSICAL_TIMING.AFTER_BEAT) {
          // Small delay to ensure proper sequencing
          setTimeout(() => {
            this.emitEventWithCompletion(
              event,
              eventData,
              executionContext,
              completeBeat
            );
          }, 10);
        } else if (timing === MUSICAL_TIMING.DELAYED) {
          // Longer delay for intentional timing
          setTimeout(() => {
            this.emitEventWithCompletion(
              event,
              eventData,
              executionContext,
              completeBeat
            );
          }, 100);
        }
      } catch (error) {
        // Handle beat execution error
        this.handleBeatError(executionContext, beat, error as Error);
        reject(error);
      }
    });
  }

  /**
   * Emit an event through the event bus
   * @param eventType - Event type
   * @param eventData - Event data
   * @param executionContext - Execution context
   */
  private emitEvent(
    eventType: string,
    eventData: Record<string, any>,
    executionContext: SequenceExecutionContext
  ): void {
    try {
      // Add sequence context to event
      const contextualEventData = {
        ...eventData,
        sequence: {
          id: executionContext.id,
          name: executionContext.sequenceName,
          beat: executionContext.currentBeat,
          movement: executionContext.currentMovement,
        },
        // 🎽 Include the data baton in the event context
        context: {
          payload: executionContext.payload,
          executionId: executionContext.id,
          sequenceName: executionContext.sequenceName,
        },
      };

      // Special debugging for canvas-element-created
      if (eventType === "canvas-element-created") {
        console.log(
          "🔍 DEBUG: Musical Conductor emitting canvas-element-created event"
        );
        console.log("🔍 DEBUG: Event data:", contextualEventData);
        console.log(
          "🔍 DEBUG: EventBus subscribers for canvas-element-created:",
          this.eventBus.getSubscriberCount("canvas-element-created")
        );
      }

      // Emit the event
      this.eventBus.emit(eventType, contextualEventData);

      // Event emitted - internal logging disabled
    } catch (error) {
      console.error(
        `🎼 MusicalConductor: Failed to emit event ${eventType}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Emit an event with Handler-Coordinated Beat Execution completion callback
   * @param eventType - Event type
   * @param eventData - Event data
   * @param executionContext - Execution context
   * @param completeBeat - Beat completion callback
   */
  private emitEventWithCompletion(
    eventType: string,
    eventData: Record<string, any>,
    executionContext: SequenceExecutionContext,
    completeBeat: (data?: any) => void
  ): void {
    try {
      const beatKey = `${executionContext.id}-${executionContext.currentBeat}`;

      // Track this beat as processing
      this.processingBeats.set(beatKey, {
        sequenceName: executionContext.id,
        beatNumber: executionContext.currentBeat || 0,
        startTime: Date.now(),
        completeBeat,
        timeoutId: setTimeout(() => {
          console.log(
            `🎯 Beat ${executionContext.currentBeat} timeout after 30s`
          );
          this.handleBeatTimeout(beatKey);
        }, 30000), // 30 second timeout
      });

      // Add sequence context and completeBeat callback to event
      const contextualEventData = {
        ...eventData,
        sequence: {
          id: executionContext.id,
          name: executionContext.sequenceName,
          beat: executionContext.currentBeat,
          movement: executionContext.currentMovement,
        },
        // 🎽 Include the data baton in the event context
        context: {
          payload: executionContext.payload,
          executionId: executionContext.id,
          sequenceName: executionContext.sequenceName,
          eventBus: this.eventBus,
          conductor: this,
          // Handler-Coordinated Beat Execution callback
          completeBeat: (data?: any) => {
            this.handleBeatCompletion(beatKey, data);
          },
        },
      };

      console.log(
        `🎯 Event ${eventType} emitted for beat ${executionContext.currentBeat} with completion callback`
      );

      // Emit the event
      this.eventBus.emit(eventType, contextualEventData);
    } catch (error) {
      console.error(
        `🎼 MusicalConductor: Failed to emit event with completion ${eventType}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Handle beat completion from handlers
   * @param beatKey - Beat tracking key
   * @param data - Completion data from handler
   */
  private handleBeatCompletion(beatKey: string, data?: any): void {
    const beatInfo = this.processingBeats.get(beatKey);

    if (!beatInfo) {
      console.log(
        `🎯 Cannot complete beat - beat not in processing: ${beatKey
          .split("-")
          .pop()}`
      );
      return;
    }

    // Clear timeout
    if (beatInfo.timeoutId) {
      clearTimeout(beatInfo.timeoutId);
    }

    // Update payload if data provided
    if (data && typeof data === "object") {
      const executionContext = this.activeSequence;
      if (executionContext) {
        this.updatePayload(executionContext, data);
        console.log(`🎽 Beat ${beatInfo.beatNumber} updated payload:`, data);
      }
    }

    // Remove from processing
    this.processingBeats.delete(beatKey);

    const completionTime = Date.now() - beatInfo.startTime;
    console.log(
      `🎯 Beat ${beatInfo.beatNumber} completed for sequence ${beatInfo.sequenceName}`
    );
    console.log(`✅ Completed in ${completionTime.toFixed(2)}ms`);

    // Signal completion to the original caller
    beatInfo.completeBeat(data);
  }

  /**
   * Handle beat timeout
   * @param beatKey - Beat tracking key
   */
  private handleBeatTimeout(beatKey: string): void {
    const beatInfo = this.processingBeats.get(beatKey);

    if (beatInfo) {
      console.error(
        `❌ Beat ${beatInfo.beatNumber} timed out after 30 seconds`
      );
      this.processingBeats.delete(beatKey);

      // Complete with timeout error
      beatInfo.completeBeat({
        success: false,
        error: "Beat execution timeout",
        timeout: true,
      });
    }
  }

  /**
   * Complete a sequence execution with Resource Release
   * @param executionContext - Execution context
   */
  private completeSequence(executionContext: SequenceExecutionContext): void {
    const executionTime = performance.now() - executionContext.startTime;

    // MCO/MSO: Release resource ownership
    const { resourceId } = executionContext.data;
    if (resourceId) {
      this.releaseResourceOwnership(resourceId, executionContext.id);
    }

    // Update statistics
    this.statistics.totalSequencesExecuted++;
    this.statistics.lastExecutionTime = executionTime;
    this.statistics.currentQueueLength = Math.max(
      0,
      this.statistics.currentQueueLength - 1
    );

    // Update average execution time
    const alpha = 0.1; // Smoothing factor
    this.statistics.averageExecutionTime =
      this.statistics.averageExecutionTime * (1 - alpha) +
      executionTime * alpha;

    // Calculate completion rate
    this.statistics.sequenceCompletionRate =
      this.statistics.totalSequencesExecuted /
      this.statistics.totalSequencesQueued;

    // Add to history
    this.sequenceHistory.push(executionContext);

    // Keep history manageable (last 100 sequences)
    if (this.sequenceHistory.length > 100) {
      this.sequenceHistory.shift();
    }

    // Sequence completed - internal logging disabled

    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_COMPLETED, {
      sequenceName: executionContext.sequenceName,
      requestId: executionContext.id,
      executionTime,
      beatsExecuted: executionContext.completedBeats.length,
      errors: executionContext.errors.length,
    });

    // Clear active sequence and process queue
    this.activeSequence = null;
    this.processSequenceQueue();
  }

  /**
   * Fail a sequence execution with Resource Release
   * @param executionContext - Execution context
   * @param error - Error that caused the failure
   */
  private failSequence(
    executionContext: SequenceExecutionContext,
    error: Error
  ): void {
    const executionTime = performance.now() - executionContext.startTime;

    // MCO/MSO: Release resource ownership on failure
    const { resourceId } = executionContext.data;
    if (resourceId) {
      this.releaseResourceOwnership(resourceId, executionContext.id);
    }

    // Update statistics
    this.statistics.errorCount++;
    this.statistics.currentQueueLength = Math.max(
      0,
      this.statistics.currentQueueLength - 1
    );

    console.error(
      `🎼 MusicalConductor: Sequence failed - ${
        executionContext.sequenceName
      } (${executionTime.toFixed(2)}ms) [Resource: ${resourceId}]:`,
      error
    );

    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_FAILED, {
      sequenceName: executionContext.sequenceName,
      requestId: executionContext.id,
      executionTime,
      error: error.message,
      beatsExecuted: executionContext.completedBeats.length,
      totalErrors: executionContext.errors.length,
    });

    // Clear active sequence and process queue
    this.activeSequence = null;
    this.processSequenceQueue();
  }

  // ===== Orchestration Validation Compliance Methods =====

  /**
   * Queue a sequence for execution (validation compliance method)
   * @param sequenceName - Name of the sequence to queue
   * @param data - Data to pass to the sequence
   * @param priority - Priority level
   * @returns Request ID for tracking
   */
  queueSequence(
    sequenceName: string,
    data: Record<string, any> = {},
    priority: SequencePriority = SEQUENCE_PRIORITIES.NORMAL
  ): string {
    // This is an alias for startSequence to satisfy validation requirements
    return this.startSequence(sequenceName, data, priority);
  }

  /**
   * Execute the next sequence in queue (validation compliance method)
   * @returns Success status
   */
  executeNextSequence(): boolean {
    if (this.sequenceQueue.length === 0) {
      return false;
    }

    if (this.activeSequence !== null) {
      return false; // Already executing a sequence
    }

    this.processSequenceQueue();
    return true;
  }

  /**
   * Check if a sequence is currently running (validation compliance method)
   * @param sequenceName - Optional sequence name to check for specific sequence
   * @returns True if a sequence is executing (or specific sequence if name provided)
   */
  isSequenceRunning(sequenceName?: string): boolean {
    if (!sequenceName) {
      return this.activeSequence !== null;
    }

    // Check if the specific sequence is currently running
    return (
      this.activeSequence !== null &&
      this.activeSequence.sequence.name === sequenceName
    );
  }

  /**
   * Get the currently executing sequence (validation compliance method)
   * @returns Current sequence execution context or null
   */
  getCurrentSequence(): SequenceExecutionContext | null {
    return this.activeSequence;
  }

  /**
   * 🎽 Update the data baton payload for the currently executing sequence
   * This allows plugin handlers to pass data between beats
   * @param payloadData - Data to merge into the current payload
   * @returns Success status
   */
  updatePayload(payloadData: Record<string, any>): boolean {
    if (!this.activeSequence) {
      console.warn(
        "🎽 MusicalConductor: Cannot update payload - no active sequence"
      );
      return false;
    }

    // Merge new payload data with existing payload
    this.activeSequence.payload = {
      ...this.activeSequence.payload,
      ...payloadData,
    };

    console.log(
      "🎽 MusicalConductor: Payload updated:",
      this.activeSequence.payload
    );
    return true;
  }

  /**
   * 🎽 Get the current data baton payload
   * @returns Current payload or null if no active sequence
   */
  getPayload(): Record<string, any> | null {
    return this.activeSequence?.payload || null;
  }

  /**
   * Get all queued sequences (validation compliance method)
   * @returns Array of queued sequence requests
   */
  getQueuedSequences(): SequenceRequest[] {
    return [...this.sequenceQueue];
  }

  /**
   * Clear the sequence queue (validation compliance method)
   * @returns Number of sequences that were cleared
   */
  clearSequenceQueue(): number {
    const clearedCount = this.sequenceQueue.length;
    this.sequenceQueue = [];
    this.statistics.currentQueueLength = 0;

    console.log(
      `🎼 MusicalConductor: Cleared ${clearedCount} sequences from queue`
    );
    return clearedCount;
  }

  /**
   * Get resource ownership information (MCO/MSO diagnostic method)
   * @returns Resource ownership map
   */
  getResourceOwnership(): Map<string, ResourceOwner> {
    return new Map(this.resourceOwnership);
  }

  /**
   * Get symphony resource mapping (MCO/MSO diagnostic method)
   * @returns Symphony to resources mapping
   */
  getSymphonyResourceMap(): Map<string, Set<string>> {
    return new Map(this.symphonyResourceMap);
  }

  /**
   * Get sequence instances (MCO/MSO diagnostic method)
   * @returns Sequence instances map
   */
  getSequenceInstances(): Map<string, SequenceInstance> {
    return new Map(this.sequenceInstances);
  }

  // ===== Phase 2: Conflict Resolution Strategies =====

  /**
   * Resolve resource conflict using REJECT strategy
   * @param resourceId - Resource identifier
   * @param requestingSymphony - Symphony requesting the resource
   * @param currentOwner - Current resource owner
   * @returns Resolution result
   */
  private resolveResourceConflict_Reject(
    resourceId: string,
    requestingSymphony: string,
    currentOwner: ResourceOwner
  ): { success: boolean; message: string } {
    console.warn(
      `🎼 MCO: REJECT - Resource ${resourceId} is owned by ${currentOwner.symphonyName}, rejecting request from ${requestingSymphony}`
    );

    return {
      success: false,
      message: `Resource ${resourceId} is currently owned by ${currentOwner.symphonyName}. Request rejected to prevent conflicts.`,
    };
  }

  /**
   * Resolve resource conflict using QUEUE strategy
   * @param sequenceRequest - The sequence request to queue
   * @param resourceId - Resource identifier
   * @param currentOwner - Current resource owner
   * @returns Resolution result
   */
  private resolveResourceConflict_Queue(
    sequenceRequest: SequenceRequest,
    resourceId: string,
    currentOwner: ResourceOwner
  ): { success: boolean; message: string } {
    // Add to queue with resource dependency metadata
    const queuedRequest = {
      ...sequenceRequest,
      data: {
        ...sequenceRequest.data,
        waitingForResource: resourceId,
        blockedBy: currentOwner.symphonyName,
        queuedForResource: true,
      },
    };

    this.sequenceQueue.push(queuedRequest);

    console.log(
      `🎼 MCO: QUEUE - Sequence ${sequenceRequest.sequenceName} queued until resource ${resourceId} is released by ${currentOwner.symphonyName}`
    );

    return {
      success: true,
      message: `Sequence queued until resource ${resourceId} is available. Currently owned by ${currentOwner.symphonyName}.`,
    };
  }

  /**
   * Resolve resource conflict using INTERRUPT strategy (HIGH priority only)
   * @param resourceId - Resource identifier
   * @param requestingSymphony - Symphony requesting the resource
   * @param requestingInstanceId - Requesting instance ID
   * @param requestingPriority - Requesting priority
   * @param requestingExecutionId - Requesting execution ID
   * @param currentOwner - Current resource owner
   * @returns Resolution result
   */
  private resolveResourceConflict_Interrupt(
    resourceId: string,
    requestingSymphony: string,
    requestingInstanceId: string,
    requestingPriority: SequencePriority,
    requestingExecutionId: string,
    currentOwner: ResourceOwner
  ): { success: boolean; message: string } {
    if (requestingPriority !== SEQUENCE_PRIORITIES.HIGH) {
      return {
        success: false,
        message: `Only HIGH priority sequences can interrupt. Current priority: ${requestingPriority}`,
      };
    }

    if (currentOwner.priority === SEQUENCE_PRIORITIES.HIGH) {
      return {
        success: false,
        message: `Cannot interrupt HIGH priority sequence ${currentOwner.symphonyName}`,
      };
    }

    // Force release the resource from current owner
    console.warn(
      `🎼 MCO: INTERRUPT - HIGH priority ${requestingSymphony} interrupting ${currentOwner.symphonyName} for resource ${resourceId}`
    );

    // Find and fail the current sequence using the resource
    if (
      this.activeSequence &&
      this.activeSequence.id === currentOwner.sequenceExecutionId
    ) {
      const interruptError = new Error(
        `Interrupted by HIGH priority sequence: ${requestingSymphony}`
      );
      this.failSequence(this.activeSequence, interruptError);
    }

    // Release the resource
    this.releaseResourceOwnership(resourceId, currentOwner.sequenceExecutionId);

    // Acquire for the new requester
    const acquired = this.acquireResourceOwnership(
      resourceId,
      requestingSymphony,
      requestingInstanceId,
      requestingPriority,
      requestingExecutionId
    );

    return {
      success: acquired,
      message: acquired
        ? `HIGH priority sequence ${requestingSymphony} successfully interrupted and acquired resource ${resourceId}`
        : `Failed to acquire resource ${resourceId} after interruption`,
    };
  }

  /**
   * Enhanced resource conflict resolution with strategy selection
   * @param resourceId - Resource identifier
   * @param symphonyName - Symphony requesting the resource
   * @param instanceId - Instance identifier
   * @param priority - Request priority
   * @param sequenceExecutionId - Sequence execution ID
   * @param sequenceRequest - Full sequence request (for queuing)
   * @returns Resolution result
   */
  private resolveResourceConflictAdvanced(
    resourceId: string,
    symphonyName: string,
    instanceId: string,
    priority: SequencePriority,
    sequenceExecutionId: string,
    sequenceRequest: SequenceRequest
  ): { success: boolean; message: string; strategy: string } {
    const conflictResult = this.checkResourceConflict(
      resourceId,
      symphonyName,
      priority,
      instanceId
    );

    if (!conflictResult.hasConflict) {
      // No conflict - proceed normally
      const acquired = this.acquireResourceOwnership(
        resourceId,
        symphonyName,
        instanceId,
        priority,
        sequenceExecutionId
      );
      return {
        success: acquired,
        message: acquired
          ? `Resource ${resourceId} acquired successfully`
          : `Failed to acquire resource ${resourceId}`,
        strategy: "ALLOW",
      };
    }

    const currentOwner = conflictResult.currentOwner!;

    // Apply resolution strategy based on conflict analysis
    switch (conflictResult.resolution) {
      case "REJECT":
        const rejectResult = this.resolveResourceConflict_Reject(
          resourceId,
          symphonyName,
          currentOwner
        );
        return { ...rejectResult, strategy: "REJECT" };

      case "QUEUE":
        const queueResult = this.resolveResourceConflict_Queue(
          sequenceRequest,
          resourceId,
          currentOwner
        );
        return { ...queueResult, strategy: "QUEUE" };

      case "INTERRUPT":
        const interruptResult = this.resolveResourceConflict_Interrupt(
          resourceId,
          symphonyName,
          instanceId,
          priority,
          sequenceExecutionId,
          currentOwner
        );
        return { ...interruptResult, strategy: "INTERRUPT" };

      default:
        return {
          success: false,
          message: `Unknown resolution strategy: ${conflictResult.resolution}`,
          strategy: "UNKNOWN",
        };
    }
  }

  // ===== Phase 3: StrictMode Protection & Idempotency Methods =====

  /**
   * Generate a hash for sequence request to detect duplicates
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @param priority - Sequence priority
   * @returns Hash string for duplicate detection
   */
  private generateSequenceHash(
    sequenceName: string,
    data: Record<string, any>,
    priority: SequencePriority
  ): string {
    // Create a stable hash based on sequence characteristics
    const hashData = {
      sequenceName,
      priority,
      // Include relevant data fields but exclude timestamps and request IDs
      resourceId: data.resourceId,
      componentId: data.componentId,
      elementId: data.elementId,
      canvasId: data.canvasId,
      symphonyName: data.symphonyName,
      instanceId: data.instanceId,
    };

    // Simple hash generation (in production, use a proper hash function)
    const hashString = JSON.stringify(hashData);
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `seq_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Check if a sequence request is a duplicate within the idempotency window
   * @param sequenceHash - Hash of the sequence request
   * @returns True if this is a duplicate request
   */
  private isDuplicateSequenceRequest(sequenceHash: string): boolean {
    const now = performance.now();
    const lastExecution = this.recentExecutions.get(sequenceHash);

    if (!lastExecution) {
      return false; // Never executed
    }

    const timeSinceLastExecution = now - lastExecution;
    const isDuplicate = timeSinceLastExecution < this.idempotencyWindow;

    if (isDuplicate) {
      console.warn(
        `🎼 MCO: Duplicate sequence request detected (hash: ${sequenceHash}, ${timeSinceLastExecution.toFixed(
          2
        )}ms ago)`
      );
    }

    return isDuplicate;
  }

  /**
   * Record a sequence execution to prevent future duplicates
   * @param sequenceHash - Hash of the sequence request
   */
  private recordSequenceExecution(sequenceHash: string): void {
    const now = performance.now();
    this.recentExecutions.set(sequenceHash, now);
    this.executedSequenceHashes.add(sequenceHash);

    // Clean up old entries to prevent memory leaks
    this.cleanupOldExecutionRecords();
  }

  /**
   * Clean up old execution records outside the idempotency window
   */
  private cleanupOldExecutionRecords(): void {
    const now = performance.now();
    const cutoffTime = now - this.idempotencyWindow;

    for (const [hash, timestamp] of this.recentExecutions.entries()) {
      if (timestamp < cutoffTime) {
        this.recentExecutions.delete(hash);
      }
    }

    // Limit the size of executedSequenceHashes to prevent unbounded growth
    if (this.executedSequenceHashes.size > 1000) {
      const hashArray = Array.from(this.executedSequenceHashes);
      const toKeep = hashArray.slice(-500); // Keep the most recent 500
      this.executedSequenceHashes = new Set(toKeep);
    }
  }

  /**
   * Enhanced sequence deduplication for StrictMode protection
   * @param sequenceName - Name of the sequence
   * @param data - Sequence data
   * @param priority - Sequence priority
   * @returns Deduplication result
   */
  private deduplicateSequenceRequest(
    sequenceName: string,
    data: Record<string, any>,
    priority: SequencePriority
  ): { isDuplicate: boolean; hash: string; message: string } {
    const sequenceHash = this.generateSequenceHash(
      sequenceName,
      data,
      priority
    );

    // Special handling for ElementLibrary Display sequence - always allow first execution
    if (sequenceName === "Element Library Display Symphony No. 12") {
      const isDuplicate = this.isDuplicateSequenceRequest(sequenceHash);

      if (isDuplicate) {
        const now = performance.now();
        const lastExecution = this.recentExecutions.get(sequenceHash);
        const timeSinceLastExecution = lastExecution ? now - lastExecution : 0;

        console.log(
          `🎼 MCO: ElementLibrary Display duplicate check - last execution: ${timeSinceLastExecution.toFixed(
            2
          )}ms ago`
        );

        // Always allow the first ElementLibrary Display sequence to execute
        // This ensures the display sequence can run at least once
        console.log(
          `🎼 MCO: FORCING ElementLibrary Display sequence execution - bypassing duplicate detection`
        );
        return {
          isDuplicate: false,
          hash: sequenceHash,
          message: `ElementLibrary Display sequence FORCED execution: ${sequenceName} (hash: ${sequenceHash})`,
        };
      } else {
        console.log(
          `🎼 MCO: ElementLibrary Display sequence - first execution, allowing`
        );
        return {
          isDuplicate: false,
          hash: sequenceHash,
          message: `ElementLibrary Display sequence first execution: ${sequenceName} (hash: ${sequenceHash})`,
        };
      }
    }

    const isDuplicate = this.isDuplicateSequenceRequest(sequenceHash);

    if (isDuplicate) {
      return {
        isDuplicate: true,
        hash: sequenceHash,
        message: `Duplicate sequence request blocked: ${sequenceName} (hash: ${sequenceHash})`,
      };
    }

    return {
      isDuplicate: false,
      hash: sequenceHash,
      message: `Sequence request approved: ${sequenceName} (hash: ${sequenceHash})`,
    };
  }

  /**
   * Check if this is a React StrictMode duplicate call
   * @param data - Sequence data
   * @returns True if this appears to be a StrictMode duplicate
   */
  private isStrictModeDuplicate(data: Record<string, any>): boolean {
    // Check for common StrictMode patterns
    if (data.source === "react-strict-mode" || data.strictMode === true) {
      return true;
    }

    // Check for rapid successive calls (common in StrictMode)
    const now = performance.now();
    if (data.timestamp && typeof data.timestamp === "number") {
      const timeDiff = now - data.timestamp;
      if (timeDiff < 100) {
        // Less than 100ms apart
        console.warn(
          `🎼 MCO: Potential StrictMode duplicate detected (${timeDiff.toFixed(
            2
          )}ms apart)`
        );
        return true;
      }
    }

    return false;
  }
}
