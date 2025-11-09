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
    }
