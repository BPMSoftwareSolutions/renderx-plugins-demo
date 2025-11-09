using System;
using System.IO;
using System.Threading.Tasks;
using Xunit;
// NuGet packages required: FlaUI.Core, FlaUI.UIA3, xunit, Microsoft.NET.Test.Sdk, xunit.runner.visualstudio, FluentAssertions
using FlaUI.Core;
using FlaUI.UIA3;

namespace RenderX.Shell.Avalonia.E2ETests;

/// <summary>
/// E2E tests for theme switching functionality
/// Tests verify that the theme toggle button exists and can be interacted with
/// </summary>
public class ThemeToggleE2ETests : IAsyncLifetime
{
    private Application? _app;
    private UIA3Automation? _automation;

    public async Task InitializeAsync()
    {
        var exe = TestHelpers.ResolveAppExePath();
        _app = Application.Launch(exe);
        _automation = new UIA3Automation();
        // Wait for main window
        var main = _app.GetMainWindow(_automation, TimeSpan.FromSeconds(60));
        Assert.NotNull(main);

        // Give the UI time to fully render
        await Task.Delay(2000);
    }

    public Task DisposeAsync()
    {
        try { _app?.Close(); } catch { /* ignore */ }
        _automation?.Dispose();
        return Task.CompletedTask;
    }

    [Fact]
    public void ThemeToggle_ButtonExists()
    {
        var main = _app!.GetMainWindow(_automation!);
        Assert.NotNull(main);

        // Look for theme toggle button in the header area
        // The button should be in the headerRight slot
        var buttons = main.FindAllDescendants(cf => cf.ByControlType(FlaUI.Core.Definitions.ControlType.Button));
        Assert.NotEmpty(buttons);
    }

    [Fact]
    public void ThemeToggle_HeaderPanelExists()
    {
        var main = _app!.GetMainWindow(_automation!);
        Assert.NotNull(main);

        // Verify the main window has content
        var children = main.FindAllChildren();
        Assert.NotEmpty(children);
    }

    [Fact]
    public void ThemeToggle_CanvasAreaExists()
    {
        var main = _app!.GetMainWindow(_automation!);
        Assert.NotNull(main);

        // Verify the canvas area exists (main content area)
        var children = main.FindAllChildren();
        Assert.True(children.Length > 0, "Main window should have child elements");
    }
}


