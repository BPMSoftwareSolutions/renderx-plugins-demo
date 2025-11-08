using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RenderX.Shell.Avalonia.Core.Conductor;
using RenderX.Shell.Avalonia.Core.Events;
using RenderX.Shell.Avalonia.UI.ViewModels;
using RenderX.Shell.Avalonia.UI.Views;
using System;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia;

public partial class MainWindow : Window
{
    private sealed class NoopObserver<T> : IObserver<T>
    {
        public void OnCompleted() { }
        public void OnError(Exception error) { }
        public void OnNext(T value) { }
    }

    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MainWindow> _logger;
    private LayoutManager? _layoutManager;

    public MainWindow()
    {
        InitializeComponent();

        // Get service provider from App
        _serviceProvider = ((App)Application.Current!).ServiceProvider;
        _logger = _serviceProvider.GetRequiredService<ILogger<MainWindow>>();

        // Global keyboard shortcut for diagnostics (Ctrl+Shift+D)
        KeyDown += OnKeyDown;

        // Initialize controls when window loads
        Loaded += OnWindowLoaded;

        // Handle window size changes for responsive layout
        SizeChanged += OnWindowSizeChanged;
    }

    private async void OnWindowLoaded(object? sender, RoutedEventArgs e)
    {
        try
        {
            _logger.LogInformation("MainWindow loaded, initializing controls");

            // Get dependencies
            var eventRouter = _serviceProvider.GetRequiredService<IEventRouter>();
            var conductor = _serviceProvider.GetRequiredService<IConductor>();
            var canvasLogger = _serviceProvider.GetRequiredService<ILogger<CanvasControl>>();
            var controlPanelLogger = _serviceProvider.GetRequiredService<ILogger<ControlPanelControl>>();
            var layoutLogger = _serviceProvider.GetRequiredService<ILogger<LayoutManager>>();

            // Initialize LayoutManager
            _layoutManager = new LayoutManager(layoutLogger);
            _layoutManager.Initialize();

            // Initialize CanvasControl
            var canvasControl = this.FindControl<CanvasControl>("CanvasControl");
            if (canvasControl != null)
            {
                canvasControl.Initialize(eventRouter, conductor, canvasLogger);
                _logger.LogInformation("CanvasControl initialized");
            }

            // Initialize ControlPanelControl
            var controlPanelControl = this.FindControl<ControlPanelControl>("ControlPanelControl");
            if (controlPanelControl != null)
            {
                controlPanelControl.Initialize(eventRouter, conductor, controlPanelLogger);
                _logger.LogInformation("ControlPanelControl initialized");
            }

            // Update status bar
            var statusBar = this.FindControl<TextBlock>("StatusBarText");
            if (statusBar != null)
            {
                statusBar.Text = "Ready";
            }

            _logger.LogInformation("MainWindow initialization complete");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing MainWindow");
        }
    }

    private void OnWindowSizeChanged(object? sender, SizeChangedEventArgs e)
    {
        try
        {
            if (_layoutManager != null)
            {
                var layout = _layoutManager.CalculateLayout(e.NewSize.Width, e.NewSize.Height);
                _logger.LogDebug("Window resized: Width={Width}, Height={Height}, ResponsiveMode={ResponsiveMode}",
                    e.NewSize.Width, e.NewSize.Height, layout.IsResponsiveMode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling window size change");
        }
    }

    private void OnKeyDown(object? sender, KeyEventArgs e)
    {
        if (DataContext is MainWindowViewModel viewModel)
        {
            // Ctrl+Shift+D or Cmd+Shift+D
            if ((e.KeyModifiers.HasFlag(KeyModifiers.Control) || e.KeyModifiers.HasFlag(KeyModifiers.Meta))
                && e.KeyModifiers.HasFlag(KeyModifiers.Shift)
                && e.Key == Key.D)
            {
                e.Handled = true;
                viewModel.ToggleDiagnosticsCommand.Execute().Subscribe(new NoopObserver<System.Reactive.Unit>());
            }
        }
    }
}
