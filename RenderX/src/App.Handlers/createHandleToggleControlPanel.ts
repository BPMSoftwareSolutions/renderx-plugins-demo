import type { AppState } from "../types/AppTypes";
import { ConductorService } from "../services/ConductorService";

export function createHandleToggleControlPanel(
  setAppState: React.Dispatch<React.SetStateAction<AppState>>,
  getState: () => AppState
) {
  return () => {
    const current = getState().panels.showControlPanel;
    const newState = !current;

    setAppState((prev) => ({
      ...prev,
      panels: { ...prev.panels, showControlPanel: newState },
    }));

    try {
      const conductor = ConductorService.getInstance().getConductor();
      conductor.play("panel-toggle-symphony", "onTogglePanel", {
        panelType: "controlPanel",
        newState,
        options: { animated: true, updateLayout: true },
        timestamp: Date.now(),
      });
    } catch {}
  };
}

