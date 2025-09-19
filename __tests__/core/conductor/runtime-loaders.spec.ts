import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadJsonSequenceCatalogs } from "../../../src/core/conductor/runtime-loaders";

describe("loadJsonSequenceCatalogs", () => {
  let mockConductor: any;
  let mockFetch: any;
  let consoleLogSpy: any;

  beforeEach(() => {
    mockConductor = {
      mount: vi.fn().mockResolvedValue(undefined),
      logger: {
        warn: vi.fn()
      }
    };

    // Mock global fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    
    // Mock window object to simulate browser environment
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true
    });
    
    // Mock globalThis.fetch
    Object.defineProperty(globalThis, 'fetch', {
      value: mockFetch,
      writable: true
    });

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it("should process all discovered plugins without early termination", async () => {
    // Mock plugin manifest
    const mockManifest = {
      plugins: [
        { id: "CanvasPlugin" },
        { id: "CanvasComponentPlugin" },
        { id: "HeaderTitlePlugin" },
        { id: "HeaderControlsPlugin" },
        { id: "HeaderThemePlugin" },
        { id: "LibraryPlugin" },
        { id: "LibraryComponentPlugin" },
        { id: "ControlPanelPlugin" },
        { id: "LibraryComponentDropPlugin" }
      ]
    };

    // Mock fetch responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockManifest)
      })
      // Mock index.json responses for each plugin directory
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sequences: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sequences: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sequences: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sequences: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sequences: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          sequences: [{ file: "library-load.json", handlersPath: "@renderx-plugins/library" }] 
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sequences: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sequences: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sequences: [] })
      })
      // Mock library-load.json sequence file
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          pluginId: "LibraryPlugin",
          id: "library-load-symphony",
          name: "Library Load",
          movements: []
        })
      });

    await loadJsonSequenceCatalogs(mockConductor);

    // Verify that all plugins were processed
    const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
    
    // Should see "Starting iteration" messages for all plugins
    const startingIterationLogs = logCalls.filter(log => 
      typeof log === 'string' && log.includes('Starting iteration')
    );
    
    // Should process all 9 plugins from manifest
    expect(startingIterationLogs.length).toBeGreaterThanOrEqual(9);
    
    // Should see completion message
    const completionLogs = logCalls.filter(log => 
      typeof log === 'string' && log.includes('Loop completed, processed')
    );
    expect(completionLogs.length).toBe(1);
    
    // Should process LibraryPlugin specifically
    const libraryPluginLogs = logCalls.filter(log => 
      typeof log === 'string' && log.includes('LibraryPlugin')
    );
    expect(libraryPluginLogs.length).toBeGreaterThan(0);
  });

  it("should not terminate early after processing only 2 plugins", async () => {
    // This test specifically checks for the bug described in issue #192
    const mockManifest = {
      plugins: [
        { id: "CanvasPlugin" },
        { id: "CanvasComponentPlugin" },
        { id: "LibraryPlugin" },
        { id: "ControlPanelPlugin" }
      ]
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockManifest)
      })
      // Mock responses for all 4 plugins
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ sequences: [] })
      });

    await loadJsonSequenceCatalogs(mockConductor);

    const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
    
    // Should see iteration 3 and 4, not just 1 and 2
    const iteration3Log = logCalls.find(log => 
      typeof log === 'string' && log.includes('Starting iteration 3/')
    );
    const iteration4Log = logCalls.find(log => 
      typeof log === 'string' && log.includes('Starting iteration 4/')
    );
    
    expect(iteration3Log).toBeDefined();
    expect(iteration4Log).toBeDefined();
  });
});
