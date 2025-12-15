// Vitest global setup for the plugin package tests
// - Ensures JSDOM env has a predictable starting state
// - Imports the host-sdk mock so component tests work without the host
import { vi } from "vitest";

// Mock @renderx-plugins/host-sdk before any imports
vi.mock("@renderx-plugins/host-sdk", () => ({
  useConductor: () => ({
    play: vi.fn().mockImplementation(async (_pluginId: string, sequenceId: string, data?: { onTheme?: (theme: string) => void; theme?: string }, callback?: (result: { theme?: string }) => void) => {
      let result: { theme?: string } = {};
      if (sequenceId === "header-ui-theme-get-symphony") {
        const current = document?.documentElement?.getAttribute("data-theme") || "light";
        // Fire optional streaming callback
        if (data && typeof data.onTheme === "function") {
          try {
            data.onTheme(current);
          } catch {
            // Ignore callback errors
          }
        }
        result = { theme: current };
      } else if (sequenceId === "header-ui-theme-toggle-symphony") {
        const theme = (data?.theme as "light" | "dark") || "light";
        try {
          document?.documentElement?.setAttribute("data-theme", theme);
        } catch {
          // Ignore DOM manipulation errors
        }
        result = { theme };
      }
      if (typeof callback === "function") {
        try {
          callback(result);
        } catch {
          // Ignore callback errors
        }
      }
      return result;
    })
  }),
  resolveInteraction: (interaction: string) => {
    if (interaction === "app.ui.theme.get") {
      return { pluginId: "HeaderThemePlugin", sequenceId: "header-ui-theme-get-symphony" };
    }
    return { pluginId: "HeaderThemePlugin", sequenceId: "header-ui-theme-toggle-symphony" };
  }
}));

// Ensure no lingering theme between tests
beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

