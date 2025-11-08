using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Core.Manifests;

/// <summary>
/// Layout manifest model
/// </summary>
public record LayoutManifest
{
    public string Version { get; init; } = "1.0.0";
    public LayoutDefinition Layout { get; init; } = new();
    public List<SlotDefinition> Slots { get; init; } = new();
}

/// <summary>
/// Layout definition
/// </summary>
public record LayoutDefinition
{
    public string Kind { get; init; } = "grid"; // "grid", "flex"
    public List<string> Columns { get; init; } = new();
    public List<string> Rows { get; init; } = new();
    public List<List<string>> Areas { get; init; } = new();
    public GapDefinition Gap { get; init; } = new();
}

/// <summary>
/// Gap definition for layout
/// </summary>
public record GapDefinition
{
    public string Column { get; init; } = "0";
    public string Row { get; init; } = "0";
}

/// <summary>
/// Slot definition
/// </summary>
public record SlotDefinition
{
    public string Name { get; init; } = string.Empty;
    public SlotConstraints? Constraints { get; init; }
    public SlotCapabilities? Capabilities { get; init; }
}

/// <summary>
/// Slot constraints
/// </summary>
public record SlotConstraints
{
    public double? MinWidth { get; init; }
    public double? MinHeight { get; init; }
    public double? MaxWidth { get; init; }
    public double? MaxHeight { get; init; }
}

/// <summary>
/// Slot capabilities
/// </summary>
public record SlotCapabilities
{
    public bool Droppable { get; init; }
    public bool Resizable { get; init; }
    public bool Scrollable { get; init; }
}

/// <summary>
/// Interaction manifest model
/// </summary>
public record InteractionManifest
{
    public string Version { get; init; } = "1.0.0";
    public Dictionary<string, RouteDefinition> Routes { get; init; } = new();
}

/// <summary>
/// Route definition for interactions
/// </summary>
public record RouteDefinition
{
    public string PluginId { get; init; } = string.Empty;
    public string SequenceId { get; init; } = string.Empty;
    public string? Description { get; init; }
}

/// <summary>
/// Topics manifest model
/// </summary>
public record TopicsManifest
{
    public string Version { get; init; } = "1.0.0";
    public Dictionary<string, TopicDefinition> Topics { get; init; } = new();
}

/// <summary>
/// Topic definition
/// </summary>
public record TopicDefinition
{
    public string Description { get; init; } = string.Empty;
    public TopicPerformance? Performance { get; init; }
    public bool Replay { get; init; }
    public string? Schema { get; init; }
}

/// <summary>
/// Topic performance settings
/// </summary>
public record TopicPerformance
{
    public int? ThrottleMs { get; init; }
    public int? DebounceMs { get; init; }
    public int? MaxConcurrent { get; init; }
}

/// <summary>
/// Plugin manifest model
/// </summary>
public record PluginManifest
{
    public string Version { get; init; } = "1.0.0";
    public List<PluginDefinition> Plugins { get; init; } = new();
}

/// <summary>
/// Plugin definition in manifest
/// </summary>
public record PluginDefinition
{
    public string Id { get; init; } = string.Empty;
    public string? DisplayName { get; init; }
    public string? Description { get; init; }
    public string? Version { get; init; }
    public PluginUIDefinition? UI { get; init; }
    public PluginRuntimeDefinition? Runtime { get; init; }
    public string[] Dependencies { get; init; } = Array.Empty<string>();
    public bool AutoMount { get; init; } = true;
}

/// <summary>
/// Plugin UI definition
/// </summary>
public record PluginUIDefinition
{
    public string? PanelId { get; init; }
    public string? Title { get; init; }
}

/// <summary>
/// Plugin runtime definition
/// </summary>
public record PluginRuntimeDefinition
{
    public string? EntryPoint { get; init; }
    public string? Type { get; init; }
}

/// <summary>
/// Manifest loader interface
/// </summary>
public interface IManifestLoader
{
    /// <summary>
    /// Load a manifest of the specified type
    /// </summary>
    /// <typeparam name="T">Manifest type</typeparam>
    /// <param name="manifestPath">Path to manifest file</param>
    Task<T> LoadManifestAsync<T>(string manifestPath) where T : class;

    /// <summary>
    /// Load a manifest with fallback
    /// </summary>
    /// <typeparam name="T">Manifest type</typeparam>
    /// <param name="manifestPath">Path to manifest file</param>
    /// <param name="fallback">Fallback value if loading fails</param>
    Task<T> LoadManifestAsync<T>(string manifestPath, T fallback) where T : class;

    /// <summary>
    /// Clear manifest cache
    /// </summary>
    void ClearCache();
}
