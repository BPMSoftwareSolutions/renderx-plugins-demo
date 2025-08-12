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

// ElementLibrary component is now imported directly and integrates with Musical Conductor
// Removed plugin-loading logic - using original ElementLibrary.tsx with Musical Conductor integration

import {
  type ConductorClient,
  resetCommunicationSystem,
} from "musical-conductor";
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

  const [communicationSystem, setCommunicationSystem] = useState<{
    conductor: ConductorClient;
  } | null>(null);

  // Canvas interactions are now fully handled by the Canvas UI plugin via conductor.play per ADR-0014.



  // Initialize communication system
  useEffect(() => {
    console.log("🚀 RenderX Evolution - Initializing Communication System...");

    let cancelled = false;
    const svc = ConductorService.getInstance();
    svc
      .initialize()
      .then(() => {
        const conductor = svc.getConductor();
        if (cancelled) return;
        setCommunicationSystem({ conductor });
        console.log("✅ Communication System initialized successfully");
        console.log("🎼 Musical Conductor:", conductor.getStatistics());
        (window as any).renderxCommunicationSystem = { conductor };
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("❌ Failed to initialize communication system:", error);
        }
      });

    // Cleanup function for React StrictMode compatibility
    return () => {
      cancelled = true;
      console.log("🧹 Cleaning up communication system...");
      try {
        const isDev =
          typeof import.meta !== "undefined" &&
          (import.meta as any).env &&
          (import.meta as any).env.DEV === true;
        if (!isDev) {
          resetCommunicationSystem();
        } else {
          // Avoid full teardown in dev/StrictMode to prevent mid-flow blank conductor
          // Keep the existing conductor instance for idempotent re-mounts
          (window as any).renderxCommunicationSystem = (window as any)
            .renderxCommunicationSystem || { conductor: undefined };
        }
      } catch {
        // Fallback to safe reset if env detection fails
        resetCommunicationSystem();
      }
    };
  }, []);

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
    if (communicationSystem) {
      console.log(
        "🎼 Starting Element Library Panel Toggle via conductor.play()"
      );
      communicationSystem.conductor.play(
        "panel-toggle-symphony",
        "onTogglePanel",
        {
          panelType: "elementLibrary",
          newState,
          options: {
            animated: true,
            updateLayout: true,
          },
          timestamp: Date.now(),
        }
      );
    }
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
    if (communicationSystem) {
      console.log("🎼 Starting Control Panel Toggle via conductor.play()");
      communicationSystem.conductor.play(
        "panel-toggle-symphony",
        "onTogglePanel",
        {
          panelType: "controlPanel",
          newState,
          options: {
            animated: true,
            updateLayout: true,
          },
          timestamp: Date.now(),
        }
      );
    }
  };

  // Layout mode handlers with Musical Sequence integration
  const handleEnterPreview = () => {
    const previousMode = appState.layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "preview" }));

    // Start musical sequence using CIA conductor.play()
    if (communicationSystem) {
      console.log(
        "🎼 Starting Layout Mode Change: Preview via conductor.play()"
      );
      communicationSystem.conductor.play(
        "layout-mode-symphony",
        "onModeChange",
        {
          previousMode,
          currentMode: "preview",
          options: {
            animated: true,
            preserveState: true,
          },
          timestamp: Date.now(),
        }
      );
    }
  };

  const handleEnterFullscreenPreview = () => {
    const previousMode = appState.layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "fullscreen-preview" }));

    // Start musical sequence instead of direct event emission
    if (communicationSystem) {
      console.log(
        "🎼 Starting Layout Mode Change: Fullscreen Preview via conductor.play()"
      );
      communicationSystem.conductor.play(
        "layout-mode-symphony",
        "onModeChange",
        {
          previousMode,
          currentMode: "fullscreen-preview",
          options: {
            animated: true,
            preserveState: false,
          },
          timestamp: Date.now(),
        }
      );
    }
  };

  const handleExitPreview = () => {
    const previousMode = appState.layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "editor" }));

    // Start musical sequence using CIA conductor.play()
    if (communicationSystem) {
      console.log(
        "🎼 Starting Layout Mode Change: Editor via conductor.play()"
      );
      communicationSystem.conductor.play(
        "layout-mode-symphony",
        "onModeChange",
        {
          previousMode,
          currentMode: "editor",
          options: {
            animated: true,
            preserveState: true,
          },
          timestamp: Date.now(),
        }
      );
    }
  };

  // Render layout based on mode
  const renderLayout = () => {
    const { layoutMode } = appState;

    switch (layoutMode) {
      case "preview":
        return (
          <div className="app-layout app-layout--preview">
            <CenterPanel />
            <div className="preview-overlay">
              <button
                className="preview-exit-button"
                onClick={handleExitPreview}
                title="Exit Preview (Esc)"
              >
                ✕ Exit Preview
              </button>
            </div>
          </div>
        );

      case "fullscreen-preview":
        return (
          <div className="app-layout app-layout--fullscreen-preview">
            <CenterPanel />
            <div className="preview-overlay">
              <button
                className="preview-exit-button"
                onClick={handleExitPreview}
                title="Exit Fullscreen Preview"
              >
                ✕ Exit Fullscreen
              </button>
            </div>
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
            <div className="panel-toggles">
              <button
                className={`panel-toggle-button ${
                  appState.panels.showElementLibrary ? "active" : ""
                }`}
                onClick={handleToggleElementLibrary}
                title={`${
                  appState.panels.showElementLibrary ? "Hide" : "Show"
                } Element Library`}
              >
                📚 Library
              </button>
              <button
                className={`panel-toggle-button ${
                  appState.panels.showControlPanel ? "active" : ""
                }`}
                onClick={handleToggleControlPanel}
                title={`${
                  appState.panels.showControlPanel ? "Hide" : "Show"
                } Control Panel`}
              >
                🎛️ Properties
              </button>
            </div>
          </div>

          <div className="app-header-right">
            <button
              className="preview-button"
              onClick={handleEnterPreview}
              title="Enter Preview Mode"
            >
              👁️ Preview
            </button>
            <button
              className="fullscreen-preview-button"
              onClick={handleEnterFullscreenPreview}
              title="Enter Fullscreen Preview"
            >
              ⛶ Fullscreen
            </button>
            <ThemeToggleButton />
          </div>
        </header>
      )}

      <main className="app-main">{renderLayout()}</main>
    </div>
  );
};

export default AppContent;
