// Ensure CSS is included as a side-effect for consumers (browser-safe)
// Use dynamic import guarded by DOM presence so Node/test imports don't crash
if (typeof document !== "undefined" && document && typeof (document as any).createElement === "function") {
  // Dynamic import triggers tsup's injectStyle only in real browser-like env
  // Fire-and-forget to avoid top-level await
  import("./ui/Header.css");
}

export { HeaderTitle } from "./ui/HeaderTitle";
export { HeaderControls } from "./ui/HeaderControls";
export { HeaderThemeToggle } from "./ui/HeaderThemeToggle";
export { handlers } from "./symphonies/ui/ui.symphony";

// Optional registration hook for sequences (no-op for this UI-only pilot)
export async function register(_conductor: any) {
  // no-op
}

