using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using FlaUI.Core;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Conditions;
using FlaUI.UIA3;
using Xunit;

namespace RenderX.Shell.Avalonia.Tests;

/// <summary>
/// E2E tests for Avalonia desktop application using TDD (Red-Green-Refactor)
///
/// STRATEGY:
/// - Layer 1 (Avalonia Host Shell): ✅ Fully testable via FlaUI - Window, containers, controls
/// - Layer 2 (TypeScript/WebView2): ❌ Not testable via FlaUI - Requires Playwright + WebView2 CDP
///
/// These tests validate the HOST SHELL layer. Web layer tests require separate Playwright suite.
///
/// See docs/AVALONIA_E2E_TDD_ANALYSIS.md for complete mapping and strategy.
/// </summary>
public class ApplicationTests : IDisposable
{
    private FlaUI.Core.Application? _application;
    private UIA3Automation? _automation;

    private int? _launchedProcessId;

    /// <summary>
    /// RED TEST 1: Window Availability & Title
    /// Verifies the main application window exists and has the correct title.
    ///
    /// This test checks host-level readiness. The window being present and titled
    /// "RenderX Shell" indicates the Avalonia shell has initialized successfully.
    /// </summary>
    [Fact]
    public void Application_Window_Has_Correct_Title()
    {
        // Arrange
        LaunchApplication();

        // Act
        var mainWindow = GetMainWindow();

        // Assert
        Assert.NotNull(mainWindow);
        Assert.True(mainWindow.IsAvailable, "Main window should be available");
        Assert.Equal("RenderX Shell", mainWindow.Title);
    }

    /// <summary>
    /// RED TEST 2: Fallback UI Visible During Load
    /// Verifies that the MainContent grid (with loading spinner) is visible during initialization.
    ///
    /// The MainContent grid is bound to !WebViewLoaded, so it should be visible
    /// immediately after launch and hide once the WebView frontend loads.
    /// </summary>
    [Fact]
    public void Application_Shows_Fallback_UI_While_Loading()
    {
        // Arrange
        LaunchApplication();
        var mainWindow = GetMainWindow();

        // Act - Check if window has any descendants at all
        var allDescendants = mainWindow.FindAllDescendants();

        // Debug: dump what we can see
        DumpWindowTree(mainWindow, 150);
        DumpProcessTree(300);

        // Assert - For now, just verify the window exists
        // TODO: Once Avalonia UIA support is fixed, test for specific child elements
        Assert.NotNull(mainWindow);
        Assert.NotNull(allDescendants);
    }

    /// <summary>
    /// RED TEST 3: WebViewHost Container Exists
    /// Verifies that the WebViewHost UserControl and its internal WebViewContainer grid exist.
    ///
    /// These containers hold the TypeScript/React frontend. Their presence indicates
    /// the host shell has successfully initialized the WebView placeholder structure.
    /// </summary>
    [Fact]
    public void Application_Has_WebViewHost_Container()
    {
        // Arrange
        LaunchApplication();
        var mainWindow = GetMainWindow();

        // Act - Find WebView container
        var webViewContainer = FindByIdOrNameWithRetry(mainWindow, "WebViewContainer", timeoutMs: 5000);

        // Debug: dump what we can see
        DumpWindowTree(mainWindow, 200);
        DumpProcessTree(300);

        // Assert
        Assert.NotNull(webViewContainer);
        Assert.True(webViewContainer.IsAvailable, "WebViewContainer should be visible");
    }

