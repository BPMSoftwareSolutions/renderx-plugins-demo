import React from "react";
import { useConductor } from "../../../src/conductor";
import { resolveInteraction } from "../../../src/interactionManifest";
import { setSelectionObserver, setClassesObserver } from "../state/observer.store";
import "./ControlPanel.css";

// Property sections configuration
const PROPERTY_SECTIONS = [
  {
    id: "content",
    title: "📝 CONTENT",
    fields: [
      { key: "content", label: "Button Text", type: "text", path: "content.content" },
      { key: "variant", label: "Variant", type: "select", path: "content.variant",
        options: [{ value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }, { value: "danger", label: "Danger" }] },
      { key: "size", label: "Size", type: "select", path: "content.size",
        options: [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }] },
      { key: "disabled", label: "Disabled", type: "checkbox", path: "content.disabled" }
    ]
  },
  {
    id: "layout",
    title: "📐 LAYOUT",
    fields: [
      { key: "x", label: "X Position", type: "number", path: "layout.x" },
      { key: "y", label: "Y Position", type: "number", path: "layout.y" },
      { key: "width", label: "Width", type: "number", path: "layout.width" },
      { key: "height", label: "Height", type: "number", path: "layout.height" }
    ]
  },
  {
    id: "styling",
    title: "🎨 STYLING",
    fields: [
      { key: "bg-color", label: "Background Color", type: "text", path: "styling.bg-color", placeholder: "#007acc" },
      { key: "text-color", label: "Text Color", type: "text", path: "styling.text-color", placeholder: "#ffffff" },
      { key: "border-radius", label: "Border Radius", type: "text", path: "styling.border-radius", placeholder: "4px" },
      { key: "font-size", label: "Font Size", type: "text", path: "styling.font-size", placeholder: "14px" }
    ]
  }
];

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function PropertyField({ field, selectedElement, onChange }: any) {
  const value = getNestedValue(selectedElement, field.path) || (field.type === "number" ? 0 : field.type === "checkbox" ? false : "");

  if (field.type === "select") {
    return (
      <select className="property-input" value={value} onChange={(e) => onChange(field.key, e.target.value)}>
        {field.options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="property-label">
        <input type="checkbox" checked={value} onChange={(e) => onChange(field.key, e.target.checked)} />
        {field.label}
      </label>
    );
  }

  return (
    <input
      className="property-input"
      type={field.type}
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(field.key, field.type === "number" ? parseInt(e.target.value) || 0 : e.target.value)}
    />
  );
}

export function ControlPanel() {
  const conductor = useConductor();
  const [selectedElement, setSelectedElement] = React.useState<any>(null);
  const [currentClasses, setCurrentClasses] = React.useState<string[]>([]);

  React.useEffect(() => {
    setSelectionObserver((selectionModel) => {
      setSelectedElement(selectionModel);
      setCurrentClasses(selectionModel?.classes || []);
    });
    setClassesObserver((classData) => {
      if (classData?.classes) setCurrentClasses(classData.classes);
    });
    return () => {
      setSelectionObserver(null);
      setClassesObserver(null);
    };
  }, []);

  const handleAction = (interaction: string, data: any) => {
    if (!selectedElement?.header?.id) return;
    try {
      const route = resolveInteraction(interaction);
      conductor?.play?.(route.pluginId, route.sequenceId, { id: selectedElement.header.id, ...data });
    } catch {}
  };

  const handleAttributeChange = (attribute: string, value: any) => handleAction("canvas.component.update", { attribute, value });
  const handleAddClass = (className: string) => className.trim() && handleAction("control.panel.classes.add", { className: className.trim() });
  const handleRemoveClass = (className: string) => handleAction("control.panel.classes.remove", { className });

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
            {PROPERTY_SECTIONS.map(section => (
              <div key={section.id} className="property-section">
                <div className="property-section-title">{section.title}</div>
                <div className="property-grid">
                  {section.fields.map(field => (
                    <div key={field.key} className="property-item">
                      {field.type !== "checkbox" && <label className="property-label">{field.label}</label>}
                      <PropertyField field={field} selectedElement={selectedElement} onChange={handleAttributeChange} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="property-section">
              <div className="property-section-title">🏷️ CSS CLASSES</div>
              <div className="property-grid">
                <div className="property-item">
                  <label className="property-label">Current Classes</label>
                  <div className="class-list">
                    {currentClasses.map((className, index) => (
                      <span key={index} className="class-pill">
                        {className}
                        <button className="class-remove-btn" onClick={() => handleRemoveClass(className)} title="Remove class">×</button>
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

