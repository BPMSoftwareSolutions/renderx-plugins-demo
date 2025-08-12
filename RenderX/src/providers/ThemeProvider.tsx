import React, { useEffect, useState } from "react";
import { ConductorService } from "../services/ConductorService";

// Thin-shell ThemeProvider: delegates theme selection to the theme-symphony plugin
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const persisted =
          (typeof localStorage !== "undefined" && localStorage.getItem("app-theme")) || "auto";
        // Ensure plugins are registered before first play
        await ConductorService.getInstance().initialize();
        const conductor = ConductorService.getInstance().getConductor();
        const tryApply = () => {
          if (cancelled) return;
          try {
            const ids = (conductor.getMountedPluginIds && conductor.getMountedPluginIds()) || [];
            if (Array.isArray(ids) && ids.includes("theme-symphony")) {
              if ((window as any).__rx_theme_applied__ === true) return;
              (window as any).__rx_theme_applied__ = true;
              conductor.play("theme-symphony", "theme-symphony", { targetTheme: persisted });
            } else {
              setTimeout(tryApply, 120);
            }
          } catch {
            setTimeout(tryApply, 150);
          }
        };
        tryApply();
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return <>{children}</>;
};

// Toggle button that cycles light -> dark -> auto and delegates to plugin
export const ThemeToggleButton: React.FC = () => {
  const [theme, setTheme] = useState<string>(
    () => (typeof localStorage !== "undefined" && localStorage.getItem("app-theme")) || "auto"
  );
  const next = (t: string) => (t === "light" ? "dark" : t === "dark" ? "auto" : "light");

  const onClick = async () => {
    try {
      const targetTheme = next(theme);
      const conductor = ConductorService.getInstance().getConductor();
      await conductor.play("theme-symphony", "theme-symphony", {
        targetTheme,
        onThemeChange: (t: string) => setTheme(t || targetTheme),
      });
    } catch {}
  };

  return (
    <button onClick={onClick} title={`Theme: ${theme}`} className="theme-toggle-button">
      🎨
    </button>
  );
};
