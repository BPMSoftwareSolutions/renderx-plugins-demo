namespace RenderX.HostSDK.Avalonia.Extensions;

/// <summary>
/// Configuration options for the RenderX Host SDK.
/// </summary>
public class HostSdkOptions
{
    /// <summary>
    /// Enable debug logging for Host SDK operations.
    /// Default: false
    /// </summary>
    public bool EnableDebugLogging { get; set; } = false;

    /// <summary>
    /// Timeout in milliseconds for JavaScript operations.
    /// Default: 30000 (30 seconds)
    /// </summary>
    public int OperationTimeoutMs { get; set; } = 30000;

    /// <summary>
    /// Custom path to the Host SDK JavaScript bundle.
    /// If null, uses the embedded bundle.
    /// </summary>
    public string? CustomBundlePath { get; set; }

    /// <summary>
    /// Enable automatic initialization of the Host SDK on startup.
    /// Default: true
    /// </summary>
    public bool AutoInitialize { get; set; } = true;

    /// <summary>
    /// Maximum number of statements the JavaScript engine can execute.
    /// Default: 100000
    /// </summary>
    public int MaxStatements { get; set; } = 100000;

    /// <summary>
    /// Timeout in seconds for the JavaScript engine.
    /// Default: 30
    /// </summary>
    public int EngineTimeoutSeconds { get; set; } = 30;
}

