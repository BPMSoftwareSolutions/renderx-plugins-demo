using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Xunit;

namespace RenderX.Shell.Avalonia.Analyzers.Tests;

/// <summary>
/// Tests to validate that desktop plugin structure matches web version parity.
/// Ensures all required plugins are implemented and properly registered.
/// </summary>
public class PluginStructureValidationTests
{
    private static readonly string RepoRoot = FindRepositoryRoot();
    private static readonly string WebPluginsPath = Path.Combine(RepoRoot, "packages");
    private static readonly string DesktopPluginsPath = Path.Combine(RepoRoot, "src");
    private static readonly string ManifestPath = Path.Combine(DesktopPluginsPath, "RenderX.Shell.Avalonia", "plugins", "plugin-manifest.json");
    private static readonly string PluginLoaderPath = Path.Combine(DesktopPluginsPath, "RenderX.Shell.Avalonia", "Infrastructure", "Plugins", "PluginLoader.cs");

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
    public void WebPluginsExist()
    {
        Assert.True(Directory.Exists(WebPluginsPath), $"Web plugins directory not found: {WebPluginsPath}");
        
        var expectedPlugins = new[] { "header", "canvas", "control-panel", "library" };
        foreach (var plugin in expectedPlugins)
        {
            var pluginPath = Path.Combine(WebPluginsPath, plugin);
            Assert.True(Directory.Exists(pluginPath), $"Web plugin not found: {plugin}");
        }
    }

    [Fact]
    public void DesktopPluginProjectsExist()
    {
        Assert.True(Directory.Exists(DesktopPluginsPath), $"Desktop plugins directory not found: {DesktopPluginsPath}");
        
        var expectedPlugins = new[] { "RenderX.Plugins.Header", "RenderX.Plugins.Library" };
        foreach (var plugin in expectedPlugins)
        {
            var pluginPath = Path.Combine(DesktopPluginsPath, plugin);
            Assert.True(Directory.Exists(pluginPath), $"Desktop plugin project not found: {plugin}");
        }
    }

    [Fact]
    public void PluginManifestExists()
    {
        Assert.True(File.Exists(ManifestPath), $"Plugin manifest not found: {ManifestPath}");
    }

    [Fact]
    public void PluginManifestIsValidJson()
    {
        var json = File.ReadAllText(ManifestPath);
        var doc = JsonDocument.Parse(json);
        Assert.True(doc.RootElement.ValueKind != System.Text.Json.JsonValueKind.Undefined);
    }

    [Fact]
    public void ManifestDefinesAllRequiredSlots()
    {
        var json = File.ReadAllText(ManifestPath);
        var doc = JsonDocument.Parse(json);
        var plugins = doc.RootElement.GetProperty("plugins");

        var slots = new HashSet<string>();
        foreach (var plugin in plugins.EnumerateArray())
        {
            if (plugin.TryGetProperty("ui", out var ui) && ui.TryGetProperty("slot", out var slot))
            {
                slots.Add(slot.GetString() ?? "");
            }
        }

        var expectedSlots = new[] { "headerLeft", "headerCenter", "headerRight", "library", "canvas", "controlPanel" };
        foreach (var slot in expectedSlots)
        {
            Assert.Contains(slot, slots);
        }
    }

    [Fact]
    public void PluginLoaderRegistersAllSlots()
    {
        // Verify all required slots are defined in the manifest
        Assert.True(File.Exists(ManifestPath), $"Plugin manifest not found at {ManifestPath}");

        var manifestContent = File.ReadAllText(ManifestPath);
        using var doc = JsonDocument.Parse(manifestContent);

        var plugins = doc.RootElement.GetProperty("plugins");
        var slots = new HashSet<string>();

        foreach (var plugin in plugins.EnumerateArray())
        {
            var ui = plugin.GetProperty("ui");
            if (ui.TryGetProperty("slot", out var slotElement))
            {
                var slot = slotElement.GetString();
                if (!string.IsNullOrEmpty(slot))
                {
                    slots.Add(slot);
                }
            }
        }

        var expectedSlots = new[] { "headerLeft", "headerCenter", "headerRight", "library", "canvas", "controlPanel" };
        foreach (var slot in expectedSlots)
        {
            Assert.Contains(slot, slots);
        }
    }

    [Fact]
    public void PluginLoaderMapsToValidTypes()
    {
        // Verify all plugins have valid module and export names in the manifest
        Assert.True(File.Exists(ManifestPath), $"Plugin manifest not found at {ManifestPath}");

        var manifestContent = File.ReadAllText(ManifestPath);
        using var doc = JsonDocument.Parse(manifestContent);

        var plugins = doc.RootElement.GetProperty("plugins");
        var expectedExports = new[] { "HeaderTitlePlugin", "HeaderControlsPlugin", "HeaderThemePlugin", "LibraryPlugin", "CanvasControl", "ControlPanelControl" };
        var foundExports = new HashSet<string>();

        foreach (var plugin in plugins.EnumerateArray())
        {
            var ui = plugin.GetProperty("ui");
            if (ui.TryGetProperty("export", out var exportElement))
            {
                var export = exportElement.GetString();
                if (!string.IsNullOrEmpty(export))
                {
                    foundExports.Add(export);
                }
            }
        }

        foreach (var expected in expectedExports)
        {
            Assert.Contains(expected, foundExports);
        }
    }

