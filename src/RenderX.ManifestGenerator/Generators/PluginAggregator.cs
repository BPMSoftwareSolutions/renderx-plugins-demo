using System.Reflection;
using System.Text.Json;
using RenderX.ManifestGenerator.Models;

namespace RenderX.ManifestGenerator.Generators;

/// <summary>
/// Discovers plugins from DLL files and generates plugin manifest.
/// Equivalent to web's aggregate-plugins.js
/// </summary>
public class PluginAggregator
{
    private readonly string _srcDir;
    private readonly string _pluginsDir;
    private readonly JsonSerializerOptions _jsonOptions;

    public PluginAggregator(string srcDir, string pluginsDir, JsonSerializerOptions jsonOptions)
    {
        _srcDir = srcDir;
        _pluginsDir = pluginsDir;
        _jsonOptions = jsonOptions;
    }

    public async Task<PluginManifest> AggregateAsync()
    {
        var manifest = new PluginManifest
        {
            Generated = DateTime.UtcNow,
            Plugins = new List<Plugin>()
        };

        // Discover all plugin projects
        var pluginDirs = Directory.GetDirectories(_srcDir, "RenderX.Plugins.*");

        foreach (var pluginDir in pluginDirs)
        {
            var plugin = await DiscoverPluginAsync(pluginDir);
            if (plugin != null)
            {
                manifest.Plugins.Add(plugin);
            }
        }

        return manifest;
    }

    private async Task<Plugin?> DiscoverPluginAsync(string pluginDir)
    {
        var projectName = Path.GetFileName(pluginDir);
        var dllName = $"{projectName}.dll";

        // Try to find the DLL in bin/Debug or bin/Release
        var binDirs = new[]
        {
            Path.Combine(pluginDir, "bin", "Debug", "net8.0", dllName),
            Path.Combine(pluginDir, "bin", "Release", "net8.0", dllName)
        };

        string? dllPath = null;
        foreach (var path in binDirs)
        {
            if (File.Exists(path))
            {
                dllPath = path;
                break;
            }
        }

        // If DLL not found, try to infer plugin info from project structure
        if (dllPath == null)
        {
            return await InferPluginFromProjectAsync(pluginDir, projectName);
        }

        try
        {
            // Load assembly and extract metadata
            var assembly = Assembly.LoadFrom(dllPath);
            return ExtractPluginFromAssembly(assembly, pluginDir, projectName);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"   ⚠️  Failed to load {projectName}: {ex.Message}");
            // Fallback to inference
            return await InferPluginFromProjectAsync(pluginDir, projectName);
        }
    }

    private Plugin? ExtractPluginFromAssembly(Assembly assembly, string pluginDir, string projectName)
    {
        // Try to find a plugin class (ends with "Plugin")
        // Include both instance classes and static classes
        var pluginType = assembly.GetTypes()
            .FirstOrDefault(t => t.Name.EndsWith("Plugin") && t.IsClass);

        if (pluginType == null)
        {
            return null;
        }

        var pluginId = pluginType.Name;
        var version = assembly.GetName().Version?.ToString() ?? "1.0.0";

        return new Plugin
        {
            Id = pluginId,
            Version = version,
            Runtime = new PluginRuntime
            {
                Module = $"{projectName}.dll",
                Export = pluginType.Name
            },
            Ui = new PluginUi
            {
                Module = $"{projectName}.dll",
                Export = pluginType.Name
            }
        };
    }

    private Task<Plugin?> InferPluginFromProjectAsync(string pluginDir, string projectName)
    {
        // Infer plugin ID from project name
        // RenderX.Plugins.Canvas -> CanvasPlugin
        // RenderX.Plugins.ControlPanel -> ControlPanelPlugin
        var pluginName = projectName.Replace("RenderX.Plugins.", "");
        var pluginId = $"{pluginName}Plugin";

        // Check if this plugin has any JSON files
        var hasSequences = Directory.Exists(Path.Combine(pluginDir, "json-sequences"));
        var hasTopics = Directory.Exists(Path.Combine(pluginDir, "json-topics"));
        var hasComponents = Directory.Exists(Path.Combine(pluginDir, "json-components"));

        if (!hasSequences && !hasTopics && !hasComponents)
        {
            // No JSON files, might not be a valid plugin
            Console.WriteLine($"   ⚠️  {projectName}: No JSON files found, skipping");
            return Task.FromResult<Plugin?>(null);
        }

        var plugin = new Plugin
        {
            Id = pluginId,
            Version = "1.0.0",
            Runtime = new PluginRuntime
            {
                Module = $"{projectName}.dll",
                Export = pluginId
            },
            Ui = new PluginUi
            {
                Module = $"{projectName}.dll",
                Export = pluginId
            }
        };

        return Task.FromResult<Plugin?>(plugin);
    }
}

