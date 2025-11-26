import { describe, it, expect } from "vitest";
import { SchemaResolverService } from "../src/services/schema-resolver.service";
import type {
  ControlPanelConfig,
  SelectedElement,
} from "../src/types/control-panel.types";
import htmlSchema from "./__fixtures__/json-components/html.json";

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

describe("HTML component markup field", () => {
  let _ctx: any;
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
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  it("uses code textarea renderer (type=code)", () => {
    const resolver = new SchemaResolverService(baseConfig);
    // Simulate schema load (imported JSON)
    resolver.registerComponentSchema("html", htmlSchema as any);

    const element: SelectedElement = {
      header: { id: "1", type: "html", name: "HTML", version: "1.0.0" } as any,
      content: { markup: "<p>Test</p>" },
      layout: { x: 0, y: 0, width: 300, height: 120 },
      styling: {},
    } as any;

    const fields = resolver.generatePropertyFields(element);
    const markupField = fields.find((f) => f.key === "markup");
    expect(markupField).toBeTruthy();
    expect(markupField?.type).toBe("code");
    expect(markupField?.rendererProps?.rows).toBe(8);
  });
});

