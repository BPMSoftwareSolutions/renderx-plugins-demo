import type { AppState } from "../types/AppTypes";
import { ConductorService } from "../services/ConductorService";

export function createHandleExitPreview(
  setAppState: React.Dispatch<React.SetStateAction<AppState>>,
  getState: () => AppState
) {
  return () => {
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
}

