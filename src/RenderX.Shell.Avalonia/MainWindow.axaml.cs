using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RenderX.Shell.Avalonia.Core;
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

            // Get ThinHostLayer from DI
            var thinHostLayer = _serviceProvider.GetRequiredService<IThinHostLayer>();
            var layoutLogger = _serviceProvider.GetRequiredService<ILogger<LayoutManager>>();

            // Initialize ThinHostLayer
            await thinHostLayer.InitializeAsync();

            // Initialize LayoutManager
            _layoutManager = new LayoutManager(layoutLogger);
            _layoutManager.Initialize();

            // Mount native Avalonia controls into slots (thin-host architecture)

            // Canvas slot - CanvasControl
            var canvasSlot = this.FindControl<Border>("Canvas");
            if (canvasSlot != null)
            {
                var canvasControl = new CanvasControl();
                var canvasLogger = _serviceProvider.GetRequiredService<ILogger<CanvasControl>>();
                canvasControl.Initialize(
                    thinHostLayer.EventRouter,
                    thinHostLayer.Conductor,
                    canvasLogger);
                canvasSlot.Child = canvasControl;
                _logger.LogInformation("CanvasControl mounted in Canvas slot");
            }

            // ControlPanel slot - ControlPanelControl
            var controlPanelSlot = this.FindControl<Border>("ControlPanel");
            if (controlPanelSlot != null)
            {
                var controlPanelControl = new ControlPanelControl();
                var controlPanelLogger = _serviceProvider.GetRequiredService<ILogger<ControlPanelControl>>();
                controlPanelControl.Initialize(
                    thinHostLayer.EventRouter,
                    thinHostLayer.Conductor,
                    controlPanelLogger);
                controlPanelSlot.Child = controlPanelControl;
                _logger.LogInformation("ControlPanelControl mounted in ControlPanel slot");
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
