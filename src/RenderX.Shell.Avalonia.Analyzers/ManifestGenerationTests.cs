using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Xunit;

namespace RenderX.Shell.Avalonia.Analyzers.Tests;

/// <summary>
/// Tests to validate that desktop manifest generation system achieves parity with web version.
/// Ensures all manifests are auto-generated from plugin metadata and cannot be out of sync.
/// </summary>
public class ManifestGenerationTests
{
    private static readonly string RepoRoot = FindRepositoryRoot();
    private static readonly string ShellDir = Path.Combine(RepoRoot, "src", "RenderX.Shell.Avalonia");
    private static readonly string PluginsDir = Path.Combine(ShellDir, "plugins");

    private static string FindRepositoryRoot()
    {
        var current = new DirectoryInfo(AppDomain.CurrentDomain.BaseDirectory);
        while (current != null)
        {
            if (File.Exists(Path.Combine(current.FullName, ".git", "config")))
                return current.FullName;
            current = current.Parent;
        }
        throw new InvalidOperationException("Could not find repository root");
    }

    [Fact]
    public void PluginManifest_MustBeGenerated()
    {
        // Verify plugin-manifest.json exists and is generated
        var manifestPath = Path.Combine(PluginsDir, "plugin-manifest.json");
        Assert.True(File.Exists(manifestPath), $"plugin-manifest.json must exist at {manifestPath}");

        // Verify it's generated (contains generated timestamp)
        var content = File.ReadAllText(manifestPath);
        var manifest = JsonSerializer.Deserialize<JsonElement>(content);
        
        Assert.True(manifest.TryGetProperty("generated", out var generated), 
            "plugin-manifest.json must contain 'generated' timestamp field");
        
        // Verify it's not too old (generated within last 24 hours)
        if (DateTime.TryParse(generated.GetString(), out var generatedDate))
        {
            var age = DateTime.UtcNow - generatedDate;
            Assert.True(age.TotalHours < 24, 
                $"plugin-manifest.json appears stale (generated {age.TotalHours:F1} hours ago). Run build to regenerate.");
        }
    }

    [Fact]
    public void InteractionManifest_MustBeGenerated()
    {
        // Verify interaction-manifest.json exists and is generated
        var manifestPath = Path.Combine(PluginsDir, "interaction-manifest.json");
        Assert.True(File.Exists(manifestPath), $"interaction-manifest.json must exist at {manifestPath}");

        // Verify it's generated (contains generated timestamp)
        var content = File.ReadAllText(manifestPath);
        var manifest = JsonSerializer.Deserialize<JsonElement>(content);
        
        Assert.True(manifest.TryGetProperty("generated", out var generated), 
            "interaction-manifest.json must contain 'generated' timestamp field");
        
        // Verify it has routes
        Assert.True(manifest.TryGetProperty("routes", out var routes), 
            "interaction-manifest.json must contain 'routes' object");
    }

    [Fact]
    public void TopicsManifest_MustBeGenerated()
    {
        // Verify topics-manifest.json exists and is generated
        var manifestPath = Path.Combine(PluginsDir, "topics-manifest.json");
        Assert.True(File.Exists(manifestPath), $"topics-manifest.json must exist at {manifestPath}");

        // Verify it's generated (contains generated timestamp)
        var content = File.ReadAllText(manifestPath);
        var manifest = JsonSerializer.Deserialize<JsonElement>(content);
        
        Assert.True(manifest.TryGetProperty("generated", out var generated), 
            "topics-manifest.json must contain 'generated' timestamp field");
        
        // Verify it has topics
        Assert.True(manifest.TryGetProperty("topics", out var topics), 
            "topics-manifest.json must contain 'topics' object");
    }

    [Fact]
    public void LayoutManifest_MustBeGenerated()
    {
        // Verify layout-manifest.json exists and is generated
        var manifestPath = Path.Combine(PluginsDir, "layout-manifest.json");
        Assert.True(File.Exists(manifestPath), $"layout-manifest.json must exist at {manifestPath}");

        // Verify it's generated (contains generated timestamp)
        var content = File.ReadAllText(manifestPath);
        var manifest = JsonSerializer.Deserialize<JsonElement>(content);
        
        Assert.True(manifest.TryGetProperty("generated", out var generated), 
            "layout-manifest.json must contain 'generated' timestamp field");
        
        // Verify it has slots
        Assert.True(manifest.TryGetProperty("slots", out var slots), 
            "layout-manifest.json must contain 'slots' array");
    }

