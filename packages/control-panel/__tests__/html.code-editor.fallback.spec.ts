import { describe, it, expect } from "vitest";
import { SchemaResolverService } from "../src/services/schema-resolver.service";
import type {
  ControlPanelConfig,
  SelectedElement,
} from "../src/types/control-panel.types";
import htmlSchemaOriginal from "./__fixtures__/json-components/html.json";

const baseConfig: ControlPanelConfig = {
  version: "1.0.0-test",
  description: "test config",
  defaultSections: [
    {
      id: "content",
      title: "Content",
      icon: "\ud83e\udde9",
      order: 1,
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: "layout",
      title: "Layout",
      icon: "\ud83d\udcd0",
      order: 2,
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: "styling",
      title: "Styling",
      icon: "\ud83c\udfa8",
      order: 3,
      collapsible: true,
      defaultExpanded: false,
    },
  ],
  fieldTypes: {},
  componentTypeOverrides: {},
};

describe("HTML component markup field fallback", () => {
  let ctx: any;
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null,`n      payload: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  it("forces code type even if ui.control missing (legacy cached schema)", () => {
    const resolver = new SchemaResolverService(baseConfig);
    const stale = JSON.parse(JSON.stringify(htmlSchemaOriginal)) as any;
    // Simulate outdated schema without ui.control metadata
    delete (stale as any).integration.properties.schema.markup.ui;
    resolver.registerComponentSchema("html", stale);

    const element: SelectedElement = {
      header: { id: "2", type: "html", name: "HTML", version: "1.0.1" } as any,
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


