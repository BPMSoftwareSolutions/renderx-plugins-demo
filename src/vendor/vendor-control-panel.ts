// Stable vendor entry used to bundle the workspace Control Panel into a single file for preview/E2E
// IMPORTANT: Import via bare package specifier so UI and symphonies share the SAME module instance (observer store)
import * as CP from '@renderx-plugins/control-panel';
export const ControlPanel = CP.ControlPanel;
export const register = CP.register;
// Prevent full tree-shake: attach to window for preview builds
if (typeof window !== 'undefined') {
  // @ts-ignore
  (window).__rx_cp_vendor = CP;
}
