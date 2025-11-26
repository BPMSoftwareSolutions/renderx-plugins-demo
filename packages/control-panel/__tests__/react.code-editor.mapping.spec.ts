import { describe, it, expect, beforeEach } from "vitest";
import { SchemaResolverService } from "../src/services/schema-resolver.service";
import path from "path";
import { readFileSync } from "fs";

// Helper to load JSON
function loadJson<T>(filePath: string): T {
  const content = readFileSync(filePath, "utf-8");
  // Remove BOM if present
  const cleanContent = content.replace(/^\uFEFF/, "");
  return JSON.parse(cleanContent);
}

interface ControlPanelConfig {
  defaultSections: Array<{ id: string; title: string; order: number }>;
  componentTypeOverrides: Record<string, any>;
}

interface ComponentSchema {
  id: string;
  integration: {
    properties: {
      schema: Record<string, any>;
    };
  };
}

interface SelectedElement {
  header: { type: string; id: string; componentSchema?: ComponentSchema };
  content: Record<string, any>;
  layout: { x: number; y: number; width: number; height: number };
  styling: Record<string, any>;
  classes?: string[];
  events?: Record<string, any>;
}

describe("React component code editor mapping", () => {
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
  let config: ControlPanelConfig;
  let reactSchema: ComponentSchema;

  beforeEach(() => {
    // Load control panel config
    const configPath = path.join(
      __dirname,
      "..",
      "src",
      "config",
      "control-panel.schema.json"
    );
    config = loadJson<ControlPanelConfig>(configPath);

    // Load react component schema from fixtures
    const reactSchemaPath = path.join(
      __dirname,
      "__fixtures__",
      "json-components",
      "react.json"
    );
    reactSchema = loadJson<ComponentSchema>(reactSchemaPath);
  });

  it("maps reactCode field to code editor with JavaScript language", () => {
    const resolver = new SchemaResolverService(config);
    resolver.registerComponentSchema("react", reactSchema);

    const selected: SelectedElement = {
      header: { type: "react", id: "node-1", componentSchema: reactSchema },
      content: { reactCode: "const MyComponent = () => <div>Hello</div>;" },
      layout: { x: 0, y: 0, width: 100, height: 100 },
      styling: {},
      classes: [],
      events: {},
    };

    const fields = resolver.generatePropertyFields(selected);

    // Find the reactCode field
    const reactCodeField = fields.find((f) => f.key === "reactCode");
    expect(reactCodeField).toBeTruthy();
    expect(reactCodeField!.type).toBe("code");
    expect(reactCodeField!.rendererProps?.language).toBe("javascript");
  });

  it("renders code editor with 12 rows for React component", () => {
    const resolver = new SchemaResolverService(config);
    resolver.registerComponentSchema("react", reactSchema);

    const selected: SelectedElement = {
      header: { type: "react", id: "node-1" },
      content: {},
      layout: { x: 0, y: 0, width: 100, height: 100 },
      styling: {},
    };

    const fields = resolver.generatePropertyFields(selected);
    const reactCodeField = fields.find((f) => f.key === "reactCode");

    expect(reactCodeField?.rendererProps?.rows).toBe(12);
  });

  it("includes placeholder text for React code editor", () => {
    const resolver = new SchemaResolverService(config);
    resolver.registerComponentSchema("react", reactSchema);

    const selected: SelectedElement = {
      header: { type: "react", id: "node-1" },
      content: {},
      layout: { x: 0, y: 0, width: 100, height: 100 },
      styling: {},
    };

    const fields = resolver.generatePropertyFields(selected);
    const reactCodeField = fields.find((f) => f.key === "reactCode");

    expect(reactCodeField?.rendererProps?.placeholder).toBeTruthy();
  });
});

