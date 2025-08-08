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

        // Trigger the element selection sequence
        const result = communicationSystem.conductor.play(
          "Component.element-selection-symphony",
          "Canvas Element Selection Symphony No. 37",
          {
            element: {
              id: elementId,
              type: element.type,
              elementId: elementId,
              cssClass: cssClass,
              metadata: element.metadata,
              componentData: element.componentData,
            },
            selectionType: e.ctrlKey || e.metaKey ? "multi" : "single",
            selectionContext: {
              clickEvent: true,
              timestamp: Date.now(),
              coordinates: {
                x: e.clientX,
                y: e.clientY,
              },
            },
            clearPrevious: !(e.ctrlKey || e.metaKey),
          }
        );

        console.log(
          `🎼 Element selection triggered: ${result ? "SUCCESS" : "FAILED"}`
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
  const template = componentData.ui.template;

  // Parse the template to add canvas-specific attributes to the root element
  // This ensures the component remains pure while adding necessary canvas functionality
  const parser = new DOMParser();
  const doc = parser.parseFromString(template, "text/html");
  const rootElement = doc.body.firstElementChild;

  if (rootElement) {
    // Add canvas-specific attributes to the component's root element
    rootElement.setAttribute("id", elementId);
    rootElement.setAttribute("data-component-id", elementId);
    rootElement.setAttribute("draggable", "true");

    // Add canvas classes while preserving component's original classes
    const existingClasses = rootElement.getAttribute("class") || "";
    const canvasClasses = `${cssClass} rx-generic-component rx-selected`;
    rootElement.setAttribute(
      "class",
      `${existingClasses} ${canvasClasses}`.trim()
    );

    const modifiedTemplate = rootElement.outerHTML;

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
