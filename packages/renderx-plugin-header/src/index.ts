export { HeaderTitle } from "./ui/HeaderTitle";
export { HeaderControls } from "./ui/HeaderControls";
export { HeaderThemeToggle } from "./ui/HeaderThemeToggle";
export { handlers } from "./symphonies/ui/ui.symphony";

// Optional registration hook for sequences (no-op for this UI-only pilot)
export async function register(_conductor: any) {
  // no-op
}

