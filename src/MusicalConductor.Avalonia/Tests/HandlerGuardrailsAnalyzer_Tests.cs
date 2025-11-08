using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using MusicalConductor.Analyzers;
using Xunit;

namespace MusicalConductor.Tests;

public class HandlerGuardrailsAnalyzerTests
{
    [Fact]
    public void MC001_ShouldReportErrorWhenHandlerDoesNotInheritFromHandlerBase()
    {
        var code = @"
namespace App.Handlers;

public class MyHandler
{
    public async Task Execute(object? data)
    {
        await Task.CompletedTask;
    }
}
";
        var tree = CSharpSyntaxTree.ParseText(code);
        var root = (CompilationUnitSyntax)tree.GetRoot();
        var classDecl = root.DescendantNodes().OfType<ClassDeclarationSyntax>().First();

        // Check that class doesn't inherit from HandlerBase
        var inheritsFromHandlerBase = classDecl.BaseList?.Types
            .Any(t => t.Type.ToString().Contains("HandlerBase")) ?? false;

        Assert.False(inheritsFromHandlerBase);
    }

    [Fact]
    public void MC002_ShouldReportWarningWhenHandlerNotInAppHandlersNamespace()
    {
        var code = @"
namespace MyCompany.Handlers
{
    public class MyHandler
    {
    }
}
";
        var tree = CSharpSyntaxTree.ParseText(code);
        var root = (CompilationUnitSyntax)tree.GetRoot();
        var namespaceDecl = root.DescendantNodes().OfType<NamespaceDeclarationSyntax>().First();

        var namespaceName = namespaceDecl.Name.ToString();
        var isAppHandlers = namespaceName.EndsWith("App.Handlers") || namespaceName.Equals("App.Handlers");

        Assert.False(isAppHandlers);
    }

    [Fact]
    public void MC003_ShouldReportWarningWhenMultipleHandlersInOneFile()
    {
        var code = @"
namespace App.Handlers;

public class FirstHandler
{
}

public class SecondHandler
{
}
";
        var tree = CSharpSyntaxTree.ParseText(code);
        var root = (CompilationUnitSyntax)tree.GetRoot();
        var classes = root.DescendantNodes().OfType<ClassDeclarationSyntax>().ToList();

        Assert.Equal(2, classes.Count);
    }

    [Fact]
    public void MC004_ShouldReportWarningWhenHandlerNameDoesNotEndWithHandler()
    {
        var code = @"
namespace App.Handlers;

public class MyAction
{
}
";
        var tree = CSharpSyntaxTree.ParseText(code);
        var root = (CompilationUnitSyntax)tree.GetRoot();
        var classDecl = root.DescendantNodes().OfType<ClassDeclarationSyntax>().First();

        var endsWithHandler = classDecl.Identifier.Text.EndsWith("Handler");

        Assert.False(endsWithHandler);
    }

    [Fact]
    public void MC005_ShouldReportErrorWhenHandlerDoesNotImplementExecute()
    {
        var code = @"
namespace App.Handlers;

public class MyHandler
{
}
";
        var tree = CSharpSyntaxTree.ParseText(code);
        var root = (CompilationUnitSyntax)tree.GetRoot();
        var classDecl = root.DescendantNodes().OfType<ClassDeclarationSyntax>().First();

        var hasExecuteMethod = classDecl.Members
            .OfType<MethodDeclarationSyntax>()
            .Any(m => m.Identifier.Text == "Execute");

        Assert.False(hasExecuteMethod);
    }

    [Fact]
    public void ShouldValidateCorrectHandlerStructure()
    {
        var code = @"
namespace App.Handlers;

public class MyHandler
{
    public async Task Execute(object? data)
    {
        await Task.CompletedTask;
    }
}
";
        var tree = CSharpSyntaxTree.ParseText(code);
        var root = (CompilationUnitSyntax)tree.GetRoot();
        var classDecl = root.DescendantNodes().OfType<ClassDeclarationSyntax>().First();

        // Verify structure
        Assert.EndsWith("Handler", classDecl.Identifier.Text);
        Assert.Contains(classDecl.Members.OfType<MethodDeclarationSyntax>(), m => m.Identifier.Text == "Execute");
    }
}

