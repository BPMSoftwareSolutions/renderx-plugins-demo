/**
 * AppContentHandlers
 * Thin-shell handler factories for panel toggles and layout mode transitions.
 *
 * IMPORTANT: Client app is a thin shell. All domain behavior must be handled by plugins
 * via conductor.play. These handlers only flip UI state and invoke plugin sequences.
 */

import type { AppState } from "../types/AppTypes";
import { ConductorService } from "../services/ConductorService";

export function createPanelToggleHandlers(
  setAppState: React.Dispatch<React.SetStateAction<AppState>>
) {
  const handleToggleElementLibrary = () => {
    const newState = (prev: AppState) => !prev.panels.showElementLibrary;

    setAppState((prev) => ({
      ...prev,
      panels: { ...prev.panels, showElementLibrary: newState(prev) },
    }));

    // Orchestrate via plugin
    try {
      const conductor = ConductorService.getInstance().getConductor();
      conductor.play("panel-toggle-symphony", "onTogglePanel", {
        panelType: "elementLibrary",
        newState: true, // value is not used by shell UI; plugin owns behavior
        options: { animated: true, updateLayout: true },
        timestamp: Date.now(),
      });
    } catch {}
  };

  const handleToggleControlPanel = () => {
    const newState = (prev: AppState) => !prev.panels.showControlPanel;

    setAppState((prev) => ({
      ...prev,
      panels: { ...prev.panels, showControlPanel: newState(prev) },
    }));

    // Orchestrate via plugin
    try {
      const conductor = ConductorService.getInstance().getConductor();
      conductor.play("panel-toggle-symphony", "onTogglePanel", {
        panelType: "controlPanel",
        newState: true,
        options: { animated: true, updateLayout: true },
        timestamp: Date.now(),
      });
    } catch {}
  };

  return { handleToggleElementLibrary, handleToggleControlPanel } as const;
}

export function createModeHandlers(
  setAppState: React.Dispatch<React.SetStateAction<AppState>>
) {
  const handleEnterPreview = (getState: () => AppState) => {
    const previousMode = getState().layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "preview" }));
    try {
      const conductor = ConductorService.getInstance().getConductor();
      conductor.play("layout-mode-symphony", "onModeChange", {
        previousMode,
        currentMode: "preview",
        options: { animated: true, preserveState: true },
        timestamp: Date.now(),
      });
    } catch {}
  };

  const handleEnterFullscreenPreview = (getState: () => AppState) => {
    const previousMode = getState().layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "fullscreen-preview" }));
    try {
      const conductor = ConductorService.getInstance().getConductor();
      conductor.play("layout-mode-symphony", "onModeChange", {
        previousMode,
        currentMode: "fullscreen-preview",
        options: { animated: true, preserveState: false },
        timestamp: Date.now(),
      });
    } catch {}
  };

  const handleExitPreview = (getState: () => AppState) => {
    const previousMode = getState().layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "editor" }));
    try {
      const conductor = ConductorService.getInstance().getConductor();
      conductor.play("layout-mode-symphony", "onModeChange", {
        previousMode,
        currentMode: "editor",
        options: { animated: true, preserveState: true },
        timestamp: Date.now(),
      });
    } catch {}
  };

  return {
    handleEnterPreview,
    handleEnterFullscreenPreview,
    handleExitPreview,
  } as const;
}

