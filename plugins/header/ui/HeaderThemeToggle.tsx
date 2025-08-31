import React from "react";
import { useConductor, resolveInteraction } from "@renderx/host-sdk";

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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        height: "100%",
        padding: "0 12px",
      }}
    >
      <button
        onClick={toggle}
        style={{ padding: "6px 10px", fontSize: 12 }}
        title="Toggle Theme"
      >
        {theme === "light" ? "🌞 Light" : "🌙 Dark"}
      </button>
    </div>
  );
}
