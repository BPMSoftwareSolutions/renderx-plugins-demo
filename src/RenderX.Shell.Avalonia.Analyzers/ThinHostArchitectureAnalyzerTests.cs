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
}

