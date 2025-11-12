using Avalonia;
using Avalonia.Input;
using Avalonia.Interactivity;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Interfaces;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Infrastructure.Events;

/// <summary>
/// Service for wiring UI events from manifest (uiEvents.json).
/// Implements manifest-driven keyboard shortcuts and UI event routing.
/// Avalonia counterpart to web version's wireUiEvents() function (src/ui/events/wiring.ts).
/// See ADR-0037 for architecture details.
/// </summary>
public class UiEventService : IUiEventService
{
    private readonly IEventRouter _eventRouter;
    private readonly ILogger<UiEventService> _logger;
    private readonly List<EventHandler<KeyEventArgs>> _registeredHandlers = new();
    private Visual? _targetVisual;
    private bool _disposed;

    public UiEventService(IEventRouter eventRouter, ILogger<UiEventService> logger)
    {
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc/>
    public async Task WireEventsAsync(string manifestPath)
    {
        if (string.IsNullOrWhiteSpace(manifestPath))
            throw new ArgumentNullException(nameof(manifestPath));

        if (!File.Exists(manifestPath))
        {
            _logger.LogWarning("⚠️  UI events manifest not found: {Path}", manifestPath);
            return;
        }

        try
        {
            var json = await File.ReadAllTextAsync(manifestPath);
            var events = JsonSerializer.Deserialize<List<UiEventDef>>(json);

            if (events == null || events.Count == 0)
            {
                _logger.LogWarning("⚠️  No UI events found in manifest");
                return;
            }

            _logger.LogInformation("🎹 Wiring {Count} UI events from manifest", events.Count);

            foreach (var eventDef in events)
            {
                WireEvent(eventDef);
            }

            _logger.LogInformation("✅ UI events wired successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to wire UI events from manifest");
            throw;
        }
    }

    /// <summary>
    /// Wire a single event definition.
    /// </summary>
    private void WireEvent(UiEventDef eventDef)
    {
        // Currently only support window-level keyboard events
        // TODO: Add support for element selectors and click events when needed
        // The web version supports both window events and element selector events (#rx-canvas, etc.)
        // For now, we focus on keyboard shortcuts which are the most critical for parity
        if (eventDef.Target.Window != true || eventDef.Event != "keydown")
        {
            _logger.LogDebug("⏭️  Skipping non-window or non-keydown event: {Id} (selector-based events not yet implemented)", eventDef.Id);
            return;
        }

        EventHandler<KeyEventArgs> handler = (sender, e) =>
        {
            try
            {
                // Check guard conditions
                if (eventDef.Guard != null)
                {
                    // Key check
                    if (eventDef.Guard.Key != null)
                    {
                        var keyString = e.Key.ToString();
                        // Handle single-char keys (e.g., "c" maps to Key.C)
                        if (eventDef.Guard.Key.Length == 1)
                        {
                            var expectedKey = eventDef.Guard.Key.ToUpperInvariant();
                            if (keyString != expectedKey)
                                return;
                        }
                        else if (!keyString.Equals(eventDef.Guard.Key, StringComparison.OrdinalIgnoreCase))
                        {
                            return;
                        }
                    }

                    // Modifier key checks
                    var modifiers = e.KeyModifiers;

                    if (eventDef.Guard.CtrlKey.HasValue)
                    {
                        var hasCtrl = modifiers.HasFlag(KeyModifiers.Control);
                        if (hasCtrl != eventDef.Guard.CtrlKey.Value)
                            return;
                    }

                    if (eventDef.Guard.MetaKey.HasValue)
                    {
                        var hasMeta = modifiers.HasFlag(KeyModifiers.Meta);
                        if (hasMeta != eventDef.Guard.MetaKey.Value)
                            return;
                    }

                    if (eventDef.Guard.ShiftKey.HasValue)
                    {
                        var hasShift = modifiers.HasFlag(KeyModifiers.Shift);
                        if (hasShift != eventDef.Guard.ShiftKey.Value)
                            return;
                    }

                    if (eventDef.Guard.AltKey.HasValue)
                    {
                        var hasAlt = modifiers.HasFlag(KeyModifiers.Alt);
                        if (hasAlt != eventDef.Guard.AltKey.Value)
                            return;
                    }

                    // TODO: Implement notClosestMatch selector check when needed
                    // This would require access to the focused element and visual tree traversal
                }

                // All guards passed - publish the event
                var payload = eventDef.Publish.Payload ?? new { };
                
                _logger.LogDebug("🎹 UI event triggered: {Id} -> {Topic}", eventDef.Id, eventDef.Publish.Topic);
                
                // Mark as handled to prevent default behavior
                e.Handled = true;

                // Publish asynchronously
                Task.Run(async () =>
                {
                    try
                    {
                        await _eventRouter.PublishAsync(eventDef.Publish.Topic, payload);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "❌ Error publishing UI event: {Topic}", eventDef.Publish.Topic);
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in UI event handler: {Id}", eventDef.Id);
            }
        };

        _registeredHandlers.Add(handler);
        _logger.LogDebug("✅ Wired UI event: {Id}", eventDef.Id);
    }

    /// <summary>
    /// Register event handlers on the target visual (typically MainWindow).
    /// </summary>
    public void RegisterHandlers(Visual targetVisual)
    {
        if (_targetVisual != null)
        {
            _logger.LogWarning("⚠️  Handlers already registered");
            return;
        }

        _targetVisual = targetVisual ?? throw new ArgumentNullException(nameof(targetVisual));

        // Attach handlers to the visual's KeyDown event using Avalonia's event system
        if (_targetVisual is InputElement inputElement)
        {
            foreach (var handler in _registeredHandlers)
            {
                inputElement.AddHandler(InputElement.KeyDownEvent, handler, RoutingStrategies.Tunnel);
            }
        }

        _logger.LogInformation("✅ Registered {Count} keyboard event handlers", _registeredHandlers.Count);
    }

    /// <inheritdoc/>
    public void UnwireAll()
    {
        if (_targetVisual != null && _targetVisual is InputElement inputElement)
        {
            foreach (var handler in _registeredHandlers)
            {
                inputElement.RemoveHandler(InputElement.KeyDownEvent, handler);
            }
            _targetVisual = null;
        }

        _registeredHandlers.Clear();
        _logger.LogInformation("🧹 UI event handlers unwired");
    }

    /// <inheritdoc/>
    public void Dispose()
    {
        if (_disposed) return;

        UnwireAll();
        _disposed = true;
    }
}
