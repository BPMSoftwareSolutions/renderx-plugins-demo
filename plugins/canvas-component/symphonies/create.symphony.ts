export const sequence = {
  id: "canvas-component-create-symphony",
  name: "Canvas Component Create",
  movements: [
    {
      id: "create",
      beats: [
        { beat: 1, event: "canvas:component:resolve-template", handler: "resolveTemplate", timing: "immediate" },
        { beat: 2, event: "canvas:component:create", handler: "createNode", timing: "after-beat" },
        { beat: 3, event: "canvas:component:notify-ui", handler: "notifyUi", timing: "after-beat" },
      ],
    },
  ],
} as const;

export const handlers = {
  resolveTemplate(data: any, ctx: any) {
    const tpl = data?.component?.template;
    if (!tpl) throw new Error("Missing component template.");
    ctx.payload.template = tpl;
  },

  createNode(data: any, ctx: any) {
    const tpl = ctx.payload.template;
    const nodeId = `rx-node-${Math.random().toString(36).slice(2, 8)}`;
    const selector = `#${nodeId}`;

    // StageCrew transaction: create element under #rx-canvas, set id/classes/style/attrs, then commit
    const txn = ctx.stageCrew?.beginBeat?.(nodeId, { handlerName: "createNode" });
    txn
      ?.create(tpl.tag, { classes: tpl.classes || [], attrs: { id: nodeId } })
      .appendTo("#rx-canvas");

    const style: Record<string, string> = {};
    const tplStyle = tpl.style || {};
    for (const [k, v] of Object.entries(tplStyle)) style[k] = String(v);
    if (data?.position) {
      style.position = style.position || "absolute";
      style.left = typeof data.position.x === "number" ? `${data.position.x}px` : String(data.position.x);
      style.top = typeof data.position.y === "number" ? `${data.position.y}px` : String(data.position.y);
    }

    txn?.update(selector, {
      classes: { add: (tpl.classes || []) as string[] },
      attrs: { id: nodeId },
      style,
    });

    txn?.commit?.({ batch: true });

    ctx.payload.createdNode = {
      id: nodeId,
      tag: tpl.tag,
      text: tpl.text,
      classes: tpl.classes,
      style: tpl.style,
      position: data.position,
    };
  },

  notifyUi(data: any, ctx: any) {
    data?.onComponentCreated?.(ctx.payload.createdNode);
  },
};