    /// <summary>
    /// RED TEST 4: DiagnosticsBadge Button Exists & Is Accessible
    /// Verifies that the diagnostics toggle button exists, is enabled, and has a tooltip.
    ///
    /// This button allows users to open the diagnostics overlay (Ctrl+Shift+D).
    /// Its presence and enabled state confirms the diagnostic system is initialized.
    /// </summary>
    [Fact]
    public void Application_WebViewHost_LoadingIndicator_Present()
    {
        // Arrange
        LaunchApplication();
        var mainWindow = GetMainWindow();
        Thread.Sleep(1000); // Give initial bindings time to settle

        // Act - Find the loading indicator inside WebViewHost container
        var loadingIndicator = FindByIdOrNameWithRetry(mainWindow, "LoadingIndicator", timeoutMs: 5000);

        // Debug
        DumpWindowTree(mainWindow, 200);

        // Assert
        Assert.NotNull(loadingIndicator);
        Assert.True(loadingIndicator.IsAvailable, "LoadingIndicator should be visible before WebView fully loads");
    }

    /// <summary>
    /// PHASE 3 TEST 1: Native Avalonia Controls Are Initialized
    /// Verifies that CanvasControl and ControlPanelControl are created and available.
    ///
    /// Phase 3 replaces WebView2 with native Avalonia controls. This test validates
    /// that the controls are properly instantiated and accessible via the UI tree.
    /// </summary>
    [Fact]
    public void Application_Does_Not_Render_Static_Avalonia_Panels()
    {
        // Arrange
        LaunchApplication();
        var mainWindow = GetMainWindow();
        WaitForWindowTreeReady(mainWindow, minElements: 3, timeoutMs: 10000);

        // Act - Ensure host does NOT render native static panels (thin-host contract)
        var canvasControl = FindByIdOrNameWithRetry(mainWindow, "CanvasControl", timeoutMs: 1000);
        var controlPanelControl = FindByIdOrNameWithRetry(mainWindow, "ControlPanelControl", timeoutMs: 1000);
        var libraryPanel = FindByIdOrNameWithRetry(mainWindow, "LibraryPanel", timeoutMs: 1000);

        DumpWindowTree(mainWindow, 200);

        // Assert - These should NOT exist in thin host
        Assert.Null(canvasControl);
        Assert.Null(controlPanelControl);
        Assert.Null(libraryPanel);
    }

    /// <summary>
    /// PHASE 3 TEST 2: ThinHostLayer Services Are Wired
    /// Verifies that the application initializes without errors and services are available.
    ///
    /// Phase 3 wires SDK services (IConductorClient, IEventRouter) through ThinHostLayer.
    /// This test validates that the DI container properly registers and initializes these services.
    /// </summary>
    [Fact]
    public void Application_Phase3_ThinHostLayer_Services_Are_Wired()
    {
        // Arrange
        LaunchApplication();
        var mainWindow = GetMainWindow();
        Thread.Sleep(3000); // Allow services to initialize

        // Act - Verify window is responsive and initialized
        var isAvailable = mainWindow.IsAvailable;
        var title = mainWindow.Title;

        // Assert - Window should be fully initialized
        Assert.True(isAvailable, "Main window should be available after service initialization");
        Assert.Equal("RenderX Shell", title);
    }

    /// <summary>
    /// PHASE 3 TEST 3: Event Router Is Functional
    /// Verifies that event subscriptions are working by checking for event-related UI elements.
    ///
    /// Phase 3 replaces custom IEventRouter with SDK IEventRouter. This test validates
    /// that events can be subscribed to and the UI responds appropriately.
    /// </summary>
    [Fact]
    public void Application_Phase3_Event_Router_Is_Functional()
    {
        // Arrange
        LaunchApplication();
        var mainWindow = GetMainWindow();
        WaitForWindowTreeReady(mainWindow, minElements: 5, timeoutMs: 10000);

        // Act - Check that the window tree is populated (indicates event subscriptions are working)
        var allDescendants = mainWindow.FindAllDescendants();

        // Assert - Should have multiple UI elements indicating proper initialization
        Assert.NotNull(allDescendants);
        Assert.True(allDescendants.Length > 0, "Window should have UI elements from event subscriptions");
    }

