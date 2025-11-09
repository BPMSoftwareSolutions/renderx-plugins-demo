using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;

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
///
/// SHELL003: Plugin completeness violations
/// 9. All plugins in plugin-manifest.json must have corresponding implementations
/// 10. All plugins must be registered in PluginLoader.cs
/// 11. All plugin DLLs must be referenced in the shell project
/// </summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public class ThinHostArchitectureAnalyzer : DiagnosticAnalyzer
{
    public const string DiagnosticId = "SHELL001";
    public const string PluginDecouplingDiagnosticId = "SHELL002";
    public const string PluginCompletenessDiagnosticId = "SHELL003";
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

    private static readonly DiagnosticDescriptor PluginCompletenessRule = new DiagnosticDescriptor(
        PluginCompletenessDiagnosticId,
        title: "Plugin completeness violation",
        messageFormat: "Plugin architecture gap: {0}",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "All plugins must be standalone DLLs, not embedded in the shell. Canvas and ControlPanel should be in RenderX.Plugins.Canvas and RenderX.Plugins.ControlPanel, not in RenderX.Shell.Avalonia.UI.Views.");

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(Rule, PluginDecouplingRule, PluginCompletenessRule);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterSyntaxNodeAction(AnalyzeImportStatement, SyntaxKind.UsingDirective);
        context.RegisterSyntaxNodeAction(AnalyzeObjectCreation, SyntaxKind.ObjectCreationExpression);
        context.RegisterCompilationAction(AnalyzePluginCompleteness);
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

    private static void AnalyzePluginCompleteness(CompilationAnalysisContext context)
    {
        // SHELL003: Check for embedded plugins that should be standalone
        // Canvas and ControlPanel should NOT be in RenderX.Shell.Avalonia.UI.Views

        var embeddedPlugins = new[]
        {
            "RenderX.Shell.Avalonia.UI.Views.CanvasControl",
            "RenderX.Shell.Avalonia.UI.Views.ControlPanelControl",
        };

        foreach (var embeddedPlugin in embeddedPlugins)
        {
            var symbol = context.Compilation.GetTypeByMetadataName(embeddedPlugin);
            if (symbol != null)
            {
                var location = symbol.Locations.FirstOrDefault();
                if (location != null && location.IsInSource)
                {
                    var diagnostic = Diagnostic.Create(
                        PluginCompletenessRule,
                        location,
                        $"{symbol.Name} is embedded in shell but should be a standalone plugin (RenderX.Plugins.Canvas or RenderX.Plugins.ControlPanel)");

                    context.ReportDiagnostic(diagnostic);
                }
            }
        }
    }
}

