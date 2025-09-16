// Stable vendor entry used to bundle the workspace Control Panel into a single file for preview/E2E
// This lets the runtime resolve the bare module specifier via an import map
import * as CP from '../../packages/control-panel/src/index.ts';
export const ControlPanel = CP.ControlPanel;
export const register = CP.register;
// Prevent full tree-shake: attach to window for preview builds
if (typeof window !== 'undefined') {
  // @ts-ignore
  (window).__rx_cp_vendor = CP;
}

