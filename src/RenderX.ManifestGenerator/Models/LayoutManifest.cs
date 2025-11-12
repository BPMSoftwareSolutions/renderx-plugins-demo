using System.Text.Json.Serialization;

namespace RenderX.ManifestGenerator.Models;

public class LayoutManifest
{
    [JsonPropertyName("slots")]
    public List<LayoutSlot>? Slots { get; set; }

    [JsonPropertyName("generated")]
    public DateTime? Generated { get; set; }
}

public class LayoutSlot
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("pluginId")]
    public string? PluginId { get; set; }

    [JsonPropertyName("position")]
    public string? Position { get; set; }

    [JsonPropertyName("size")]
    public string? Size { get; set; }
}

