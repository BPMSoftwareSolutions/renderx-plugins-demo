import React from "react";
import type { AppState } from "../types/AppTypes";
import CenterPanel from "./CenterPanel";
import ElementLibrary from "./ElementLibrary";
import ControlPanel from "./ControlPanel";
import ExitOverlay from "./ExitOverlay";

interface LayoutRendererProps {
  appState: AppState;
  onExitPreview: () => void;
}

const LayoutRenderer: React.FC<LayoutRendererProps> = ({ appState, onExitPreview }) => {
  const { layoutMode } = appState;

  switch (layoutMode) {
    case "preview":
      return (
        <div className="app-layout app-layout--preview">
          <CenterPanel />
          <ExitOverlay variant="preview" onExit={onExitPreview} />
        </div>
      );

    case "fullscreen-preview":
      return (
        <div className="app-layout app-layout--fullscreen-preview">
          <CenterPanel />
          <ExitOverlay variant="fullscreen" onExit={onExitPreview} />
        </div>
      );

    case "editor":
    default: {
      const { showElementLibrary, showControlPanel } = appState.panels;
      let layoutClass = "app-layout";
      if (!showElementLibrary && !showControlPanel) layoutClass += " app-layout--no-panels";
      else if (!showElementLibrary) layoutClass += " app-layout--no-library";
      else if (!showControlPanel) layoutClass += " app-layout--no-controls";

      return (
        <div className={layoutClass}>
          {/* Element Library - Left Panel */}
          {showElementLibrary && (
            <aside className="app-sidebar left" id="component-library" data-plugin-mounted="true">
              <ElementLibrary />
            </aside>
          )}

          {/* Canvas - Center */}
          <CenterPanel />

          {/* Control Panel - Right Panel */}
          {showControlPanel && (
            <aside className="app-sidebar right" id="control-panel" data-plugin-mounted="true">
              <ControlPanel />
            </aside>
          )}
        </div>
      );
    }
  }
};

export default LayoutRenderer;

