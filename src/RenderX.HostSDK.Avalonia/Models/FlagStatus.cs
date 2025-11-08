namespace RenderX.HostSDK.Avalonia.Models;

/// <summary>
/// Status of a feature flag.
/// </summary>
public enum FlagStatus
{
    /// <summary>
    /// Feature is disabled.
    /// </summary>
    Off,

    /// <summary>
    /// Feature is enabled.
    /// </summary>
    On,

    /// <summary>
    /// Feature is in experimental mode.
    /// </summary>
    Experiment
}

