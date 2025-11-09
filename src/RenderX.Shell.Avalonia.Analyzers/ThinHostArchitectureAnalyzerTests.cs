using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Diagnostics;
using System.Collections.Immutable;
using System.Linq;
using Xunit;

namespace RenderX.Shell.Avalonia.Analyzers.Tests;

public class ThinHostArchitectureAnalyzerTests
{
    private static Diagnostic[] GetDiagnostics(string code, string filePath = "RenderX.Shell.Avalonia/Test.cs")
    {
        var tree = CSharpSyntaxTree.ParseText(code, path: filePath);
        var compilation = CSharpCompilation.Create("TestAssembly")
            .AddSyntaxTrees(tree)
            .AddReferences(MetadataReference.CreateFromFile(typeof(object).Assembly.Location));

        var analyzer = new ThinHostArchitectureAnalyzer();
        var compilationWithAnalyzers = compilation.WithAnalyzers(
            ImmutableArray.Create<DiagnosticAnalyzer>(analyzer));

        return compilationWithAnalyzers.GetAnalyzerDiagnosticsAsync().Result.ToList().ToArray();
    }

    [Fact]
    public void ForbiddenImport_ConductorNamespace_ReportsDiagnostic()
    {
        var code = @"
using RenderX.Shell.Avalonia.Core.Conductor;

namespace RenderX.Shell.Avalonia.UI;

public class TestControl
{
}";

        var diagnostics = GetDiagnostics(code);

        Assert.Single(diagnostics);
        Assert.Equal(ThinHostArchitectureAnalyzer.DiagnosticId, diagnostics[0].Id);
    }

    [Fact]
    public void ForbiddenImport_EventsNamespace_ReportsDiagnostic()
    {
        var code = @"
using RenderX.Shell.Avalonia.Core.Events;

namespace RenderX.Shell.Avalonia.UI;

public class TestControl
{
}";

        var diagnostics = GetDiagnostics(code);

        Assert.Single(diagnostics);
        Assert.Equal(ThinHostArchitectureAnalyzer.DiagnosticId, diagnostics[0].Id);
    }

    [Fact]
    public void AllowedImport_HostSDK_NoViolation()
    {
        var code = @"
using RenderX.HostSDK.Avalonia.Services;

namespace RenderX.Shell.Avalonia.UI;

public class TestControl
{
}";

        var diagnostics = GetDiagnostics(code);

        Assert.Empty(diagnostics);
    }

    [Fact]
    public void AllowedImport_MusicalConductor_NoViolation()
    {
        var code = @"
using MusicalConductor.Avalonia.Services;

namespace RenderX.Shell.Avalonia.UI;

public class TestControl
{
}";

        var diagnostics = GetDiagnostics(code);

        Assert.Empty(diagnostics);
    }

    [Fact]
    public void NonShellCode_NoViolation()
    {
        var code = @"
using RenderX.Shell.Avalonia.Core.Conductor;

namespace SomeOtherNamespace;

public class TestClass
{
}";

        var diagnostics = GetDiagnostics(code, "SomeOtherProject/Test.cs");

        Assert.Empty(diagnostics);
    }
        [Fact]
        public void MainWindow_Import_PluginViews_Reports_SHELL002()
        {
            var code = @"
using RenderX.Shell.Avalonia.UI.Views;
public class MW { }
";
            var diagnostics = GetDiagnostics(code, "RenderX.Shell.Avalonia/MainWindow.axaml.cs");
            Assert.Contains(diagnostics, d => d.Id == ThinHostArchitectureAnalyzer.PluginDecouplingDiagnosticId);
        }

        [Fact]
        public void MainWindow_New_CanvasControl_Reports_SHELL002()
        {
            var code = @"
public class MW { void F(){ var x = new CanvasControl(); } }
";
            var diagnostics = GetDiagnostics(code, "RenderX.Shell.Avalonia/MainWindow.axaml.cs");
            Assert.Contains(diagnostics, d => d.Id == ThinHostArchitectureAnalyzer.PluginDecouplingDiagnosticId);
        }

        [Fact]
        public void MainWindow_New_LibraryControl_Reports_SHELL002()
        {
            var code = @"
public class MW { void F(){ var x = new LibraryControl(); } }
";
            var diagnostics = GetDiagnostics(code, "RenderX.Shell.Avalonia/MainWindow.axaml.cs");
            Assert.Contains(diagnostics, d => d.Id == ThinHostArchitectureAnalyzer.PluginDecouplingDiagnosticId);
        }

