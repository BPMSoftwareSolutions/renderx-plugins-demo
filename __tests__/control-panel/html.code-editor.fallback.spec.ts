import { describe, it, expect } from "vitest";
import { SchemaResolverService } from "../../plugins/control-panel/services/schema-resolver.service";
import type {
  ControlPanelConfig,
  SelectedElement,
} from "../../plugins/control-panel/types/control-panel.types";
import htmlSchemaOriginal from "../../json-components/html.json";

const baseConfig: ControlPanelConfig = {
  version: "1.0.0-test",
  description: "test config",
  defaultSections: [
    {
      id: "content",
      title: "Content",
      icon: "🧩",
      order: 1,
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: "layout",
      title: "Layout",
      icon: "📐",
      order: 2,
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: "styling",
      title: "Styling",
      icon: "🎨",
      order: 3,
      collapsible: true,
      defaultExpanded: false,
    },
  ],
  fieldTypes: {},
  componentTypeOverrides: {},
};

describe("HTML component markup field fallback", () => {
  it("forces code type even if ui.control missing (legacy cached schema)", () => {
    const resolver = new SchemaResolverService(baseConfig);
    const stale = JSON.parse(JSON.stringify(htmlSchemaOriginal)) as any;
    // Simulate outdated schema without ui.control metadata
    delete stale.integration.properties.schema.markup.ui;
    resolver.registerComponentSchema("html", stale);

    const element: SelectedElement = {
      header: { id: "2", type: "html", name: "HTML", version: "1.0.1" },
      content: { markup: "<p>Test</p>" },
      layout: { x: 0, y: 0, width: 320, height: 120 },
      styling: {},
    } as any;

    const fields = resolver.generatePropertyFields(element);
    const markupField = fields.find((f) => f.key === "markup");
    expect(markupField?.type).toBe("code");
    expect(markupField?.rendererProps?.rows).toBe(8);
  });
});
