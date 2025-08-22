export const sequence = {
  id: "library-load-symphony",
  name: "Library Load",
  movements: [
    {
      id: "load",
      beats: [
        { beat: 1, event: "library:components:load", handler: "loadComponents", timing: "immediate" },
        { beat: 2, event: "library:components:notify-ui", handler: "notifyUi", timing: "after-beat" },
      ],
    },
  ],
} as const;

export const handlers = {
  async loadComponents(_data: any, ctx: any) {
    const list = (await import("../../../data/components.json", { with: { type: "json" } } as any)).default;
    ctx.payload.components = Array.isArray(list) ? list : [];
    return { count: ctx.payload.components.length };
  },
  notifyUi(data: any, ctx: any) {
    data?.onComponentsLoaded?.(ctx.payload.components);
  },
};

