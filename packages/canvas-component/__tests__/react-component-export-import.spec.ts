/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { buildUiFileContent } from "../src/symphonies/export/export.pure";
import { parseUiFile } from "../src/symphonies/import/import.parse.pure";

describe("React Component Export/Import", () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = {
      payload: {},
      logger: {
        info: () => {},
        warn: () => {},
        error: () => {},
      },
    };
  });

  it("should export React component with code and props", () => {
    const components = [
      {
        id: "react-1",
        type: "react",
        classes: ["rx-comp", "rx-react"],
        style: { position: "absolute", left: "10px", top: "20px" },
        content: {
          reactCode: "export default function MyComponent() { return React.createElement('div', null, 'Hello'); }",
          props: { count: 5 },
        },
        createdAt: Date.now(),
      },
    ];

    const layoutData = [
      {
        id: "react-1",
        x: 10,
        y: 20,
        width: 300,
        height: 200,
        parentId: null,
        siblingIndex: 0,
      },
    ];

    mockCtx.payload.components = components;
    mockCtx.payload.layoutData = layoutData;
    mockCtx.payload.canvasMetadata = { width: 800, height: 600 };
    mockCtx.payload.cssClasses = {};

    buildUiFileContent({}, mockCtx);

    const uiFile = mockCtx.payload.uiFileContent;
    expect(uiFile.components).toHaveLength(1);
    expect(uiFile.components[0].type).toBe("react");
    expect(uiFile.components[0].content.reactCode).toBeDefined();
    expect(uiFile.components[0].content.props).toEqual({ count: 5 });
  });

  it("should import React component with code and props preserved", () => {
    const uiFile = {
      version: "1.0.1",
      metadata: {
        createdAt: new Date().toISOString(),
        canvasSize: { width: 800, height: 600 },
        componentCount: 1,
      },
      cssClasses: {},
      components: [
        {
          id: "react-1",
          type: "react",
          template: {
            tag: "div",
            classRefs: ["rx-comp", "rx-react"],
            style: { position: "absolute" },
          },
          layout: { x: 10, y: 20, width: 300, height: 200 },
          parentId: null,
          siblingIndex: 0,
          createdAt: Date.now(),
          content: {
            reactCode: "export default function MyComponent() { return React.createElement('div', null, 'Hello'); }",
            props: { count: 5 },
          },
        },
      ],
    };

    mockCtx.payload.uiFileContent = uiFile;
    parseUiFile({}, mockCtx);

    const importedComponents = mockCtx.payload.importComponents;
    expect(importedComponents).toHaveLength(1);
    expect(importedComponents[0].type).toBe("react");
    expect(importedComponents[0].content.reactCode).toBeDefined();
    expect(importedComponents[0].content.props).toEqual({ count: 5 });
  });

  it("should preserve React code through export/import cycle", () => {
    const originalCode = `
      export default function Counter(props) {
        const [count, setCount] = React.useState(props.initialCount || 0);
        return React.createElement('div', null, 'Count: ' + count);
      }
    `;

    const components = [
      {
        id: "react-counter",
        type: "react",
        classes: ["rx-comp", "rx-react"],
        style: {},
        content: {
          reactCode: originalCode,
          props: { initialCount: 10 },
        },
        createdAt: Date.now(),
      },
    ];

    mockCtx.payload.components = components;
    mockCtx.payload.layoutData = [
      { id: "react-counter", x: 0, y: 0, width: 200, height: 100, parentId: null, siblingIndex: 0 },
    ];
    mockCtx.payload.canvasMetadata = { width: 800, height: 600 };
    mockCtx.payload.cssClasses = {};

    buildUiFileContent({}, mockCtx);
    const exported = mockCtx.payload.uiFileContent;

    mockCtx.payload = {};
    mockCtx.payload.uiFileContent = exported;
    parseUiFile({}, mockCtx);

    const imported = mockCtx.payload.importComponents[0];
    expect(imported.content.reactCode).toBe(originalCode);
    expect(imported.content.props).toEqual({ initialCount: 10 });
  });
});

