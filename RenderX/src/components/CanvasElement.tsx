/**
 * Canvas Element Component
 * Renders individual elements on the canvas with drag support
 */

import React from "react";

interface CanvasElementProps {
  element: any;
  elementId: string;
  cssClass: string;
  onDragStart?: (e: React.DragEvent, element: any) => void;
  onDragEnd?: (e: React.DragEvent, element: any) => void;
}

const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  elementId,
  cssClass,
  onDragStart,
  onDragEnd,
}) => {
  // Handle element click for selection
  const handleElementClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      console.log("🎯 CanvasElement: Element clicked", elementId);

      // Get communication system and trigger selection
      const communicationSystem = (window as any).renderxCommunicationSystem;
      if (communicationSystem && communicationSystem.conductor) {
        console.log("🎼 Triggering element selection via conductor...");

        // Trigger the selection symphony (callback-first)
        communicationSystem.conductor.play(
          "Canvas.component-select-symphony",
          "Canvas.component-select-symphony",
          {
            elementId,
            onSelectionChange: (id: string | null) => {
              try {
                const ev = new CustomEvent("renderx:selection:update", {
                  detail: { id },
                });
                window.dispatchEvent(ev);
              } catch {}
            },
          }
        );
      } else {
        console.warn("No communication system available for element selection");
      }
    },
    [element, elementId, cssClass]
  );
  // Get component data from the element
  const componentData = element.componentData;

  if (!componentData?.ui?.template) {
    // Fallback for elements without component data
    return (
      <div
        id={elementId}
        data-component-id={elementId}
        className={`${cssClass} rx-selected`}
        draggable="true"
        onDragStart={onDragStart ? (e) => onDragStart(e, element) : undefined}
        onDragEnd={onDragEnd ? (e) => onDragEnd(e, element) : undefined}
      >
        {element.metadata?.name || element.type} (No template)
      </div>
    );
  }

  // Render the actual component template from JSON definition as pure component
  // Sanitize/resolve common template tokens for Canvas rendering
  let template = componentData.ui.template;

  // Remove inline handlers to avoid React warnings and security issues
  template = template.replace(/on\w+="[^"]*"/g, "");

  // Replace common Handlebars-like placeholders with safe defaults
  const compType = (
    element?.type ||
    componentData?.metadata?.type ||
    ""
  ).toLowerCase();
  const variantDefault = compType === "button" ? "primary" : "default";
  const contentDefault =
    componentData?.metadata?.name || (compType === "button" ? "Button" : "");
  template = template
    .replace(/\{\{\s*variant\s*\}\}/g, variantDefault)
    .replace(/\{\{\s*size\s*\}\}/g, "medium")
    .replace(/\{\{\s*inputType\s*\}\}/g, "text")
    .replace(/\{\{\s*placeholder\s*\}\}/g, "Enter text")
    .replace(/\{\{\s*value\s*\}\}/g, "")
    .replace(/\{\{\s*content\s*\}\}/g, contentDefault)
    // Strip simple conditionals (common shapes)
    .replace(/\{\{#if\s+disabled\}\}\s*disabled\s*\{\{\/if\}\}/g, "")
    .replace(/\{\{#if\s+required\}\}\s*required\s*\{\{\/if\}\}/g, "");

  // Final safety: strip any remaining mustache tokens so React doesn't see invalid attributes
  template = template.replace(/\{\{[^}]+\}\}/g, "");

  // Parse the template to add canvas-specific attributes to the root element
  // This ensures the component remains pure while adding necessary canvas functionality
  const parser = new DOMParser();
  const doc = parser.parseFromString(template, "text/html");
  const rootElement = doc.body.firstElementChild;

  if (rootElement) {
    // Apply absolute positioning directly on the component root to avoid wrapper div
    const pos = (element as any)?.position || { x: 0, y: 0 };

    // Add canvas-specific attributes to the component's root element
    rootElement.setAttribute("id", elementId);
    rootElement.setAttribute("data-component-id", elementId);
    rootElement.setAttribute("draggable", "true");

    // Positioning is handled by the Canvas wrapper; avoid double-positioning the root element
    // Intentionally do not set left/top here to keep overlay alignment accurate

    // Add canvas classes while preserving component's original classes
    const existingClasses = rootElement.getAttribute("class") || "";
    const canvasClasses = `${cssClass} rx-generic-component rx-selected`;
    rootElement.setAttribute(
      "class",
      `${existingClasses} ${canvasClasses}`.trim()
    );

    const modifiedTemplate = rootElement.outerHTML;

    // Inject scoped styles for this component instance on the canvas
    React.useEffect(() => {
      const css = componentData?.ui?.styles?.css;
      if (!css) return;
      const styleId = `style-${elementId}`;
      const styleEl = document.getElementById(
        styleId
      ) as HTMLStyleElement | null;
      // Scope all class selectors to this instance's cssClass
      const selectorPrefix = `#${elementId}`;
      const scoped = css.replace(
        /(^|})\s*([^\{]+)\s*\{/g,
        (match, brace, selector) => {
          const sels = selector
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          const rewritten = sels
            .flatMap((s) => {
              const needsSpace = !(s.startsWith(".") || s.startsWith("#"));
              const selfCombo = `${selectorPrefix}${needsSpace ? " " : ""}${s}`;
              const descCombo = `${selectorPrefix} ${s}`;
              return [descCombo, selfCombo];
            })
            .join(", ");
          return `${brace} ${rewritten} {`;
        }
      );
      const tag = styleEl || document.createElement("style");
      tag.id = styleId;
      tag.textContent = scoped;
      if (!styleEl) document.head.appendChild(tag);
      // Debug: log a sample and computed styles after paint
      try {
        console.log("[CanvasElement] injected styles", {
          styleId,
          bytes: scoped.length,
          sample: scoped.slice(0, 120),
        });
        setTimeout(() => {
          const el = document.getElementById(elementId) as HTMLElement | null;
          if (el) {
            const cs = getComputedStyle(el);
            console.log("[CanvasElement] computed styles", {
              id: elementId,
              className: el.className,
              color: cs.color,
              backgroundColor: cs.backgroundColor,
              borderTop: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
            });
          }
        }, 0);
      } catch {}
      return () => {
        const s = document.getElementById(styleId);
        if (s && s.parentNode) s.parentNode.removeChild(s);
      };
    }, [elementId, cssClass, componentData?.ui?.styles?.css]);

    // Use useEffect to handle events since we can't attach React event handlers to dangerouslySetInnerHTML
    React.useEffect(() => {
      const domElement = document.getElementById(elementId);
      if (domElement) {
        // Add click event listener for selection
        const handleClick = (e: MouseEvent) => {
          handleElementClick(e as any);
        };
        domElement.addEventListener("click", handleClick);

        // Add drag event listeners if provided
        let handleDragStart: ((e: DragEvent) => void) | undefined;
        let handleDragEnd: ((e: DragEvent) => void) | undefined;

        if (onDragStart) {
          handleDragStart = (e: DragEvent) => {
            onDragStart(e as any, domElement);
          };
          domElement.addEventListener("dragstart", handleDragStart);
        }

        if (onDragEnd) {
          handleDragEnd = (e: DragEvent) => {
            onDragEnd(e as any, domElement);
          };
          domElement.addEventListener("dragend", handleDragEnd);
        }

        // Cleanup function
        return () => {
          domElement.removeEventListener("click", handleClick);
          if (handleDragStart) {
            domElement.removeEventListener("dragstart", handleDragStart);
          }
          if (handleDragEnd) {
            domElement.removeEventListener("dragend", handleDragEnd);
          }
        };
      }
    }, [elementId, onDragStart, element, handleElementClick]);

    // Return the pure component by creating a temporary container and extracting the element
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = modifiedTemplate;
    const componentElement = tempContainer.firstElementChild;

    if (componentElement) {
      // Create React element from the component's tag name and attributes
      const tagName = componentElement.tagName.toLowerCase();
      const props: any = {
        key: elementId,
      };

      // Copy all attributes from the parsed element, converting HTML to React props
      Array.from(componentElement.attributes).forEach((attr) => {
        if (attr.name === "class") {
          props.className = attr.value;
        } else if (attr.name === "style") {
          // Convert inline style string to React style object
          const styleObj: Record<string, string> = {};
          const toCamel = (s: string) =>
            s
              .trim()
              .replace(/^-ms-/, "ms-")
              .replace(/-([a-z])/g, (_, c) => (c ? c.toUpperCase() : ""));
          attr.value
            .split(";")
            .map((pair) => pair.trim())
            .filter(Boolean)
            .forEach((pair) => {
              const [key, ...rest] = pair.split(":");
              if (!key || rest.length === 0) return;
              const val = rest.join(":").trim();
              styleObj[toCamel(key)] = val;
            });
          props.style = styleObj;
        } else if (attr.name === "onclick") {
          // Skip onclick for now - would need proper event handling
        } else if (attr.name === "onchange") {
          // Convert HTML onchange to React onChange
          // Skip for now - would need proper event handling
        } else if (attr.name === "onblur") {
          // Convert HTML onblur to React onBlur
          // Skip for now - would need proper event handling
        } else if (attr.name === "onfocus") {
          // Convert HTML onfocus to React onFocus
          // Skip for now - would need proper event handling
        } else {
          props[attr.name] = attr.value;
        }
      });

      // Add drag event handler
      if (onDragStart) {
        props.onDragStart = (e: React.DragEvent) => onDragStart(e, element);
      }

      // Check if this is a void element (self-closing tags that cannot have children)
      const voidElements = [
        "input",
        "img",
        "br",
        "hr",
        "meta",
        "link",
        "area",
        "base",
        "col",
        "embed",
        "source",
        "track",
        "wbr",
      ];
      const isVoidElement = voidElements.includes(tagName);

      // Return the pure component element
      if (isVoidElement) {
        // Void elements cannot have children
        return React.createElement(tagName, props);
      } else {
        // Non-void elements can have text content or children
        return React.createElement(
          tagName,
          props,
          componentElement.textContent
        );
      }
    }

    // Fallback to div with innerHTML if element creation fails
    return <div dangerouslySetInnerHTML={{ __html: modifiedTemplate }} />;
  }

  // Fallback if template parsing fails
  return (
    <div
      id={elementId}
      data-component-id={elementId}
      className={`${cssClass} rx-generic-component rx-selected`}
      draggable="true"
      onDragStart={onDragStart ? (e) => onDragStart(e, element) : undefined}
      onDragEnd={onDragEnd ? (e) => onDragEnd(e, element) : undefined}
    >
      Template parsing failed
    </div>
  );
};

export default CanvasElement;
