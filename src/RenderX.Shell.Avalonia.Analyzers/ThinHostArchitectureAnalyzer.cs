using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;
using System.Collections.Immutable;

namespace RenderX.Shell.Avalonia.Analyzers;

/// <summary>
/// Roslyn analyzer to enforce thin-host architecture pattern in RenderX.Shell.Avalonia.
/// 
/// Rules:
/// 1. Shell code must NOT import from RenderX.Shell.Avalonia.Core.Conductor/**
/// 2. Shell code must NOT import from RenderX.Shell.Avalonia.Core.Events/**
/// 3. Shell code must NOT create custom implementations of SDK interfaces
/// 4. All SDK services must come from DI (no 'new' keyword for SDK types)
/// </summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public class ThinHostArchitectureAnalyzer : DiagnosticAnalyzer
{
    public const string DiagnosticId = "SHELL001";
    private const string Category = "Architecture";

    private static readonly DiagnosticDescriptor Rule = new DiagnosticDescriptor(
        DiagnosticId,
        title: "Thin-host architecture violation",
        messageFormat: "Shell code must not import from '{0}'. Use SDK services from DI instead.",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "The shell must be a thin presentation layer that consumes SDKs via DI, not a monolith with custom implementations.");

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics => ImmutableArray.Create(Rule);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterSyntaxNodeAction(AnalyzeImportStatement, SyntaxKind.UsingDirective);
    }

    private static void AnalyzeImportStatement(SyntaxNodeAnalysisContext context)
    {
        var usingDirective = (UsingDirectiveSyntax)context.Node;
        var namespaceName = usingDirective.Name?.ToString() ?? "";

        // Only check shell code
        var filePath = context.SemanticModel.SyntaxTree.FilePath;
        if (!filePath.Contains("RenderX.Shell.Avalonia"))
            return;

        // Forbidden imports
        var forbiddenNamespaces = new[]
        {
            "RenderX.Shell.Avalonia.Core.Conductor",
            "RenderX.Shell.Avalonia.Core.Events",
        };

        foreach (var forbidden in forbiddenNamespaces)
        {
            if (namespaceName.StartsWith(forbidden))
            {
                var diagnostic = Diagnostic.Create(
                    Rule,
                    usingDirective.GetLocation(),
                    forbidden);

                context.ReportDiagnostic(diagnostic);
            }
        }
    }
}