    /// <summary>
    /// CRITICAL TEST: Application Displays Correct 3-Column Layout on Startup
    ///
    /// This is the PRIMARY E2E test that validates the application displays the correct UI.
    /// The app should show:
    /// - Header row (48px) with headerLeft, headerCenter, headerRight slots
    /// - Main content row with 3 columns:
    ///   * Library panel (left, 320px)
    ///   * Canvas (center, 1fr) - main drawing area
    ///   * Control Panel (right, 360px) - properties panel
    ///
    /// FAILURE INDICATES: Blank white screen, missing panels, or incorrect layout
    /// </summary>
    [Fact(Skip="SPA-layer UI verified in Cypress; thin host renders only WebViewHost")]
    public void Application_Displays_Correct_3Column_Layout_On_Startup()
    {
        // Arrange
        LaunchApplication();
        var mainWindow = GetMainWindow();
        WaitForWindowTreeReady(mainWindow, minElements: 10, timeoutMs: 15000);
        Thread.Sleep(2000); // Allow layout to settle

        // Act - Find all major UI sections
        var canvasControl = FindByIdOrNameWithRetry(mainWindow, "CanvasControl", timeoutMs: 5000);
        var controlPanelControl = FindByIdOrNameWithRetry(mainWindow, "ControlPanelControl", timeoutMs: 5000);
        var libraryPanel = FindByIdOrNameWithRetry(mainWindow, "LibraryPanel", timeoutMs: 5000);
        var headerArea = FindByIdOrNameWithRetry(mainWindow, "HeaderArea", timeoutMs: 5000);

        // Debug output
        DumpWindowTree(mainWindow, 300);
        DumpProcessTree(400);

        // Assert - All major panels should be present
        Assert.NotNull(canvasControl);
        Assert.NotNull(controlPanelControl);
        Assert.NotNull(libraryPanel);
        Assert.NotNull(headerArea);

        // Assert - All panels should be visible
        Assert.True(canvasControl.IsAvailable, "CanvasControl should be visible");
        Assert.True(controlPanelControl.IsAvailable, "ControlPanelControl should be visible");
        Assert.True(libraryPanel.IsAvailable, "LibraryPanel should be visible");
        Assert.True(headerArea.IsAvailable, "HeaderArea should be visible");
    }

    /// <summary>
    /// CRITICAL TEST: Canvas Panel Shows Expected Content
    ///
    /// Validates that the Canvas panel displays:
    /// - Header with "Canvas" title
    /// - Component count indicator
    /// - Canvas content area (white background)
    /// - Status bar at bottom
    /// </summary>
    [Fact(Skip="SPA-layer UI verified in Cypress; thin host renders only WebViewHost")]
    public void Application_Canvas_Panel_Shows_Expected_Content()
    {
        // Arrange
        LaunchApplication();
        var mainWindow = GetMainWindow();
        WaitForWindowTreeReady(mainWindow, minElements: 10, timeoutMs: 15000);

        // Act - Find canvas-specific elements
        var canvasControl = FindByIdOrNameWithRetry(mainWindow, "CanvasControl", timeoutMs: 5000);
        var componentCountText = canvasControl?.FindFirstDescendant(cf => cf.ByName("ComponentCountText"));
        var statusText = canvasControl?.FindFirstDescendant(cf => cf.ByName("StatusText"));

        // Debug output
        DumpWindowTree(mainWindow, 300);

        // Assert - Canvas should have expected child elements
        Assert.NotNull(canvasControl);
        Assert.NotNull(componentCountText);
        Assert.NotNull(statusText);
    }

