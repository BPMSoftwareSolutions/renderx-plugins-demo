namespace RenderX.HostSDK.Avalonia.Models;

/// <summary>
/// Route definition for interactions and topics.
/// </summary>
public class Route
{
    /// <summary>
    /// Plugin ID that handles this route.
    /// </summary>
    public required string PluginId { get; set; }

    /// <summary>
    /// Sequence ID within the plugin.
    /// </summary>
    public required string SequenceId { get; set; }
}

