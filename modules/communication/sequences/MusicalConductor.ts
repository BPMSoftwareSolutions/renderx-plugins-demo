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

// Import new core components
import { ConductorCore } from "./core/ConductorCore";
import { SequenceRegistry } from "./core/SequenceRegistry";
import { EventSubscriptionManager } from "./core/EventSubscriptionManager";
import { ExecutionQueue, QueueStatus } from "./execution/ExecutionQueue";
import { SequenceExecutor } from "./execution/SequenceExecutor";
import { PluginManager } from "./plugins/PluginManager";
import {
  PluginInterfaceFacade,
  type SPAPlugin,
  type PluginMountResult,
} from "./plugins/PluginInterfaceFacade";
import { ResourceManager } from "./resources/ResourceManager";
import { ResourceDelegator } from "./resources/ResourceDelegator";
import { StatisticsManager } from "./monitoring/StatisticsManager";
import { PerformanceTracker } from "./monitoring/PerformanceTracker";
import { DuplicationDetector } from "./monitoring/DuplicationDetector";
import { EventLogger } from "./monitoring/EventLogger";
import { SequenceValidator } from "./validation/SequenceValidator";
import { SequenceUtilities } from "./utilities/SequenceUtilities";

// CIA (Conductor Integration Architecture) interfaces moved to PluginInterfaceFacade

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

  // Core components
  private conductorCore: ConductorCore;
  private sequenceRegistry: SequenceRegistry;
  private eventSubscriptionManager: EventSubscriptionManager;
  private executionQueue: ExecutionQueue;
  private sequenceExecutor: SequenceExecutor;
  private pluginManager: PluginManager;
  private pluginInterface: PluginInterfaceFacade;
  private resourceManager: ResourceManager;
  private resourceDelegator: ResourceDelegator;

  // Monitoring components
  private statisticsManager: StatisticsManager;
  private performanceTracker: PerformanceTracker;
  private duplicationDetector: DuplicationDetector;
  private eventLogger: EventLogger;

  // Validation components
  private sequenceValidator: SequenceValidator;

  // Utility components
  private sequenceUtilities: SequenceUtilities;

  // Legacy properties removed - now handled by specialized components

  // Getters for accessing core components
  private get eventBus(): EventBus {
    return this.conductorCore.getEventBus();
  }

  private get spaValidator(): SPAValidator {
    return this.conductorCore.getSPAValidator();
  }

  // Legacy sequences getter removed - now use sequenceRegistry directly

  // Legacy beat execution properties removed - now handled by BeatExecutor

  // Legacy plugin properties removed - now handled by PluginManager

  // Legacy resource properties removed - now handled by ResourceManager

  // Legacy monitoring properties removed - now handled by monitoring components

  // SPA Validation - now accessed via getter

  // Legacy logging properties removed - now handled by EventLogger

  private constructor(eventBus: EventBus) {
    // Initialize core components
    this.conductorCore = ConductorCore.getInstance(eventBus);
    this.sequenceRegistry = new SequenceRegistry(eventBus);
    this.eventSubscriptionManager = new EventSubscriptionManager(
      eventBus,
      this.conductorCore.getSPAValidator()
    );
    this.executionQueue = new ExecutionQueue();
    // Initialize monitoring components first
    this.statisticsManager = new StatisticsManager();
    this.performanceTracker = new PerformanceTracker();
    this.duplicationDetector = new DuplicationDetector();
    this.eventLogger = new EventLogger(eventBus, this.performanceTracker);

    // Initialize validation components
    this.sequenceValidator = new SequenceValidator(this.duplicationDetector);

    // Initialize utility components
    this.sequenceUtilities = new SequenceUtilities();

    this.sequenceExecutor = new SequenceExecutor(
      eventBus,
      this.conductorCore.getSPAValidator(),
      this.executionQueue,
      this.statisticsManager.getStatistics()
    );
    this.pluginManager = new PluginManager(
      eventBus,
      this.conductorCore.getSPAValidator(),
      this.sequenceRegistry
    );
    this.pluginInterface = new PluginInterfaceFacade(
      this.pluginManager,
      this.conductorCore.getSPAValidator()
    );
    this.resourceManager = new ResourceManager();
    this.resourceDelegator = new ResourceDelegator(this.resourceManager);

    console.log("🎼 MusicalConductor: Initialized with core components");
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
      // Reset core components
      ConductorCore.resetInstance();
    }
    MusicalConductor.instance = null;
    console.log("🔄 MusicalConductor: Singleton instance reset");
  }

  /**
   * Set up beat execution logging
   * Protected against duplicate initialization within the singleton
   */
  private setupBeatExecutionLogging(): void {
    this.eventLogger.setupBeatExecutionLogging();
  }

  // Legacy cleanupEventSubscriptions method removed - now handled by EventLogger

  // Legacy logging methods removed - now handled by EventLogger

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
    const movementInfo = this.sequenceUtilities.getMovementNameForBeat(
      sequenceName,
      beatNumber
    );
    return movementInfo.name;
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
    this.eventLogger.handleBeatError(executionContext, beat, error);
  }

  /**
   * Register a musical sequence
   * @param sequence - The sequence to register
   */
  registerSequence(sequence: MusicalSequence): void {
    this.sequenceRegistry.register(sequence);
  }

  /**
   * Unregister a musical sequence
   * @param sequenceName - Name of the sequence to unregister
   */
  unregisterSequence(sequenceName: string): void {
    this.sequenceRegistry.unregister(sequenceName);
  }

  /**
   * Get a registered sequence
   * @param sequenceName - Name of the sequence
   */
  getSequence(sequenceName: string): MusicalSequence | undefined {
    return this.sequenceRegistry.get(sequenceName);
  }

  /**
   * Get all registered sequence names
   */
  getSequenceNames(): string[] {
    return this.sequenceRegistry.getNames();
  }

  /**
   * Get all registered sequences with their details
   * @returns Array of registered sequences
   */
  getRegisteredSequences(): MusicalSequence[] {
    return this.sequenceRegistry.getAll();
  }

  /**
   * Get all mounted plugin names
   */
  getMountedPlugins(): string[] {
    return this.pluginInterface.getMountedPlugins();
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
    return this.pluginInterface.play(
      pluginId,
      sequenceName,
      context,
      priority,
      (seqName, data, prio) => this.startSequence(seqName, data, prio)
    );
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
  subscribe(
    eventName: string,
    callback: EventCallback,
    context?: any
  ): UnsubscribeFunction {
    return this.eventSubscriptionManager.subscribe(
      eventName,
      callback,
      context
    );
  }

  /**
   * Unsubscribe from events through the conductor (SPA-compliant)
   * @param eventName - The event name to unsubscribe from
   * @param callback - The callback function to remove
   */
  unsubscribe(eventName: string, callback: EventCallback): void {
    this.eventSubscriptionManager.unsubscribe(eventName, callback);
  }

  /**
   * Check if the caller is authorized to use conductor subscription methods
   * @param callerInfo - Information about the caller from stack analysis
   * @returns True if authorized, false otherwise
   */
  private isAuthorizedSubscriber(callerInfo: any): boolean {
    return this.sequenceUtilities.isAuthorizedSubscriber(callerInfo);
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
    return this.pluginInterface.mount(sequence, handlers, pluginId, metadata);
  }

  /**
   * Register CIA-compliant plugins
   * Loads and mounts all plugins from the plugins directory
   */
  async registerCIAPlugins(): Promise<void> {
    return this.pluginInterface.registerCIAPlugins();
  }

  // Legacy loadPluginManifest method removed - now handled by PluginManifestLoader

  // Legacy registerPluginsFromManifest method removed - now handled by PluginManager

  // Legacy registerFallbackSequences method removed - now handled by PluginManager

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
    return this.pluginInterface.executeMovementWithHandler(
      sequenceName,
      movementName,
      data
    );
  }

  // Legacy loadPluginModule method removed - now handled by PluginLoader

  // Legacy loadPluginModuleComplex method removed - now handled by PluginLoader

  /**
   * Load plugin from dynamic import with error handling (CIA-compliant)
   * @param pluginPath - Path to the plugin module
   * @returns Plugin load result
   */
  async loadPlugin(pluginPath: string): Promise<PluginMountResult> {
    return this.pluginInterface.loadPlugin(pluginPath);
  }

  // Legacy extractPluginCode method removed - now handled by PluginInterfaceFacade

  /**
   * Validate plugin pre-compilation status
   * @param pluginId - Plugin identifier
   * @returns Validation result
   */
  // Legacy validatePluginPreCompilation method removed - now handled by PluginInterfaceFacade

  /**
   * Unmount a plugin (CIA-compliant)
   * @param pluginId - Plugin identifier
   * @returns Success status
   */
  unmountPlugin(pluginId: string): boolean {
    return this.pluginInterface.unmountPlugin(pluginId);
  }

  /**
   * Get mounted plugin information
   * @param pluginId - Plugin identifier
   * @returns Plugin information or undefined
   */
  getPluginInfo(pluginId: string): SPAPlugin | undefined {
    return this.pluginInterface.getPluginInfo(pluginId);
  }

  /**
   * Get all mounted plugin IDs
   * @returns Array of plugin IDs
   */
  getMountedPluginIds(): string[] {
    return this.pluginInterface.getMountedPluginIds();
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
    return this.sequenceUtilities.createSequenceInstanceId(
      sequenceName,
      {},
      "NORMAL"
    );
  }

  /**
   * Extract symphony name from sequence name (e.g., "JsonLoader.json-component-symphony" -> "JsonLoader")
   * @param sequenceName - Full sequence name
   * @returns Symphony name
   */
  private extractSymphonyName(sequenceName: string): string {
    return this.sequenceUtilities.extractSymphonyName(sequenceName);
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
    return this.sequenceUtilities.extractResourceId(sequenceName, data);
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
    const delegatorResult = this.resourceDelegator.checkResourceConflict(
      resourceId,
      instanceId,
      priority
    );

    // Convert ResourceDelegator result to MusicalConductor result format
    return {
      hasConflict: delegatorResult.hasConflict,
      conflictType: delegatorResult.hasConflict ? "SAME_RESOURCE" : "NONE",
      resolution:
        delegatorResult.resolution === "override"
          ? "ALLOW"
          : delegatorResult.resolution === "reject"
          ? "REJECT"
          : delegatorResult.resolution === "queue"
          ? "QUEUE"
          : "ALLOW",
      message: delegatorResult.reason || "No conflict detected",
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
    const result = this.resourceDelegator.acquireResourceOwnership(
      resourceId,
      instanceId,
      priority
    );
    return result.acquired;
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
    this.resourceDelegator.releaseResourceOwnership(
      resourceId,
      sequenceExecutionId || "unknown"
    );
  }

  /**
   * Set priority for an event type
   * @param eventType - Event type
   * @param priority - Priority level (MUSICAL_DYNAMICS value)
   */
  setPriority(eventType: string, priority: string): void {
    // Legacy priorities tracking removed - priority now handled by ExecutionQueue
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
      const sequence = this.sequenceRegistry.get(sequenceName);
      if (!sequence) {
        console.error(
          `❌ MusicalConductor: Sequence "${sequenceName}" not found!`
        );
        console.error(
          `❌ This means the plugin for "${sequenceName}" is not loaded or registered.`
        );
        console.error(
          `❌ Available sequences:`,
          this.sequenceRegistry.getNames()
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
      const deduplicationResult =
        this.sequenceValidator.deduplicateSequenceRequest(
          sequenceName,
          data,
          priority
        );

      if (deduplicationResult.isDuplicate) {
        console.warn(`🎼 MCO: ${deduplicationResult.reason}`);

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
      this.statisticsManager.recordSequenceQueued();

      // Starting sequence - internal logging disabled for cleaner output

      console.log(
        `🔍 DEBUG: ${sequenceName} - priority: ${priority}, activeSequence: ${
          this.sequenceExecutor.getCurrentSequence()?.sequenceName || "none"
        }`
      );

      // Add to execution queue
      this.executionQueue.enqueue(sequenceRequest);

      // Process queue if not currently executing
      if (!this.sequenceExecutor.isSequenceRunning()) {
        this.processSequenceQueue();
      }

      this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_QUEUED, {
        sequenceName,
        requestId,
        priority,
        queueLength: this.executionQueue.size(),
      });

      return requestId;
    } catch (error) {
      console.error(
        `🎼 MusicalConductor: Failed to start sequence: ${sequenceName}`,
        error
      );
      this.statisticsManager.recordError();
      throw error;
    }
  }

  // Legacy executeSequenceImmediately method removed - now handled by SequenceExecutor

  /**
   * Create execution context for a sequence
   * @param sequenceRequest - Sequence request
   */
  private createExecutionContext(
    sequenceRequest: SequenceRequest
  ): SequenceExecutionContext {
    const sequence = this.sequenceRegistry.get(sequenceRequest.sequenceName)!;

    // Determine execution type based on whether there was an active sequence when this was queued
    const executionType = this.sequenceExecutor.isSequenceRunning()
      ? "CONSECUTIVE"
      : "IMMEDIATE";

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
  private async processSequenceQueue(): Promise<void> {
    if (
      !this.executionQueue.isEmpty() &&
      !this.sequenceExecutor.isSequenceRunning()
    ) {
      const nextRequest = this.executionQueue.dequeue();
      if (nextRequest) {
        const waitTime = performance.now() - nextRequest.queuedAt;

        // Update queue wait time statistics
        this.updateQueueWaitTimeStatistics(waitTime);

        // Get the sequence and execute it
        const sequence = this.sequenceRegistry.get(nextRequest.sequenceName);
        if (sequence) {
          try {
            await this.sequenceExecutor.executeSequence(nextRequest, sequence);
            // Process next sequence in queue
            this.processSequenceQueue();
          } catch (error) {
            console.error(
              `❌ Failed to execute sequence ${nextRequest.sequenceName}:`,
              error
            );
            // Continue processing queue even if one sequence fails
            this.processSequenceQueue();
          }
        } else {
          console.error(
            `❌ Sequence ${nextRequest.sequenceName} not found in registry`
          );
          // Continue processing queue
          this.processSequenceQueue();
        }
      }
    }
  }

  /**
   * Update queue wait time statistics
   * @param waitTime - Wait time in milliseconds
   */
  private updateQueueWaitTimeStatistics(waitTime: number): void {
    this.statisticsManager.updateQueueWaitTime(waitTime);
  }

  /**
   * Get current statistics (enhanced with CIA plugin information)
   */
  getStatistics(): ConductorStatistics & { mountedPlugins: number } {
    return this.statisticsManager.getEnhancedStatistics(
      this.pluginInterface.getMountedPluginIds().length
    );
  }

  /**
   * Get conductor status including eventBus availability
   * @returns Conductor status object
   */
  getStatus(): {
    statistics: ConductorStatistics & { mountedPlugins: number };
    eventBus: boolean;
    sequences: number;
    plugins: number;
  } {
    return {
      statistics: this.getStatistics(),
      eventBus: !!this.eventBus,
      sequences: this.sequenceRegistry.size(),
      plugins: this.pluginInterface.getMountedPluginIds().length,
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.statisticsManager.reset();
    this.performanceTracker.reset();
    this.duplicationDetector.reset();
    console.log("🎼 MusicalConductor: All monitoring data reset");
  }

  /**
   * Get queue status
   */
  getQueueStatus(): QueueStatus {
    return this.executionQueue.getStatus();
  }

  // Legacy executeSequence method removed - now handled by SequenceExecutor

  // Legacy executeMovement method removed - now handled by MovementExecutor

  // Legacy executeBeat and processBeatQueue methods removed - now handled by BeatExecutor

  // Legacy executeActualBeat method removed - now handled by BeatExecutor

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

  // Legacy emitEventWithCompletion method removed - now handled by BeatExecutor

  // Legacy handleBeatCompletion and handleBeatTimeout methods removed - now handled by BeatExecutor

  // Legacy completeSequence method removed - now handled by SequenceExecutor

  // Legacy failSequence method removed - now handled by SequenceExecutor

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
    if (this.executionQueue.isEmpty()) {
      return false;
    }

    if (this.sequenceExecutor.isSequenceRunning()) {
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
    return this.sequenceExecutor.isSequenceRunning(sequenceName);
  }

  /**
   * Get the currently executing sequence (validation compliance method)
   * @returns Current sequence execution context or null
   */
  getCurrentSequence(): SequenceExecutionContext | null {
    return this.sequenceExecutor.getCurrentSequence();
  }

  /**
   * 🎽 Update the data baton payload for the currently executing sequence
   * This allows plugin handlers to pass data between beats
   * @param payloadData - Data to merge into the current payload
   * @returns Success status
   */
  updatePayload(payloadData: Record<string, any>): boolean {
    const currentSequence = this.sequenceExecutor.getCurrentSequence();
    if (!currentSequence) {
      console.warn(
        "🎽 MusicalConductor: Cannot update payload - no active sequence"
      );
      return false;
    }

    // Merge new payload data with existing payload
    currentSequence.payload = {
      ...currentSequence.payload,
      ...payloadData,
    };

    console.log(
      "🎽 MusicalConductor: Payload updated:",
      currentSequence.payload
    );
    return true;
  }

  /**
   * 🎽 Get the current data baton payload
   * @returns Current payload or null if no active sequence
   */
  getPayload(): Record<string, any> | null {
    const currentSequence = this.sequenceExecutor.getCurrentSequence();
    return currentSequence?.payload || null;
  }

  /**
   * Get all queued sequences (validation compliance method)
   * @returns Array of queued sequence requests
   */
  getQueuedSequences(): SequenceRequest[] {
    return this.executionQueue.getQueuedRequests();
  }

  /**
   * Clear the sequence queue (validation compliance method)
   * @returns Number of sequences that were cleared
   */
  clearSequenceQueue(): number {
    return this.executionQueue.clear();
  }

  /**
   * Get resource ownership information (MCO/MSO diagnostic method)
   * @returns Resource ownership map
   */
  getResourceOwnership(): Map<string, ResourceOwner> {
    return this.resourceManager.getResourceOwnership();
  }

  /**
   * Get symphony resource mapping (MCO/MSO diagnostic method)
   * @returns Symphony to resources mapping
   */
  getSymphonyResourceMap(): Map<string, Set<string>> {
    return this.resourceManager.getSymphonyResourceMap();
  }

  /**
   * Get sequence instances (MCO/MSO diagnostic method)
   * @returns Sequence instances map
   */
  getSequenceInstances(): Map<string, any> {
    return this.resourceManager.getSequenceInstances();
  }

  // ===== Phase 2: Conflict Resolution Strategies =====

  // Legacy resolveResourceConflict_Reject method removed - now handled by ResourceConflictResolver

  // Legacy resolveResourceConflict_Queue method removed - now handled by ResourceConflictResolver

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
  // Legacy resolveResourceConflict_Interrupt method removed - now handled by ResourceConflictResolver

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
    return this.resourceManager.resolveResourceConflictAdvanced(
      resourceId,
      symphonyName,
      instanceId,
      priority,
      sequenceExecutionId,
      sequenceRequest
    );
  }

  // ===== Phase 3: StrictMode Protection & Idempotency Methods =====

  // Legacy generateSequenceHash method removed - now handled by SequenceValidator

  /**
   * Check if a sequence request is a duplicate within the idempotency window
   * @param sequenceHash - Hash of the sequence request
   * @returns True if this is a duplicate request
   */
  private isDuplicateSequenceRequest(sequenceHash: string): boolean {
    const result =
      this.duplicationDetector.isDuplicateSequenceRequest(sequenceHash);

    if (result.isDuplicate) {
      console.warn(`🎼 MCO: ${result.reason} (hash: ${sequenceHash})`);
    }

    return result.isDuplicate;
  }

  /**
   * Record a sequence execution to prevent future duplicates
   * @param sequenceHash - Hash of the sequence request
   */
  private recordSequenceExecution(sequenceHash: string): void {
    this.duplicationDetector.recordSequenceExecution(sequenceHash);
  }

  // Legacy cleanupOldExecutionRecords method removed - now handled by DuplicationDetector

  // Legacy deduplicateSequenceRequest method removed - now handled by SequenceValidator

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