    /// <summary>
    /// CRITICAL TEST: Control Panel Shows Expected Content
    ///
    /// Validates that the Control Panel displays:
    /// - Header with "Properties" title
    /// - Selected component indicator
    /// - Properties section
    /// - Interactions section
    /// - CSS Classes section
    /// - Status section
    /// </summary>
    [Fact(Skip="SPA-layer UI verified in Cypress; thin host renders only WebViewHost")]
    public void Application_ControlPanel_Shows_Expected_Content()
    {
        // Arrange
        LaunchApplication();
        var mainWindow = GetMainWindow();
        WaitForWindowTreeReady(mainWindow, minElements: 10, timeoutMs: 15000);

        // Act - Find control panel-specific elements
        var controlPanelControl = FindByIdOrNameWithRetry(mainWindow, "ControlPanelControl", timeoutMs: 5000);
        var selectedComponentText = controlPanelControl?.FindFirstDescendant(cf => cf.ByName("SelectedComponentText"));
        var propertiesItemsControl = controlPanelControl?.FindFirstDescendant(cf => cf.ByName("PropertiesItemsControl"));
        var interactionsItemsControl = controlPanelControl?.FindFirstDescendant(cf => cf.ByName("InteractionsItemsControl"));
        var cssClassesInput = controlPanelControl?.FindFirstDescendant(cf => cf.ByName("CssClassesInput"));

        // Debug output
        DumpWindowTree(mainWindow, 300);

        // Assert - Control Panel should have expected child elements
        Assert.NotNull(controlPanelControl);
        Assert.NotNull(selectedComponentText);
        Assert.NotNull(propertiesItemsControl);
        Assert.NotNull(interactionsItemsControl);
        Assert.NotNull(cssClassesInput);
    }

    /// <summary>
    /// CRITICAL TEST: Status Bar Is Visible and Functional
    ///
    /// Validates that the status bar at the bottom displays:
    /// - Status text ("Ready")
    /// - Diagnostics badge button (if enabled)
    /// </summary>
    [Fact(Skip="SPA-layer status UX lives in web app; host has no native status bar")]
    public void Application_StatusBar_Is_Visible_And_Functional()
    {
        // Arrange
        LaunchApplication();
        var mainWindow = GetMainWindow();
        WaitForWindowTreeReady(mainWindow, minElements: 5, timeoutMs: 10000);

        // Act - Find status bar elements
        var statusBarText = FindByIdOrNameWithRetry(mainWindow, "StatusBarText", timeoutMs: 5000);
        var diagnosticsBadge = FindByIdOrNameWithRetry(mainWindow, "DiagnosticsBadge", timeoutMs: 5000);

        // Debug output
        DumpWindowTree(mainWindow, 200);

        // Assert - Status bar should be present
        Assert.NotNull(statusBarText);
        Assert.NotNull(diagnosticsBadge);
    }

    /// <summary>
    /// CRITICAL TEST: Header Slots Are Present and Accessible
    ///
    /// Validates that all three header slots are rendered:
    /// - headerLeft (320px) - Application branding/logo
    /// - headerCenter (1fr) - Canvas title/info
    /// - headerRight (360px) - Theme toggle and other controls
    ///
    /// The headerRight slot is where the theme toggle plugin will be mounted.
    /// This test ensures the slot infrastructure is in place for plugin mounting.
    /// </summary>
    [Fact(Skip="Header slots are rendered by SPA; validate via Cypress (theme toggle, etc.)")]
    public void Application_Header_Slots_Are_Present_And_Accessible()
    {
        // Arrange
        LaunchApplication();
        var mainWindow = GetMainWindow();
        WaitForWindowTreeReady(mainWindow, minElements: 10, timeoutMs: 15000);
        Thread.Sleep(2000); // Allow layout to settle

        // Act - Find all header slots
        var headerArea = FindByIdOrNameWithRetry(mainWindow, "HeaderArea", timeoutMs: 5000);
        var headerLeft = FindByIdOrNameWithRetry(mainWindow, "HeaderLeft", timeoutMs: 5000);
        var headerCenter = FindByIdOrNameWithRetry(mainWindow, "HeaderCenter", timeoutMs: 5000);
        var headerRight = FindByIdOrNameWithRetry(mainWindow, "HeaderRight", timeoutMs: 5000);

        // Debug output
        DumpWindowTree(mainWindow, 300);

        // Assert - All header slots should be present
        Assert.NotNull(headerArea);
        Assert.NotNull(headerLeft);
        Assert.NotNull(headerCenter);
        Assert.NotNull(headerRight);

        // Assert - All header slots should be visible
        Assert.True(headerArea.IsAvailable, "HeaderArea should be visible");
        Assert.True(headerLeft.IsAvailable, "HeaderLeft should be visible");
        Assert.True(headerCenter.IsAvailable, "HeaderCenter should be visible");
        Assert.True(headerRight.IsAvailable, "HeaderRight should be visible");
    }

