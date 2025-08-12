/**
 * App Content Component
 * Main application logic and layout management
 */

import React, { useState } from "react";
// Thin shell: all domain UIs are mounted via components that themselves are plugin-driven
import LayoutRenderer from "./LayoutRenderer";
import type { AppState } from "../types/AppTypes";
import HeaderPanelToggles from "./HeaderPanelToggles";
import HeaderActions from "./HeaderActions";

import { createHandleToggleElementLibrary } from "../App.Handlers/createHandleToggleElementLibrary";
import { createHandleToggleControlPanel } from "../App.Handlers/createHandleToggleControlPanel";
import { createHandleEnterPreview } from "../App.Handlers/createHandleEnterPreview";
import { createHandleEnterFullscreenPreview } from "../App.Handlers/createHandleEnterFullscreenPreview";
import { createHandleExitPreview } from "../App.Handlers/createHandleExitPreview";

const AppContent: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    layoutMode: "editor",
    panels: {
      showElementLibrary: true,
      showControlPanel: true,
    },
    hasUnsavedChanges: false,
  });



  const getState = () => appState;
  const handleToggleElementLibrary = createHandleToggleElementLibrary(setAppState, getState);
  const handleToggleControlPanel = createHandleToggleControlPanel(setAppState, getState);
  const handleEnterPreview = createHandleEnterPreview(setAppState, getState);
  const handleEnterFullscreenPreview = createHandleEnterFullscreenPreview(setAppState, getState);
  const handleExitPreview = createHandleExitPreview(setAppState, getState);

  return (
    <div className="renderx-app">
      {/* Header - Only show in editor mode */}
      {appState.layoutMode === "editor" && (
        <header className="app-header">
          <div className="app-header-left">
            <h1>RenderX Evolution</h1>
            <p>Lightweight Visual Shell</p>
            {appState.hasUnsavedChanges && (
              <span className="unsaved-indicator">● Unsaved changes</span>
            )}
          </div>

          <div className="app-header-center">
            {/* Panel Toggle Buttons */}
            <HeaderPanelToggles
              showElementLibrary={appState.panels.showElementLibrary}
              showControlPanel={appState.panels.showControlPanel}
              onToggleElementLibrary={handleToggleElementLibrary}
              onToggleControlPanel={handleToggleControlPanel}
            />
          </div>

          <HeaderActions
            onEnterPreview={handleEnterPreview}
            onEnterFullscreen={handleEnterFullscreenPreview}
          />
        </header>
      )}

      <main className="app-main">
        <LayoutRenderer appState={appState} onExitPreview={handleExitPreview} />
      </main>
    </div>
  );
};

export default AppContent;
