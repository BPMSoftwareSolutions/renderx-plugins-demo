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

    // StageCrew integration placeholder (handlers own side-effects):
    // ctx.stageCrew?.injectRawCSS?.(serializeStyleToCSS(tpl.style));
    // const txn = ctx.stageCrew?.beginBeat?.();
    // txn?.create(`#${nodeId}`, { tag: tpl.tag, classes: tpl.classes, text: tpl.text });
    // txn?.setPosition?.(nodeId, data.position);
    // ctx.stageCrew?.injectInstanceCSS?.(nodeId, tpl.style);
    // txn?.commit?.();

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

