// Control Panel package entry
// UI export and runtime register (no-op; sequences are JSON-mounted)

export { ControlPanel } from './ui/ControlPanel';

export async function register(_conductor?: any) {
  // No-op: Control Panel sequences are mounted via json-sequences loader
}
