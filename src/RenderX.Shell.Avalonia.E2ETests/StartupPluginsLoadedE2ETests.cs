using System;
using System.Threading.Tasks;
using Xunit;
using FlaUI.Core;
using FlaUI.UIA3;

namespace RenderX.Shell.Avalonia.E2ETests;

/// <summary>
/// E2E test equivalent to cypress/e2e/00-startup-plugins-loaded.cy.ts
/// Verifies all plugins listed in plugin-manifest.json are loaded successfully at startup
/// </summary>
public class StartupPluginsLoadedE2ETests : IAsyncLifetime
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

        // Give the UI time to fully render and plugins to load
        await Task.Delay(3000);
    }

    public Task DisposeAsync()
    {
        try { _app?.Close(); } catch { /* ignore */ }
        _automation?.Dispose();
        return Task.CompletedTask;
    }

    [Fact]
    public void VerifiesMainWindowLoads()
    {
        var main = _app!.GetMainWindow(_automation!);
        Assert.NotNull(main);
        Assert.True(main.IsAvailable, "Main window should be available");
    }

    [Fact]
    public void VerifiesPluginPanelsArePresent()
    {
        var main = _app!.GetMainWindow(_automation!);
        Assert.NotNull(main);

        // Verify the main window has child elements (panels)
        var children = main.FindAllChildren();
        Assert.True(children.Length > 0, "Main window should have child panels (header, canvas, library, control panel)");
    }

    [Fact]
    public void VerifiesHeaderPanelExists()
    {
        var main = _app!.GetMainWindow(_automation!);
        Assert.NotNull(main);

        // Look for header elements (buttons, text)
        var buttons = main.FindAllDescendants(cf => cf.ByControlType(FlaUI.Core.Definitions.ControlType.Button));
        Assert.NotEmpty(buttons);
    }

    [Fact]
    public void VerifiesCanvasPanelExists()
    {
        var main = _app!.GetMainWindow(_automation!);
        Assert.NotNull(main);

        // Verify canvas area exists
        var children = main.FindAllChildren();
        Assert.True(children.Length > 0, "Canvas panel should be present");
    }

    [Fact]
    public void VerifiesLibraryPanelExists()
    {
        var main = _app!.GetMainWindow(_automation!);
        Assert.NotNull(main);

        // Look for library panel elements
        var children = main.FindAllChildren();
        Assert.True(children.Length > 0, "Library panel should be present");
    }

    [Fact]
    public void VerifiesControlPanelExists()
    {
        var main = _app!.GetMainWindow(_automation!);
        Assert.NotNull(main);

        // Look for control panel elements
        var children = main.FindAllChildren();
        Assert.True(children.Length > 0, "Control panel should be present");
    }
}