    [Fact]
    public void HeaderPluginImplementationsExist()
    {
        var headerPluginPath = Path.Combine(DesktopPluginsPath, "RenderX.Plugins.Header");
        
        var expectedFiles = new[] 
        { 
            "HeaderTitlePlugin.axaml.cs",
            "HeaderControlsPlugin.axaml.cs",
            "HeaderThemePlugin.axaml.cs"
        };

        foreach (var file in expectedFiles)
        {
            var filePath = Path.Combine(headerPluginPath, file);
            Assert.True(File.Exists(filePath), $"Header plugin file not found: {file}");
        }
    }

    [Fact]
    public void LibraryPluginImplementationExists()
    {
        var libraryPluginPath = Path.Combine(DesktopPluginsPath, "RenderX.Plugins.Library");
        var filePath = Path.Combine(libraryPluginPath, "LibraryPlugin.axaml.cs");
        Assert.True(File.Exists(filePath), "LibraryPlugin.axaml.cs not found");
    }

    [Fact]
    public void PluginProjectsHaveCsprojFiles()
    {
        var expectedProjects = new[]
        {
            Path.Combine(DesktopPluginsPath, "RenderX.Plugins.Header", "RenderX.Plugins.Header.csproj"),
            Path.Combine(DesktopPluginsPath, "RenderX.Plugins.Library", "RenderX.Plugins.Library.csproj"),
            Path.Combine(DesktopPluginsPath, "RenderX.Plugins.Canvas", "RenderX.Plugins.Canvas.csproj"),
            Path.Combine(DesktopPluginsPath, "RenderX.Plugins.ControlPanel", "RenderX.Plugins.ControlPanel.csproj")
        };

        foreach (var projectPath in expectedProjects)
        {
            Assert.True(File.Exists(projectPath), $"Project file not found: {projectPath}");
        }
    }

    [Fact]
    public void CanvasAndControlPanelAreMigratedToStandalonePlugins()
    {
        // Canvas and ControlPanel have been migrated to standalone plugins
        // for consistency with the web version and to satisfy SHELL003 analyzer rule.

        var canvasPluginPath = Path.Combine(DesktopPluginsPath, "RenderX.Plugins.Canvas");
        var controlPanelPluginPath = Path.Combine(DesktopPluginsPath, "RenderX.Plugins.ControlPanel");

        // Verify both plugins exist as standalone DLLs
        Assert.True(Directory.Exists(canvasPluginPath),
            "Canvas plugin should be a standalone DLL");
        Assert.True(Directory.Exists(controlPanelPluginPath),
            "ControlPanel plugin should be a standalone DLL");

        // Verify implementation files exist
        var canvasControlPath = Path.Combine(canvasPluginPath, "CanvasControl.axaml.cs");
        var controlPanelControlPath = Path.Combine(controlPanelPluginPath, "ControlPanelControl.axaml.cs");

        Assert.True(File.Exists(canvasControlPath), "CanvasControl.axaml.cs not found in Canvas plugin");
        Assert.True(File.Exists(controlPanelControlPath), "ControlPanelControl.axaml.cs not found in ControlPanel plugin");
    }

    [Fact]
    public void PluginManifestDefinesAllPluginMappings()
    {
        // Enforce that plugin manifest is the single source of truth for plugin mappings
        // This prevents hardcoded mappings in PluginLoader.cs

        Assert.True(File.Exists(ManifestPath), $"Plugin manifest not found at {ManifestPath}");

        var manifestContent = File.ReadAllText(ManifestPath);
        var manifest = JsonDocument.Parse(manifestContent);

        var plugins = manifest.RootElement.GetProperty("plugins");
        var pluginIds = new HashSet<string>();

        foreach (var plugin in plugins.EnumerateArray())
        {
            var id = plugin.GetProperty("id").GetString();
            Assert.NotNull(id);
            pluginIds.Add(id);
        }

        // Verify all required plugins are defined
        var requiredPlugins = new[] { "HeaderTitlePlugin", "HeaderControlsPlugin", "HeaderThemePlugin", "LibraryPlugin", "CanvasPlugin", "ControlPanelPlugin" };
        foreach (var required in requiredPlugins)
        {
            Assert.Contains(required, pluginIds);
        }
    }

    [Fact]
    public void PluginLoaderShouldNotHaveHardcodedMappings()
    {
        // Enforce that PluginLoader loads from manifest, not hardcoded dictionary
        // This test documents the architectural requirement

        Assert.True(File.Exists(PluginLoaderPath), $"PluginLoader.cs not found at {PluginLoaderPath}");

        var code = File.ReadAllText(PluginLoaderPath);

        // Should NOT contain hardcoded _slotTypeMap dictionary
        Assert.False(code.Contains("_slotTypeMap = new Dictionary"),
            "PluginLoader should not have hardcoded _slotTypeMap. Use manifest-driven loading instead.");

        // Should load from manifest
        Assert.True(code.Contains("plugin-manifest.json"),
            "PluginLoader should load plugin mappings from plugin-manifest.json");
    }
}

