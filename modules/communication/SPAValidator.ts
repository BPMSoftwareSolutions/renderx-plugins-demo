/**
 * SPA Runtime Validator
 * Provides runtime enforcement of Symphonic Plugin Architecture (SPA) compliance
 * Prevents plugins from directly accessing eventBus.emit() and enforces conductor.play() usage
 */

import { EventBus, EventCallback } from "./EventBus.js";

export interface SPAViolation {
  type: string;
  pluginId: string;
  description: string;
  stackTrace: string;
  timestamp: Date;
  severity: "critical" | "error" | "warning";
}

export interface SPAValidatorConfig {
  strictMode: boolean;
  allowedPlugins: string[];
  logViolations: boolean;
  throwOnViolation: boolean;
  enableRuntimeChecks: boolean;
}

export class SPAValidator {
  private violations: SPAViolation[] = [];
  public config: SPAValidatorConfig;
  private originalEventBusEmit: Function | null = null;
  private originalEventBusSubscribe: Function | null = null;
  private registeredPlugins: Set<string> = new Set();

  constructor(config: Partial<SPAValidatorConfig> = {}) {
    this.config = {
      strictMode: true,
      allowedPlugins: [],
      logViolations: true,
      throwOnViolation: false,
      enableRuntimeChecks: true,
      ...config,
    };

    if (this.config.enableRuntimeChecks) {
      this.initializeRuntimeChecks();
    }
  }

  /**
   * Initialize runtime checks by intercepting eventBus.emit calls and subscribe calls
   */
  private initializeRuntimeChecks(): void {
    // Store original emit method
    this.originalEventBusEmit = EventBus.prototype.emit;

    // Override emit method with validation
    (EventBus.prototype.emit as any) = this.createValidatedEmit();

    // Store original subscribe method and override it
    this.originalEventBusSubscribe = EventBus.prototype.subscribe;
    (EventBus.prototype.subscribe as any) = this.createValidatedSubscribe();

    // Intercept global eventBus access
    this.interceptGlobalAccess();

    console.log("🎼 SPA Validator: Runtime checks initialized");
  }

  /**
   * Create validated emit function that checks for plugin violations
   */
  private createValidatedEmit(): Function {
    return function (
      this: EventBus,
      eventName: string,
      data?: any,
      options: any = {}
    ) {
      const validator = SPAValidator.getInstance();

      // Get call stack to identify caller
      const stack = new Error().stack || "";
      const callerInfo = validator.analyzeCallStack(stack);

      // Check if call is from a plugin
      if (validator.isPluginCall(callerInfo)) {
        const violation = validator.createViolation(
          "RUNTIME_DIRECT_EVENTBUS_EMIT",
          callerInfo.pluginId,
          `Plugin '${callerInfo.pluginId}' directly called eventBus.emit('${eventName}')`,
          stack,
          "critical"
        );

        validator.handleViolation(violation);

        // In strict mode, block the call
        if (validator.config.strictMode) {
          console.error(
            `🚫 SPA Validator: Blocked direct eventBus.emit() call from plugin '${callerInfo.pluginId}'`
          );
          console.error(
            `💡 Use conductor.play('${callerInfo.pluginId}', 'SEQUENCE_NAME', data) instead`
          );
          return;
        }
      }

      // Call original emit method
      return validator.originalEventBusEmit!.call(
        this,
        eventName,
        data,
        options
      );
    };
  }

  /**
   * Create validated subscribe function that checks for React component violations
   */
  private createValidatedSubscribe(): Function {
    return function (
      this: EventBus,
      eventName: string,
      callback: EventCallback,
      context?: any
    ) {
      const validator = SPAValidator.getInstance();
      const stack = new Error().stack || "";
      const callerInfo = validator.analyzeCallStack(stack);

      // Allow MusicalConductor to subscribe directly for internal operations
      if (callerInfo.isMusicalConductor) {
        return validator.originalEventBusSubscribe!.call(
          this,
          eventName,
          callback,
          context
        );
      }

      // Check if React component is directly subscribing
      if (callerInfo.isReactComponent) {
        const violation = validator.createViolation(
          "RUNTIME_REACT_COMPONENT_EVENTBUS_SUBSCRIBE",
          "react-component",
          `React component directly called eventBus.subscribe('${eventName}') - should use conductor.subscribe()`,
          stack,
          "critical"
        );
        validator.handleViolation(violation);

        if (validator.config.strictMode) {
          throw new Error(
            `React component violation: Use conductor.subscribe('${eventName}', callback) instead of eventBus.subscribe()`
          );
        }
      }

      // Check if plugin is subscribing outside mount method
      if (callerInfo.isPlugin && !callerInfo.isInMountMethod) {
        const violation = validator.createViolation(
          "RUNTIME_PLUGIN_EVENTBUS_SUBSCRIBE_OUTSIDE_MOUNT",
          callerInfo.pluginId,
          `Plugin '${callerInfo.pluginId}' called eventBus.subscribe() outside mount method`,
          stack,
          "error"
        );
        validator.handleViolation(violation);
      }

      return validator.originalEventBusSubscribe!.call(
        this,
        eventName,
        callback,
        context
      );
    };
  }

