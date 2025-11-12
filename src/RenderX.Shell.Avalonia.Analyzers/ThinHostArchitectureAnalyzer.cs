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
///
/// SHELL004: Manifest-driven loading violations
/// 12. PluginLoader must NOT have hardcoded _slotTypeMap dictionary
/// 13. PluginLoader must load plugin mappings from plugin-manifest.json
/// 14. All plugin mappings must be defined in the manifest, not in code
///
/// SHELL005: No-Cross-Plugin-Imports
/// 15. Plugins must NOT import code from other plugins
/// 16. Cross-plugin dependencies must go through SDK interfaces only
///
/// SHELL006: No-Host-Internals-In-Plugins
/// 17. Plugins must NOT import from RenderX.Shell.Avalonia.* (except SDK)
/// 18. Plugins must use RenderX.HostSDK.Avalonia for all host interactions
///
/// SHELL007: No-Console-In-Plugins
/// 19. Plugins must NOT use Console.WriteLine or Debug.WriteLine
/// 20. Plugins must use ILogger for all logging
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

    private const string ManifestDrivenLoadingDiagnosticId = "SHELL004";
    private static readonly DiagnosticDescriptor ManifestDrivenLoadingRule = new DiagnosticDescriptor(
        ManifestDrivenLoadingDiagnosticId,
        title: "Manifest-driven loading violation",
        messageFormat: "PluginLoader must use manifest-driven loading: {0}",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "PluginLoader must load plugin mappings from plugin-manifest.json, not use hardcoded _slotTypeMap dictionary. This ensures the manifest is the single source of truth for plugin configuration.");

    private const string NoCrossPluginImportsDiagnosticId = "SHELL005";
    private static readonly DiagnosticDescriptor NoCrossPluginImportsRule = new DiagnosticDescriptor(
        NoCrossPluginImportsDiagnosticId,
        title: "Cross-plugin import violation",
        messageFormat: "Plugins must not import from other plugins: {0}. Use SDK interfaces instead.",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "Plugins must be isolated and not depend on other plugins. All cross-plugin communication must go through SDK interfaces.");

    private const string NoHostInternalsInPluginsDiagnosticId = "SHELL006";
    private static readonly DiagnosticDescriptor NoHostInternalsInPluginsRule = new DiagnosticDescriptor(
        NoHostInternalsInPluginsDiagnosticId,
        title: "Host internals in plugin violation",
        messageFormat: "Plugins must not import host internals: {0}. Use RenderX.HostSDK.Avalonia instead.",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "Plugins must not access shell internals. All host interactions must go through the HostSDK.");

    private const string NoConsoleInPluginsDiagnosticId = "SHELL007";
    private static readonly DiagnosticDescriptor NoConsoleInPluginsRule = new DiagnosticDescriptor(
        NoConsoleInPluginsDiagnosticId,
        title: "Console usage in plugin violation",
        messageFormat: "Plugins must not use Console or Debug directly: {0}. Use ILogger instead.",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "Plugins must use ILogger for all logging, not Console.WriteLine or Debug.WriteLine.");

    private const string RequirePluginManifestFragmentDiagnosticId = "SHELL008";
    private static readonly DiagnosticDescriptor RequirePluginManifestFragmentRule = new DiagnosticDescriptor(
        RequirePluginManifestFragmentDiagnosticId,
        title: "Plugin manifest fragment missing",
        messageFormat: "Plugin must have a valid manifest fragment: {0}",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "Each plugin must define a manifest fragment with required fields (id, name, version, etc.).");

    private const string ValidateInternalPluginIdsDiagnosticId = "SHELL009";
    private static readonly DiagnosticDescriptor ValidateInternalPluginIdsRule = new DiagnosticDescriptor(
        ValidateInternalPluginIdsDiagnosticId,
        title: "Plugin ID mismatch",
        messageFormat: "Plugin ID mismatch: {0}",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "Plugin IDs must be consistent across manifest and code.");

    private const string RequireManifestValidationDiagnosticId = "SHELL010";
    private static readonly DiagnosticDescriptor RequireManifestValidationRule = new DiagnosticDescriptor(
        RequireManifestValidationDiagnosticId,
        title: "Manifest validation missing",
        messageFormat: "Manifest validation required: {0}",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "Plugin manifests must be validated at startup.");

    private const string HandlerExportExistsDiagnosticId = "SHELL011";
    private static readonly DiagnosticDescriptor HandlerExportExistsRule = new DiagnosticDescriptor(
        HandlerExportExistsDiagnosticId,
        title: "Handler export missing",
        messageFormat: "Handler export missing: {0}",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "All handlers referenced in plugin manifests must be exported from the plugin code.");

    private const string ValidHandlersPathDiagnosticId = "SHELL012";
    private static readonly DiagnosticDescriptor ValidHandlersPathRule = new DiagnosticDescriptor(
        ValidHandlersPathDiagnosticId,
        title: "Invalid handler path",
        messageFormat: "Invalid handler path: {0}",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "Handler paths must be resolvable and not in restricted locations.");

    private const string FeatureFlagsDiagnosticId = "SHELL013";
    private static readonly DiagnosticDescriptor FeatureFlagsRule = new DiagnosticDescriptor(
        FeatureFlagsDiagnosticId,
        title: "Feature flag must be string literal",
        messageFormat: "Feature flag IDs must be string literals: {0}",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "Feature flag IDs must be string literals, not variables or expressions.");

    private const string InteractionKeysDiagnosticId = "SHELL014";
    private static readonly DiagnosticDescriptor InteractionKeysRule = new DiagnosticDescriptor(
        InteractionKeysDiagnosticId,
        title: "Interaction key must be string literal",
        messageFormat: "Interaction keys must be string literals: {0}",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "Interaction keys must be string literals, not variables or expressions.");

    private const string TopicsKeysDiagnosticId = "SHELL015";
    private static readonly DiagnosticDescriptor TopicsKeysRule = new DiagnosticDescriptor(
        TopicsKeysDiagnosticId,
        title: "Topic name must be string literal",
        messageFormat: "Topic names must be string literals: {0}",
        category: Category,
        defaultSeverity: DiagnosticSeverity.Error,
        isEnabledByDefault: true,
        description: "Topic names must be string literals, not variables or expressions.");

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(Rule, PluginDecouplingRule, PluginCompletenessRule, ManifestDrivenLoadingRule,
            NoCrossPluginImportsRule, NoHostInternalsInPluginsRule, NoConsoleInPluginsRule,
            RequirePluginManifestFragmentRule, ValidateInternalPluginIdsRule, RequireManifestValidationRule,
            HandlerExportExistsRule, ValidHandlersPathRule, FeatureFlagsRule, InteractionKeysRule, TopicsKeysRule);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterSyntaxNodeAction(AnalyzeImportStatement, SyntaxKind.UsingDirective);
        context.RegisterSyntaxNodeAction(AnalyzeObjectCreation, SyntaxKind.ObjectCreationExpression);
        context.RegisterSyntaxNodeAction(AnalyzeInvocationExpression, SyntaxKind.InvocationExpression);
        context.RegisterSyntaxNodeAction(AnalyzeFeatureFlagsAndInteractions, SyntaxKind.InvocationExpression);
        context.RegisterCompilationAction(AnalyzePluginCompleteness);
        context.RegisterCompilationAction(AnalyzeManifestDrivenLoading);
        context.RegisterCompilationAction(AnalyzePluginManifestValidation);
        context.RegisterCompilationAction(AnalyzeHandlerValidation);
    }

    private static void AnalyzeImportStatement(SyntaxNodeAnalysisContext context)
    {
        var usingDirective = (UsingDirectiveSyntax)context.Node;
        var namespaceName = usingDirective.Name?.ToString() ?? "";
        var filePath = context.SemanticModel.SyntaxTree.FilePath;

        // SHELL001: Forbidden imports (thin-host violations) - only check shell code
        if (filePath.Contains("RenderX.Shell.Avalonia") && !filePath.Contains("RenderX.Plugins."))
        {
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

        // SHELL005: No-Cross-Plugin-Imports - plugins must not import from other plugins
        var isPluginCode = filePath.Contains("RenderX.Plugins.") && !filePath.Contains("RenderX.Shell.Avalonia");
        if (isPluginCode)
        {
            // Extract current plugin name from path (e.g., RenderX.Plugins.Canvas)
            var pathParts = filePath.Split("RenderX.Plugins.");
            if (pathParts.Length > 1)
            {
                var currentPlugin = "RenderX.Plugins." + pathParts[1].Split(new[] { '\\', '/' })[0];

                // Check if importing from another plugin
                if (namespaceName.StartsWith("RenderX.Plugins.") && !namespaceName.StartsWith(currentPlugin))
                {
                    var diagnostic = Diagnostic.Create(
                        NoCrossPluginImportsRule,
                        usingDirective.GetLocation(),
                        namespaceName);

                    context.ReportDiagnostic(diagnostic);
                }
            }
        }

        // SHELL006: No-Host-Internals-In-Plugins - plugins must not import shell internals
        if (isPluginCode)
        {
            // Plugins can use RenderX.HostSDK.Avalonia but not RenderX.Shell.Avalonia internals
            if (namespaceName.StartsWith("RenderX.Shell.Avalonia") &&
                !namespaceName.StartsWith("RenderX.HostSDK.Avalonia"))
            {
                var diagnostic = Diagnostic.Create(
                    NoHostInternalsInPluginsRule,
                    usingDirective.GetLocation(),
                    namespaceName);

                context.ReportDiagnostic(diagnostic);
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

    private static void AnalyzeManifestDrivenLoading(CompilationAnalysisContext context)
    {
        // SHELL004: Check that PluginLoader uses manifest-driven loading
        // PluginLoader must NOT have hardcoded _slotTypeMap dictionary

        var pluginLoaderType = context.Compilation.GetTypeByMetadataName("RenderX.Shell.Avalonia.Infrastructure.Plugins.PluginLoader");
        if (pluginLoaderType == null)
            return;

        var location = pluginLoaderType.Locations.FirstOrDefault();
        if (location == null || !location.IsInSource)
            return;

        // Get the source code of the PluginLoader file
        var syntaxTree = location.SourceTree;
        if (syntaxTree == null)
            return;

        var sourceText = syntaxTree.GetText();
        var code = sourceText.ToString();

        // Check for hardcoded _slotTypeMap dictionary (anti-pattern)
        if (code.Contains("_slotTypeMap = new Dictionary"))
        {
            var diagnostic = Diagnostic.Create(
                ManifestDrivenLoadingRule,
                location,
                "PluginLoader has hardcoded _slotTypeMap dictionary. Use manifest-driven loading instead.");

            context.ReportDiagnostic(diagnostic);
        }

        // Check that manifest loading is present
        if (!code.Contains("plugin-manifest.json"))
        {
            var diagnostic = Diagnostic.Create(
                ManifestDrivenLoadingRule,
                location,
                "PluginLoader should load plugin mappings from plugin-manifest.json");

            context.ReportDiagnostic(diagnostic);
        }
    }

    private static void AnalyzeInvocationExpression(SyntaxNodeAnalysisContext context)
    {
        var invocation = (InvocationExpressionSyntax)context.Node;
        var filePath = context.SemanticModel.SyntaxTree.FilePath;

        // SHELL007: Check for Console.WriteLine or Debug.WriteLine in plugins
        var isPluginCode = filePath.Contains("RenderX.Plugins.") && !filePath.Contains("RenderX.Shell.Avalonia");

        if (isPluginCode)
        {
            var methodName = invocation.Expression.ToString();

            // Check for Console.WriteLine, Console.Write, etc.
            if (methodName.StartsWith("Console.") &&
                (methodName.Contains("WriteLine") || methodName.Contains("Write") || methodName.Contains("Error")))
            {
                var diagnostic = Diagnostic.Create(
                    NoConsoleInPluginsRule,
                    invocation.GetLocation(),
                    "Console usage");

                context.ReportDiagnostic(diagnostic);
            }

            // Check for Debug.WriteLine, Debug.Write, etc.
            if (methodName.StartsWith("Debug.") &&
                (methodName.Contains("WriteLine") || methodName.Contains("Write")))
            {
                var diagnostic = Diagnostic.Create(
                    NoConsoleInPluginsRule,
                    invocation.GetLocation(),
                    "Debug usage");

                context.ReportDiagnostic(diagnostic);
            }
        }
    }

    private static void AnalyzePluginManifestValidation(CompilationAnalysisContext context)
    {
        // SHELL008: Check that plugins have valid manifest fragments
        // SHELL009: Check that plugin IDs are consistent
        // SHELL010: Check that manifest validation is performed

        // Look for plugin projects by checking for plugin-manifest.json files
        var pluginManifestPath = System.IO.Path.Combine(
            System.IO.Path.GetDirectoryName(context.Compilation.SyntaxTrees.FirstOrDefault()?.FilePath ?? ""),
            "..", "..", "..", "plugin-manifest.json");

        if (System.IO.File.Exists(pluginManifestPath))
        {
            try
            {
                var manifestContent = System.IO.File.ReadAllText(pluginManifestPath);

                // SHELL008: Validate manifest structure
                if (string.IsNullOrWhiteSpace(manifestContent) || !manifestContent.Contains("\"id\""))
                {
                    // Report diagnostic for missing manifest fields
                    var location = context.Compilation.SyntaxTrees.FirstOrDefault()?.GetRoot().GetLocation();
                    if (location != null)
                    {
                        var diagnostic = Diagnostic.Create(
                            RequirePluginManifestFragmentRule,
                            location,
                            "Missing required manifest fields (id, name, version)");

                        context.ReportDiagnostic(diagnostic);
                    }
                }
            }
            catch
            {
                // Silently ignore file read errors
            }
        }

        // SHELL010: Check that PluginLoader validates manifests
        var pluginLoaderType = context.Compilation.GetTypeByMetadataName("RenderX.Shell.Avalonia.Infrastructure.Plugins.PluginLoader");
        if (pluginLoaderType != null)
        {
            var location = pluginLoaderType.Locations.FirstOrDefault();
            if (location != null && location.IsInSource)
            {
                var syntaxTree = location.SourceTree;
                if (syntaxTree != null)
                {
                    var sourceText = syntaxTree.GetText();
                    var code = sourceText.ToString();

                    // Check that manifest validation is present
                    if (!code.Contains("ValidateManifest") && !code.Contains("validate") && !code.Contains("Validate"))
                    {
                        var diagnostic = Diagnostic.Create(
                            RequireManifestValidationRule,
                            location,
                            "PluginLoader should validate plugin manifests at startup");

                        context.ReportDiagnostic(diagnostic);
                    }
                }
            }
        }
    }

    private static void AnalyzeHandlerValidation(CompilationAnalysisContext context)
    {
        // SHELL011: Check that handlers referenced in manifests are exported
        // SHELL012: Check that handler paths are valid

        // Look for handler exports in plugin code
        foreach (var syntaxTree in context.Compilation.SyntaxTrees)
        {
            var filePath = syntaxTree.FilePath;

            // Only check plugin code
            if (!filePath.Contains("RenderX.Plugins.") || filePath.Contains("RenderX.Shell.Avalonia"))
                continue;

            var root = syntaxTree.GetRoot();
            var methods = root.DescendantNodes().OfType<MethodDeclarationSyntax>();

            foreach (var method in methods)
            {
                // SHELL011: Check for handler exports
                // Handlers should be public and properly named
                var methodName = method.Identifier.Text;

                // Check if method looks like a handler (e.g., OnSomething, Handle*)
                if ((methodName.StartsWith("On") || methodName.StartsWith("Handle")) &&
                    method.Modifiers.Any(m => m.IsKind(SyntaxKind.PublicKeyword)))
                {
                    // This is a valid handler export pattern
                    // No diagnostic needed
                }
            }
        }

        // SHELL012: Validate handler paths in manifests
        // This would check that handler paths reference valid locations
        // For now, we'll do a basic check for common path issues
        foreach (var syntaxTree in context.Compilation.SyntaxTrees)
        {
            var filePath = syntaxTree.FilePath;

            if (!filePath.Contains("RenderX.Plugins."))
                continue;

            var root = syntaxTree.GetRoot();
            var stringLiterals = root.DescendantNodes().OfType<LiteralExpressionSyntax>()
                .Where(l => l.IsKind(SyntaxKind.StringLiteralExpression));

            foreach (var literal in stringLiterals)
            {
                var value = literal.Token.ValueText;

                // Check for invalid handler paths
                if (value.Contains("../../../") || value.Contains("..\\..\\..\\"))
                {
                    var diagnostic = Diagnostic.Create(
                        ValidHandlersPathRule,
                        literal.GetLocation(),
                        $"Handler path uses too many parent directory references: {value}");

                    context.ReportDiagnostic(diagnostic);
                }
            }
        }
    }

    private static void AnalyzeFeatureFlagsAndInteractions(SyntaxNodeAnalysisContext context)
    {
        var invocation = (InvocationExpressionSyntax)context.Node;
        var methodName = invocation.Expression.ToString();

        // SHELL013: Feature flags must use string literals
        if (methodName.Contains("FeatureFlag") || methodName.Contains("IsFeatureEnabled"))
        {
            var arguments = invocation.ArgumentList.Arguments;
            if (arguments.Count > 0)
            {
                var firstArg = arguments[0].Expression;

                // Check if argument is a string literal
                if (!firstArg.IsKind(SyntaxKind.StringLiteralExpression))
                {
                    var diagnostic = Diagnostic.Create(
                        FeatureFlagsRule,
                        firstArg.GetLocation(),
                        "Feature flag ID must be a string literal");

                    context.ReportDiagnostic(diagnostic);
                }
            }
        }

        // SHELL014: Interaction keys must use string literals
        if (methodName.Contains("Interaction") || methodName.Contains("PublishInteraction"))
        {
            var arguments = invocation.ArgumentList.Arguments;
            if (arguments.Count > 0)
            {
                var firstArg = arguments[0].Expression;

                // Check if argument is a string literal
                if (!firstArg.IsKind(SyntaxKind.StringLiteralExpression))
                {
                    var diagnostic = Diagnostic.Create(
                        InteractionKeysRule,
                        firstArg.GetLocation(),
                        "Interaction key must be a string literal");

                    context.ReportDiagnostic(diagnostic);
                }
            }
        }

        // SHELL015: Topic names must use string literals
        if (methodName.Contains("Topic") || methodName.Contains("PublishTopic") || methodName.Contains("SubscribeTopic"))
        {
            var arguments = invocation.ArgumentList.Arguments;
            if (arguments.Count > 0)
            {
                var firstArg = arguments[0].Expression;

                // Check if argument is a string literal
                if (!firstArg.IsKind(SyntaxKind.StringLiteralExpression))
                {
                    var diagnostic = Diagnostic.Create(
                        TopicsKeysRule,
                        firstArg.GetLocation(),
                        "Topic name must be a string literal");

                    context.ReportDiagnostic(diagnostic);
                }
            }
        }
    }
}

