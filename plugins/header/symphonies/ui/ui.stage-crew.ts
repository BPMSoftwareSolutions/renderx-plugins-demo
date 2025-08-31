export function toggleTheme(data: any, ctx: any) {
  try {
    const htmlSelector = "html";
    const next = data?.theme || "light";

    // Use stage-crew to set attribute; avoid direct DOM writes in UI layer
    const txn = ctx.stageCrew?.beginBeat?.();
    if (txn) {
      txn.update(htmlSelector, { attrs: { "data-theme": next } });
      txn.commit({ batch: true });
    }

    // Persist preference marker on ctx (no direct globals)
    try {
      ctx.payload.theme = next;
    } catch {}
  } catch (e) {
    ctx.logger?.warn?.("toggleTheme failed", e);
  }
}
