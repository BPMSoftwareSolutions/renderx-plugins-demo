export async function initializePackageBuild(data: any, ctx: any) {
  ctx.payload = { ...(ctx.payload || {}), packageBuildInitialized: true };
}

export async function buildComponentsPackage(data: any, ctx: any) {
  ctx.payload = { ...(ctx.payload || {}), componentsBuilt: true };
}

export async function buildMusicalConductorPackage(data: any, ctx: any) {
  ctx.payload = { ...(ctx.payload || {}), musicalConductorBuilt: true };
}

export async function buildHostSdkPackage(data: any, ctx: any) {
  ctx.payload = { ...(ctx.payload || {}), hostSdkBuilt: true };
}
