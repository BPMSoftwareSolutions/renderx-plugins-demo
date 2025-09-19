import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// SUT
import { registerAllSequences } from "../../src/core/conductor/sequence-registration";

// Feature flags
import {
  setFlagOverride,
  clearFlagOverrides,
} from "../../src/core/environment/feature-flags";

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
  });
  afterEach(() => {
    clearFlagOverrides();
    __setPluginManifestForTests({ plugins: [] });
  });

  it("never mounts JSON catalogs (loader is not called)", async () => {
    const spy = vi
      .spyOn(loaders, "loadJsonSequenceCatalogs")
      .mockResolvedValueOnce();

    // Regardless of feature flag, fallback is removed
    setFlagOverride("host.plugin-first.registration", true);
    await registerAllSequences(fakeConductor());
    setFlagOverride("host.plugin-first.registration", false);
    await registerAllSequences(fakeConductor());

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
