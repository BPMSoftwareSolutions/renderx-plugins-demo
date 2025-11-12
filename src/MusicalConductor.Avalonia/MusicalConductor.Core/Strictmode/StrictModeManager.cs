using Microsoft.Extensions.Logging;

namespace MusicalConductor.Core.Strictmode;

/// <summary>
/// StrictModeManager - Enforces strict execution patterns
/// Validates and enforces strict mode rules for sequence execution
/// </summary>
public class StrictModeManager
{
    public class StrictModeConfig
    {
        public bool Enabled { get; set; }
        public bool EnforceSequenceOrdering { get; set; }
        public bool EnforceResourceOwnership { get; set; }
        public bool EnforceErrorHandling { get; set; }
    }

    private StrictModeConfig _config;
    private readonly List<string> _registeredPatterns = new();
    private readonly ILogger<StrictModeManager> _logger;
    private readonly object _lock = new();

    public StrictModeManager(ILogger<StrictModeManager> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _config = new StrictModeConfig
        {
            Enabled = false,
            EnforceSequenceOrdering = false,
            EnforceResourceOwnership = false,
            EnforceErrorHandling = false
        };
    }

    /// <summary>
    /// Enable strict mode with configuration
    /// </summary>
    public void EnableStrictMode(StrictModeConfig config)
    {
        lock (_lock)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _config.Enabled = true;

            _logger.LogInformation(
                "🔒 StrictModeManager: Strict mode enabled (Ordering={Ordering}, Ownership={Ownership}, ErrorHandling={ErrorHandling})",
                _config.EnforceSequenceOrdering,
                _config.EnforceResourceOwnership,
                _config.EnforceErrorHandling);
        }
    }

    /// <summary>
    /// Disable strict mode
    /// </summary>
    public void DisableStrictMode()
    {
        lock (_lock)
        {
            _config.Enabled = false;

            _logger.LogInformation("🔒 StrictModeManager: Strict mode disabled");
        }
    }

    /// <summary>
    /// Register an execution pattern
    /// </summary>
    public void RegisterPattern(string patternName)
    {
        lock (_lock)
        {
            if (!_registeredPatterns.Contains(patternName))
            {
                _registeredPatterns.Add(patternName);

                _logger.LogDebug(
                    "🔒 StrictModeManager: Registered execution pattern {PatternName}",
                    patternName);
            }
        }
    }

    /// <summary>
    /// Validate execution against strict mode rules
    /// </summary>
    public bool ValidateExecution(string sequenceName, string executionContext)
    {
        lock (_lock)
        {
            if (!_config.Enabled)
            {
                return true;
            }

            // Perform validation checks
            bool isValid = true;

            if (_config.EnforceSequenceOrdering)
            {
                // Check sequence ordering
                isValid = isValid && ValidateSequenceOrdering(sequenceName);
            }

            if (_config.EnforceResourceOwnership)
            {
                // Check resource ownership
                isValid = isValid && ValidateResourceOwnership(sequenceName);
            }

            if (_config.EnforceErrorHandling)
            {
                // Check error handling
                isValid = isValid && ValidateErrorHandling(sequenceName);
            }

            return isValid;
        }
    }

    /// <summary>
    /// Get current strict mode configuration
    /// </summary>
    public StrictModeConfig GetConfiguration()
    {
        lock (_lock)
        {
            return _config;
        }
    }

    /// <summary>
    /// Get registered patterns
    /// </summary>
    public IReadOnlyList<string> GetRegisteredPatterns()
    {
        lock (_lock)
        {
            return _registeredPatterns.AsReadOnly();
        }
    }

    /// <summary>
    /// Update strict mode configuration
    /// </summary>
    public void UpdateConfiguration(StrictModeConfig newConfig)
    {
        lock (_lock)
        {
            var oldConfig = _config;
            _config = newConfig;

            _logger.LogInformation("⚙️ StrictModeManager: Configuration updated");

            if (oldConfig.EnforceSequenceOrdering != newConfig.EnforceSequenceOrdering)
            {
                _logger.LogInformation("⚙️ StrictModeManager: Sequence ordering enforcement changed from {OldValue} to {NewValue}", oldConfig.EnforceSequenceOrdering, newConfig.EnforceSequenceOrdering);
            }

            if (oldConfig.EnforceResourceOwnership != newConfig.EnforceResourceOwnership)
            {
                _logger.LogInformation("⚙️ StrictModeManager: Resource ownership enforcement changed from {OldValue} to {NewValue}", oldConfig.EnforceResourceOwnership, newConfig.EnforceResourceOwnership);
            }

            if (oldConfig.EnforceErrorHandling != newConfig.EnforceErrorHandling)
            {
                _logger.LogInformation("⚙️ StrictModeManager: Error handling enforcement changed from {OldValue} to {NewValue}", oldConfig.EnforceErrorHandling, newConfig.EnforceErrorHandling);
            }
        }
    }

    private bool ValidateSequenceOrdering(string sequenceName)
    {
        // Placeholder for sequence ordering validation
        return true;
    }

    private bool ValidateResourceOwnership(string sequenceName)
    {
        // Placeholder for resource ownership validation
        return true;
    }

    private bool ValidateErrorHandling(string sequenceName)
    {
        // Placeholder for error handling validation
        return true;
    }
}

