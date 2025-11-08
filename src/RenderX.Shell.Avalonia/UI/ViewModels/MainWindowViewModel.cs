using ReactiveUI;
using RenderX.Shell.Avalonia.Core;
using RenderX.Shell.Avalonia.Core.Conductor;
using RenderX.Shell.Avalonia.Infrastructure.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Reactive;
using System.Reactive.Linq;
using Microsoft.Extensions.Logging;

namespace RenderX.Shell.Avalonia.UI.ViewModels;

/// <summary>
/// Main window view model
/// </summary>
public class MainWindowViewModel : ViewModelBase
{
    private readonly IThinHostLayer _thinHost;
    private readonly RenderXConfiguration _configuration;
    private readonly ILogger<MainWindowViewModel> _logger;

    private bool _diagnosticsOpen;
    private bool _diagnosticsBadgeVisible;
    private bool _useLayoutManifest;
    private bool _webViewLoaded;
    private string _statusMessage = "Initializing...";

    public MainWindowViewModel(
        IThinHostLayer thinHost,
        IOptions<RenderXConfiguration> configuration,
        ILogger<MainWindowViewModel> logger)
    {
        _thinHost = thinHost ?? throw new ArgumentNullException(nameof(thinHost));
        _configuration = configuration.Value;
        _logger = logger;

        // Initialize properties from configuration
        UseLayoutManifest = _configuration.Layout.UseLayoutManifest;
        DiagnosticsBadgeVisible = _configuration.FeatureFlags.DiagnosticsEnabled;

        // Commands
        ToggleDiagnosticsCommand = ReactiveCommand.Create(ToggleDiagnostics);
        InitializeCommand = ReactiveCommand.CreateFromTask(InitializeAsync);

        // Subscribe to conductor events for status updates
        _thinHost.Conductor.SequenceEvents
            .Where(e => e.EventType == SequenceEventType.Failed)
            .Subscribe(e => StatusMessage = $"Error: {e.Error}");

        _thinHost.Conductor.SequenceEvents
            .Where(e => e.EventType == SequenceEventType.Completed)
            .Subscribe(e => StatusMessage = "Ready");

        // Auto-initialize
        InitializeCommand.Execute().Subscribe();
    }

    /// <summary>
    /// Whether diagnostics overlay is open
    /// </summary>
    public bool DiagnosticsOpen
    {
        get => _diagnosticsOpen;
        set => this.RaiseAndSetIfChanged(ref _diagnosticsOpen, value);
    }

    /// <summary>
    /// Whether diagnostics badge is visible
    /// </summary>
    public bool DiagnosticsBadgeVisible
    {
        get => _diagnosticsBadgeVisible;
        set => this.RaiseAndSetIfChanged(ref _diagnosticsBadgeVisible, value);
    }

    /// <summary>
    /// Whether to use layout manifest for UI
    /// </summary>
    public bool UseLayoutManifest
    {
        get => _useLayoutManifest;
        set => this.RaiseAndSetIfChanged(ref _useLayoutManifest, value);
    }

    /// <summary>
    /// Whether the WebView has been loaded and initialized
    /// </summary>
    public bool WebViewLoaded
    {
        get => _webViewLoaded;
        set => this.RaiseAndSetIfChanged(ref _webViewLoaded, value);
    }

    /// <summary>
    /// Current status message
    /// </summary>
    public string StatusMessage
    {
        get => _statusMessage;
        set => this.RaiseAndSetIfChanged(ref _statusMessage, value);
    }

    /// <summary>
    /// Command to toggle diagnostics overlay
    /// </summary>
    public ReactiveCommand<Unit, Unit> ToggleDiagnosticsCommand { get; }

    /// <summary>
    /// Command to initialize the application
    /// </summary>
    public ReactiveCommand<Unit, Unit> InitializeCommand { get; }

    /// <summary>
    /// Toggle diagnostics overlay
    /// </summary>
    private void ToggleDiagnostics()
    {
        DiagnosticsOpen = !DiagnosticsOpen;
        _logger.LogDebug("Diagnostics overlay toggled: {IsOpen}", DiagnosticsOpen);
    }

    /// <summary>
    /// Initialize the application
    /// </summary>
    private async System.Threading.Tasks.Task InitializeAsync()
    {
        try
        {
            StatusMessage = "Initializing thin host layer...";
            await _thinHost.InitializeAsync();

            StatusMessage = "Ready";
            _logger.LogInformation("RenderX Shell initialized successfully");
        }
        catch (Exception ex)
        {
            StatusMessage = $"Initialization failed: {ex.Message}";
            _logger.LogError(ex, "Failed to initialize RenderX Shell");
        }
    }
}

/// <summary>
/// Base view model class
/// </summary>
public abstract class ViewModelBase : ReactiveObject
{
}