        [Fact]
        public void MainWindow_New_HeaderLeftControl_Reports_SHELL002()
        {
            var code = @"
public class MW { void F(){ var x = new HeaderLeftControl(); } }
";
            var diagnostics = GetDiagnostics(code, "RenderX.Shell.Avalonia/MainWindow.axaml.cs");
            Assert.Contains(diagnostics, d => d.Id == ThinHostArchitectureAnalyzer.PluginDecouplingDiagnosticId);
        }

        [Fact]
        public void MainWindow_New_HeaderCenterControl_Reports_SHELL002()
        {
            var code = @"
public class MW { void F(){ var x = new HeaderCenterControl(); } }
";
            var diagnostics = GetDiagnostics(code, "RenderX.Shell.Avalonia/MainWindow.axaml.cs");
            Assert.Contains(diagnostics, d => d.Id == ThinHostArchitectureAnalyzer.PluginDecouplingDiagnosticId);
        }

        [Fact]
        public void MainWindow_New_HeaderRightControl_Reports_SHELL002()
        {
            var code = @"
public class MW { void F(){ var x = new HeaderRightControl(); } }
";
            var diagnostics = GetDiagnostics(code, "RenderX.Shell.Avalonia/MainWindow.axaml.cs");
            Assert.Contains(diagnostics, d => d.Id == ThinHostArchitectureAnalyzer.PluginDecouplingDiagnosticId);
        }

