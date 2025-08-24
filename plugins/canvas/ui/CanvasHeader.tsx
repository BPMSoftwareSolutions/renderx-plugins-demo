import React from "react";
import "./CanvasPage.css";

export function CanvasHeader() {
  const [zoomLevel, setZoomLevel] = React.useState(100);
  const [activeMode, setActiveMode] = React.useState("select");

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 25));
  };

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
  };

  return (
    <div className="canvas-header">
      <div className="canvas-title">🎨 Design Canvas</div>
      <div className="canvas-controls">
        <div 
          className={`canvas-control ${activeMode === "select" ? "active" : ""}`}
          data-mode="select"
          onClick={() => handleModeChange("select")}
        >
          <span>🔍</span>
        </div>
        <div 
          className={`canvas-control ${activeMode === "move" ? "active" : ""}`}
          data-mode="move"
          onClick={() => handleModeChange("move")}
        >
          <span>✋</span>
        </div>
        <div 
          className={`canvas-control ${activeMode === "draw" ? "active" : ""}`}
          data-mode="draw"
          onClick={() => handleModeChange("draw")}
        >
          <span>✏️</span>
        </div>
        <div className="canvas-divider"></div>
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={handleZoomOut}>−</button>
          <span className="zoom-level">{zoomLevel}%</span>
          <button className="zoom-btn" onClick={handleZoomIn}>+</button>
        </div>
        <div 
          className="canvas-control"
          data-action="preview"
        >
          <span>👁️</span>
        </div>
      </div>
    </div>
  );
}
