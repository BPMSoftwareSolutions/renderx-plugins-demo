using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;

namespace MusicalConductor.Avalonia.Logging;

/// <summary>
/// ConductorLogger - Provides hierarchical logging with contextual emoji icons
/// matching the web version's ConductorLogger.ts implementation.
/// 
/// Subscribes to Musical Conductor events and logs them with proper indentation
/// and contextual icons for sequence/movement/beat/handler/plugin operations.
/// 
/// Web version reference: packages/musical-conductor/modules/communication/sequences/monitoring/ConductorLogger.ts
/// </summary>
public class ConductorLogger
{
    private readonly ILogger<ConductorLogger> _logger;
    private readonly Dictionary<string, Stack<ScopeInfo>> _stacks = new();
    private readonly object _lock = new();
    private bool _enabled;

    public ConductorLogger(ILogger<ConductorLogger> logger, bool enabled = true)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _enabled = enabled;
    }

    /// <summary>
    /// Subscribe to Musical Conductor events for hierarchical logging.
    /// This should be called after the Jint engine is initialized and the conductor bundle is loaded.
    /// </summary>
    public void SubscribeToEvents(IEventBus eventBus)
    {
        if (!_enabled)
        {
            _logger.LogDebug("ConductorLogger is disabled, skipping event subscriptions");
            return;
        }

        if (eventBus == null)
        {
            throw new ArgumentNullException(nameof(eventBus));
        }

        _logger.LogInformation("🎼 ConductorLogger: Subscribing to Musical Conductor events");

        // Sequence scope
        eventBus.Subscribe<dynamic>("sequence-started", OnSequenceStarted);
        eventBus.Subscribe<dynamic>("sequence-completed", OnSequenceCompleted);

        // Movement scope
        eventBus.Subscribe<dynamic>("movement-started", OnMovementStarted);
        eventBus.Subscribe<dynamic>("movement-completed", OnMovementCompleted);

        // Beat scope
        eventBus.Subscribe<dynamic>("beat-started", OnBeatStarted);
        eventBus.Subscribe<dynamic>("beat-completed", OnBeatCompleted);
        eventBus.Subscribe<dynamic>("beat-failed", OnBeatFailed);

        // Handler scopes (emitted by PluginManager wrapping)
        eventBus.Subscribe<dynamic>("plugin:handler:start", OnHandlerStart);
        eventBus.Subscribe<dynamic>("plugin:handler:end", OnHandlerEnd);

        // Plugin log messages
        eventBus.Subscribe<dynamic>("musical-conductor:log", OnPluginLog);

        // Stage crew commit logging
        eventBus.Subscribe<dynamic>("stage:cue", OnStageCue);

        _logger.LogInformation("✅ ConductorLogger: Event subscriptions complete");
    }

    /// <summary>
    /// Get the current depth for a request ID (exposed for other loggers to align indent).
    /// </summary>
    public int GetDepth(string? requestId = null)
    {
        var key = requestId ?? "__global__";
        lock (_lock)
        {
            return _stacks.TryGetValue(key, out var stack) ? stack.Count : 0;
        }
    }

    private void OnSequenceStarted(dynamic data)
    {
        var requestId = GetPropertyValue(data, "requestId");
        var sequenceName = GetPropertyValue(data, "sequenceName") ?? "unknown-sequence";

        var indent = GetIndent(requestId);
        _logger.LogInformation($"{indent}🎼 {sequenceName}");

        Push(requestId, new ScopeInfo { Type = "sequence", Label = $"🎼 {sequenceName}" });
    }

    private void OnSequenceCompleted(dynamic data)
    {
        var requestId = GetPropertyValue(data, "requestId");
        Pop(requestId, "sequence");
    }

    private void OnMovementStarted(dynamic data)
    {
        var requestId = GetPropertyValue(data, "requestId");
        var movementName = GetPropertyValue(data, "movementName") ?? "unknown-movement";

        var indent = GetIndent(requestId);
        _logger.LogInformation($"{indent}🎵 {movementName}");

        Push(requestId, new ScopeInfo { Type = "movement", Label = $"🎵 {movementName}" });
    }

    private void OnMovementCompleted(dynamic data)
    {
        var requestId = GetPropertyValue(data, "requestId");
        Pop(requestId, "movement");
    }

    private void OnBeatStarted(dynamic data)
    {
        var requestId = GetPropertyValue(data, "requestId");
        var beat = GetPropertyValue(data, "beat") ?? "?";
        var eventName = GetPropertyValue(data, "event") ?? "unknown-event";
        
        var indent = GetIndent(requestId);
        _logger.LogInformation($"{indent}🥁 {beat}: {eventName}");

        Push(requestId, new ScopeInfo { Type = "beat", Label = $"🥁 {beat}: {eventName}" });
    }

    private void OnBeatCompleted(dynamic data)
    {
        var requestId = GetPropertyValue(data, "requestId");
        Pop(requestId, "beat");
    }

    private void OnBeatFailed(dynamic data)
    {
        var requestId = GetPropertyValue(data, "requestId");
        Pop(requestId, "beat");
    }

    private void OnHandlerStart(dynamic data)
    {
        var requestId = GetPropertyValue(data, "requestId");
        var pluginId = GetPropertyValue(data, "pluginId") ?? "unknown-plugin";
        var handlerName = GetPropertyValue(data, "handlerName") ?? "unknown-handler";
        
        var indent = GetIndent(requestId);
        _logger.LogInformation($"{indent}🔧 {pluginId}.{handlerName}");

        Push(requestId, new ScopeInfo { Type = "handler", Label = $"🔧 {pluginId}.{handlerName}" });
    }

    private void OnHandlerEnd(dynamic data)
    {
        var requestId = GetPropertyValue(data, "requestId");
        Pop(requestId, "handler");
    }

    private void OnPluginLog(dynamic evt)
    {
        var requestId = GetPropertyValue(evt, "requestId");
        var pluginId = GetPropertyValue(evt, "pluginId");
        var handlerName = GetPropertyValue(evt, "handlerName");
        var level = GetPropertyValue(evt, "level") ?? "log";
        var message = GetPropertyValue(evt, "message");

        var indent = GetIndent(requestId);

        // Build prefix with appropriate icon
        string prefix;
        if (!string.IsNullOrEmpty(pluginId))
        {
            // Plugin logs use puzzle piece icon
            prefix = $"🧩 {pluginId}{(!string.IsNullOrEmpty(handlerName) ? "." + handlerName : "")}";
        }
        else
        {
            // Console logs use level-specific icons
            prefix = level?.ToLower() switch
            {
                "warn" => "⚠️",
                "error" => "❌",
                _ => "🎼"
            };
        }

        var line = $"{indent}{prefix}";

        // Format message - handle array or single value
        var messageText = FormatMessage(message);

        // Log based on level
        switch (level?.ToLower())
        {
            case "warn":
                _logger.LogWarning($"{line} {messageText}");
                break;
            case "error":
                _logger.LogError($"{line} {messageText}");
                break;
            case "info":
            case "log":
            default:
                _logger.LogInformation($"{line} {messageText}");
                break;
        }
    }

    private void OnStageCue(dynamic cue)
    {
        if (cue == null) return;

        var operations = GetPropertyValue(cue, "operations");
        if (operations == null) return;

        // Convert operations to array if needed
        var operationsArray = ConvertToArray(operations);
        if (operationsArray == null || operationsArray.Length == 0) return;

        var requestId = GetPropertyValue(cue, "requestId");
        var pluginId = GetPropertyValue(cue, "pluginId") ?? "unknown";
        var correlationId = GetPropertyValue(cue, "correlationId") ?? "no-correlation";
        
        // Try to get handlerName from meta
        var meta = GetPropertyValue(cue, "meta");
        var handlerName = meta != null ? GetPropertyValue(meta, "handlerName") : null;
        var handlerSuffix = !string.IsNullOrEmpty(handlerName) ? $".{handlerName}" : "";

        var indent = GetIndent(requestId);
        _logger.LogInformation($"{indent}🎭 Stage Crew: {pluginId}{handlerSuffix} ({correlationId})");

        // Log each operation with proper indentation
        for (int i = 0; i < operationsArray.Length; i++)
        {
            var op = operationsArray[i];
            var opIndent = $"{indent}  ";
            var isLast = i == operationsArray.Length - 1;
            var connector = isLast ? "└─" : "├─";
            var opText = FormatOperation(op);

            _logger.LogInformation($"{opIndent}{connector} {opText}");
        }
    }

    private void Push(string? requestId, ScopeInfo scope)
    {
        var key = requestId ?? "__global__";
        lock (_lock)
        {
            if (!_stacks.ContainsKey(key))
            {
                _stacks[key] = new Stack<ScopeInfo>();
            }
            _stacks[key].Push(scope);
        }
    }

    private void Pop(string? requestId, string expectedType)
    {
        var key = requestId ?? "__global__";
        lock (_lock)
        {
            if (_stacks.TryGetValue(key, out var stack) && stack.Count > 0)
            {
                // Find and remove the last matching type
                var items = stack.ToList();
                for (int i = 0; i < items.Count; i++)
                {
                    if (items[i].Type == expectedType)
                    {
                        items.RemoveAt(i);
                        _stacks[key] = new Stack<ScopeInfo>(items.AsEnumerable().Reverse());
                        return;
                    }
                }
                
                // If we didn't find the expected type, log a warning
                _logger.LogWarning("Scope mismatch: expected {Expected}, but not found in stack", expectedType);
            }
        }
    }

    private string GetIndent(string? requestId = null)
    {
        var key = requestId ?? "__global__";
        int depth;
        lock (_lock)
        {
            depth = _stacks.TryGetValue(key, out var stack) ? stack.Count : 0;
        }
        return new string(' ', Math.Max(0, depth * 2)); // 2 spaces per level
    }

    private string? GetPropertyValue(dynamic obj, string propertyName)
    {
        if (obj == null) return null;

        try
        {
            // Try as ExpandoObject/IDictionary
            if (obj is IDictionary<string, object> dict)
            {
                if (dict.TryGetValue(propertyName, out var value))
                {
                    return value?.ToString();
                }
            }
            // Try as dynamic property access
            else
            {
                var value = obj.GetType().GetProperty(propertyName)?.GetValue(obj);
                return value?.ToString();
            }
        }
        catch
        {
            // Ignore errors and return null
        }

        return null;
    }

    private string FormatMessage(dynamic message)
    {
        if (message == null) return string.Empty;

        // If it's an array, join the elements
        if (message is Array arr)
        {
            return string.Join(" ", arr.Cast<object>().Select(o => o?.ToString() ?? ""));
        }

        // If it's an IEnumerable, join the elements
        if (message is System.Collections.IEnumerable enumerable && !(message is string))
        {
            return string.Join(" ", enumerable.Cast<object>().Select(o => o?.ToString() ?? ""));
        }

        return message.ToString() ?? string.Empty;
    }

    private object[]? ConvertToArray(dynamic operations)
    {
        if (operations == null) return null;

        if (operations is Array arr)
        {
            return arr.Cast<object>().ToArray();
        }

        if (operations is System.Collections.IEnumerable enumerable && !(operations is string))
        {
            return enumerable.Cast<object>().ToArray();
        }

        return new[] { operations };
    }

    private string FormatOperation(dynamic op)
    {
        if (op == null) return "unknown";

        try
        {
            // Try to format as "type: details"
            var type = GetPropertyValue(op, "type");
            var details = GetPropertyValue(op, "details") ?? GetPropertyValue(op, "value");
            
            if (!string.IsNullOrEmpty(type))
            {
                return !string.IsNullOrEmpty(details) ? $"{type}: {details}" : type;
            }

            return op.ToString() ?? "unknown";
        }
        catch
        {
            return op.ToString() ?? "unknown";
        }
    }

    private class ScopeInfo
    {
        public string Type { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
    }
}

