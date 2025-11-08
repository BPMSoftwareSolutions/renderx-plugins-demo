using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;
using System.Collections.Immutable;

namespace MusicalConductor.Analyzers;

/// <summary>
/// Roslyn analyzer for enforcing handler guardrails.
/// </summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public class HandlerGuardrailsAnalyzer : DiagnosticAnalyzer
{
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(
            Diagnostics.MC001_MustInheritFromHandlerBase,
            Diagnostics.MC002_MustBeInAppHandlersNamespace,
            Diagnostics.MC003_OnlyOneHandlerPerFile,
            Diagnostics.MC004_HandlerNameMustEndWithHandler,
            Diagnostics.MC005_MustImplementExecute);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();

        context.RegisterSyntaxTreeAction(AnalyzeSyntaxTree);
    }

    private void AnalyzeSyntaxTree(SyntaxTreeAnalysisContext context)
    {
        var root = (CompilationUnitSyntax)context.Tree.GetRoot();
        var handlerClasses = root.DescendantNodes()
            .OfType<ClassDeclarationSyntax>()
            .Where(c => IsHandlerClass(c))
            .ToList();

        if (handlerClasses.Count == 0)
            return;

        // MC003: Check for multiple handlers in one file
        if (handlerClasses.Count() > 1)
        {
            foreach (var handler in handlerClasses)
            {
                var diagnostic = Diagnostic.Create(
                    Diagnostics.MC003_OnlyOneHandlerPerFile,
                    handler.GetLocation());
                context.ReportDiagnostic(diagnostic);
            }
        }

        // Analyze each handler class
        foreach (var handlerClass in handlerClasses)
        {
            AnalyzeHandlerClass(context, handlerClass);
        }
    }

    private void AnalyzeHandlerClass(SyntaxTreeAnalysisContext context, ClassDeclarationSyntax classDecl)
    {
        var semanticModel = context.Tree.GetRoot().SyntaxTree;

        // MC004: Check class name ends with 'Handler'
        if (!classDecl.Identifier.Text.EndsWith("Handler"))
        {
            var diagnostic = Diagnostic.Create(
                Diagnostics.MC004_HandlerNameMustEndWithHandler,
                classDecl.Identifier.GetLocation(),
                classDecl.Identifier.Text);
            context.ReportDiagnostic(diagnostic);
        }

        // MC001: Check if inherits from HandlerBase
        var inheritsFromHandlerBase = classDecl.BaseList?.Types
            .Any(t => t.Type.ToString().Contains("HandlerBase")) ?? false;

        if (!inheritsFromHandlerBase)
        {
            var diagnostic = Diagnostic.Create(
                Diagnostics.MC001_MustInheritFromHandlerBase,
                classDecl.Identifier.GetLocation(),
                classDecl.Identifier.Text);
            context.ReportDiagnostic(diagnostic);
        }

        // MC002: Check namespace is App.Handlers
        var namespaceDecl = classDecl.Ancestors()
            .OfType<NamespaceDeclarationSyntax>()
            .FirstOrDefault();

        if (namespaceDecl != null)
        {
            var namespaceName = namespaceDecl.Name.ToString();
            if (!namespaceName.EndsWith("App.Handlers") && !namespaceName.Equals("App.Handlers"))
            {
                var diagnostic = Diagnostic.Create(
                    Diagnostics.MC002_MustBeInAppHandlersNamespace,
                    classDecl.Identifier.GetLocation(),
                    classDecl.Identifier.Text,
                    namespaceName);
                context.ReportDiagnostic(diagnostic);
            }
        }

        // MC005: Check if implements Execute method
        var hasExecuteMethod = classDecl.Members
            .OfType<MethodDeclarationSyntax>()
            .Any(m => m.Identifier.Text == "Execute");

        if (!hasExecuteMethod)
        {
            var diagnostic = Diagnostic.Create(
                Diagnostics.MC005_MustImplementExecute,
                classDecl.Identifier.GetLocation(),
                classDecl.Identifier.Text);
            context.ReportDiagnostic(diagnostic);
        }
    }

    private bool IsHandlerClass(ClassDeclarationSyntax classDecl)
    {
        // Check if class name ends with Handler
        if (!classDecl.Identifier.Text.EndsWith("Handler"))
            return false;

        // Check if it's in App.Handlers namespace or inherits from HandlerBase
        var namespaceDecl = classDecl.Ancestors()
            .OfType<NamespaceDeclarationSyntax>()
            .FirstOrDefault();

        var inHandlersNamespace = namespaceDecl?.Name.ToString().Contains("Handlers") ?? false;
        var inheritsFromHandlerBase = classDecl.BaseList?.Types
            .Any(t => t.Type.ToString().Contains("HandlerBase")) ?? false;

        return inHandlersNamespace || inheritsFromHandlerBase;
    }
}