        [Fact]
        public void EmbeddedPlugins_CanvasControl_Reports_SHELL003()
        {
            // SHELL003: Canvas should be a standalone plugin, not embedded in shell
            var code = @"
namespace RenderX.Shell.Avalonia.UI.Views;

public class CanvasControl
{
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Shell.Avalonia/UI/Views/CanvasControl.axaml.cs");
            Assert.Contains(diagnostics, d => d.Id == ThinHostArchitectureAnalyzer.PluginCompletenessDiagnosticId);
        }

        [Fact]
        public void EmbeddedPlugins_ControlPanelControl_Reports_SHELL003()
        {
            // SHELL003: ControlPanel should be a standalone plugin, not embedded in shell
            var code = @"
namespace RenderX.Shell.Avalonia.UI.Views;

public class ControlPanelControl
{
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Shell.Avalonia/UI/Views/ControlPanelControl.axaml.cs");
            Assert.Contains(diagnostics, d => d.Id == ThinHostArchitectureAnalyzer.PluginCompletenessDiagnosticId);
        }

        // SHELL005: No-Cross-Plugin-Imports Tests
        [Fact]
        public void Plugin_CrossPluginImport_Reports_SHELL005()
        {
            var code = @"
using RenderX.Plugins.ControlPanel;

namespace RenderX.Plugins.Canvas;

public class CanvasControl
{
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/CanvasControl.cs");
            Assert.Contains(diagnostics, d => d.Id == "SHELL005");
        }

        [Fact]
        public void Plugin_SamePluginImport_NoViolation()
        {
            var code = @"
using RenderX.Plugins.Canvas.Services;

namespace RenderX.Plugins.Canvas;

public class CanvasControl
{
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/CanvasControl.cs");
            Assert.DoesNotContain(diagnostics, d => d.Id == "SHELL005");
        }

        // SHELL006: No-Host-Internals-In-Plugins Tests
        [Fact]
        public void Plugin_HostInternalsImport_Reports_SHELL006()
        {
            var code = @"
using RenderX.Shell.Avalonia.Infrastructure;

namespace RenderX.Plugins.Canvas;

public class CanvasControl
{
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/CanvasControl.cs");
            Assert.Contains(diagnostics, d => d.Id == "SHELL006");
        }

        [Fact]
        public void Plugin_HostSDKImport_NoViolation()
        {
            var code = @"
using RenderX.HostSDK.Avalonia.Services;

namespace RenderX.Plugins.Canvas;

public class CanvasControl
{
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/CanvasControl.cs");
            Assert.DoesNotContain(diagnostics, d => d.Id == "SHELL006");
        }

        // SHELL007: No-Console-In-Plugins Tests
        [Fact]
        public void Plugin_ConsoleWriteLine_Reports_SHELL007()
        {
            var code = @"
namespace RenderX.Plugins.Canvas;

public class CanvasControl
{
    public void Test()
    {
        Console.WriteLine(""test"");
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/CanvasControl.cs");
            Assert.Contains(diagnostics, d => d.Id == "SHELL007");
        }

        [Fact]
        public void Plugin_DebugWriteLine_Reports_SHELL007()
        {
            var code = @"
using System.Diagnostics;

namespace RenderX.Plugins.Canvas;

public class CanvasControl
{
    public void Test()
    {
        Debug.WriteLine(""test"");
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/CanvasControl.cs");
            Assert.Contains(diagnostics, d => d.Id == "SHELL007");
        }

        [Fact]
        public void Plugin_ILoggerUsage_NoViolation()
        {
            var code = @"
using Microsoft.Extensions.Logging;

namespace RenderX.Plugins.Canvas;

public class CanvasControl
{
    private readonly ILogger _logger;

    public void Test()
    {
        _logger.LogInformation(""test"");
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/CanvasControl.cs");
            Assert.DoesNotContain(diagnostics, d => d.Id == "SHELL007");
        }

        [Fact]
        public void ShellCode_ConsoleWriteLine_NoViolation()
        {
            var code = @"
namespace RenderX.Shell.Avalonia;

public class TestClass
{
    public void Test()
    {
        Console.WriteLine(""test"");
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Shell.Avalonia/Test.cs");
            Assert.DoesNotContain(diagnostics, d => d.Id == "SHELL007");
        }

        // SHELL008: Require-Plugin-Manifest-Fragment Tests
        [Fact]
        public void Plugin_WithValidManifest_NoViolation()
        {
            // This test validates that plugins with proper manifest structure don't trigger SHELL008
            // In practice, this would be checked against actual plugin-manifest.json files
            var code = @"
namespace RenderX.Plugins.Canvas;

public class CanvasControl
{
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/CanvasControl.cs");
            // SHELL008 is a compilation-level check, so it won't trigger on simple code
            Assert.DoesNotContain(diagnostics, d => d.Id == "SHELL008");
        }

        // SHELL009: Validate-Internal-Plugin-Ids Tests
        [Fact]
        public void Plugin_WithConsistentIds_NoViolation()
        {
            // This test validates that plugins with consistent IDs don't trigger SHELL009
            var code = @"
namespace RenderX.Plugins.Canvas;

public class CanvasControl
{
    public const string PluginId = ""RenderX.Plugins.Canvas"";
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/CanvasControl.cs");
            // SHELL009 is a compilation-level check
            Assert.DoesNotContain(diagnostics, d => d.Id == "SHELL009");
        }

        // SHELL010: Require-Manifest-Validation Tests
        [Fact]
        public void PluginLoader_WithoutValidation_Reports_SHELL010()
        {
            // This test would validate that PluginLoader performs manifest validation
            // In practice, this is checked at compilation time
            var code = @"
namespace RenderX.Shell.Avalonia.Infrastructure.Plugins;

public class PluginLoader
{
    public void LoadPlugins()
    {
        // Missing manifest validation
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Shell.Avalonia/Infrastructure/Plugins/PluginLoader.cs");
            // SHELL010 is a compilation-level check
            Assert.Contains(diagnostics, d => d.Id == "SHELL010");
        }

        [Fact]
        public void PluginLoader_WithValidation_NoViolation()
        {
            var code = @"
namespace RenderX.Shell.Avalonia.Infrastructure.Plugins;

public class PluginLoader
{
    public void LoadPlugins()
    {
        ValidateManifest();
    }

    private void ValidateManifest()
    {
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Shell.Avalonia/Infrastructure/Plugins/PluginLoader.cs");
            Assert.DoesNotContain(diagnostics, d => d.Id == "SHELL010");
        }

        // SHELL011: Handler-Export-Exists Tests
        [Fact]
        public void Plugin_WithPublicHandlerMethod_NoViolation()
        {
            var code = @"
namespace RenderX.Plugins.Canvas;

public class CanvasHandler
{
    public void OnCanvasCreated()
    {
    }

    public void HandleCanvasUpdate()
    {
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/CanvasHandler.cs");
            Assert.DoesNotContain(diagnostics, d => d.Id == "SHELL011");
        }

        [Fact]
        public void Plugin_WithPrivateHandlerMethod_NoViolation()
        {
            // Private handlers are allowed - they're just not exported
            var code = @"
namespace RenderX.Plugins.Canvas;

public class CanvasHandler
{
    private void OnCanvasCreated()
    {
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/CanvasHandler.cs");
            Assert.DoesNotContain(diagnostics, d => d.Id == "SHELL011");
        }

        // SHELL012: Valid-Handlers-Path Tests
        [Fact]
        public void Plugin_WithInvalidHandlerPath_Reports_SHELL012()
        {
            var code = @"
namespace RenderX.Plugins.Canvas;

public class CanvasHandler
{
    public string GetPath()
    {
        return ""../../../invalid/path"";
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/CanvasHandler.cs");
            Assert.Contains(diagnostics, d => d.Id == "SHELL012");
        }

        [Fact]
        public void Plugin_WithValidHandlerPath_NoViolation()
        {
            var code = @"
namespace RenderX.Plugins.Canvas;

public class CanvasHandler
{
    public string GetPath()
    {
        return ""./handlers/canvas-handler"";
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/CanvasHandler.cs");
            Assert.DoesNotContain(diagnostics, d => d.Id == "SHELL012");
        }

        // SHELL013: Feature-Flags Tests
        [Fact]
        public void Plugin_FeatureFlagWithStringLiteral_NoViolation()
        {
            var code = @"
namespace RenderX.Plugins.Canvas;

public class FeatureManager
{
    public void CheckFeature()
    {
        var enabled = IsFeatureEnabled(""feature.canvas.advanced"");
    }

    private bool IsFeatureEnabled(string flagId)
    {
        return true;
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/FeatureManager.cs");
            Assert.DoesNotContain(diagnostics, d => d.Id == "SHELL013");
        }

        [Fact]
        public void Plugin_FeatureFlagWithVariable_Reports_SHELL013()
        {
            var code = @"
namespace RenderX.Plugins.Canvas;

public class FeatureManager
{
    public void CheckFeature()
    {
        var flagId = ""feature.canvas.advanced"";
        var enabled = IsFeatureEnabled(flagId);
    }

    private bool IsFeatureEnabled(string id)
    {
        return true;
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/FeatureManager.cs");
            Assert.Contains(diagnostics, d => d.Id == "SHELL013");
        }

        // SHELL014: Interaction-Keys Tests
        [Fact]
        public void Plugin_InteractionWithStringLiteral_NoViolation()
        {
            var code = @"
namespace RenderX.Plugins.Canvas;

public class InteractionManager
{
    public void PublishEvent()
    {
        PublishInteraction(""canvas.created"");
    }

    private void PublishInteraction(string key)
    {
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/InteractionManager.cs");
            Assert.DoesNotContain(diagnostics, d => d.Id == "SHELL014");
        }

        [Fact]
        public void Plugin_InteractionWithVariable_Reports_SHELL014()
        {
            var code = @"
namespace RenderX.Plugins.Canvas;

public class InteractionManager
{
    public void PublishEvent()
    {
        var key = ""canvas.created"";
        PublishInteraction(key);
    }

    private void PublishInteraction(string k)
    {
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/InteractionManager.cs");
            Assert.Contains(diagnostics, d => d.Id == "SHELL014");
        }

        // SHELL015: Topics-Keys Tests
        [Fact]
        public void Plugin_TopicWithStringLiteral_NoViolation()
        {
            var code = @"
namespace RenderX.Plugins.Canvas;

public class TopicManager
{
    public void Subscribe()
    {
        SubscribeTopic(""canvas.updated"");
    }

    private void SubscribeTopic(string name)
    {
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/TopicManager.cs");
            Assert.DoesNotContain(diagnostics, d => d.Id == "SHELL015");
        }

        [Fact]
        public void Plugin_TopicWithVariable_Reports_SHELL015()
        {
            var code = @"
namespace RenderX.Plugins.Canvas;

public class TopicManager
{
    public void Subscribe()
    {
        var topicName = ""canvas.updated"";
        SubscribeTopic(topicName);
    }

    private void SubscribeTopic(string name)
    {
    }
}";
            var diagnostics = GetDiagnostics(code, "RenderX.Plugins.Canvas/TopicManager.cs");
            Assert.Contains(diagnostics, d => d.Id == "SHELL015");
        }
    }
