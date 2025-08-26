import React from "react";
import { useConductor } from "../../../src/conductor";
import { resolveInteraction } from "../../../src/interactionManifest";
import "./CanvasPage.css";

export function CanvasHeader() {
  const [zoomLevel, setZoomLevel] = React.useState(100);
  const [activeMode, setActiveMode] = React.useState("select");
  const conductor = useConductor();

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 25));
  };

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
  };

  const handleExport = async () => {
    try {
      const route = resolveInteraction("canvas.component.export");
      await conductor?.play?.(route.pluginId, route.sequenceId, {});
    } catch (error) {
      console.error("Failed to export canvas:", error);
    }
  };

  const handleImport = async () => {
    try {
      const route = resolveInteraction("canvas.component.import");
      await conductor?.play?.(route.pluginId, route.sequenceId, {});
    } catch (error) {
      console.error("Failed to import canvas:", error);
    }
  };

  return (
    <div className="canvas-header">
      <div className="canvas-title">🎨 Design Canvas</div>
      <div className="canvas-controls">
        <div
          className={`canvas-control ${
            activeMode === "select" ? "active" : ""
          }`}
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
        <div
          className="canvas-control"
          onClick={handleExport}
          title="Export Canvas"
        >
          <span>💾</span>
        </div>
        <div
          className="canvas-control"
          onClick={handleImport}
          title="Import .ui"
        >
          <span>📂</span>
        </div>
        <div className="canvas-divider"></div>
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={handleZoomOut}>
            −
          </button>
          <span className="zoom-level">{zoomLevel}%</span>
          <button className="zoom-btn" onClick={handleZoomIn}>
            +
          </button>
        </div>
        <div className="canvas-control" data-action="preview">
          <span>👁️</span>
        </div>
      </div>
    </div>
  );
}
