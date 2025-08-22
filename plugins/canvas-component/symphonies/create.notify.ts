export const notifyUi = (data: any, ctx: any) => {
  data?.onComponentCreated?.(ctx.payload.createdNode);
};

