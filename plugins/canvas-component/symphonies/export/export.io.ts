export const queryAllComponents = async (data: any, ctx: any) => {
  try {
    ctx.logger?.info?.("Querying all components from KV store");

    let components: any[] = [];

    // Try to get components from KV store if available
    if (ctx.io?.kv?.getAll) {
      try {
        components = await ctx.io.kv.getAll();
        ctx.logger?.info?.(
          `KV store available, found ${components?.length || 0} components`
        );
      } catch (kvError) {
        ctx.logger?.warn?.("KV store error:", kvError);
        components = [];
      }
    } else {
      ctx.logger?.info?.("KV store not available");
    }

    // If KV store is empty, perform basic DOM discovery for CSS collection
    if (!components || components.length === 0) {
      ctx.logger?.info?.(
        "KV store empty, performing basic DOM discovery for export"
      );
      if (typeof document !== "undefined") {
        const canvasEl = document.getElementById("rx-canvas");
        if (canvasEl) {
          const found: any[] = [];
          const els = canvasEl.querySelectorAll(".rx-comp");
          for (const el of Array.from(els)) {
            const htmlEl = el as HTMLElement;
            const classes = Array.from(htmlEl.classList);
            const typeClass = classes.find(
              (cls) => cls.startsWith("rx-") && cls !== "rx-comp"
            );
            const type = typeClass
              ? typeClass.replace("rx-", "")
              : htmlEl.tagName.toLowerCase();

            found.push({
              id: htmlEl.id,
              type,
              classes, // This is what CSS collection needs
              createdAt: Date.now(),
            });
          }
          components = found;
          ctx.payload.source = "dom-discovery";
          ctx.logger?.info?.(`DOM discovery found ${found.length} components`);
        }
      }
    }

    ctx.payload.components = components || [];
    ctx.payload.componentCount = components?.length || 0;
    if (!ctx.payload.source) ctx.payload.source = "kv-store";
    ctx.logger?.info?.(
      `Retrieved ${ctx.payload.componentCount} components from ${ctx.payload.source}`
    );
  } catch (error) {
    ctx.logger?.error?.("Failed to query components:", error);
    ctx.payload.error = String(error);
    ctx.payload.components = [];
    ctx.payload.componentCount = 0;
  }
};
