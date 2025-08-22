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

export const handlers = {
  async loadComponents(_data: any, ctx: any) {
    let list: any[] = [];
    try {
      if (typeof window !== "undefined" && typeof fetch === "function") {
        // Browser/dev server path: serve from public/data
        const res = await fetch("/data/components.json");
        if (res.ok) list = await res.json();
      } else {
        // Test/Node path: import JSON from repo
        const mod = await import("../../../data/components.json", { with: { type: "json" } } as any);
        list = mod?.default || [];
      }
    } catch {}
    ctx.payload.components = Array.isArray(list) ? list : [];
    return { count: ctx.payload.components.length };
  },
  notifyUi(data: any, ctx: any) {
    data?.onComponentsLoaded?.(ctx.payload.components);
  },
};

