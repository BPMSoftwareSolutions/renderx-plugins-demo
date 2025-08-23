// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.
function mapJsonComponentToTemplate(json: any) {
  const type = json?.metadata?.replaces || json?.metadata?.type || "div";
  const name = json?.metadata?.name || type;
  const classes = ["rx-comp", `rx-${type}`];
  const ci = json?.integration?.canvasIntegration || {};

  // Handle icon data attributes
  const icon = json?.ui?.icon || {};
  const attrs: any = {};
  if (icon?.mode === "emoji" && icon?.value) {
    attrs["data-icon"] = String(icon.value);
    if (icon.position) attrs["data-icon-pos"] = String(icon.position);
  }

  return {
    id: `json-${type}`,
    name,
    template: {
      tag: type === "input" ? "input" : type || "div",
      text:
        type === "button"
          ? json?.integration?.properties?.defaultValues?.content || "Click Me"
          : undefined,
      classes,
      // Pass through base CSS and variable map so StageCrew can inject styles
      css: json?.ui?.styles?.css,
      cssVariables: json?.ui?.styles?.variables || {},
      // Library-only style layer for preview (non-breaking optional fields)
      cssLibrary: json?.ui?.styles?.library?.css,
      cssVariablesLibrary: json?.ui?.styles?.library?.variables || {},
      // Icon and other data attributes
      attributes: attrs,
      // Default size used for initial inline dimensions
      dimensions: { width: ci.defaultWidth, height: ci.defaultHeight },
      // Inline style will be reserved for position only in create handler
      style: {},
    },
  };
}

export const handlers = {
  async loadComponents(_data: any, ctx: any) {
    let list: any[] = [];
    try {
      if (typeof globalThis !== "undefined" && typeof fetch === "function") {
        // Browser/dev server path: serve from public/json-components using JSON index
        const idxRes = await fetch("/json-components/index.json");
        const idx = idxRes.ok ? await idxRes.json() : { components: [] };
        const files: string[] = idx?.components || [];
        const base = "/json-components/";
        const items: any[] = [];
        for (const f of files) {
          const res = await fetch(base + f);
          if (res.ok) {
            const json = await res.json();
            items.push(mapJsonComponentToTemplate(json));
          }
        }
        list = items;
      } else {
        // Test/Node path: use repo json-components folder
        const idx = await import("../../../json-components/index.json", {
          with: { type: "json" },
        } as any);
        const files: string[] =
          idx?.default?.components || idx?.components || [];
        const items: any[] = [];
        for (const f of files) {
          const mod = await import(
            /* @vite-ignore */ `../../../json-components/${f}`,
            { with: { type: "json" } } as any
          );
          const json = mod?.default || mod;
          items.push(mapJsonComponentToTemplate(json));
        }
        list = items;
      }
    } catch {
      // fallback to legacy data list on error
      try {
        const mod = await import("../../../data/components.json", {
          with: { type: "json" },
        } as any);
        list = mod?.default || [];
      } catch {}
    }
    ctx.payload.components = Array.isArray(list) ? list : [];
    return { count: ctx.payload.components.length };
  },
  notifyUi(data: any, ctx: any) {
    data?.onComponentsLoaded?.(ctx.payload.components);
  },
};
