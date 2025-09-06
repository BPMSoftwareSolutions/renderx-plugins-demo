import React from "react";
import { useConductor, resolveInteraction } from "@renderx/host-sdk";
import "./Header.css";

// Lazy-load the presentational view (disabled in tests to avoid async teardown issues)
const isTestEnv =
  typeof import.meta !== "undefined" && !!(import.meta as any).vitest;
type HeaderButtonViewProps = {
  theme: "light" | "dark" | null;
  onToggle: () => void;
};
const HeaderThemeButtonView = isTestEnv
  ? null
  : (React.lazy(
      () => import("./HeaderThemeButtonView")
    ) as unknown as React.ComponentType<
      HeaderButtonViewProps & React.RefAttributes<HTMLButtonElement>
    >);

export function HeaderThemeToggle() {
  const conductor = useConductor();
  const [theme, setThemeState] = React.useState<"light" | "dark" | null>(null);
  const requestedRef = React.useRef(false);
  const aliveRef = React.useRef(true);
  React.useEffect(() => {
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const safeSetTheme = (t: "light" | "dark") => {
    if (!aliveRef.current) return;
    setThemeState(t);
  };

  const ensureTheme = React.useCallback(
    (el: HTMLButtonElement | null) => {
      if (!el || theme !== null || requestedRef.current || !aliveRef.current)
        return;
      requestedRef.current = true;
      try {
        const route = resolveInteraction("app.ui.theme.get");
        conductor.play(
          route.pluginId,
          route.sequenceId,
          {
            onTheme: (t: "light" | "dark") => safeSetTheme(t),
          },
          (result: any) => {
            const t = result?.theme;
            if (t === "light" || t === "dark") safeSetTheme(t);
          }
        );
      } catch {
        // Fallback to dark theme on error
        safeSetTheme("dark");
      }
    },
    [theme, conductor]
  );

  const toggle = async () => {
    try {
      const next = theme === "light" ? "dark" : "light";
      // Optimistically update UI immediately for snappy feedback
      safeSetTheme(next);
      const route = resolveInteraction("app.ui.theme.toggle");
      const result = await conductor.play(route.pluginId, route.sequenceId, {
        theme: next,
      });
      const updatedTheme =
        (result?.theme as "light" | "dark" | undefined) || next;
      // Reconcile with authoritative result
      safeSetTheme(updatedTheme);
    } catch {
      // Silently handle theme toggle failures
    }
  };

  return (
    <div className="header-container">
      <div className="header-theme-toggle">
        {isTestEnv ? (
          <button
            ref={ensureTheme}
            onClick={toggle}
            className="header-theme-button"
            title="Toggle Theme"
          >
            {theme === "light" ? "🌙 Dark" : "🌞 Light"}
          </button>
        ) : (
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
        )}
      </div>
    </div>
  );
}
