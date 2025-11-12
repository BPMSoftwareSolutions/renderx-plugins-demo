using System.Text.Json;
using RenderX.ManifestGenerator.Models;

namespace RenderX.ManifestGenerator.Generators;

/// <summary>
/// Generates topics manifest from sequence files.
/// Equivalent to web's generate-topics-manifest.js
/// </summary>
public class TopicsManifestGenerator
{
    private readonly string _pluginsDir;
    private readonly JsonSerializerOptions _jsonOptions;

    public TopicsManifestGenerator(string pluginsDir, JsonSerializerOptions jsonOptions)
    {
        _pluginsDir = pluginsDir;
        _jsonOptions = jsonOptions;
    }

    public async Task<TopicsManifest> GenerateAsync()
    {
        var manifest = new TopicsManifest
        {
            Generated = DateTime.UtcNow,
            Topics = new Dictionary<string, TopicInfo>()
        };

        var sequencesDir = Path.Combine(_pluginsDir, "json-sequences");
        if (!Directory.Exists(sequencesDir))
        {
            return manifest;
        }

        // Read all sequence files
        var sequenceFiles = Directory.GetFiles(sequencesDir, "*.json", SearchOption.AllDirectories);

        foreach (var file in sequenceFiles)
        {
            try
            {
                var json = await File.ReadAllTextAsync(file);
                var sequence = JsonSerializer.Deserialize<Sequence>(json, _jsonOptions);

                if (sequence?.Movements == null)
                {
                    continue;
                }

                // Extract topics (events) from sequence
                foreach (var movement in sequence.Movements)
                {
                    if (movement.Beats == null)
                    {
                        continue;
                    }

                    foreach (var beat in movement.Beats)
                    {
                        if (string.IsNullOrEmpty(beat.Event))
                        {
                            continue;
                        }

                        // Add topic if not already present
                        if (!manifest.Topics.ContainsKey(beat.Event))
                        {
                            manifest.Topics[beat.Event] = new TopicInfo
                            {
                                PluginId = sequence.PluginId ?? "unknown",
                                Description = beat.Description
                            };
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"   ⚠️  Failed to process {Path.GetFileName(file)}: {ex.Message}");
            }
        }

        return manifest;
    }
}

