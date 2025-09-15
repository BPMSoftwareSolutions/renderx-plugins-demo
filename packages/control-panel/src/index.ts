// Temporary workspace package entry for Control Panel (Phase 1)
// UI is re-exported from in-repo source; runtime register is a no-op because
// sequences are mounted from JSON catalogs by the host loader.

export { ControlPanel } from '../../../plugins/control-panel/ui/ControlPanel';

export async function register(_conductor?: any) {
  // No-op: Control Panel sequences are mounted via json-sequences loader
}

