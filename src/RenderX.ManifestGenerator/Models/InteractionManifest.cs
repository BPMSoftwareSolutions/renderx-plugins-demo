using System.Text.Json.Serialization;

namespace RenderX.ManifestGenerator.Models;

public class InteractionManifest
{
    [JsonPropertyName("routes")]
    public Dictionary<string, RouteInfo> Routes { get; set; } = new();

    [JsonPropertyName("generated")]
    public DateTime? Generated { get; set; }
}

public class RouteInfo
{
    [JsonPropertyName("pluginId")]
    public string PluginId { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}

