export function resolveTemplate(data: any, ctx: any) {
  // Reuse the same payload shape as canvas-component
  const tpl = data?.component?.template || data?.template;
  if (!tpl) throw new Error("Missing template for container create");
  ctx.payload = ctx.payload || {};
  ctx.payload.template = tpl;
  ctx.payload.nodeId = data?.nodeId || `rx-node-${Math.random().toString(36).slice(2, 8)}`;
  return { ok: true };
}