  /**
   * Intercept global eventBus access through window.renderxCommunicationSystem
   */
  private interceptGlobalAccess(): void {
    if (typeof window === "undefined") return;

    // Monitor access to window.renderxCommunicationSystem.eventBus
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      window,
      "renderxCommunicationSystem"
    );

    let communicationSystem: any = null;

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
      set: (value) => {
        communicationSystem = value;
      },
      configurable: true,
    });
  }

  /**
   * Check if global access is violating SPA principles
   */
  private isViolatingGlobalAccess(callerInfo: any, stack: string): boolean {
    // Allow MusicalConductor and AppContent to set up the system
    if (
      callerInfo.source === "MusicalConductor" ||
      stack.includes("AppContent")
    ) {
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
  private handleGlobalAccessViolation(callerInfo: any, stack: string): void {
    const violation = this.createViolation(
      "RUNTIME_GLOBAL_EVENTBUS_ACCESS",
      callerInfo.pluginId || callerInfo.source,
      `Global eventBus access detected - should use conductor methods instead`,
      stack,
      "critical"
    );
    this.handleViolation(violation);
  }

  /**
   * Analyze call stack to identify plugin calls, React components, and mount methods
   */
  public analyzeCallStack(stack: string): {
    isPlugin: boolean;
    pluginId: string;
    fileName: string;
    isReactComponent: boolean;
    isInMountMethod: boolean;
    source: string;
    isMusicalConductor: boolean;
  } {
    const lines = stack.split("\n");
    let isReactComponent = false;
    let isInMountMethod = false;
    let isMusicalConductor = false;
    let source = "unknown";

    for (const line of lines) {
      // Check for MusicalConductor internal operations first
      // Handle both full paths, URLs, and just filenames
      if (
        line.includes("MusicalConductor") ||
        line.includes("/sequences/MusicalConductor.ts") ||
        line.includes("/sequences/core/") ||
        line.includes("/sequences/plugins/PluginManager") ||
        line.includes("/sequences/plugins/PluginInterfaceFacade") ||
        line.includes("/sequences/plugins/PluginLoader") ||
        line.includes("/sequences/plugins/PluginValidator") ||
        line.includes("/sequences/plugins/PluginManifestLoader") ||
        line.includes("SequenceRegistry") ||
        line.includes("EventSubscriptionManager") ||
        line.includes("ConductorCore") ||
        line.includes("EventOrchestrator") ||
        line.includes("SequenceOrchestrator") ||
        line.includes("/communication/EventBus") ||
        line.includes("/communication/SPAValidator") ||
        // Handle filename-only patterns (common in minified/bundled code)
        line.includes("PluginManager.js") ||
        line.includes("PluginInterfaceFacade.js") ||
        line.includes("PluginLoader.js") ||
        line.includes("PluginValidator.js") ||
        line.includes("PluginManifestLoader.js") ||
        line.includes("SequenceRegistry.js") ||
        line.includes("EventSubscriptionManager.js") ||
        line.includes("ConductorCore.js") ||
        line.includes("EventOrchestrator.js") ||
        line.includes("SequenceOrchestrator.js") ||
        line.includes("EventBus.js") ||
        line.includes("SPAValidator.js") ||
        // Handle browser URL patterns for E2E testing
        line.includes("/dist/modules/communication/") ||
        line.includes("/dist/modules/sequences/")
      ) {
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
          isMusicalConductor: true,
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
          isMusicalConductor: false,
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
          isMusicalConductor: false,
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
      isMusicalConductor: false,
    };
  }

  /**
   * Check if call is from a plugin
   */
  private isPluginCall(callerInfo: {
    isPlugin: boolean;
    pluginId: string;
    isReactComponent?: boolean;
    isInMountMethod?: boolean;
    source?: string;
    isMusicalConductor?: boolean;
  }): boolean {
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
  public createViolation(
    type: string,
    pluginId: string,
    description: string,
    stackTrace: string,
    severity: "critical" | "error" | "warning"
  ): SPAViolation {
    return {
      type,
      pluginId,
      description,
      stackTrace,
      timestamp: new Date(),
      severity,
    };
  }

  /**
   * Handle violation based on configuration
   */
  public handleViolation(violation: SPAViolation): void {
    this.violations.push(violation);

    if (this.config.logViolations) {
      console.error(
        `🎼 SPA Violation [${violation.severity.toUpperCase()}]: ${
          violation.description
        }`
      );
      console.error(`   Plugin: ${violation.pluginId}`);
      console.error(`   Time: ${violation.timestamp.toISOString()}`);

      if (violation.severity === "critical") {
        console.error(
          `   Stack: ${violation.stackTrace.split("\n").slice(0, 3).join("\n")}`
        );
      }
    }

    if (this.config.throwOnViolation && violation.severity === "critical") {
      throw new Error(`SPA Violation: ${violation.description}`);
    }
  }

  /**
   * Register a plugin as allowed to use eventBus directly (for migration)
   */
  public registerPlugin(pluginId: string): void {
    this.registeredPlugins.add(pluginId);
    // Plugin registered - logging disabled for cleaner output
  }

  /**
   * Validate plugin compliance before mounting
   */
  public validatePluginMount(
    pluginId: string,
    pluginCode: string
  ): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check for direct eventBus.emit calls in plugin code
    const directEmitPattern = /eventBus\.emit\s*\(/g;
    const matches = pluginCode.match(directEmitPattern);

    if (matches) {
      violations.push(
        `Plugin '${pluginId}' contains ${matches.length} direct eventBus.emit() call(s)`
      );
    }

    // Check for global eventBus access
    const globalEmitPattern = /window\..*eventBus\.emit\s*\(/g;
    const globalMatches = pluginCode.match(globalEmitPattern);

    if (globalMatches) {
      violations.push(
        `Plugin '${pluginId}' contains ${globalMatches.length} global eventBus access(es)`
      );
    }

    // Check for proper conductor.play usage
    const conductorPlayPattern = /conductor\.play\s*\(/g;
    const conductorMatches = pluginCode.match(conductorPlayPattern);

    if (!conductorMatches && (matches || globalMatches)) {
      violations.push(
        `Plugin '${pluginId}' uses eventBus.emit() but no conductor.play() - should migrate to SPA`
      );
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  /**
   * Get all violations
   */
  public getViolations(): SPAViolation[] {
    return [...this.violations];
  }

  /**
   * Get violations by plugin
   */
  public getViolationsByPlugin(pluginId: string): SPAViolation[] {
    return this.violations.filter((v) => v.pluginId === pluginId);
  }

  /**
   * Clear violations
   */
  public clearViolations(): void {
    this.violations = [];
  }

  /**
   * Generate compliance report
   */
  public generateComplianceReport(): {
    totalViolations: number;
    violationsByPlugin: Record<string, number>;
    violationsBySeverity: Record<string, number>;
    recommendations: string[];
  } {
    const violationsByPlugin: Record<string, number> = {};
    const violationsBySeverity: Record<string, number> = {};
    const recommendations: string[] = [];

    for (const violation of this.violations) {
      violationsByPlugin[violation.pluginId] =
        (violationsByPlugin[violation.pluginId] || 0) + 1;
      violationsBySeverity[violation.severity] =
        (violationsBySeverity[violation.severity] || 0) + 1;
    }

    // Generate recommendations
    for (const [pluginId, count] of Object.entries(violationsByPlugin)) {
      recommendations.push(
        `Plugin '${pluginId}' has ${count} violation(s) - migrate to conductor.play() pattern`
      );
    }

    return {
      totalViolations: this.violations.length,
      violationsByPlugin,
      violationsBySeverity,
      recommendations,
    };
  }

  /**
   * Singleton instance
   */
  private static instance: SPAValidator;

  public static getInstance(): SPAValidator {
    if (!SPAValidator.instance) {
      SPAValidator.instance = new SPAValidator();
    }
    return SPAValidator.instance;
  }

  /**
   * Initialize SPA validation with configuration
   */
  public static initialize(
    config: Partial<SPAValidatorConfig> = {}
  ): SPAValidator {
    SPAValidator.instance = new SPAValidator(config);
    return SPAValidator.instance;
  }

  /**
   * Disable runtime checks (for testing or migration)
   */
  public disableRuntimeChecks(): void {
    if (this.originalEventBusEmit) {
      (EventBus.prototype.emit as any) = this.originalEventBusEmit!;
      console.log("🎼 SPA Validator: Runtime checks disabled");
    }
  }
}
