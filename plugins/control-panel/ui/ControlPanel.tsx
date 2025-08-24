import React from "react";
import "./ControlPanel.css";

export function ControlPanel() {
  const [selectedElement, setSelectedElement] = React.useState<any>(null);

  return (
    <div className="control-panel">
      <div className="control-panel-header">
        <h3>⚙️ Properties Panel</h3>
        {selectedElement && (
          <div className="element-info">
            <span className="element-type">{selectedElement.type}</span>
            <span className="element-id">#{selectedElement.id}</span>
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
            {/* Properties will be rendered here when an element is selected */}
            <div className="property-section">
              <div className="property-section-title">General</div>
              <div className="property-grid">
                <div className="property-item">
                  <label className="property-label">Name</label>
                  <input className="property-input" type="text" value={selectedElement.name || ""} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

