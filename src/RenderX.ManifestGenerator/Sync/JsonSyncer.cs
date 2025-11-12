using RenderX.ManifestGenerator.Models;

namespace RenderX.ManifestGenerator.Sync;

/// <summary>
/// Syncs JSON files from plugin projects to the shell's plugins directory.
/// Equivalent to web's sync-json-sequences.js, sync-json-components.js, etc.
/// </summary>
public class JsonSyncer
{
    private readonly string _srcDir;
    private readonly string _pluginsDir;
    private readonly PluginManifest _pluginManifest;

    public JsonSyncer(string srcDir, string pluginsDir, PluginManifest pluginManifest)
    {
        _srcDir = srcDir;
        _pluginsDir = pluginsDir;
        _pluginManifest = pluginManifest;
    }

    public async Task<SyncStats> SyncAllAsync()
    {
        var stats = new SyncStats();

        // Create target directories
        var sequencesTarget = Path.Combine(_pluginsDir, "json-sequences");
        var topicsTarget = Path.Combine(_pluginsDir, "json-topics");
        var componentsTarget = Path.Combine(_pluginsDir, "json-components");

        Directory.CreateDirectory(sequencesTarget);
        Directory.CreateDirectory(topicsTarget);
        Directory.CreateDirectory(componentsTarget);

        // Process each plugin
        var processedProjects = new HashSet<string>();

        foreach (var plugin in _pluginManifest.Plugins)
        {
            var projectName = GetProjectNameFromPlugin(plugin);
            if (string.IsNullOrEmpty(projectName) || processedProjects.Contains(projectName))
            {
                continue;
            }

            processedProjects.Add(projectName);

            var projectPath = Path.Combine(_srcDir, projectName);
            if (!Directory.Exists(projectPath))
            {
                Console.WriteLine($"   ⚠️  {projectName}: Project directory not found");
                continue;
            }

            var kebabName = GetKebabCaseName(plugin.Id);

            // Sync sequences
            var sequencesPath = Path.Combine(projectPath, "json-sequences");
            if (Directory.Exists(sequencesPath))
            {
                var targetPath = Path.Combine(sequencesTarget, kebabName);
                var count = await CopyJsonFilesAsync(sequencesPath, targetPath);
                if (count > 0)
                {
                    Console.WriteLine($"   ✅ {projectName} sequences: {count} files");
                    stats.TotalFiles += count;
                }
            }

            // Sync topics
            var topicsPath = Path.Combine(projectPath, "json-topics");
            if (Directory.Exists(topicsPath))
            {
                var targetPath = Path.Combine(topicsTarget, kebabName);
                var count = await CopyJsonFilesAsync(topicsPath, targetPath);
                if (count > 0)
                {
                    Console.WriteLine($"   ✅ {projectName} topics: {count} files");
                    stats.TotalFiles += count;
                }
            }

            // Sync components (flat structure, no subdirectory)
            var componentsPath = Path.Combine(projectPath, "json-components");
            if (Directory.Exists(componentsPath))
            {
                var count = await CopyJsonFilesAsync(componentsPath, componentsTarget);
                if (count > 0)
                {
                    Console.WriteLine($"   ✅ {projectName} components: {count} files");
                    stats.TotalFiles += count;
                }
            }

            stats.PluginsProcessed++;
        }

        return stats;
    }

    private Task<int> CopyJsonFilesAsync(string sourceDir, string targetDir)
    {
        Directory.CreateDirectory(targetDir);

        var count = 0;
        var files = Directory.GetFiles(sourceDir, "*.json", SearchOption.AllDirectories);

        foreach (var sourceFile in files)
        {
            var relativePath = Path.GetRelativePath(sourceDir, sourceFile);
            var targetFile = Path.Combine(targetDir, relativePath);

            var targetFileDir = Path.GetDirectoryName(targetFile);
            if (!string.IsNullOrEmpty(targetFileDir))
            {
                Directory.CreateDirectory(targetFileDir);
            }

            File.Copy(sourceFile, targetFile, overwrite: true);
            count++;
        }

        return Task.FromResult(count);
    }

    private string GetProjectNameFromPlugin(Plugin plugin)
    {
        // Extract project name from runtime.module or ui.module
        var module = plugin.Runtime?.Module ?? plugin.Ui?.Module;
        if (string.IsNullOrEmpty(module))
        {
            return string.Empty;
        }

        // Remove .dll extension
        return module.Replace(".dll", "");
    }

    private string GetKebabCaseName(string pluginId)
    {
        // Convert PascalCase to kebab-case
        // CanvasComponentPlugin -> canvas-component
        var name = pluginId.Replace("Plugin", "");

        // Insert hyphens before capitals
        var result = string.Empty;
        for (int i = 0; i < name.Length; i++)
        {
            if (i > 0 && char.IsUpper(name[i]))
            {
                result += "-";
            }
            result += char.ToLower(name[i]);
        }

        return result;
    }
}

public class SyncStats
{
    public int TotalFiles { get; set; }
    public int PluginsProcessed { get; set; }
}

