import React, { startTransition } from "react";
import { createRoot } from "react-dom/client";
import * as Babel from "@babel/standalone";
import { validateReactCode } from "./react-code-validator";
// (EventRouter publish removed for test determinism when no conductor)

// Track React roots for cleanup
const reactRoots = new Map<string, any>();

/**
 * Renders React code inside a canvas component node.
 * Compiles user-provided React code and mounts it using React 19 createRoot.
 * Supports props injection and component communication via EventRouter.
 */
export const renderReact = async (_data: any, ctx: any) => {
  // Only process React components
  if (ctx.payload.kind !== "react") {
    return;
  }

  const nodeId = ctx.payload.nodeId;
  const template = ctx.payload.template;
  const reactCode = template.content?.reactCode;
  const props = template.content?.props || {};

  if (!nodeId || !reactCode) {
    ctx.logger?.warn?.("renderReact: Missing nodeId or React code");
    return;
  }

  try {
    // Get the DOM container that was created by createNode
    const container = document.getElementById(nodeId);
    if (!container) {
      throw new Error(`Container element not found: ${nodeId}`);
    }

    // Clean up any existing React root for this node
    const existingRoot = reactRoots.get(nodeId);
    if (existingRoot) {
      existingRoot.unmount();
      reactRoots.delete(nodeId);
    }

    // Expose EventRouter to React components for inter-component communication
    if (ctx.conductor) {
      exposeEventRouterToReact(ctx.conductor);
    }

    // Validate React code before compilation
    const validation = validateReactCode(reactCode);
    if (!validation.valid) {
      throw new Error(`React code validation failed:\n${validation.errors.join('\n')}`);
    }

    // Compile the React code with props injection
    const compiledComponent = compileReactCode(reactCode);
    const compilationError =
      (compiledComponent as any)?.__renderxCompilationError as string | undefined;

    // Create React root and render the component with props
    const root = createRoot(container);
    const element = React.createElement(compiledComponent, props);

    // Use startTransition to make rendering non-blocking
    startTransition(() => {
      root.render(element);
    });

    // Track the root for future cleanup
    reactRoots.set(nodeId, root);

    // If the compiled component represents a compilation error, surface it
    if (compilationError) {
      if (ctx.conductor?.publish) {
        try {
          ctx.conductor.publish("react.component.error", {
            componentId: nodeId,
            error: compilationError,
            phase: "compile",
            timestamp: Date.now(),
          });
        } catch (e) {
          ctx.logger?.warn?.(
            "renderReact: publish(compilation error) failed",
            e instanceof Error ? e.message : String(e)
          );
        }
      }

      const errorDiagnostic = getDiagnosticsEmitter();
      if (errorDiagnostic) {
        try {
          errorDiagnostic({
            level: "error",
            source: "Plugin",
            message: "React JSX compilation error (topic 'react.component.error')",
            data: {
              topic: "react.component.error",
              componentId: nodeId,
              error: compilationError,
              phase: "compile",
            },
          });
        } catch {
          // Diagnostics should never break runtime behavior
        }
      }

      ctx.payload.reactError = compilationError;
      return;
    }

    // Publish componentMounted event (prefer direct conductor for test determinism)
    if (ctx.conductor?.publish) {
      try {
        ctx.conductor.publish("react.component.mounted", {
          componentId: nodeId,
          timestamp: Date.now(),
        });
      } catch (e) {
        ctx.logger?.warn?.(
          "renderReact: publish(mounted) failed",
          e instanceof Error ? e.message : String(e)
        );
      }
    }

    // Emit diagnostics for React component mount (visible to CLI observers)
    const mountDiagnostic = getDiagnosticsEmitter();
    if (mountDiagnostic) {
      try {
        mountDiagnostic({
          level: "info",
          source: "Plugin",
          message: "React component mounted (topic 'react.component.mounted')",
          data: {
            topic: "react.component.mounted",
            componentId: nodeId,
            templateId: template?.id,
            kind: ctx.payload.kind,
          },
        });
      } catch {
        // Diagnostics should never break runtime behavior
      }
    }

    // Update payload to indicate successful React rendering
    ctx.payload.reactRendered = true;

  } catch (error) {
    // Handle compilation or rendering errors gracefully
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.logger?.error?.("renderReact error:", errorMessage);

    // Display user-friendly error in the container
    const container = document.getElementById(nodeId);
    if (container) {
      container.innerHTML = `
        <div style="
          padding: 8px;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 4px;
          color: #c33;
          font-family: monospace;
          font-size: 12px;
        ">
          <strong>React Error:</strong><br>
          ${escapeHtml(errorMessage)}
        </div>
      `;
    }

    // Publish componentError event (prefer direct conductor)
    if (ctx.conductor?.publish) {
      try {
        ctx.conductor.publish("react.component.error", {
          componentId: nodeId,
          error: errorMessage,
          timestamp: Date.now(),
        });
      } catch (e) {
        ctx.logger?.warn?.(
          "renderReact: publish(error) failed",
          e instanceof Error ? e.message : String(e)
        );
      }
    }

    // Emit diagnostics for React component errors
    const errorDiagnostic = getDiagnosticsEmitter();
    if (errorDiagnostic) {
      try {
        errorDiagnostic({
          level: "error",
          source: "Plugin",
          message: "React component error (topic 'react.component.error')",
          data: {
            topic: "react.component.error",
            componentId: nodeId,
            error: errorMessage,
          },
        });
      } catch {
        // Diagnostics should never break runtime behavior
      }
    }

    ctx.payload.reactError = errorMessage;
  }
};

