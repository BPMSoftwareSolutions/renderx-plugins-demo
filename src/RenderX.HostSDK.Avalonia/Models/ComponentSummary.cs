namespace RenderX.HostSDK.Avalonia.Models;

/// <summary>
/// Summary information about a component in the inventory.
/// </summary>
public class ComponentSummary
{
    /// <summary>
    /// Unique identifier for the component.
    /// </summary>
    public required string Id { get; set; }

    /// <summary>
    /// Display name of the component.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Optional tags for categorizing the component.
    /// </summary>
    public List<string>? Tags { get; set; }
}

