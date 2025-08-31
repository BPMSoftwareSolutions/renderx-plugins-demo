import React from "react";
import { useConductor, resolveInteraction } from "@renderx/host-sdk";
import "./Header.css";

export function HeaderThemeToggle() {
  const conductor = useConductor();
  const [theme, setThemeState] = React.useState<"light" | "dark">("dark"); // Default to dark per issue #80

  // Get current theme on mount using stage-crew handler
  React.useEffect(() => {
    const getCurrentTheme = async () => {
      try {
        const route = resolveInteraction("app.ui.theme.get");
        const result = await conductor.play(
          route.pluginId,
          route.sequenceId,
          {}
        );
        const currentTheme = result?.theme || "dark";
        setThemeState(currentTheme);
      } catch (e) {
        console.warn("Failed to get current theme:", e);
        setThemeState("dark");
      }
    };

    getCurrentTheme();
  }, [conductor]);

  const toggle = async () => {
    try {
      const next = theme === "light" ? "dark" : "light";
      const route = resolveInteraction("app.ui.theme.toggle");
      const result = await conductor.play(route.pluginId, route.sequenceId, {
        theme: next,
      });
      // Update local state based on the result from stage-crew handler
      const updatedTheme = result?.theme || next;
      setThemeState(updatedTheme);
    } catch (e) {
      console.warn("Theme toggle failed: ", e);
    }
  };

  return (
    <div className="header-container">
      <div className="header-theme-toggle">
        <button
          onClick={toggle}
          className="header-theme-button"
          title="Toggle Theme"
        >
          {theme === "light" ? "🌙 Dark" : "🌞 Light"}
        </button>
      </div>
    </div>
  );
}
