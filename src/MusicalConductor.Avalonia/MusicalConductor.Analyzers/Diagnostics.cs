using Microsoft.CodeAnalysis;

namespace MusicalConductor.Analyzers;

/// <summary>
/// Diagnostic descriptors for MusicalConductor handler guardrails.
/// </summary>
public static class Diagnostics
{
    private const string Category = "MusicalConductor.Handlers";

    /// <summary>
    /// MC001: Handler must inherit from HandlerBase.
    /// </summary>
    public static readonly DiagnosticDescriptor MC001_MustInheritFromHandlerBase =
        new DiagnosticDescriptor(
            id: "MC001",
            title: "Handler must inherit from HandlerBase",
            messageFormat: "Class '{0}' implements IHandler but does not inherit from HandlerBase. All handlers must inherit from HandlerBase.",
            category: Category,
            defaultSeverity: DiagnosticSeverity.Error,
            isEnabledByDefault: true,
            description: "Handlers must inherit from HandlerBase to ensure consistent logging, error handling, and nested sequence execution patterns.");

    /// <summary>
    /// MC002: Handler must be in App.Handlers namespace.
    /// </summary>
    public static readonly DiagnosticDescriptor MC002_MustBeInAppHandlersNamespace =
        new DiagnosticDescriptor(
            id: "MC002",
            title: "Handler must be in App.Handlers namespace",
            messageFormat: "Handler '{0}' is in namespace '{1}'. Handlers must be in the 'App.Handlers' namespace.",
            category: Category,
            defaultSeverity: DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "Handlers should be organized in the App.Handlers namespace for consistency and discoverability.");

    /// <summary>
    /// MC003: Handler file must contain only one handler class.
    /// </summary>
    public static readonly DiagnosticDescriptor MC003_OnlyOneHandlerPerFile =
        new DiagnosticDescriptor(
            id: "MC003",
            title: "Only one handler per file",
            messageFormat: "File contains multiple handler classes. Each handler must be in its own file.",
            category: Category,
            defaultSeverity: DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "Each handler class should be in its own file for maintainability and clarity.");

    /// <summary>
    /// MC004: Handler class name must end with 'Handler'.
    /// </summary>
    public static readonly DiagnosticDescriptor MC004_HandlerNameMustEndWithHandler =
        new DiagnosticDescriptor(
            id: "MC004",
            title: "Handler class name must end with 'Handler'",
            messageFormat: "Handler class '{0}' does not end with 'Handler'. Handler class names must follow the pattern '*Handler'.",
            category: Category,
            defaultSeverity: DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "Handler class names should end with 'Handler' for consistency and clarity.");

    /// <summary>
    /// MC005: Handler must implement Execute method.
    /// </summary>
    public static readonly DiagnosticDescriptor MC005_MustImplementExecute =
        new DiagnosticDescriptor(
            id: "MC005",
            title: "Handler must implement Execute method",
            messageFormat: "Handler '{0}' does not implement the Execute method. All handlers must implement Execute(IHandlerContext context, object? data).",
            category: Category,
            defaultSeverity: DiagnosticSeverity.Error,
            isEnabledByDefault: true,
            description: "Handlers must implement the Execute method to define their behavior.");
}

