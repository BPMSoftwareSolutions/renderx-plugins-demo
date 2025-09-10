import { describe, it, expect } from "vitest";
import { buildLayoutManifest } from "../scripts/generate-layout-manifest.js";

describe("buildLayoutManifest", () => {
  it("returns default layout when no catalogs provided", () => {
    const result = buildLayoutManifest([]);
    
    expect(result.version).toBe("1.0.0");
    expect(result.layout.kind).toBe("grid");
    expect(result.layout.columns).toEqual(["320px", "1fr", "360px"]);
    expect(result.layout.areas).toEqual([["library", "canvas", "controlPanel"]]);
    expect(result.slots).toHaveLength(3);
    expect(result.slots.map(s => s.name)).toEqual(["library", "canvas", "controlPanel"]);
  });

  it("merges catalog layout properties", () => {
    const catalogs = [
      {
        layout: {
          columns: ["400px", "1fr", "300px"],
          responsive: [
            {
              media: "(max-width: 768px)",
              columns: ["1fr"],
              areas: [["canvas"], ["library"], ["controlPanel"]]
            }
          ]
        }
      }
    ];

    const result = buildLayoutManifest(catalogs);
    
    expect(result.layout.columns).toEqual(["400px", "1fr", "300px"]);
    expect(result.layout.responsive).toHaveLength(1);
    expect(result.layout.responsive[0].media).toBe("(max-width: 768px)");
  });

  it("replaces slots when catalog provides them", () => {
    const catalogs = [
      {
        slots: [
          { name: "sidebar", constraints: { minWidth: 200 } },
          { name: "main", constraints: { minWidth: 600 } }
        ]
      }
    ];

    const result = buildLayoutManifest(catalogs);
    
    expect(result.slots).toHaveLength(2);
    expect(result.slots[0].name).toBe("sidebar");
    expect(result.slots[1].name).toBe("main");
  });

  it("later catalogs override earlier ones", () => {
    const catalogs = [
      { version: "1.0.0", layout: { columns: ["300px", "1fr"] } },
      { version: "2.0.0", layout: { columns: ["400px", "1fr"] } }
    ];

    const result = buildLayoutManifest(catalogs);
    
    expect(result.version).toBe("2.0.0");
    expect(result.layout.columns).toEqual(["400px", "1fr"]);
  });
});