/**
 * Compiles React code string into a React component function.
 * Supports default exports, function declarations, and arrow components.
 * Uses @babel/standalone to transform JSX before evaluation.
 */
function compileReactCode(code: string): React.ComponentType {
  try {
    if (!code || typeof code !== "string") {
      throw new Error("React code must be a non-empty string");
    }

    // First, transform JSX (and modern syntax) to plain JS using Babel.
    let transformedCode = code;
    try {
      const result = (Babel as any).transform
        ? (Babel as any).transform(code, {
            presets: ["react"],
            filename: "react-dynamic-component.js",
          })
        : null;
      if (result && typeof result.code === "string") {
        transformedCode = result.code;
      }
    } catch (transformError) {
      const msg =
        transformError instanceof Error
          ? transformError.message
          : String(transformError);
      throw new Error(`JSX transformation failed: ${msg}`);
    }

    let cleanCode = transformedCode;
    let componentName = "GeneratedComponent";

    // Handle `export default function Name()` specially so we can keep the name.
    const defaultFuncMatch = cleanCode.match(
      /export\s+default\s+function\s+(\w+)/
    );
    if (defaultFuncMatch) {
      const originalName = defaultFuncMatch[1];
      cleanCode = cleanCode.replace(
        /export\s+default\s+function\s+(\w+)/,
        `function ${originalName}`
      );
      cleanCode += `\nconst GeneratedComponent = ${originalName};`;
      componentName = "GeneratedComponent";
    } else if (/export\s+default\s+/.test(cleanCode)) {
      // Generic default export (arrow or expression)
      cleanCode = cleanCode.replace(
        /export\s+default\s+/,
        "const GeneratedComponent = "
      );
      componentName = "GeneratedComponent";
    } else {
      // No explicit default export  fall back to first function/const
      const funcDeclMatch = cleanCode.match(/function\s+(\w+)/);
      const arrowMatch = cleanCode.match(/const\s+(\w+)\s*=/);

      if (funcDeclMatch) {
        componentName = funcDeclMatch[1];
      } else if (arrowMatch) {
        componentName = arrowMatch[1];
      } else {
        // Treat the whole code as an expression defining the component
        cleanCode = `const GeneratedComponent = ${cleanCode};`;
        componentName = "GeneratedComponent";
      }
    }

    // Strip any remaining non-default export keywords
    cleanCode = cleanCode.replace(/export\s+{[^}]*};?/g, "");
    cleanCode = cleanCode.replace(
      /export\s+(const|let|var|function)\s+/g,
      "$1 "
    );

    const functionBody = `
      "use strict";
      ${cleanCode}
      return ${componentName};
    `;

    const compiledFunction = new Function("React", functionBody);
    const component = compiledFunction(React);

    if (typeof component !== "function") {
      throw new Error(
        "Compiled code did not return a valid React component function"
      );
    }

    return component;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    function ErrorComponent() {
      return React.createElement(
        "div",
        {
          style: {
            padding: "8px",
            background: "#fee",
            border: "1px solid #fcc",
            borderRadius: "4px",
            color: "#c33",
            fontFamily: "monospace",
            fontSize: "12px",
          },
        },
        `Compilation Error: ${errorMsg}`
      );
    }

    (ErrorComponent as any).__renderxCompilationError = errorMsg;

    return ErrorComponent as any;
  }
}

/**
 * Cleanup function to unmount React roots when components are deleted
 */
export function cleanupReactRoot(nodeId: string) {
  const root = reactRoots.get(nodeId);
  if (root) {
    root.unmount();
    reactRoots.delete(nodeId);
  }
}

/**
 * Escape HTML to prevent XSS in error messages
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Helper to access the host diagnostics emitter if it is available.
 * Plugins must not assume diagnostics are present; this is purely best-effort.
 */
function getDiagnosticsEmitter(): ((event: any) => void) | null {
  try {
    if (typeof window === "undefined") {
      return null;
    }
    const emit = (window as any)?.RenderX?.diagnostics?.emitDiagnostic;
    return typeof emit === "function" ? emit : null;
  } catch {
    return null;
  }
}

/**
 * Provides global access to EventRouter for React components
 * Allows components to publish/subscribe to events for inter-component communication
 */
export function exposeEventRouterToReact(conductor: any) {
  if (typeof window !== 'undefined') {
    (window as any).RenderX = (window as any).RenderX || {};
    (window as any).RenderX.conductor = conductor;
    (window as any).RenderX.publish = (topic: string, data: any) => {
      const emitter = getDiagnosticsEmitter();
      if (emitter) {
        try {
          emitter({
            level: "debug",
            source: "Plugin",
            message: `React component published topic '${topic}'`,
            data: {
              topic,
              payload: data,
            },
          });
        } catch {
          // Diagnostics should never break runtime behavior
        }
      }
      conductor?.publish?.(topic, data);
    };
    (window as any).RenderX.subscribe = (topic: string, handler: any) => {
      conductor?.subscribe?.(topic, handler);
    };
  }
}
