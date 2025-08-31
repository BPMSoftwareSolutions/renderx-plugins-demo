export function toggleTheme(data: any, ctx: any) {
  try {
    const next = data?.theme || "light";

    // Direct DOM manipulation in stage-crew handler (StageCrew API deprecated)
    try {
      if (typeof document !== "undefined") {
        const el = document.documentElement;
        const raf =
          (typeof window !== "undefined" &&
            (window as any).requestAnimationFrame) ||
          null;
        const apply = () => el.setAttribute("data-theme", next);
        if (raf) raf(() => apply());
        else apply();
      }
    } catch {}

    // Persist preference marker on ctx (no direct globals)
    try {
      ctx.payload.theme = next;
    } catch {}
  } catch (e) {
    ctx.logger?.warn?.("toggleTheme failed", e);
  }
}
