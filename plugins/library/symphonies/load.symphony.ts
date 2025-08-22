export const sequence = {
  id: "library-load-symphony",
  name: "Library Load",
  movements: [
    {
      id: "load",
      name: "Load",
      beats: [
        { beat: 1, event: "library:components:load", title: "Load Components", dynamics: "mf", handler: "loadComponents", timing: "immediate" },
        { beat: 2, event: "library:components:notify-ui", title: "Notify UI", dynamics: "mf", handler: "notifyUi", timing: "after-beat" },
      ],
    },
  ],
} as const;

function mapJsonComponentToTemplate(json: any) {
  const type = json?.metadata?.replaces || json?.metadata?.type || "div";
  const name = json?.metadata?.name || type;
  const classes = ["rx-comp", `rx-${type}`];
  const ci = json?.integration?.canvasIntegration || {};
  return {
    id: `json-${type}`,
    name,
    template: {
      tag: type === "input" ? "input" : (type || "div"),
      text: type === "button" ? (json?.integration?.properties?.defaultValues?.content || "Click Me") : undefined,
      classes,
      // Pass through base CSS and variable map so StageCrew can inject styles
      css: json?.ui?.styles?.css,
      cssVariables: json?.ui?.styles?.variables || {},
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
      if (typeof window !== "undefined" && typeof fetch === "function") {
        // Browser/dev server path: serve from public/jsone-components using JSON index
        const idxRes = await fetch("/jsone-components/index.json");
        const idx = idxRes.ok ? await idxRes.json() : { components: [] };
        const files: string[] = idx?.components || [];
        const base = "/jsone-components/";
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
        const idx = await import("../../../json-components/index.json", { with: { type: "json" } } as any);
        const files: string[] = idx?.default?.components || idx?.components || [];
        const items: any[] = [];
        for (const f of files) {
          const mod = await import(`../../../json-components/${f}`, { with: { type: "json" } } as any);
          const json = mod?.default || mod;
          items.push(mapJsonComponentToTemplate(json));
        }
        list = items;
      }
    } catch (e) {
      // fallback to legacy data list on error
      try {
        const mod = await import("../../../data/components.json", { with: { type: "json" } } as any);
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

