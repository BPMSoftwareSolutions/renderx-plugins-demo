import type { AppState } from "../types/AppTypes";
import { ConductorService } from "../services/ConductorService";

export function createHandleEnterPreview(
  setAppState: React.Dispatch<React.SetStateAction<AppState>>,
  getState: () => AppState
) {
  return () => {
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
}

