using System.Text.Json.Serialization;

namespace RenderX.ManifestGenerator.Models;

public class Sequence
{
    [JsonPropertyName("pluginId")]
    public string? PluginId { get; set; }

    [JsonPropertyName("movements")]
    public List<Movement>? Movements { get; set; }
}

public class Movement
{
    [JsonPropertyName("beats")]
    public List<Beat>? Beats { get; set; }
}

public class Beat
{
    [JsonPropertyName("event")]
    public string? Event { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}

