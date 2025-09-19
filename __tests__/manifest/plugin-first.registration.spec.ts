import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// SUT
import { registerAllSequences } from "../../src/core/conductor/sequence-registration";

// Feature flags
import { clearFlagOverrides } from "../../src/core/environment/feature-flags";

// Manifest test override
import { __setPluginManifestForTests } from "../../src/core/manifests/pluginManifest";

// Spy on JSON catalog loader
import * as loaders from "../../src/core/conductor/runtime-loaders";

const fakeConductor = () => ({
  logger: { warn: vi.fn() },
  mount: vi.fn(),
  getMountedPluginIds: vi.fn(() => []),
});

describe("Plugin-first registration (no JSON-catalog fallback)", () => {
  beforeEach(() => {
    clearFlagOverrides();
    __setPluginManifestForTests({ plugins: [] });
    (globalThis as any).__DISABLE_JSON_CATALOG_FALLBACK = true;
  });
  afterEach(() => {
    clearFlagOverrides();
    __setPluginManifestForTests({ plugins: [] });
    delete (globalThis as any).__DISABLE_JSON_CATALOG_FALLBACK;
  });

  it("never mounts JSON catalogs (loader is not called)", async () => {
    const spy = vi
      .spyOn(loaders, "loadJsonSequenceCatalogs")
      .mockResolvedValueOnce();

    // Fallback is removed; plugin-first only
    await registerAllSequences(fakeConductor());
    await registerAllSequences(fakeConductor());

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
