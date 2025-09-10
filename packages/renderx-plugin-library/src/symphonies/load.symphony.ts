// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file exports handlers for those sequences.
import { mapJsonComponentToTemplate } from "@renderx-plugins/host-sdk";

function mapJsonComponentToTemplateCompat(json: any) {
  const tpl = mapJsonComponentToTemplate(json);
  const type = json?.metadata?.replaces || json?.metadata?.type || "div";
  return {
    id: `json-${type}`,
    name: json?.metadata?.name || type,
    template: tpl,
    metadata: json?.metadata || {},
    // Preserve original UI for CSS extraction in Node/test path
    ui: json?.ui,
  };
}


// Compile-time flag injected by tsup/esbuild via --define.IS_LIB_BUILD_FLAG=true
declare const IS_LIB_BUILD_FLAG: boolean;
const IS_LIB_BUILD = (typeof IS_LIB_BUILD_FLAG !== "undefined") && IS_LIB_BUILD_FLAG;



export const handlers = {
  async loadComponents(_data: any, ctx: any) {
    let list: any[] = [];
    try {
      const isVitest = (() => {
        try {
          // @ts-ignore - Vitest injects this flag
          return !!(import.meta as any)?.vitest || process.env.NODE_ENV === "test";
        } catch {
          return process.env.NODE_ENV === "test";
        }
      })();

      if (typeof fetch === "function" && !isVitest) {
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
      } else if (!IS_LIB_BUILD) {
        // Node/test path: use manifest-tools to enumerate JSON components in the repo
        try {
          const mod: any = await import("@renderx-plugins/manifest-tools");
          const fn = mod?.getJsonComponents;
          const items = typeof fn === "function" ? await fn() : [];
          list = (items || []).map(mapJsonComponentToTemplateCompat);
        } catch {
          list = [];
        }
      } else {
        // During package build, exclude Node/test-time logic from the published bundle
        list = [];
      }
    } catch {
      // Leave list empty on error
    }

    ctx.payload.components = Array.isArray(list) ? list : [];
    return { count: ctx.payload.components.length };
  },
  notifyUi(data: any, ctx: any) {
    data?.onComponentsLoaded?.(ctx.payload.components);
  },
};
