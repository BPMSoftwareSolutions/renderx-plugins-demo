// Sequences are mounted via JSON catalogs at startup (see src/conductor.ts)
// Provide an idempotent register() so hosts can call it safely before JSON catalogs mount.
export async function register(conductor: any) {
  try {
    if (conductor && (conductor as any)._canvasComponentRegistered) return;
    if (conductor) (conductor as any)._canvasComponentRegistered = true;
  } catch {}
  // Intentionally no sequence mounts here; JSON catalogs handle mounting.
}