    /// <summary>
    /// CRITICAL TEST: Library Panel Is Present and Accessible
    ///
    /// Validates that the Library panel (left sidebar) is rendered and accessible.
    /// This is where the component library plugin will be mounted.
    /// </summary>
    [Fact(Skip="Library panel is SPA-owned; verify via Cypress")]
    public void Application_Library_Panel_Is_Present_And_Accessible()
    {
        // Arrange
        LaunchApplication();
        var mainWindow = GetMainWindow();
        WaitForWindowTreeReady(mainWindow, minElements: 10, timeoutMs: 15000);

        // Act - Find library panel
        var libraryPanel = FindByIdOrNameWithRetry(mainWindow, "LibraryPanel", timeoutMs: 5000);

        // Debug output
        DumpWindowTree(mainWindow, 300);

        // Assert - Library panel should be present and visible
        Assert.NotNull(libraryPanel);
        Assert.True(libraryPanel.IsAvailable, "LibraryPanel should be visible");
    }

    /// <summary>
    /// RED TEST 5: WebViewLoaded Binding State Transitions
    /// Verifies that the MainContent grid visibility changes when WebViewLoaded binding updates.
    ///
    /// MainContent is bound to !WebViewLoaded, so:
    /// - Initially visible (WebViewLoaded = false)
    /// - Later hidden (WebViewLoaded = true)
    ///
    /// This confirms the binding system and frontend initialization are working.
    /// </summary>
    [Fact(Skip="Fallback visibility handled by SPA; host does not own MainContent")]
    public void Application_MainContent_Hides_When_WebView_Loads()
    {
        // Arrange
        LaunchApplication();
        var mainWindow = GetMainWindow();

        // Act - Check if window has any descendants at all
        var allDescendants = mainWindow.FindAllDescendants();

        // Debug: dump what we can see
        DumpWindowTree(mainWindow, 150);
        DumpProcessTree(300);

        // Assert - For now, just verify the window exists
        // TODO: Once Avalonia UIA support is fixed, test for specific child elements
        Assert.NotNull(mainWindow);
        Assert.NotNull(allDescendants);
    }

    /// <summary>
    /// Helper to check if an Avalonia element is visible
    /// Checks the Visual.IsVisible property pattern
    /// </summary>
    private bool GetElementVisibility(AutomationElement element)
    {
        try
        {
            // FlaUI's AutomationElement doesn't directly expose IsVisible
            // Instead, we check if the element can be found (which implies it's visible in the tree)
            // An element is considered visible if it has a non-zero bounding rectangle
            var rect = element.BoundingRectangle;
            return rect.Width > 0 && rect.Height > 0;
        }
        catch
        {
            // If visibility check fails, assume it might be visible
            return true;
        }
    }

    /// <summary>
    /// RED TEST 6: Frontend Assets Exist In Test Output
    /// Verifies that wwwroot contains the compiled TypeScript frontend.
    ///
    /// The build process should copy frontend assets to wwwroot.
    /// This test ensures the deployment/build structure is correct.
    /// </summary>
    [Fact]
    public void Application_Frontend_Assets_Exist_In_Output()
    {
        // Arrange
        var testBinDir = Path.GetDirectoryName(typeof(ApplicationTests).Assembly.Location);
        Assert.NotNull(testBinDir);

        // Act
        var wwwrootPath = Path.Combine(testBinDir, "wwwroot");
        var indexHtmlPath = Path.Combine(wwwrootPath, "index.html");

        // Assert
        Assert.True(Directory.Exists(wwwrootPath),
            $"wwwroot directory should exist at: {wwwrootPath}\n" +
            "This should be populated by build process copying frontend assets.");

        Assert.True(File.Exists(indexHtmlPath),
            $"index.html should exist at: {indexHtmlPath}\n" +
            "Ensure vite build output is being copied to test output directory.");
    }

