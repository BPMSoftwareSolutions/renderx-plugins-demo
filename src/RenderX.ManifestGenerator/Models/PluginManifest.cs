using System.Text.Json.Serialization;

namespace RenderX.ManifestGenerator.Models;

public class PluginManifest
{
    [JsonPropertyName("plugins")]
    public List<Plugin> Plugins { get; set; } = new();

    [JsonPropertyName("generated")]
    public DateTime? Generated { get; set; }
}

public class Plugin
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("version")]
    public string? Version { get; set; }

    [JsonPropertyName("ui")]
    public PluginUi? Ui { get; set; }

    [JsonPropertyName("runtime")]
    public PluginRuntime? Runtime { get; set; }

    [JsonPropertyName("sequences")]
    public List<string>? Sequences { get; set; }

    [JsonPropertyName("topics")]
    public List<string>? Topics { get; set; }

    [JsonPropertyName("components")]
    public List<string>? Components { get; set; }
}

public class PluginUi
{
    [JsonPropertyName("slot")]
    public string? Slot { get; set; }

    [JsonPropertyName("module")]
    public string Module { get; set; } = string.Empty;

    [JsonPropertyName("export")]
    public string? Export { get; set; }
}

public class PluginRuntime
{
    [JsonPropertyName("module")]
    public string Module { get; set; } = string.Empty;

    [JsonPropertyName("export")]
    public string? Export { get; set; }
}

