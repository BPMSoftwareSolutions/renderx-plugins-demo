/**
 * Helpers for renderx-web orchestration tests.
 *
 * These utilities stay "pure" and do not touch the filesystem; callers are
 * responsible for loading JSON and passing the parsed objects in.
 */

/**
 * Collects all orchestration IDs referenced by movements in the
 * renderx-web-orchestration sequence.
 */
export function getRenderxWebOrchestrationIds(renderxWeb: any): Set<string> {
  const ids = new Set<string>();

  if (!renderxWeb || !Array.isArray(renderxWeb.movements)) {
    return ids;
  }

  for (const movement of renderxWeb.movements as any[]) {
    const orchestration = (movement as any).orchestration;
    if (!orchestration) continue;

    if (typeof orchestration === 'string') {
      ids.add(orchestration);
      continue;
    }

    if (Array.isArray(orchestration)) {
      for (const id of orchestration) {
        if (typeof id === 'string') {
          ids.add(id);
        }
      }
    }
  }

  return ids;
}

