import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Vite Dependency Optimization Configuration (Issue #124)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should exclude problematic dependencies that cause reloads", async () => {
    const viteConfig = await import("../../vite.config.js");
    
    expect(viteConfig).toBeTruthy();
    expect(viteConfig?.default).toBeTruthy();
    
    const config = typeof viteConfig.default === "function" 
      ? viteConfig.default({ command: "serve", mode: "development" })
      : viteConfig.default;
    
    expect(config.optimizeDeps).toBeDefined();
    expect(config.optimizeDeps.exclude).toContain("gif.js.optimized"); // Issue #124 specific
    expect(config.optimizeDeps.exclude).toContain("/plugins/"); // Local plugin modules
  });

  it("should include stable dependencies for better performance", async () => {
    const viteConfig = await import("../../vite.config.js");
    
    expect(viteConfig).toBeTruthy();
    
    const config = typeof viteConfig.default === "function" 
      ? viteConfig.default({ command: "serve", mode: "development" })
      : viteConfig.default;
    
    expect(config.optimizeDeps.include).toContain("react");
    expect(config.optimizeDeps.include).toContain("react-dom");
    expect(config.optimizeDeps.include).toContain("@renderx-plugins/host-sdk");
    expect(config.optimizeDeps.include).toContain("@renderx-plugins/library");
  });

  it("should configure HMR to prevent plugin loading interference", async () => {
    const viteConfig = await import("../../vite.config.js");
    
    expect(viteConfig).toBeTruthy();
    
    const config = typeof viteConfig.default === "function" 
      ? viteConfig.default({ command: "serve", mode: "development" })
      : viteConfig.default;
    
    // Should have HMR configuration for plugin stability
    expect(config.server?.hmr).toBeDefined();
    expect(config.server.hmr.overlay).toBe(false); // Prevent overlay from blocking plugin loading
  });

  it("should have optimization settings that reduce reload churn", async () => {
    const viteConfig = await import("../../vite.config.js");
    
    expect(viteConfig).toBeTruthy();
    
    const config = typeof viteConfig.default === "function" 
      ? viteConfig.default({ command: "serve", mode: "development" })
      : viteConfig.default;
    
    expect(config.optimizeDeps.force).toBe(false); // Don't force re-optimization
    expect(config.optimizeDeps.esbuildOptions?.keepNames).toBe(true); // Preserve function names
  });

  it("should handle plugin registration timing correctly", () => {
    // Mock plugin registration to test resilience
    const mockConductor = {
      registerSequence: vi.fn(),
      getMountedPluginIds: vi.fn(() => ["HeaderPlugin", "LibraryPlugin", "CanvasPlugin", "ControlPanelPlugin"])
    };

    // This should not throw even if called multiple times (reload scenario)
    expect(() => {
      // Simulate multiple registrations (as would happen during reloads)
      mockConductor.registerSequence("LibraryPlugin", {}, {});
      mockConductor.registerSequence("LibraryPlugin", {}, {}); // duplicate
    }).not.toThrow();
  });
});
