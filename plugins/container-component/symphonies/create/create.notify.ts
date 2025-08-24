export const notifyUi = (_data: any, ctx: any) => {
  ctx?.payload?.createdNode && ctx?.payload?.onComponentCreated?.(ctx.payload.createdNode);
};

