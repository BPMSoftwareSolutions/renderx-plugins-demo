/**
 * PluginManager - High-level plugin management and mounting
 * Handles CIA (Conductor Integration Architecture) plugin lifecycle
 */

import { EventBus } from "../../EventBus";
import { SPAValidator } from "../../SPAValidator";
import type { MusicalSequence } from "../SequenceTypes";
import { SequenceRegistry } from "../core/SequenceRegistry";
import { PluginLoader } from "./PluginLoader";
import { PluginValidator } from "./PluginValidator";
import { PluginManifestLoader } from "./PluginManifestLoader";

// Import plugin types from MusicalConductor (temporary until we move them to a shared location)
import type { SPAPlugin, PluginMountResult } from "../MusicalConductor";

export class PluginManager {
  private eventBus: EventBus;
  private spaValidator: SPAValidator;
  private sequenceRegistry: SequenceRegistry;
  public pluginLoader: PluginLoader; // Made public for access from MusicalConductor
  private pluginValidator: PluginValidator;
  private manifestLoader: PluginManifestLoader;

  // Plugin state
  private mountedPlugins: Map<string, SPAPlugin> = new Map();
  private pluginHandlers: Map<string, Record<string, Function>> = new Map();
  private pluginsRegistered: boolean = false; // Prevent React StrictMode double execution

  constructor(
    eventBus: EventBus,
    spaValidator: SPAValidator,
    sequenceRegistry: SequenceRegistry
  ) {
    this.eventBus = eventBus;
    this.spaValidator = spaValidator;
    this.sequenceRegistry = sequenceRegistry;
    this.pluginLoader = new PluginLoader();
    this.pluginValidator = new PluginValidator();
    this.manifestLoader = new PluginManifestLoader();
  }

  /**
   * Mount a plugin with sequence and handlers
   * @param sequence - Musical sequence definition
   * @param handlers - Event handlers for the sequence
   * @param pluginId - Optional plugin ID (defaults to sequence.name)
   * @param metadata - Optional plugin metadata
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
      console.log(`🧠 PluginManager: Attempting to mount plugin: ${id}`);

      // Validate plugin structure
      const validationResult = this.pluginValidator.validatePluginStructure(
        sequence,
        handlers,
        id
      );
      if (!validationResult.isValid) {
        return {
          success: false,
          pluginId: id,
          message: `Plugin validation failed: ${validationResult.errors.join(
            ", "
          )}`,
          warnings: validationResult.warnings,
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
          warnings,
        };
      }

      // Register the sequence
      this.sequenceRegistry.register(sequence);

      // Create plugin object
      const plugin: SPAPlugin = {
        sequence,
        handlers: handlers || {},
        metadata: {
          id,
          version: metadata?.version || "1.0.0",
          author: metadata?.author,
        },
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
        warnings,
      };
    } catch (error) {
      console.error(`❌ Failed to mount plugin ${id}:`, error);
      return {
        success: false,
        pluginId: id,
        message: error instanceof Error ? error.message : String(error),
        warnings,
      };
    }
  }

  /**
   * Unmount a plugin
   * @param pluginId - Plugin ID to unmount
   * @returns True if successfully unmounted
   */
  unmountPlugin(pluginId: string): boolean {
    try {
      if (!this.mountedPlugins.has(pluginId)) {
        console.warn(`🧠 Plugin not found for unmounting: ${pluginId}`);
        return false;
      }

      const plugin = this.mountedPlugins.get(pluginId)!;

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

      // Load plugin manifest
      const pluginManifest = await this.manifestLoader.loadManifest(
        "/plugins/manifest.json"
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

  /**
   * Register plugins from manifest
   * @param manifest - Plugin manifest data
   */
  private async registerPluginsFromManifest(manifest: any): Promise<void> {
    console.log("🎼 PluginManager: Registering plugins from manifest...");

    console.log(
      `🔌 Processing ${manifest.plugins.length} plugins from manifest`
    );

    // Iterate through plugins defined in manifest
    for (const plugin of manifest.plugins) {
      try {
        if (plugin.autoMount) {
          // Check if plugin is already mounted (prevents React StrictMode double execution)
          if (this.mountedPlugins.has(plugin.name)) {
            console.log(`⚠️ Plugin already mounted, skipping: ${plugin.name}`);
            continue;
          }

          console.log(
            `🔌 Auto-mounting plugin: ${plugin.name} from ${plugin.path}`
          );

          // Dynamic plugin loading using pre-compiled JavaScript files
          const pluginModule = await this.pluginLoader.loadPluginModule(
            `/plugins/${plugin.path}index.js`
          );

          // Validate plugin structure
          if (!pluginModule.sequence || !pluginModule.handlers) {
            console.warn(
              `⚠️ Plugin ${plugin.name} missing required exports (sequence, handlers)`
            );
            continue;
          }

          // Mount the plugin with metadata from manifest
          const mountResult = await this.mount(
            pluginModule.sequence,
            pluginModule.handlers,
            plugin.name,
            {
              version: plugin.version,
              description: plugin.description,
              path: plugin.path,
              autoMount: plugin.autoMount,
            }
          );

          if (mountResult.success) {
            console.log(`✅ Auto-mounted plugin: ${plugin.name}`);
          } else {
            console.error(
              `❌ Failed to auto-mount plugin ${plugin.name}: ${mountResult.message}`
            );
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
  private registerFallbackSequences(): void {
    console.log("🔄 Registering fallback sequences...");

    // Register basic fallback sequences for essential functionality
    const fallbackSequences = [
      {
        name: "fallback-sequence",
        description: "Basic fallback sequence",
        movements: [
          {
            name: "fallback-movement",
            beats: [
              {
                beat: 1,
                event: "fallback-event",
                title: "Fallback Event",
                description: "Basic fallback event",
                dynamics: "forte",
                timing: "immediate",
                errorHandling: "continue",
                data: {},
              },
            ],
          },
        ],
      },
    ];

    fallbackSequences.forEach((sequence) => {
      this.sequenceRegistry.register(sequence as MusicalSequence);
    });

    console.log("✅ Fallback sequences registered");
  }

  /**
   * Get plugin information
   * @param pluginId - Plugin ID
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

  /**
   * Get all mounted plugin names (alias for getMountedPluginIds)
   */
  getMountedPlugins(): string[] {
    return this.getMountedPluginIds();
  }

  /**
   * Get plugin handlers for a specific plugin
   * @param pluginId - Plugin ID
   * @returns Plugin handlers or null
   */
  getPluginHandlers(pluginId: string): Record<string, Function> | null {
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

    return this.pluginHandlers.get(pluginId) || null;
  }

  /**
   * Get plugin statistics
   * @returns Plugin statistics
   */
  getStatistics(): {
    totalPlugins: number;
    mountedPlugins: string[];
    pluginsRegistered: boolean;
  } {
    return {
      totalPlugins: this.mountedPlugins.size,
      mountedPlugins: this.getMountedPluginIds(),
      pluginsRegistered: this.pluginsRegistered,
    };
  }

  /**
   * Reset plugin manager state (for testing)
   */
  reset(): void {
    this.mountedPlugins.clear();
    this.pluginHandlers.clear();
    this.pluginsRegistered = false;
    console.log("🧹 PluginManager: State reset");
  }
}