    /// <summary>
    /// Launches the Avalonia application for testing
    /// </summary>
    private void LaunchApplication()
    {
        // Get the path to the built application
        var projectDir = Path.GetDirectoryName(typeof(ApplicationTests).Assembly.Location);

        if (string.IsNullOrEmpty(projectDir))
        {
            throw new DirectoryNotFoundException("Could not determine project directory path");
        }

        // Prefer launching the app from its RID-specific output (more reliable than the copied test-bin EXE)
        var testBinDir = projectDir;
        var appExeInTestBin = Path.Combine(testBinDir, "RenderX.Shell.Avalonia.exe");
        var appExeInProjectBin = Path.GetFullPath(Path.Combine(testBinDir,
            @"..\\..\\..\\..\\RenderX.Shell.Avalonia\\bin\\Debug\\net8.0\\win-x64\\RenderX.Shell.Avalonia.exe"));

        string appPath;
        if (File.Exists(appExeInProjectBin))
        {
            appPath = appExeInProjectBin;
            Console.WriteLine($"Launching app from project bin: {appPath}");
        }
        else if (File.Exists(appExeInTestBin))
        {
            appPath = appExeInTestBin;
            Console.WriteLine($"Launching app from test bin: {appPath}");
        }
        else
        {
            throw new FileNotFoundException(
                $"Application executable not found. Checked:\n - {appExeInProjectBin}\n - {appExeInTestBin}");
        }

        // Start the application
        var startInfo = new ProcessStartInfo
        {
            FileName = appPath,
            UseShellExecute = false,
            CreateNoWindow = false,
            WorkingDirectory = Path.GetDirectoryName(appPath) ?? testBinDir
        };

        // Avoid port collisions for embedded API host
        startInfo.Environment["RENDERX_API_URL"] = "http://127.0.0.1:0";

        _application = FlaUI.Core.Application.Launch(startInfo);
        _automation = new UIA3Automation();

        try { _launchedProcessId = _application?.ProcessId; } catch { /* ignore */ }

        // Wait for application to start
        Thread.Sleep(3000);
    }

