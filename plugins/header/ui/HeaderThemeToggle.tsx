import React from "react";
import { useConductor, resolveInteraction } from "@renderx/host-sdk";
import "./Header.css";

// Lazy-load the presentational view
const HeaderThemeButtonView = React.lazy(
  () => import("./HeaderThemeButtonView")
);

export function HeaderThemeToggle() {
  const conductor = useConductor();
  const [theme, setThemeState] = React.useState<"light" | "dark" | null>(null);
  const requestedRef = React.useRef(false);

  const ensureTheme = React.useCallback(
    (el: HTMLButtonElement | null) => {
      if (!el || theme !== null || requestedRef.current) return;
      requestedRef.current = true;
      try {
        const route = resolveInteraction("app.ui.theme.get");
        conductor.play(
          route.pluginId,
          route.sequenceId,
          {
            onTheme: (t: "light" | "dark") => setThemeState(t),
          },
          (result: any) => {
            const t = result?.theme;
            if (t === "light" || t === "dark") setThemeState(t);
          }
        );
      } catch (e) {
        console.warn("Failed to get current theme:", e);
        setThemeState("dark");
      }
    },
    [theme, conductor]
  );

  const toggle = async () => {
    try {
      const next = theme === "light" ? "dark" : "light";
      const route = resolveInteraction("app.ui.theme.toggle");
      const result = await conductor.play(route.pluginId, route.sequenceId, {
        theme: next,
      });
      const updatedTheme = result?.theme || next;
      setThemeState(updatedTheme);
    } catch (e) {
      console.warn("Theme toggle failed: ", e);
    }
  };

  return (
    <div className="header-container">
      <div className="header-theme-toggle">
        <React.Suspense
          fallback={
            <button
              ref={ensureTheme}
              onClick={toggle}
              className="header-theme-button"
              title="Toggle Theme"
            >
              {theme === "light" ? "🌙 Dark" : "🌞 Light"}
            </button>
          }
        >
          <HeaderThemeButtonView
            ref={ensureTheme}
            theme={theme}
            onToggle={toggle}
          />
        </React.Suspense>
      </div>
    </div>
  );
}
