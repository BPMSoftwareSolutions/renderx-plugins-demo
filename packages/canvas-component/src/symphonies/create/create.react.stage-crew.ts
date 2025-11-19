import React, { startTransition } from "react";
import { createRoot } from "react-dom/client";

// Track React roots for cleanup
const reactRoots = new Map<string, any>();

/**
 * Renders React code inside a canvas component node.
 * Compiles user-provided React code and mounts it using React 19 createRoot.
 * Supports props injection and component communication via EventRouter.
 */
export const renderReact = (data: any, ctx: any) => {
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

    // Compile the React code with props injection
    const compiledComponent = compileReactCode(reactCode);

    // Create React root and render the component with props
    const root = createRoot(container);
    const element = React.createElement(compiledComponent, props);

    // Use startTransition to make rendering non-blocking
    startTransition(() => {
      root.render(element);
    });

    // Track the root for future cleanup
    reactRoots.set(nodeId, root);

    // Publish componentMounted event
    if (ctx.conductor) {
      ctx.conductor.publish("react.component.mounted", {
        componentId: nodeId,
        timestamp: Date.now(),
      });
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

    // Publish componentError event
    if (ctx.conductor) {
      ctx.conductor.publish("react.component.error", {
        componentId: nodeId,
        error: errorMessage,
        timestamp: Date.now(),
      });
    }

    ctx.payload.reactError = errorMessage;
  }
};

/**
 * Compiles React code string into a React component function.
 * Supports default export, named exports, and function declarations.
 * Handles JSX by providing React in the execution scope.
 */
function compileReactCode(code: string): React.ComponentType {
  try {
    // Remove export statements and extract the component
    let cleanCode = code
      .replace(/export\s+default\s+/g, "")
      .replace(/export\s+/g, "");

    // Try to extract function name from declaration or arrow function
    let componentName = "GeneratedComponent";
    const funcDeclMatch = cleanCode.match(/function\s+(\w+)/);
    const arrowMatch = cleanCode.match(/const\s+(\w+)\s*=/);

    if (funcDeclMatch) {
      componentName = funcDeclMatch[1];
    } else if (arrowMatch) {
      componentName = arrowMatch[1];
    }

    // Create execution context with React available
    const functionBody = `
      "use strict";
      ${cleanCode}
      return ${componentName};
    `;

    // Compile with React in scope
    const compiledFunction = new Function("React", functionBody);
    const component = compiledFunction(React);

    // Validate that we got a valid React component
    if (typeof component !== "function") {
      throw new Error(
        "Compiled code did not return a valid React component function"
      );
    }

    return component;
  } catch (error) {
    // Return error component if compilation fails
    const errorMsg =
      error instanceof Error ? error.message : String(error);
    return function ErrorComponent() {
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
    };
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
 * Provides global access to EventRouter for React components
 * Allows components to publish/subscribe to events for inter-component communication
 */
export function exposeEventRouterToReact(conductor: any) {
  if (typeof window !== 'undefined') {
    (window as any).RenderX = (window as any).RenderX || {};
    (window as any).RenderX.conductor = conductor;
    (window as any).RenderX.publish = (topic: string, data: any) => {
      conductor?.publish?.(topic, data);
    };
    (window as any).RenderX.subscribe = (topic: string, handler: any) => {
      conductor?.subscribe?.(topic, handler);
    };
  }
}