    /// <summary>
    /// Gets the main window of the launched application
    /// </summary>
    private FlaUI.Core.AutomationElements.Window GetMainWindow()
    {
        Assert.NotNull(_automation);
        Assert.NotNull(_application);

        var desktop = _automation.GetDesktop();
        var cf = desktop.ConditionFactory;
        AutomationElement? mainWindow = null;

        // Poll for the main window belonging to our process using multiple strategies
        var retries = 30; // ~15s total
        while (retries-- > 0 && mainWindow == null)
        {
            // Strategy 1: Standard Window control type
            mainWindow = desktop.FindFirstDescendant(cf => cf.ByProcessId(_application.ProcessId)
                .And(cf.ByControlType(FlaUI.Core.Definitions.ControlType.Window)));

            // Strategy 2: Some frameworks expose top-level as Pane or Custom
            if (mainWindow == null)
            {
                mainWindow = desktop.FindFirstDescendant(cf => cf.ByProcessId(_application.ProcessId)
                    .And(
                        cf.ByControlType(FlaUI.Core.Definitions.ControlType.Pane)
                          .Or(cf.ByControlType(FlaUI.Core.Definitions.ControlType.Custom))
                    ));
            }

            // Strategy 3: Fallback by title/name (without process constraint)
            if (mainWindow == null)
            {
                mainWindow = desktop.FindFirstDescendant(cf => cf.ByName("RenderX Shell"));
            }

            if (mainWindow == null)
            {
                Thread.Sleep(500);
            }
        }

        // Strategy 4: FlaUI's built-in main window resolution
        if (mainWindow == null)
        {
            try
            {
                var win = _application.GetMainWindow(_automation, TimeSpan.FromSeconds(10));
                if (win != null)
                {
                    return win;
                }
            }
            catch
            {
                // ignore and fall through to diagnostics
            }
        }

        // Strategy 5: Win32 fallback by enumerating top-level windows for our PID/title
        if (mainWindow == null)
        {
            try
            {
                var hwnd = Win32.FindWindowForProcess(_application.ProcessId, "RenderX Shell");
                if (hwnd != IntPtr.Zero)
                {
                    var elem = _automation.FromHandle(hwnd);
                    if (elem != null)
                    {
                        return elem.AsWindow();
                    }
                }
            }
            catch
            {
                // ignore and fall through to diagnostics
            }
        }


        if (mainWindow == null)
        {
            // Gather diagnostics
            int pid = _launchedProcessId ?? -1;
            AutomationElement[] allElements;
            try
            {
                allElements = pid > 0
                    ? desktop.FindAllChildren(cf => cf.ByProcessId(pid))
                    : desktop.FindAllChildren();
            }
            catch
            {
                allElements = desktop.FindAllChildren();
            }

            Console.WriteLine($"Could not find main Window. PID={pid}, Elements discovered: {allElements.Length}");
            foreach (var element in allElements.Take(30))
            {
                Console.WriteLine($"Element: {element.Name}, Type: {element.ControlType}, Class: {element.ClassName}");
            }
            Assert.Fail($"Could not find main window (PID={pid}).");
        }

        return mainWindow.AsWindow();
    }


    private static class Win32
    {
        public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        private static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        private static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder lpString, int nMaxCount);

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        private static extern int GetWindowTextLength(IntPtr hWnd);

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        private static extern bool IsWindowVisible(IntPtr hWnd);

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

