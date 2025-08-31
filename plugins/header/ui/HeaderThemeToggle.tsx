import React from "react";
import { useConductor, resolveInteraction } from "@renderx/host-sdk";
import "./Header.css";

export function HeaderThemeToggle() {
  const conductor = useConductor();
  const [theme, setThemeState] = React.useState<"light" | "dark">(() => {
    // Initialize based on current DOM theme
    if (typeof document !== "undefined") {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      return currentTheme === "dark" ? "dark" : "light";
    }
    return "light";
  });

  // Listen for theme changes on the DOM
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          const currentTheme =
            document.documentElement.getAttribute("data-theme");
          setThemeState(currentTheme === "dark" ? "dark" : "light");
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

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
          {theme === "light" ? "🌙 Dark" : "🌞 Light"}
        </button>
      </div>
    </div>
  );
}
