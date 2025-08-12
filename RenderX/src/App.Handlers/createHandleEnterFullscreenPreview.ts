import type { AppState } from "../types/AppTypes";
import { ConductorService } from "../services/ConductorService";

export function createHandleEnterFullscreenPreview(
  setAppState: React.Dispatch<React.SetStateAction<AppState>>,
  getState: () => AppState
) {
  return () => {
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
}

