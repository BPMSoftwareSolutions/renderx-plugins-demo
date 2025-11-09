using System.Text.Json;
using RenderX.ManifestGenerator.Generators;
using RenderX.ManifestGenerator.Sync;

namespace RenderX.ManifestGenerator;

/// <summary>
/// Main pipeline that orchestrates all manifest generation steps.
/// Mirrors the web version's pre:manifests script chain.
/// </summary>
public class ManifestGeneratorPipeline
{
    private readonly string _rootDir;
    private readonly string _srcDir;
    private readonly string _shellDir;
    private readonly string _pluginsDir;
    private readonly JsonSerializerOptions _jsonOptions;

    public ManifestGeneratorPipeline(string rootDir)
    {
        _rootDir = rootDir;
        _srcDir = Path.Combine(rootDir, "src");
        _shellDir = Path.Combine(_srcDir, "RenderX.Shell.Avalonia");
        _pluginsDir = Path.Combine(_shellDir, "plugins");
        
        _jsonOptions = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    public async Task ExecuteAsync()
    {
        Console.WriteLine("🔄 Starting manifest generation pipeline...");
        Console.WriteLine($"   Root: {_rootDir}");
        Console.WriteLine($"   Shell: {_shellDir}");
        Console.WriteLine($"   Plugins: {_pluginsDir}");
        Console.WriteLine();

        // Ensure plugins directory exists
        Directory.CreateDirectory(_pluginsDir);

        // Step 1: Aggregate plugins (discover and generate plugin manifest)
        Console.WriteLine("📦 Step 1: Aggregating plugins...");
        var pluginAggregator = new PluginAggregator(_srcDir, _pluginsDir, _jsonOptions);
        var pluginManifest = await pluginAggregator.AggregateAsync();
        Console.WriteLine($"   ✅ Found {pluginManifest.Plugins.Count} plugins");
        Console.WriteLine();

        // Step 2: Sync JSON files from plugins (sequences, topics, components)
        Console.WriteLine("📂 Step 2: Syncing JSON files from plugins...");
        var jsonSyncer = new JsonSyncer(_srcDir, _pluginsDir, pluginManifest);
        var syncStats = await jsonSyncer.SyncAllAsync();
        Console.WriteLine($"   ✅ Synced {syncStats.TotalFiles} files from {syncStats.PluginsProcessed} plugins");
        Console.WriteLine();

        // Step 3: Generate interaction manifest from sequences
        Console.WriteLine("🔗 Step 3: Generating interaction manifest...");
        var interactionGenerator = new InteractionManifestGenerator(_pluginsDir, _jsonOptions);
        var interactionManifest = await interactionGenerator.GenerateAsync();
        await WriteManifestAsync("interaction-manifest.json", interactionManifest);
        Console.WriteLine($"   ✅ Generated {interactionManifest.Routes.Count} routes");
        Console.WriteLine();

        // Step 4: Generate topics manifest from sequences
        Console.WriteLine("📋 Step 4: Generating topics manifest...");
        var topicsGenerator = new TopicsManifestGenerator(_pluginsDir, _jsonOptions);
        var topicsManifest = await topicsGenerator.GenerateAsync();
        await WriteManifestAsync("topics-manifest.json", topicsManifest);
        Console.WriteLine($"   ✅ Generated {topicsManifest.Topics.Count} topics");
        Console.WriteLine();

        // Step 5: Generate layout manifest
        Console.WriteLine("🎨 Step 5: Generating layout manifest...");
        var layoutGenerator = new LayoutManifestGenerator(_shellDir, _jsonOptions);
        var layoutManifest = await layoutGenerator.GenerateAsync();
        await WriteManifestAsync("layout-manifest.json", layoutManifest);
        Console.WriteLine($"   ✅ Generated layout with {layoutManifest.Slots?.Count ?? 0} slots");
        Console.WriteLine();

        // Step 6: Write plugin manifest to plugins directory
        Console.WriteLine("💾 Step 6: Writing plugin manifest...");
        var pluginManifestPath = Path.Combine(_pluginsDir, "plugin-manifest.json");
        await File.WriteAllTextAsync(pluginManifestPath, JsonSerializer.Serialize(pluginManifest, _jsonOptions));
        Console.WriteLine($"   ✅ Written to {pluginManifestPath}");
        Console.WriteLine();
    }

    private async Task WriteManifestAsync(string filename, object manifest)
    {
        var shellPath = Path.Combine(_shellDir, filename);
        var pluginsPath = Path.Combine(_pluginsDir, filename);
        
        var json = JsonSerializer.Serialize(manifest, _jsonOptions);
        
        await File.WriteAllTextAsync(shellPath, json);
        await File.WriteAllTextAsync(pluginsPath, json);
    }
}

