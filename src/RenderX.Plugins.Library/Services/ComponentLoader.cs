using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Logging;

namespace RenderX.Plugins.Library.Services;

/// <summary>
/// Service to load JSON component definitions from the catalog
/// </summary>
public class ComponentLoader
{
    private readonly ILogger<ComponentLoader>? _logger;
    private readonly string _componentsPath;

    public ComponentLoader(ILogger<ComponentLoader>? logger = null, string? componentsPath = null)
    {
        _logger = logger;
        
        // Default to json-components folder in the solution root
        if (string.IsNullOrEmpty(componentsPath))
        {
            var currentDir = Directory.GetCurrentDirectory();
            _componentsPath = Path.Combine(currentDir, "json-components");
        }
        else
        {
            _componentsPath = componentsPath;
        }
    }

    /// <summary>
    /// Load all component definitions from the json-components folder
    /// </summary>
    public List<ComponentDefinition> LoadComponents()
    {
        var components = new List<ComponentDefinition>();

        try
        {
            if (!Directory.Exists(_componentsPath))
            {
                _logger?.LogWarning("Components directory not found: {Path}", _componentsPath);
                return components;
            }

            var jsonFiles = Directory.GetFiles(_componentsPath, "*.json", SearchOption.TopDirectoryOnly)
                .Where(f => !Path.GetFileName(f).Equals("index.json", StringComparison.OrdinalIgnoreCase));

            foreach (var file in jsonFiles)
            {
                try
                {
                    var component = LoadComponent(file);
                    if (component != null)
                    {
                        components.Add(component);
                        _logger?.LogDebug("Loaded component: {Name} from {File}", component.Name, Path.GetFileName(file));
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Failed to load component from {File}", Path.GetFileName(file));
                }
            }

            _logger?.LogInformation("Loaded {Count} components from {Path}", components.Count, _componentsPath);
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Failed to load components from {Path}", _componentsPath);
        }

        return components;
    }

    /// <summary>
    /// Load a single component definition from a JSON file
    /// </summary>
    private ComponentDefinition? LoadComponent(string filePath)
    {
        var json = File.ReadAllText(filePath);
        var doc = JsonNode.Parse(json);

        if (doc == null)
        {
            return null;
        }

        var metadata = doc["metadata"];
        if (metadata == null)
        {
            return null;
        }

        var ui = doc["ui"];
        var icon = ui?["icon"];

        return new ComponentDefinition
        {
            Id = metadata["type"]?.GetValue<string>() ?? Path.GetFileNameWithoutExtension(filePath),
            Name = metadata["name"]?.GetValue<string>() ?? "Unknown",
            Category = metadata["category"]?.GetValue<string>() ?? "Other",
            Description = metadata["description"]?.GetValue<string>() ?? "",
            Icon = icon?["value"]?.GetValue<string>() ?? "🧩",
            Version = metadata["version"]?.GetValue<string>() ?? "1.0.0",
            Author = metadata["author"]?.GetValue<string>() ?? "",
            Tags = metadata["tags"]?.AsArray()?.Select(n => n?.GetValue<string>() ?? "").ToList() ?? new List<string>(),
            FilePath = filePath,
            JsonContent = json
        };
    }
}

/// <summary>
/// Represents a component definition loaded from JSON
/// </summary>
public class ComponentDefinition
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = "🧩";
    public string Version { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new List<string>();
    public string FilePath { get; set; } = string.Empty;
    public string JsonContent { get; set; } = string.Empty;
}
