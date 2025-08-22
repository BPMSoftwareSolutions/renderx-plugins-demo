export const createNode = (data: any, ctx: any) => {
  const tpl = ctx.payload.template;
  const id = ctx.payload.nodeId;
  const selector = `#${id}`;

  const txn = ctx.stageCrew?.beginBeat?.(id, { handlerName: "createNode" });
  txn?.create(tpl.tag, { classes: tpl.classes || [], attrs: { id } })?.appendTo?.("#rx-canvas");

  const style: Record<string, string> = {};
  const tplStyle = tpl.style || {};
  for (const [k, v] of Object.entries(tplStyle)) style[k] = String(v);
  if (data?.position) {
    style.position = style.position || "absolute";
    style.left = typeof data.position.x === "number" ? `${data.position.x}px` : String(data.position.x);
    style.top = typeof data.position.y === "number" ? `${data.position.y}px` : String(data.position.y);
  }

  txn?.update?.(selector, {
    classes: { add: (tpl.classes || []) as string[] },
    attrs: { id },
    style,
  });

  txn?.commit?.({ batch: true });

  ctx.payload.createdNode = {
    id,
    tag: tpl.tag,
    text: tpl.text,
    classes: tpl.classes,
    style: tpl.style,
    position: data.position,
  };
};

