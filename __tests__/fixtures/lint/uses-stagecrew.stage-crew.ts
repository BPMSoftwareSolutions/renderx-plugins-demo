export function demo(data: any, ctx: any) {
  const txn = ctx.stageCrew.beginBeat();
  txn.commit();
}

