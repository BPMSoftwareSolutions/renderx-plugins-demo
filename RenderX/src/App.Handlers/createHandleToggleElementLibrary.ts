import type { AppState } from "../types/AppTypes";
import { ConductorService } from "../services/ConductorService";

export function createHandleToggleElementLibrary(
  setAppState: React.Dispatch<React.SetStateAction<AppState>>,
  getState: () => AppState
) {
  return () => {
    const current = getState().panels.showElementLibrary;
    const newState = !current;

    setAppState((prev) => ({
      ...prev,
      panels: { ...prev.panels, showElementLibrary: newState },
    }));

    try {
      const conductor = ConductorService.getInstance().getConductor();
      conductor.play("panel-toggle-symphony", "onTogglePanel", {
        panelType: "elementLibrary",
        newState,
        options: { animated: true, updateLayout: true },
        timestamp: Date.now(),
      });
    } catch {}
  };
}

