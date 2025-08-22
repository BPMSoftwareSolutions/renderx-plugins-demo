export const resolveTemplate = (data: any, ctx: any) => {
  const tpl = data?.component?.template;
  if (!tpl) throw new Error("Missing component template.");
  ctx.payload.template = tpl;
  // Pre-allocate nodeId so IO can persist before DOM creation
  ctx.payload.nodeId = `rx-node-${Math.random().toString(36).slice(2, 8)}`;
};