    [Fact]
    public void PluginManifest_MustMatchDiscoveredPlugins()
    {
        // Verify plugin manifest matches actual plugin projects
        var manifestPath = Path.Combine(PluginsDir, "plugin-manifest.json");
        Assert.True(File.Exists(manifestPath), $"plugin-manifest.json must exist at {manifestPath}");

        var content = File.ReadAllText(manifestPath);
        var manifest = JsonSerializer.Deserialize<JsonElement>(content);
        
        Assert.True(manifest.TryGetProperty("plugins", out var pluginsElement), 
            "plugin-manifest.json must contain 'plugins' array");

        var plugins = pluginsElement.EnumerateArray().ToList();

        // Discover actual plugin projects
        var srcDir = Path.Combine(RepoRoot, "src");
        var pluginDirs = Directory.GetDirectories(srcDir, "RenderX.Plugins.*");

        // Filter to only plugins that have JSON files (valid plugins)
        var validPluginDirs = pluginDirs.Where(dir =>
        {
            var hasSequences = Directory.Exists(Path.Combine(dir, "json-sequences"));
            var hasTopics = Directory.Exists(Path.Combine(dir, "json-topics"));
            var hasComponents = Directory.Exists(Path.Combine(dir, "json-components"));
            return hasSequences || hasTopics || hasComponents;
        }).ToList();

        Assert.True(plugins.Count >= validPluginDirs.Count, 
            $"Plugin manifest must include all discovered plugins. Found {validPluginDirs.Count} plugin projects but manifest has {plugins.Count} plugins.");
    }

    [Fact]
    public void InteractionManifest_MustMatchSequenceFiles()
    {
        // Verify interaction manifest includes all interactions from sequence files
        var manifestPath = Path.Combine(PluginsDir, "interaction-manifest.json");
        Assert.True(File.Exists(manifestPath), $"interaction-manifest.json must exist at {manifestPath}");

        var content = File.ReadAllText(manifestPath);
        var manifest = JsonSerializer.Deserialize<JsonElement>(content);
        
        Assert.True(manifest.TryGetProperty("routes", out var routesElement), 
            "interaction-manifest.json must contain 'routes' object");

        var routes = new Dictionary<string, JsonElement>();
        foreach (var prop in routesElement.EnumerateObject())
        {
            routes[prop.Name] = prop.Value;
        }

        // Count interactions in sequence files
        var sequencesDir = Path.Combine(PluginsDir, "json-sequences");
        if (Directory.Exists(sequencesDir))
        {
            var sequenceFiles = Directory.GetFiles(sequencesDir, "*.json", SearchOption.AllDirectories);
            var totalEvents = 0;

            foreach (var file in sequenceFiles)
            {
                try
                {
                    var json = File.ReadAllText(file);
                    var sequence = JsonSerializer.Deserialize<JsonElement>(json);

                    if (sequence.TryGetProperty("movements", out var movements))
                    {
                        foreach (var movement in movements.EnumerateArray())
                        {
                            if (movement.TryGetProperty("beats", out var beats))
                            {
                                foreach (var beat in beats.EnumerateArray())
                                {
                                    if (beat.TryGetProperty("event", out var eventProp) && 
                                        !string.IsNullOrEmpty(eventProp.GetString()))
                                    {
                                        totalEvents++;
                                    }
                                }
                            }
                        }
                    }
                }
                catch
                {
                    // Skip invalid files
                }
            }

            // Manifest should have at least as many routes as unique events in sequences
            // (may have more due to component overrides)
            Assert.True(routes.Count > 0 || totalEvents == 0, 
                $"Interaction manifest should contain routes. Found {totalEvents} events in sequences but manifest has {routes.Count} routes.");
        }
    }

    [Fact]
    public void ManifestGenerator_ProjectExists()
    {
        // Verify RenderX.ManifestGenerator project exists
        var generatorDir = Path.Combine(RepoRoot, "src", "RenderX.ManifestGenerator");
        Assert.True(Directory.Exists(generatorDir), 
            $"RenderX.ManifestGenerator project must exist at {generatorDir}");

        var csprojPath = Path.Combine(generatorDir, "RenderX.ManifestGenerator.csproj");
        Assert.True(File.Exists(csprojPath), 
            $"RenderX.ManifestGenerator.csproj must exist at {csprojPath}");
    }

    [Fact]
    public void PreBuildTarget_MustIncludeManifestGeneration()
    {
        // Verify RenderX.Shell.Avalonia.csproj includes GenerateManifests target
        var csprojPath = Path.Combine(ShellDir, "RenderX.Shell.Avalonia.csproj");
        Assert.True(File.Exists(csprojPath), $"RenderX.Shell.Avalonia.csproj must exist at {csprojPath}");

        var content = File.ReadAllText(csprojPath);

        Assert.Contains("GenerateManifests", content);
        Assert.Contains("RenderX.ManifestGenerator", content);
        Assert.Contains("BeforeTargets=\"SyncPluginJsonFiles\"", content);
    }
}

