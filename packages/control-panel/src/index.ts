// Control Panel package entry
// UI export and runtime register (no-op; sequences are JSON-mounted)

// Ensure styles load as a side-effect when the package is imported
import './ui/ControlPanel.css';

// Inject built CSS at runtime when this package is dynamically imported (works in dev and prod)
(() => {
  try {
    if (typeof document === 'undefined') return;
    const href = new URL('./index.css', import.meta.url).href;
    const exists = !!document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
    if (!exists) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  } catch {}
})();

export { ControlPanel } from './ui/ControlPanel';

export async function register(_conductor?: any) {
  // No-op: Control Panel sequences are mounted via json-sequences loader
}
