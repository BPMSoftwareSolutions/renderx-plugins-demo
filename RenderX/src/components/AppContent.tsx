/**
 * App Content Component
 * Main application logic and layout management
 */

import React, { useState, useEffect } from "react";
// ElementLibrary component with Musical Conductor integration
import ElementLibrary from "./ElementLibrary";
import ControlPanel from "./ControlPanel";
import CenterPanel from "./CenterPanel";
import { ThemeToggleButton } from "../providers/ThemeProvider";
import type { AppState } from "../types/AppTypes";
import ExitOverlay from "./ExitOverlay";
import HeaderPanelToggles from "./HeaderPanelToggles";
import HeaderActions from "./HeaderActions";

// ElementLibrary component is now imported directly and integrates with Musical Conductor
// Removed plugin-loading logic - using original ElementLibrary.tsx with Musical Conductor integration

import { ConductorService } from "../services/ConductorService";

const AppContent: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    layoutMode: "editor",
    panels: {
      showElementLibrary: true,
      showControlPanel: true,
    },
    hasUnsavedChanges: false,
  });


  // Canvas interactions are now fully handled by the Canvas UI plugin via conductor.play per ADR-0014.



  // Initialize communication system

  // Panel toggle handlers with Musical Sequence integration
  const handleToggleElementLibrary = () => {
    const newState = !appState.panels.showElementLibrary;

    setAppState((prev) => ({
      ...prev,
      panels: {
        ...prev.panels,
        showElementLibrary: newState,
      },
    }));

    // Start musical sequence using CIA conductor.play()
    try {
      const conductor = ConductorService.getInstance().getConductor();
      conductor.play(
        "panel-toggle-symphony",
        "onTogglePanel",
        {
          panelType: "elementLibrary",
          newState,
          options: { animated: true, updateLayout: true },
          timestamp: Date.now(),
        }
      );
    } catch {}
  };

  const handleToggleControlPanel = () => {
    const newState = !appState.panels.showControlPanel;

    setAppState((prev) => ({
      ...prev,
      panels: {
        ...prev.panels,
        showControlPanel: newState,
      },
    }));

    // Start musical sequence using CIA conductor.play()
    try {
      const conductor = ConductorService.getInstance().getConductor();
      conductor.play(
        "panel-toggle-symphony",
        "onTogglePanel",
        {
          panelType: "controlPanel",
          newState,
          options: { animated: true, updateLayout: true },
          timestamp: Date.now(),
        }
      );
    } catch {}
  };

  // Layout mode handlers with Musical Sequence integration
  const handleEnterPreview = () => {
    const previousMode = appState.layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "preview" }));

    // Start musical sequence using CIA conductor.play()
    try {
      const conductor = ConductorService.getInstance().getConductor();
      conductor.play(
        "layout-mode-symphony",
        "onModeChange",
        {
          previousMode,
          currentMode: "preview",
          options: { animated: true, preserveState: true },
          timestamp: Date.now(),
        }
      );
    } catch {}
  };

  const handleEnterFullscreenPreview = () => {
    const previousMode = appState.layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "fullscreen-preview" }));

    // Start musical sequence instead of direct event emission
    try {
      const conductor = ConductorService.getInstance().getConductor();
      conductor.play(
        "layout-mode-symphony",
        "onModeChange",
        {
          previousMode,
          currentMode: "fullscreen-preview",
          options: { animated: true, preserveState: false },
          timestamp: Date.now(),
        }
      );
    } catch {}
  };

  const handleExitPreview = () => {
    const previousMode = appState.layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "editor" }));

    // Start musical sequence using CIA conductor.play()
    try {
      const conductor = ConductorService.getInstance().getConductor();
      conductor.play(
        "layout-mode-symphony",
        "onModeChange",
        {
          previousMode,
          currentMode: "editor",
          options: { animated: true, preserveState: true },
          timestamp: Date.now(),
        }
      );
    } catch {}
  };

  // Render layout based on mode
  const renderLayout = () => {
    const { layoutMode } = appState;

    switch (layoutMode) {
      case "preview":
        return (
          <div className="app-layout app-layout--preview">
            <CenterPanel />
            <ExitOverlay variant="preview" onExit={handleExitPreview} />
          </div>
        );

      case "fullscreen-preview":
        return (
          <div className="app-layout app-layout--fullscreen-preview">
            <CenterPanel />
            <ExitOverlay variant="fullscreen" onExit={handleExitPreview} />
          </div>
        );

      case "editor":
      default:
        const { showElementLibrary, showControlPanel } = appState.panels;

        // Determine layout class based on panel visibility
        let layoutClass = "app-layout";
        if (!showElementLibrary && !showControlPanel) {
          layoutClass += " app-layout--no-panels";
        } else if (!showElementLibrary) {
          layoutClass += " app-layout--no-library";
        } else if (!showControlPanel) {
          layoutClass += " app-layout--no-controls";
        }

        return (
          <div className={layoutClass}>
            {/* Element Library - Left Panel */}
            {showElementLibrary && (
              <aside
                className="app-sidebar left"
                id="component-library"
                data-plugin-mounted="true"
              >
                <ElementLibrary />
              </aside>
            )}

            {/* Canvas - Center */}
            <CenterPanel />

            {/* Control Panel - Right Panel */}
            {showControlPanel && (
              <aside
                className="app-sidebar right"
                id="control-panel"
                data-plugin-mounted="true"
              >
                <ControlPanel />
              </aside>
            )}
          </div>
        );
    }
  };

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

      <main className="app-main">{renderLayout()}</main>
    </div>
  );
};

export default AppContent;
