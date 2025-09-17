import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { SchemaResolverService } from "../src/services/schema-resolver.service";
import type { ControlPanelConfig, SelectedElement, ComponentSchema } from "../src/types/control-panel.types";

function loadJson<T = any>(p: string): T {
  const txt = fs.readFileSync(p, "utf-8");
  return JSON.parse(txt) as T;
}

describe("SVG schema → code editor mapping", () => {
  it("maps ui.control = code to field.type = 'code' and applies preserveAspectRatio enum presets", async () => {
    const configPath = path.join(__dirname, "..", "src", "config", "control-panel.schema.json");
    const repoRoot = path.resolve(__dirname, "..", "..", "..");
    const svgSchemaPath = path.join(repoRoot, "json-components", "svg.json");

    const config = loadJson<ControlPanelConfig>(configPath);
    const svgSchema = loadJson<ComponentSchema>(svgSchemaPath);

    const resolver = new SchemaResolverService(config);
    resolver.registerComponentSchema("svg", svgSchema);

    const selected: SelectedElement = {
      header: { type: "svg", id: "node-1", componentSchema: svgSchema },
      content: {},
      layout: { x: 0, y: 0, width: 100, height: 100 },
      styling: {},
      classes: [],
      events: {},
    };

    const fields = resolver.generatePropertyFields(selected);

    const markupField = fields.find((f) => f.key === "svgMarkup");
    expect(markupField).toBeTruthy();
    expect(markupField!.type).toBe("code");

    const parField = fields.find((f) => f.key === "preserveAspectRatio");
    expect(parField?.options?.length).toBeGreaterThan(0);
    const labels = (parField?.options || []).map((o) => String(o.value));
    expect(labels).toContain("xMidYMid meet");
    expect(labels).toContain("xMidYMid slice");
  });
});

