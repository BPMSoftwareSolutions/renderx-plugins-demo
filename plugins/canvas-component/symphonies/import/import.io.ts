export async function registerInstances(_data: any, ctx: any) {
  const list: any[] = ctx.payload.importComponents || [];
  for (const comp of list) {
    await ctx.io?.kv?.put?.(comp.id, {
      type: comp.tag,
      classes: comp.classRefs || [],
      style: comp.style || {},
      createdAt: comp.createdAt || Date.now(),
    });
  }
}

