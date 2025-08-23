export const registerInstance = async (data: any, ctx: any) => {
  const { nodeId, template } = ctx.payload || {};
  if (!nodeId || !template) throw new Error("Missing nodeId/template in payload for IO registration");

  // Examples of IO responsibilities:
  // - persist node metadata to a KV/registry
  // - write undo snapshot / change journal
  // - cache template/style blob for quick rehydrate
  await ctx.io?.kv?.put?.(nodeId, {
    type: template.tag,
    classes: template.classes,
    style: template.style,
    createdAt: Date.now(),
  });
  // (optional)
  // await ctx.io?.cache?.put?.(`tpl:${template.tag}`, template);
};

