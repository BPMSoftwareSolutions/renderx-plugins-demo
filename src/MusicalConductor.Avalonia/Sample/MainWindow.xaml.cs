using Avalonia.Controls;
using Avalonia.Interactivity;
using Microsoft.Extensions.Logging;
using MusicalConductor.Avalonia.Interfaces;

namespace MusicalConductor.Sample;

public partial class MainWindow : Window
{
    private readonly IConductorClient _conductor;
    private readonly ILogger<MainWindow> _logger;

    public MainWindow(IConductorClient conductor, ILogger<MainWindow> logger)
    {
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        InitializeComponent();
        SetupEventHandlers();
    }

    private void SetupEventHandlers()
    {
        _logger.LogInformation(\"🎼 Setting up event handlers\");

        // Subscribe to conductor events
        _conductor.On(\"sequence:started\", (data) =>
        {
            _logger.LogInformation(\"▶️ Sequence started: {Data}\", data);
            UpdateStatus(\"Sequence started\");
        });

        _conductor.On(\"sequence:completed\", (data) =>
        {
            _logger.LogInformation(\"✅ Sequence completed: {Data}\", data);
            UpdateStatus(\"Sequence completed\");
        });

        _conductor.On(\"sequence:failed\", (data) =>
        {
            _logger.LogError(\"❌ Sequence failed: {Data}\", data);
            UpdateStatus(\"Sequence failed\");
        });

        _conductor.On(\"beat:executed\", (data) =>
        {
            _logger.LogInformation(\"🎵 Beat executed: {Data}\", data);
        });
    }

    private void PlaySequence_Click(object? sender, RoutedEventArgs e)
    {
        try
        {
            _logger.LogInformation(\"▶️ Play button clicked\");

            var pluginId = \"sample-plugin\";
            var sequenceId = \"sample-sequence\";
            var context = new { message = \"Hello from Avalonia!\" };

            var requestId = _conductor.Play(pluginId, sequenceId, context);
            UpdateStatus($\"Playing sequence: {requestId}\");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, \"❌ Failed to play sequence\");
            UpdateStatus($\"Error: {ex.Message}\");
        }
    }

    private void GetStatus_Click(object? sender, RoutedEventArgs e)
    {
        try
        {
            _logger.LogInformation(\"📊 Get status button clicked\");

            var status = _conductor.GetStatus();
            var statusText = status?.ToString() ?? \"No status\";

            UpdateStatus($\"Status: {statusText}\");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, \"❌ Failed to get status\");
            UpdateStatus($\"Error: {ex.Message}\");
        }
    }

    private void GetStatistics_Click(object? sender, RoutedEventArgs e)
    {
        try
        {
            _logger.LogInformation(\"📈 Get statistics button clicked\");

            var stats = _conductor.GetStatistics();
            var statsText = stats?.ToString() ?? \"No statistics\";

            UpdateStatus($\"Statistics: {statsText}\");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, \"❌ Failed to get statistics\");
            UpdateStatus($\"Error: {ex.Message}\");
        }
    }

    private void UpdateStatus(string message)
    {
        _logger.LogInformation(\"📝 Status: {Message}\", message);
        // Update UI status label here
    }
}

