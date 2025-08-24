// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.
import { mapJsonComponentToTemplate } from "../../../src/jsonComponent.mapper";

function mapJsonComponentToTemplateCompat(json: any) {
  const tpl = mapJsonComponentToTemplate(json);
  const type = json?.metadata?.replaces || json?.metadata?.type || "div";
  return {
    id: `json-${type}`,
    name: json?.metadata?.name || type,
    template: tpl,
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
            items.push(mapJsonComponentToTemplateCompat(json));
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
          items.push(mapJsonComponentToTemplateCompat(json));
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
