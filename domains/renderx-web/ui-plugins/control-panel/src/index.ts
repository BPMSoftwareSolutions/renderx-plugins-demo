// Control Panel package entry
// UI export and runtime register (no-op; sequences are JSON-mounted)

// Ensure styles are applied when consumers import the package entry.
// Import both the top-level index.css and the UI ControlPanel.css explicitly.
// Some bundlers don't follow CSS-level @import; direct imports ensure inclusion.
import './index.css';
import './ui/ControlPanel.css';

export { ControlPanel } from './ui/ControlPanel';

export async function register(_conductor?: any) {
  // No-op: Control Panel sequences are mounted via json-sequences loader
}
