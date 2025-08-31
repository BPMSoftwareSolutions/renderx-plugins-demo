import React from "react";
import { useConductor, resolveInteraction } from "@renderx/host-sdk";
import "./Header.css";

export function HeaderThemeToggle() {
  const conductor = useConductor();
  const [theme, setThemeState] = React.useState<"light" | "dark">("light");

  const toggle = async () => {
    try {
      const next = theme === "light" ? "dark" : "light";
      const route = resolveInteraction("app.ui.theme.toggle");
      await conductor.play(route.pluginId, route.sequenceId, { theme: next });
      // Optimistically flip local label; actual DOM write happens in stage-crew handler
      setThemeState(next);
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
          {theme === "light" ? "🌞 Light" : "🌙 Dark"}
        </button>
      </div>
    </div>
  );
}
