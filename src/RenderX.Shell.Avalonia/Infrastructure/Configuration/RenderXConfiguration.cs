namespace RenderX.Shell.Avalonia.Infrastructure.Configuration;

/// <summary>
/// Configuration settings for the RenderX Shell application
/// </summary>
public class RenderXConfiguration
{
    /// <summary>
    /// Plugin-related configuration
    /// </summary>
    public PluginConfiguration Plugins { get; set; } = new();

    /// <summary>
    /// Layout and UI configuration
    /// </summary>
    public LayoutConfiguration Layout { get; set; } = new();

    /// <summary>
    /// Feature flags configuration
    /// </summary>
    public FeatureFlagsConfiguration FeatureFlags { get; set; } = new();

    /// <summary>
    /// Performance and monitoring configuration
    /// </summary>
    public PerformanceConfiguration Performance { get; set; } = new();
}

public class PluginConfiguration
{
    /// <summary>
    /// Directory containing plugin assemblies
    /// </summary>
    public string PluginsDirectory { get; set; } = "plugins";

    /// <summary>
    /// Plugin manifest file path
    /// </summary>
    public string ManifestPath { get; set; } = "plugins/plugin-manifest.json";

    /// <summary>
    /// Enable hot-reloading of plugins during development
    /// </summary>
    public bool EnableHotReload { get; set; } = false;

    /// <summary>
    /// Timeout for plugin initialization in milliseconds
    /// </summary>
    public int InitializationTimeoutMs { get; set; } = 30000;
}

public class LayoutConfiguration
{
    /// <summary>
    /// Layout manifest file path
    /// </summary>
    public string ManifestPath { get; set; } = "layout-manifest.json";

    /// <summary>
    /// Default theme name
    /// </summary>
    public string DefaultTheme { get; set; } = "Light";

    /// <summary>
    /// Enable layout manifest-driven UI
    /// </summary>
    public bool UseLayoutManifest { get; set; } = true;
}

public class FeatureFlagsConfiguration
{
    /// <summary>
    /// Enable diagnostics overlay
    /// </summary>
    public bool DiagnosticsEnabled { get; set; } = true;

    /// <summary>
    /// Enable performance monitoring
    /// </summary>
    public bool PerformanceMonitoringEnabled { get; set; } = false;

    /// <summary>
    /// Enable debug logging
    /// </summary>
    public bool DebugLoggingEnabled { get; set; } = false;
}

public class PerformanceConfiguration
{
    /// <summary>
    /// Maximum sequence execution time in milliseconds before warning
    /// </summary>
    public int SequenceExecutionWarningThresholdMs { get; set; } = 100;

    /// <summary>
    /// Maximum number of concurrent sequences
    /// </summary>
    public int MaxConcurrentSequences { get; set; } = 10;

    /// <summary>
    /// Event router throttling settings
    /// </summary>
    public ThrottlingConfiguration Throttling { get; set; } = new();
}

public class ThrottlingConfiguration
{
    /// <summary>
    /// Default throttle time in milliseconds
    /// </summary>
    public int DefaultThrottleMs { get; set; } = 16; // ~60fps

    /// <summary>
    /// Default debounce time in milliseconds
    /// </summary>
    public int DefaultDebounceMs { get; set; } = 100;
}
