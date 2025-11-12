using System.Text.Json.Serialization;

namespace RenderX.ManifestGenerator.Models;

public class TopicsManifest
{
    [JsonPropertyName("topics")]
    public Dictionary<string, TopicInfo> Topics { get; set; } = new();

    [JsonPropertyName("generated")]
    public DateTime? Generated { get; set; }
}

public class TopicInfo
{
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("pluginId")]
    public string? PluginId { get; set; }
}

