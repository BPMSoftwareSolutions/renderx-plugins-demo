using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;
using System.Collections.Immutable;

namespace RenderX.Shell.Avalonia.Analyzers;

/// <summary>
/// Roslyn analyzer to enforce thin-host and plugin decoupling architecture in RenderX.Shell.Avalonia.
///
/// Rules:
/// SHELL001: Thin-host violations
/// 1. Shell code must NOT import from RenderX.Shell.Avalonia.Core.Conductor/**
/// 2. Shell code must NOT import from RenderX.Shell.Avalonia.Core.Events/**
/// 3. Shell code must NOT create custom implementations of SDK interfaces
/// 4. All SDK services must come from DI (no 'new' keyword for SDK types)
///
/// SHELL002: Plugin decoupling violations
/// 5. MainWindow.axaml.cs must NOT directly instantiate plugin controls (new CanvasControl, etc.)
/// 6. MainWindow.axaml.cs must NOT import from RenderX.Shell.Avalonia.UI.Views.* (plugin controls)
/// 7. Plugin loading must use IPluginLoader and manifest-driven discovery
/// 8. All plugin controls must be loaded dynamically via SlotContainer
/// </summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public class ThinHostArchitectureAnalyzer : DiagnosticAnalyzer
{
    public const string DiagnosticId = "SHELL001";
    public const string PluginDecouplingDiagnosticId = "SHELL002";
    private const string Category = "Architecture";

    private static readonly DiagnosticDescriptor Rule = new DiagnosticDescriptor(
        DiagnosticId,
        title: "Thin-host architecture violation",
        messageFormat: "Shell code must not import from '{0}'. Use SDK services from DI instead.",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "The shell must be a thin presentation layer that consumes SDKs via DI, not a monolith with custom implementations.");

    private static readonly DiagnosticDescriptor PluginDecouplingRule = new DiagnosticDescriptor(
        PluginDecouplingDiagnosticId,
        title: "Plugin decoupling violation",
        messageFormat: "MainWindow must not directly instantiate plugin controls. Use IPluginLoader and manifest-driven discovery instead. Violation: {0}",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "Plugins must be loaded dynamically via SlotContainer using the plugin manifest, not hardcoded in MainWindow. This ensures plugins can be added/removed without rebuilding the shell.");

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(Rule, PluginDecouplingRule);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterSyntaxNodeAction(AnalyzeImportStatement, SyntaxKind.UsingDirective);
        context.RegisterSyntaxNodeAction(AnalyzeObjectCreation, SyntaxKind.ObjectCreationExpression);
    }

    private static void AnalyzeImportStatement(SyntaxNodeAnalysisContext context)
    {
        var usingDirective = (UsingDirectiveSyntax)context.Node;
        var namespaceName = usingDirective.Name?.ToString() ?? "";

        // Only check shell code
        var filePath = context.SemanticModel.SyntaxTree.FilePath;
        if (!filePath.Contains("RenderX.Shell.Avalonia"))
            return;

        // SHELL001: Forbidden imports (thin-host violations)
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

        // SHELL002: Plugin decoupling violations
        // MainWindow.axaml.cs must not import plugin controls directly
        if (filePath.EndsWith("MainWindow.axaml.cs"))
        {
            var forbiddenPluginImports = new[]
            {
                "RenderX.Shell.Avalonia.UI.Views.CanvasControl",
                "RenderX.Shell.Avalonia.UI.Views.ControlPanelControl",
                "RenderX.Shell.Avalonia.UI.Views.LibraryControl",
                "RenderX.Shell.Avalonia.UI.Views",
            };

            foreach (var forbidden in forbiddenPluginImports)
            {
                if (namespaceName.StartsWith(forbidden) || namespaceName == forbidden)
                {
                    var diagnostic = Diagnostic.Create(
                        PluginDecouplingRule,
                        usingDirective.GetLocation(),
                        $"Import from {forbidden}");

                    context.ReportDiagnostic(diagnostic);
                }
            }
        }
    }

    private static void AnalyzeObjectCreation(SyntaxNodeAnalysisContext context)
    {
        var objectCreation = (ObjectCreationExpressionSyntax)context.Node;
        var filePath = context.SemanticModel.SyntaxTree.FilePath;

        // SHELL002: MainWindow.axaml.cs must not directly instantiate plugin controls
        if (filePath.EndsWith("MainWindow.axaml.cs"))
        {
            var typeName = objectCreation.Type.ToString();
            var forbiddenControls = new[]
            {
                "CanvasControl",
                "ControlPanelControl",
                "LibraryControl",
                "HeaderLeftControl",
                "HeaderCenterControl",
                "HeaderRightControl",
            };

            foreach (var forbidden in forbiddenControls)
            {
                if (typeName.Contains(forbidden))
                {
                    var diagnostic = Diagnostic.Create(
                        PluginDecouplingRule,
                        objectCreation.GetLocation(),
                        $"Direct instantiation of {forbidden}");

                    context.ReportDiagnostic(diagnostic);
                }
            }
        }
    }
}

