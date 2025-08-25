import React from "react";
import { useConductor } from "../../../src/conductor";
import { resolveInteraction } from "../../../src/interactionManifest";
import { setSelectionObserver, setClassesObserver } from "../state/observer.store";
import "./ControlPanel.css";

export function ControlPanel() {
  const conductor = useConductor();
  const [selectedElement, setSelectedElement] = React.useState<any>(null);
  const [currentClasses, setCurrentClasses] = React.useState<string[]>([]);

  // Register observers on mount
  React.useEffect(() => {
    setSelectionObserver((selectionModel) => {
      setSelectedElement(selectionModel);
      // Initialize classes from selection model
      setCurrentClasses(selectionModel?.classes || []);
    });

    setClassesObserver((classData) => {
      if (classData?.classes) {
        setCurrentClasses(classData.classes);
      }
    });

    // Cleanup observers on unmount
    return () => {
      setSelectionObserver(null);
      setClassesObserver(null);
    };
  }, []);

  const handleAddClass = (className: string) => {
    if (!selectedElement?.header?.id || !className.trim()) return;

    try {
      const route = resolveInteraction("control.panel.classes.add");
      conductor?.play?.(route.pluginId, route.sequenceId, {
        id: selectedElement.header.id,
        className: className.trim()
      });
    } catch {
      // Note: UI components don't have access to ctx.logger, so we'll silently fail
      // The stage-crew handlers will log any actual errors
    }
  };

  const handleRemoveClass = (className: string) => {
    if (!selectedElement?.header?.id || !className) return;

    try {
      const route = resolveInteraction("control.panel.classes.remove");
      conductor?.play?.(route.pluginId, route.sequenceId, {
        id: selectedElement.header.id,
        className
      });
    } catch {
      // Note: UI components don't have access to ctx.logger, so we'll silently fail
      // The stage-crew handlers will log any actual errors
    }
  };

  const handleAttributeChange = (attribute: string, value: any) => {
    if (!selectedElement?.header?.id) return;

    try {
      const route = resolveInteraction("canvas.component.update");
      conductor?.play?.(route.pluginId, route.sequenceId, {
        id: selectedElement.header.id,
        attribute,
        value
      });
    } catch {
      // Note: UI components don't have access to ctx.logger, so we'll silently fail
      // The stage-crew handlers will log any actual errors
    }
  };

  return (
    <div className="control-panel">
      <div className="control-panel-header">
        <h3>⚙️ Properties Panel</h3>
        {selectedElement && (
          <div className="element-info">
            <span className="element-type">{selectedElement.header.type}</span>
            <span className="element-id">#{selectedElement.header.id}</span>
          </div>
        )}
      </div>

      <div className="control-panel-content">
        {!selectedElement ? (
          <div className="no-selection">
            <div className="no-selection-icon">🎯</div>
            <h4>No Element Selected</h4>
            <p>Click on a component in the canvas to edit its properties and styling options.</p>
          </div>
        ) : (
          <div className="property-sections">
            {/* Content Section */}
            <div className="property-section">
              <div className="property-section-title">📝 CONTENT</div>
              <div className="property-grid">
                <div className="property-item">
                  <label className="property-label">Button Text</label>
                  <input
                    className="property-input"
                    type="text"
                    value={selectedElement.content?.content || ""}
                    onChange={(e) => handleAttributeChange("content", e.target.value)}
                  />
                </div>
                <div className="property-item">
                  <label className="property-label">Variant</label>
                  <select
                    className="property-input"
                    value={selectedElement.content?.variant || "primary"}
                    onChange={(e) => handleAttributeChange("variant", e.target.value)}
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="danger">Danger</option>
                  </select>
                </div>
                <div className="property-item">
                  <label className="property-label">Size</label>
                  <select
                    className="property-input"
                    value={selectedElement.content?.size || "medium"}
                    onChange={(e) => handleAttributeChange("size", e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div className="property-item">
                  <label className="property-label">
                    <input
                      type="checkbox"
                      checked={selectedElement.content?.disabled || false}
                      onChange={(e) => handleAttributeChange("disabled", e.target.checked)}
                    />
                    Disabled
                  </label>
                </div>
              </div>
            </div>

            {/* Layout Section */}
            <div className="property-section">
              <div className="property-section-title">📐 LAYOUT</div>
              <div className="property-grid">
                <div className="property-item">
                  <label className="property-label">X Position</label>
                  <input
                    className="property-input"
                    type="number"
                    value={selectedElement.layout?.x || 0}
                    onChange={(e) => handleAttributeChange("x", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="property-item">
                  <label className="property-label">Y Position</label>
                  <input
                    className="property-input"
                    type="number"
                    value={selectedElement.layout?.y || 0}
                    onChange={(e) => handleAttributeChange("y", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="property-item">
                  <label className="property-label">Width</label>
                  <input
                    className="property-input"
                    type="number"
                    value={selectedElement.layout?.width || 0}
                    onChange={(e) => handleAttributeChange("width", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="property-item">
                  <label className="property-label">Height</label>
                  <input
                    className="property-input"
                    type="number"
                    value={selectedElement.layout?.height || 0}
                    onChange={(e) => handleAttributeChange("height", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Styling Section */}
            <div className="property-section">
              <div className="property-section-title">🎨 STYLING</div>
              <div className="property-grid">
                <div className="property-item">
                  <label className="property-label">Background Color</label>
                  <input
                    className="property-input"
                    type="text"
                    value={selectedElement.styling?.["bg-color"] || ""}
                    onChange={(e) => handleAttributeChange("bg-color", e.target.value)}
                    placeholder="#007acc"
                  />
                </div>
                <div className="property-item">
                  <label className="property-label">Text Color</label>
                  <input
                    className="property-input"
                    type="text"
                    value={selectedElement.styling?.["text-color"] || ""}
                    onChange={(e) => handleAttributeChange("text-color", e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
                <div className="property-item">
                  <label className="property-label">Border Radius</label>
                  <input
                    className="property-input"
                    type="text"
                    value={selectedElement.styling?.["border-radius"] || ""}
                    onChange={(e) => handleAttributeChange("border-radius", e.target.value)}
                    placeholder="4px"
                  />
                </div>
                <div className="property-item">
                  <label className="property-label">Font Size</label>
                  <input
                    className="property-input"
                    type="text"
                    value={selectedElement.styling?.["font-size"] || ""}
                    onChange={(e) => handleAttributeChange("font-size", e.target.value)}
                    placeholder="14px"
                  />
                </div>
              </div>
            </div>

            {/* Classes Section */}
            <div className="property-section">
              <div className="property-section-title">🏷️ CSS CLASSES</div>
              <div className="property-grid">
                <div className="property-item">
                  <label className="property-label">Current Classes</label>
                  <div className="class-list">
                    {currentClasses.map((className, index) => (
                      <span key={index} className="class-pill">
                        {className}
                        <button
                          className="class-remove-btn"
                          onClick={() => handleRemoveClass(className)}
                          title="Remove class"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="property-item">
                  <label className="property-label">Add Class</label>
                  <div className="add-class-controls">
                    <input
                      className="property-input"
                      type="text"
                      placeholder="Enter class name..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddClass(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      className="add-class-btn"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        handleAddClass(input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

