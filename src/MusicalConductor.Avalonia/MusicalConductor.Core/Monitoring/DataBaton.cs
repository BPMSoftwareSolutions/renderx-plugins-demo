using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace MusicalConductor.Core.Monitoring;

/// <summary>
/// DataBaton - capture and log baton state between beats.
/// Provides shallow snapshots, diffs, and concise console logging.
/// Ported from packages/musical-conductor/modules/communication/sequences/monitoring/DataBaton.ts
/// </summary>
public static class DataBaton
{
    /// <summary>
    /// Create a shallow snapshot of the payload dictionary.
    /// </summary>
    public static Dictionary<string, object?> Snapshot(Dictionary<string, object?>? baton)
    {
        if (baton == null)
            return new Dictionary<string, object?>();

        // Shallow snapshot to keep logs light-weight
        var snap = new Dictionary<string, object?>();
        foreach (var kvp in baton)
        {
            snap[kvp.Key] = kvp.Value;
        }
        return snap;
    }

    /// <summary>
    /// Compare two snapshots and return the differences.
    /// </summary>
    public static BatonDiff Diff(Dictionary<string, object?> prev, Dictionary<string, object?> next)
    {
        var added = new List<string>();
        var removed = new List<string>();
        var updated = new List<string>();

        var prevKeys = new HashSet<string>(prev?.Keys ?? Enumerable.Empty<string>());
        var nextKeys = new HashSet<string>(next?.Keys ?? Enumerable.Empty<string>());

        foreach (var key in nextKeys)
        {
            if (!prevKeys.Contains(key))
            {
                added.Add(key);
            }
            else if (!ShallowEqual(prev[key], next[key]))
            {
                updated.Add(key);
            }
        }

        foreach (var key in prevKeys)
        {
            if (!nextKeys.Contains(key))
            {
                removed.Add(key);
            }
        }

        return new BatonDiff
        {
            Added = added,
            Removed = removed,
            Updated = updated
        };
    }

    /// <summary>
    /// Log the data baton changes with context.
    /// </summary>
    public static void Log(
        ILogger logger,
        BatonLogContext context,
        Dictionary<string, object?> prev,
        Dictionary<string, object?> next)
    {
        var diff = Diff(prev, next);
        var hasChanges = diff.Added.Count > 0 || diff.Removed.Count > 0 || diff.Updated.Count > 0;
        var prefix = "🎽 DataBaton";

        if (!hasChanges)
        {
            logger.LogInformation(
                "{Prefix}: No changes | seq={SequenceName} beat={BeatNumber} event={BeatEvent} handler={HandlerName}",
                prefix,
                context.SequenceName ?? "?",
                context.BeatNumber?.ToString() ?? "?",
                context.BeatEvent ?? "?",
                context.HandlerName ?? "?");
            return;
        }

        var details = new List<string>();
        if (diff.Added.Count > 0)
            details.Add($"+{string.Join(",", diff.Added)}");
        if (diff.Updated.Count > 0)
            details.Add($"~{string.Join(",", diff.Updated)}");
        if (diff.Removed.Count > 0)
            details.Add($"-{string.Join(",", diff.Removed)}");

        // Small preview of changed keys (truncate for safety)
        var previewKeys = diff.Added.Concat(diff.Updated).Take(3).ToList();
        var previewObj = new Dictionary<string, object?>();
        foreach (var key in previewKeys)
        {
            if (next.ContainsKey(key))
                previewObj[key] = next[key];
        }

        string preview = "";
        try
        {
            var json = JsonSerializer.Serialize(previewObj);
            preview = json.Length > 200 ? json.Substring(0, 200) : json;
        }
        catch
        {
            preview = "{...}";
        }

        logger.LogInformation(
            "{Prefix}: {Details} | seq={SequenceName} beat={BeatNumber} event={BeatEvent} handler={HandlerName} plugin={PluginId} req={RequestId} preview={Preview}",
            prefix,
            string.Join(" ", details),
            context.SequenceName ?? "?",
            context.BeatNumber?.ToString() ?? "?",
            context.BeatEvent ?? "?",
            context.HandlerName ?? "?",
            context.PluginId ?? "?",
            context.RequestId ?? "?",
            preview);
    }

    /// <summary>
    /// Shallow equality comparison for values.
    /// </summary>
    private static bool ShallowEqual(object? a, object? b)
    {
        if (ReferenceEquals(a, b))
            return true;

        if (a == null || b == null)
            return a == b;

        if (a.GetType() != b.GetType())
            return false;

        // For value types and strings, use Equals
        if (a is ValueType || a is string)
            return a.Equals(b);

        // For dictionaries, compare keys and values
        if (a is Dictionary<string, object?> dictA && b is Dictionary<string, object?> dictB)
        {
            if (dictA.Count != dictB.Count)
                return false;

            foreach (var kvp in dictA)
            {
                if (!dictB.ContainsKey(kvp.Key) || !Equals(kvp.Value, dictB[kvp.Key]))
                    return false;
            }
            return true;
        }

        // For other reference types, use reference equality
        return false;
    }
}

/// <summary>
/// Represents the differences between two baton snapshots.
/// </summary>
public class BatonDiff
{
    public List<string> Added { get; set; } = new();
    public List<string> Removed { get; set; } = new();
    public List<string> Updated { get; set; } = new();
}

/// <summary>
/// Context information for logging data baton changes.
/// </summary>
public class BatonLogContext
{
    public string? SequenceName { get; set; }
    public string? MovementName { get; set; }
    public string? BeatEvent { get; set; }
    public int? BeatNumber { get; set; }
    public string? PluginId { get; set; }
    public string? HandlerName { get; set; }
    public string? RequestId { get; set; }
}

