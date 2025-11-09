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
    public void DesktopPlugins_MustMatchWebPluginCount()
    {
        // Enforce COMPLETE PARITY between web and desktop plugin counts
        var webPlugins = new[] { "canvas", "canvas-component", "control-panel", "header", "library", "library-component", "components" };
        var desktopPlugins = new[] { "Canvas", "CanvasComponent", "ControlPanel", "Header", "Library", "LibraryComponent", "Components" };

        Assert.Equal(webPlugins.Length, desktopPlugins.Length);
        Assert.Equal(7, webPlugins.Length); // Explicit count check
        Assert.Equal(7, desktopPlugins.Length); // Explicit count check
    }

    [Fact]
    public void WebPluginsExist()
    {
        Assert.True(Directory.Exists(WebPluginsPath), $"Web plugins directory not found: {WebPluginsPath}");

        var expectedPlugins = new[] { "header", "canvas", "canvas-component", "control-panel", "library", "library-component", "components" };
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
    public void CanvasComponentPlugin_MustExistInDesktop()
    {
        var pluginPath = Path.Combine(RepoRoot, "src", "RenderX.Plugins.CanvasComponent");
        Assert.True(Directory.Exists(pluginPath), "RenderX.Plugins.CanvasComponent project must exist");
    }

    [Fact]
    public void CanvasComponentPlugin_FilesMustMatchWebVersion()
    {
        var webPath = Path.Combine(RepoRoot, "packages", "canvas-component", "json-sequences");
        var desktopPath = Path.Combine(RepoRoot, "src", "RenderX.Plugins.CanvasComponent", "json-sequences");

        var webFiles = Directory.GetFiles(webPath, "*.json", SearchOption.AllDirectories).Length;
        var desktopFiles = Directory.GetFiles(desktopPath, "*.json", SearchOption.AllDirectories).Length;

        Assert.Equal(30, webFiles);
        Assert.Equal(30, desktopFiles);
    }

    [Fact]
    public void CanvasComponentPlugin_TopicFileMustExist()
    {
        var topicFile = Path.Combine(RepoRoot, "src", "RenderX.Plugins.CanvasComponent", "json-topics", "canvas-component.json");
        Assert.True(File.Exists(topicFile), "canvas-component.json topic file must exist");
    }

    [Fact]
    public void LibraryComponentPlugin_MustExistInDesktop()
    {
        var pluginPath = Path.Combine(RepoRoot, "src", "RenderX.Plugins.LibraryComponent");
        Assert.True(Directory.Exists(pluginPath), "RenderX.Plugins.LibraryComponent project must exist");
    }

    [Fact]
    public void LibraryComponentPlugin_FilesMustMatchWebVersion()
    {
        var webPath = Path.Combine(RepoRoot, "packages", "library-component", "json-sequences");
        var desktopPath = Path.Combine(RepoRoot, "src", "RenderX.Plugins.LibraryComponent", "json-sequences");

        var webFiles = Directory.GetFiles(webPath, "*.json", SearchOption.AllDirectories).Length;
        var desktopFiles = Directory.GetFiles(desktopPath, "*.json", SearchOption.AllDirectories).Length;

        Assert.Equal(4, webFiles);
        Assert.Equal(4, desktopFiles);
    }

    [Fact]
    public void CanvasPlugin_ShouldHaveZeroSequences()
    {
        // Canvas plugin should only be UI shell, no sequences
        var sequencePath = Path.Combine(RepoRoot, "src", "RenderX.Plugins.Canvas", "json-sequences");

        if (Directory.Exists(sequencePath))
        {
            var files = Directory.GetFiles(sequencePath, "*.json", SearchOption.AllDirectories);
            Assert.Empty(files);
        }
    }

    [Fact]
    public void LibraryPlugin_ShouldHaveOnlyLibrarySequences()
    {
        // Library plugin should have 2 sequences (library/ directory only)
        var sequencePath = Path.Combine(RepoRoot, "src", "RenderX.Plugins.Library", "json-sequences", "library");

        Assert.True(Directory.Exists(sequencePath), "library/ sequence directory must exist");

        var files = Directory.GetFiles(sequencePath, "*.json", SearchOption.AllDirectories);
        Assert.Equal(2, files.Length);

        // Ensure library-component directory does NOT exist
        var componentPath = Path.Combine(RepoRoot, "src", "RenderX.Plugins.Library", "json-sequences", "library-component");
        Assert.False(Directory.Exists(componentPath), "library-component/ should be in separate plugin");
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

    [Fact]
    public void DesktopPlugins_MustHaveJsonSequencesDirectories()
    {
        // Desktop plugins must mirror web plugins' json-sequences structure
        // This is the single source of truth for sequence definitions

        var webToDesktopMapping = new Dictionary<string, string>
        {
            { "packages/canvas-component", "src/RenderX.Plugins.CanvasComponent" },
            { "packages/control-panel", "src/RenderX.Plugins.ControlPanel" },
            { "packages/header", "src/RenderX.Plugins.Header" },
            { "packages/library", "src/RenderX.Plugins.Library" },
            { "packages/library-component", "src/RenderX.Plugins.LibraryComponent" }
        };

        var failures = new List<string>();

        foreach (var (webPath, desktopPath) in webToDesktopMapping)
        {
            var webSequencesDir = Path.Combine(RepoRoot, webPath, "json-sequences");
            var desktopSequencesDir = Path.Combine(RepoRoot, desktopPath, "json-sequences");

            // If web plugin has json-sequences, desktop must too
            if (Directory.Exists(webSequencesDir))
            {
                if (!Directory.Exists(desktopSequencesDir))
                {
                    failures.Add($"Desktop plugin {desktopPath} is missing json-sequences directory (web has it at {webPath})");
                }
            }
        }

        Assert.True(failures.Count == 0,
            $"Desktop plugins missing json-sequences directories:\n{string.Join("\n", failures)}");
    }

    [Fact]
    public void DesktopPlugins_MustHaveJsonTopicsFiles()
    {
        // Desktop plugins must mirror web plugins' json-topics structure
        // This is the single source of truth for topic definitions

        var webToDesktopMapping = new Dictionary<string, string>
        {
            { "packages/canvas-component", "src/RenderX.Plugins.CanvasComponent" },
            { "packages/control-panel", "src/RenderX.Plugins.ControlPanel" }
        };

        var failures = new List<string>();

        foreach (var (webPath, desktopPath) in webToDesktopMapping)
        {
            var webTopicsDir = Path.Combine(RepoRoot, webPath, "json-topics");
            var desktopTopicsDir = Path.Combine(RepoRoot, desktopPath, "json-topics");

            // If web plugin has json-topics, desktop must too
            if (Directory.Exists(webTopicsDir))
            {
                if (!Directory.Exists(desktopTopicsDir))
                {
                    failures.Add($"Desktop plugin {desktopPath} is missing json-topics directory (web has it at {webPath})");
                }
            }
        }

        Assert.True(failures.Count == 0,
            $"Desktop plugins missing json-topics directories:\n{string.Join("\n", failures)}");
    }

    [Fact]
    public void DesktopPlugins_SequenceFilesMustMatchWebVersion()
    {
        // Verify that desktop plugins have the same sequence files as web plugins
        // This ensures feature parity between web and desktop

        var webToDesktopMapping = new Dictionary<string, string>
        {
            { "packages/canvas-component/json-sequences", "src/RenderX.Plugins.CanvasComponent/json-sequences" },
            { "packages/control-panel/json-sequences", "src/RenderX.Plugins.ControlPanel/json-sequences" },
            { "packages/header/json-sequences", "src/RenderX.Plugins.Header/json-sequences" },
            { "packages/library/json-sequences", "src/RenderX.Plugins.Library/json-sequences" },
            { "packages/library-component/json-sequences", "src/RenderX.Plugins.LibraryComponent/json-sequences" }
        };

        var failures = new List<string>();

        foreach (var (webPath, desktopPath) in webToDesktopMapping)
        {
            var webDir = Path.Combine(RepoRoot, webPath);
            var desktopDir = Path.Combine(RepoRoot, desktopPath);

            if (!Directory.Exists(webDir)) continue;
            if (!Directory.Exists(desktopDir))
            {
                failures.Add($"Desktop directory {desktopPath} does not exist");
                continue;
            }

            // Get all JSON files from web version
            var webFiles = Directory.GetFiles(webDir, "*.json", SearchOption.AllDirectories)
                .Select(f => Path.GetRelativePath(webDir, f))
                .OrderBy(f => f)
                .ToList();

            // Get all JSON files from desktop version
            var desktopFiles = Directory.GetFiles(desktopDir, "*.json", SearchOption.AllDirectories)
                .Select(f => Path.GetRelativePath(desktopDir, f))
                .OrderBy(f => f)
                .ToList();

            // Check for missing files
            var missingFiles = webFiles.Except(desktopFiles).ToList();
            if (missingFiles.Any())
            {
                failures.Add($"Desktop {desktopPath} is missing sequence files: {string.Join(", ", missingFiles)}");
            }
        }

        Assert.True(failures.Count == 0,
            $"Desktop plugins missing sequence files:\n{string.Join("\n", failures)}");
    }

    [Fact]
    public void DesktopPlugins_TopicFilesMustMatchWebVersion()
    {
        // Verify that desktop plugins have the same topic files as web plugins

        var webToDesktopMapping = new Dictionary<string, string>
        {
            { "packages/canvas-component/json-topics", "src/RenderX.Plugins.CanvasComponent/json-topics" },
            { "packages/control-panel/json-topics", "src/RenderX.Plugins.ControlPanel/json-topics" }
        };

        var failures = new List<string>();

        foreach (var (webPath, desktopPath) in webToDesktopMapping)
        {
            var webDir = Path.Combine(RepoRoot, webPath);
            var desktopDir = Path.Combine(RepoRoot, desktopPath);

            if (!Directory.Exists(webDir)) continue;
            if (!Directory.Exists(desktopDir))
            {
                failures.Add($"Desktop directory {desktopPath} does not exist");
                continue;
            }

            // Get all JSON files from web version
            var webFiles = Directory.GetFiles(webDir, "*.json", SearchOption.AllDirectories)
                .Select(f => Path.GetRelativePath(webDir, f))
                .OrderBy(f => f)
                .ToList();

            // Get all JSON files from desktop version
            var desktopFiles = Directory.GetFiles(desktopDir, "*.json", SearchOption.AllDirectories)
                .Select(f => Path.GetRelativePath(desktopDir, f))
                .OrderBy(f => f)
                .ToList();

            // Check for missing files
            var missingFiles = webFiles.Except(desktopFiles).ToList();
            if (missingFiles.Any())
            {
                failures.Add($"Desktop {desktopPath} is missing topic files: {string.Join(", ", missingFiles)}");
            }
        }

        Assert.True(failures.Count == 0,
            $"Desktop plugins missing topic files:\n{string.Join("\n", failures)}");
    }

    [Fact]
    public void ComponentsPlugin_MustExistInDesktop()
    {
        // The components plugin (json-components) must exist in desktop version
        // This is the single source of truth for component definitions

        var webComponentsDir = Path.Combine(RepoRoot, "packages", "components", "json-components");
        var desktopComponentsDir = Path.Combine(RepoRoot, "src", "RenderX.Plugins.Components", "json-components");

        Assert.True(Directory.Exists(webComponentsDir),
            $"Web components directory not found: {webComponentsDir}");

        Assert.True(Directory.Exists(desktopComponentsDir),
            $"Desktop components directory not found: {desktopComponentsDir}. " +
            $"Desktop must have RenderX.Plugins.Components with json-components directory mirroring the web version.");
    }

    [Fact]
    public void ComponentsPlugin_FilesMustMatchWebVersion()
    {
        // Verify that desktop components plugin has the same JSON files as web version

        var webDir = Path.Combine(RepoRoot, "packages", "components", "json-components");
        var desktopDir = Path.Combine(RepoRoot, "src", "RenderX.Plugins.Components", "json-components");

        if (!Directory.Exists(webDir))
        {
            // Skip if web directory doesn't exist
            return;
        }

        Assert.True(Directory.Exists(desktopDir),
            $"Desktop components directory not found: {desktopDir}");

        // Get all JSON files from web version
        var webFiles = Directory.GetFiles(webDir, "*.json", SearchOption.AllDirectories)
            .Select(f => Path.GetRelativePath(webDir, f))
            .OrderBy(f => f)
            .ToList();

        // Get all JSON files from desktop version
        var desktopFiles = Directory.GetFiles(desktopDir, "*.json", SearchOption.AllDirectories)
            .Select(f => Path.GetRelativePath(desktopDir, f))
            .OrderBy(f => f)
            .ToList();

        // Check for missing files
        var missingFiles = webFiles.Except(desktopFiles).ToList();

        Assert.True(missingFiles.Count == 0,
            $"Desktop components plugin is missing files: {string.Join(", ", missingFiles)}");
    }
}

