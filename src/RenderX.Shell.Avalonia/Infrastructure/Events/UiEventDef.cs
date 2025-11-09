using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace RenderX.Shell.Avalonia.Infrastructure.Events;

/// <summary>
/// UI Event definition from manifest (uiEvents.json).
/// Matches the TypeScript UiEventDef interface from web version.
/// </summary>
public class UiEventDef
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("target")]
    public EventTarget Target { get; set; } = new();

    [JsonPropertyName("event")]
    public string Event { get; set; } = string.Empty;

    [JsonPropertyName("options")]
    public object? Options { get; set; }

    [JsonPropertyName("guard")]
    public EventGuard? Guard { get; set; }

    [JsonPropertyName("publish")]
    public EventPublish Publish { get; set; } = new();
}

/// <summary>
/// Event target definition (window or element selector).
/// </summary>
public class EventTarget
{
    [JsonPropertyName("window")]
    public bool? Window { get; set; }

    [JsonPropertyName("selector")]
    public string? Selector { get; set; }
}

/// <summary>
/// Guard conditions for event firing.
/// </summary>
public class EventGuard
{
    [JsonPropertyName("key")]
    public string? Key { get; set; }

    [JsonPropertyName("ctrlKey")]
    public bool? CtrlKey { get; set; }

    [JsonPropertyName("metaKey")]
    public bool? MetaKey { get; set; }

    [JsonPropertyName("shiftKey")]
    public bool? ShiftKey { get; set; }

    [JsonPropertyName("altKey")]
    public bool? AltKey { get; set; }

    [JsonPropertyName("notClosestMatch")]
    public string? NotClosestMatch { get; set; }
}

/// <summary>
/// Event publication configuration.
/// </summary>
public class EventPublish
{
    [JsonPropertyName("topic")]
    public string Topic { get; set; } = string.Empty;

    [JsonPropertyName("payload")]
    public object? Payload { get; set; }
}
