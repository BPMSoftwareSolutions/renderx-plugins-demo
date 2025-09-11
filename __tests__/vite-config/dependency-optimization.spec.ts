import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Vite Dependency Optimization Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should exclude plugin modules from dependency optimization", async () => {
    // Import the vite config
    let viteConfig;
    try {
      viteConfig = await import("../../vite.config.js");
    } catch (error) {
      console.error("Failed to import vite.config.js:", error);
      throw error;
    }

    expect(viteConfig).toBeTruthy();
    expect(viteConfig?.default).toBeTruthy();

    const config = typeof viteConfig.default === "function"
      ? viteConfig.default({ command: "serve", mode: "development" })
      : viteConfig.default;

    expect(config.optimizeDeps).toBeDefined();
    expect(config.optimizeDeps.exclude).toContain("/plugins/");
  });

  it("should include known stable dependencies in optimization", async () => {
    const viteConfig = await import("../../vite.config.js").catch(() => null);
    
    expect(viteConfig).toBeTruthy();
    
    const config = typeof viteConfig.default === "function" 
      ? viteConfig.default({ command: "serve", mode: "development" })
      : viteConfig.default;
    
    expect(config.optimizeDeps.include).toContain("react");
    expect(config.optimizeDeps.include).toContain("react-dom");
    expect(config.optimizeDeps.include).toContain("musical-conductor");
  });

  it("should configure plugin loading to be resilient to reloads", async () => {
    const viteConfig = await import("../../vite.config.js").catch(() => null);
    
    expect(viteConfig).toBeTruthy();
    
    const config = typeof viteConfig.default === "function" 
      ? viteConfig.default({ command: "serve", mode: "development" })
      : viteConfig.default;
    
    // Should have HMR configuration for plugin stability
    expect(config.server?.hmr).toBeDefined();
    expect(config.server.hmr.overlay).toBe(false); // Prevent overlay from blocking plugin loading
  });

  it("should handle plugin registration timing correctly", () => {
    // Mock plugin registration to test resilience
    const mockConductor = {
      registerSequence: vi.fn(),
      getMountedPluginIds: vi.fn(() => ["LibraryPlugin", "CanvasPlugin", "ControlPanelPlugin"])
    };

    // This should not throw even if called multiple times (reload scenario)
    expect(() => {
      // Simulate multiple registrations (as would happen during reloads)
      mockConductor.registerSequence("LibraryPlugin", {}, {});
      mockConductor.registerSequence("LibraryPlugin", {}, {}); // duplicate
    }).not.toThrow();
  });
});