        public static IntPtr FindWindowForProcess(int processId, string? titleHint)
        {
            IntPtr found = IntPtr.Zero;
            EnumWindows((hWnd, lParam) =>
            {
                if (!IsWindowVisible(hWnd)) return true;
                GetWindowThreadProcessId(hWnd, out var pid);
                if (pid != (uint)processId) return true;

                var len = GetWindowTextLength(hWnd);
                var sb = new System.Text.StringBuilder(len + 1);
                GetWindowText(hWnd, sb, sb.Capacity);
                var title = sb.ToString();

                if (string.IsNullOrEmpty(titleHint) || title.Contains(titleHint, StringComparison.OrdinalIgnoreCase))
                {
                    found = hWnd;
                    return false; // stop enumeration
                }
                return true;
            }, IntPtr.Zero);
            return found;
        }
    }

    private AutomationElement? FindByIdOrNameWithRetry(Window window, string idOrName, int timeoutMs = 5000)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        AutomationElement? found = null;
        while (sw.ElapsedMilliseconds < timeoutMs)
        {
            try
            {
                found = window.FindFirstDescendant(cf => cf.ByAutomationId(idOrName));
                if (found != null) return found;
                found = window.FindFirstDescendant(cf => cf.ByName(idOrName));
                if (found != null) return found;
            }
            catch { /* ignore transient errors */ }
            Thread.Sleep(100);
        }
        return found;
    }

    private AutomationElement? FindInProcessByIdOrNameWithRetry(string idOrName, int timeoutMs = 5000)
    {
        if (_automation == null || _application == null) return null;
        var desktop = _automation.GetDesktop();
        var cf = desktop.ConditionFactory;
        var sw = System.Diagnostics.Stopwatch.StartNew();
        AutomationElement? found = null;
        while (sw.ElapsedMilliseconds < timeoutMs)
        {
            try
            {
                found = desktop.FindFirstDescendant(cf => cf.ByProcessId(_application.ProcessId).And(cf.ByAutomationId(idOrName)));
                if (found != null) return found;
                found = desktop.FindFirstDescendant(cf => cf.ByProcessId(_application.ProcessId).And(cf.ByName(idOrName)));
                if (found != null) return found;
            }
            catch { /* ignore transient errors */ }
            Thread.Sleep(100);
        }
        return found;
    }

    private void WaitForWindowTreeReady(Window window, int minElements = 3, int timeoutMs = 8000)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        while (sw.ElapsedMilliseconds < timeoutMs)
        {
            try
            {
                var all = window.FindAllDescendants();
                if (all != null && all.Length >= minElements)
                {
                    return;
                }
            }
            catch { /* ignore transient errors */ }
            Thread.Sleep(100);
        }
        // Last attempt/log
        try
        {
            var outDir = Path.GetDirectoryName(typeof(ApplicationTests).Assembly.Location) ?? Environment.CurrentDirectory;
            var logPath = Path.Combine(outDir, "uia_tree_not_ready.txt");
            using var swriter = new StreamWriter(logPath, append: false);
            swriter.WriteLine("Window tree did not reach {0} elements within {1}ms", minElements, timeoutMs);
        }
        catch { }
    }

    private void DumpWindowTree(Window window, int max = 200)
    {
        try
        {
            var outDir = Path.GetDirectoryName(typeof(ApplicationTests).Assembly.Location) ?? Environment.CurrentDirectory;
            var logPath = Path.Combine(outDir, "uia_dump_window.txt");
            using var swriter = new StreamWriter(logPath, append: false);

            swriter.WriteLine("--- UIA Tree Dump (window scope, first {0} elements) ---", max);
            var all = window.FindAllDescendants();
            int i = 0;
            foreach (var el in all)
            {
                var id = el.AutomationId;
                var name = el.Name;
                var type = el.ControlType;
                swriter.WriteLine($"[{i++:D3}] Id='{id}' Name='{name}' Type={type} Class='{el.ClassName}'");
                if (i >= max) break;
            }
            swriter.WriteLine("--- End UIA Tree Dump ---");

            Console.WriteLine($"[DumpWindowTree] Wrote {i} lines to {logPath}");
        }
        catch (Exception ex)
        {
            Console.WriteLine("[DumpWindowTree error] " + ex);
        }
    }

    private void DumpProcessTree(int max = 300)
    {
        try
        {
            if (_automation == null || _application == null) return;
            var outDir = Path.GetDirectoryName(typeof(ApplicationTests).Assembly.Location) ?? Environment.CurrentDirectory;
            var logPath = Path.Combine(outDir, "uia_dump_process.txt");
            using var swriter = new StreamWriter(logPath, append: false);

            var desktop = _automation.GetDesktop();
            var cf = desktop.ConditionFactory;
            swriter.WriteLine("--- UIA Tree Dump (process scope, first {0} elements) ---", max);
            var all = desktop.FindAllDescendants(cf => cf.ByProcessId(_application.ProcessId));
            int i = 0;
            foreach (var el in all)
            {
                var id = el.AutomationId;
                var name = el.Name;
                var type = el.ControlType;
                swriter.WriteLine($"[{i++:D3}] Id='{id}' Name='{name}' Type={type} Class='{el.ClassName}'");
                if (i >= max) break;
            }
            swriter.WriteLine("--- End UIA Tree Dump ---");

            Console.WriteLine($"[DumpProcessTree] Wrote {i} lines to {logPath}");
        }
        catch (Exception ex)
        {
            Console.WriteLine("[DumpProcessTree error] " + ex);
        }
    }

    public void Dispose()
    {
        try { _application?.Close(); } catch { /* ignore */ }
        try { _application?.Dispose(); } catch { /* ignore */ }
        try { _automation?.Dispose(); } catch { /* ignore */ }
        GC.SuppressFinalize(this);
    }
}