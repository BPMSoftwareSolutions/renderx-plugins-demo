import { describe, it, expect, beforeEach, vi } from "vitest";
import { SchemaResolverService } from "../src/services/schema-resolver.service";

// Minimal config shape needed by constructor
const config: any = {
  defaultSections: [
    { id: "content", title: "Content", order: 1 },
    { id: "layout", title: "Layout", order: 2 },
    { id: "styling", title: "Styling", order: 3 },
  ],
  componentTypeOverrides: {}
};

function makeSchema(type: string) {
  return {
    id: type,
    integration: { properties: { schema: {} } }
  } as any;
}

describe("SchemaResolverService memoization", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    // @ts-ignore
    global.fetch = fetchMock;
  });

  it("dedupes schema fetches across multiple calls and instances", async () => {
    // Arrange: mock fetch to return a schema per type
    fetchMock.mockImplementation(async (url: string) => {
      const match = /\/json-components\/(.*?)\.json$/.exec(url);
      const type = match?.[1] ?? "unknown";
      return {
        ok: true,
        async json() { return makeSchema(type); }
      } as any;
    });

    const r1 = new SchemaResolverService(config);
    const r2 = new SchemaResolverService(config);

    // Act: load same types multiple times and across instances
    await r1.loadComponentSchemas(["button", "input"]);
    await r1.loadComponentSchemas(["button"]);
    await r2.loadComponentSchemas(["button", "input"]);

    // Assert: only one network fetch per unique type
    const urls = fetchMock.mock.calls.map(c => c[0]);
    const buttonCalls = urls.filter((u: string) => u.endsWith("/json-components/button.json")).length;
    const inputCalls = urls.filter((u: string) => u.endsWith("/json-components/input.json")).length;

    expect(buttonCalls).toBe(1);
    expect(inputCalls).toBe(1);
  });

  it("registers cached schemas into new instances without refetching", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      const match = /\/json-components\/(.*?)\.json$/.exec(url);
      const type = match?.[1] ?? "unknown";
      return {
        ok: true,
        async json() { return makeSchema(type); }
      } as any;
    });

    const r1 = new SchemaResolverService(config);
    await r1.loadComponentSchemas(["container"]);

    // New instance should reuse cache
    const r2 = new SchemaResolverService(config);
    await r2.loadComponentSchemas(["container"]);

    const urls = fetchMock.mock.calls.map(c => c[0]);
    const containerCalls = urls.filter((u: string) => u.endsWith("/json-components/container.json")).length;
    expect(containerCalls).toBe(1);
  });
});

