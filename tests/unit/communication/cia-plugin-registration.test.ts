import { TestEnvironment } from "../../utils/test-helpers";
import { PluginLoader } from "@communication/sequences/plugins/PluginLoader";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

// Map web /plugins/... paths to local repo files under RenderX/public/plugins
function mapWebPathToLocalFile(webPath: string): string {
  const rel = webPath.replace(/^\/?plugins\//, "RenderX/public/plugins/");
  return path.resolve(process.cwd(), rel);
}

describe("CIA plugin registration via manifest", () => {
  beforeAll(() => {
    // Stub fetch to serve the manifest from the local repo
    // @ts-ignore
    global.fetch = async (url: string) => {
      if (typeof url === "string" && url.endsWith("/plugins/manifest.json")) {
        const local = mapWebPathToLocalFile("/plugins/manifest.json");
        const jsonText = fs.readFileSync(local, "utf-8");
        return {
          ok: true,
          async json() {
            return JSON.parse(jsonText);
          },
          status: 200,
          statusText: "OK",
        } as any;
      }
      throw new Error(`Unhandled fetch URL in test: ${url}`);
    };

    // Spy on PluginLoader to import plugin modules from local files
    jest
      .spyOn(PluginLoader.prototype as any, "loadPluginModule")
      .mockImplementation(async (...args: any[]) => {
        const webPath = String(args[0]);
        const localFile = mapWebPathToLocalFile(webPath);
        const fileUrl = pathToFileURL(localFile).href;
        return await import(fileUrl);
      });
  });

  afterAll(() => {
    jest.restoreAllMocks();
    // @ts-ignore
    delete global.fetch;
  });

  test("registerCIAPlugins mounts Canvas.component-create-symphony", async () => {
    const eventBus = TestEnvironment.createEventBus();
    const conductor = TestEnvironment.createMusicalConductor(eventBus as any);

    await conductor.registerCIAPlugins();

    const mounted = conductor.getMountedPluginIds();
    expect(Array.isArray(mounted)).toBe(true);
    expect(mounted).toContain("Canvas.component-create-symphony");
    expect(mounted).toContain("Library.component-drop-symphony");
  });

  test("play(Canvas.component-create-symphony) succeeds after registration", async () => {
    const eventBus = TestEnvironment.createEventBus();
    const conductor = TestEnvironment.createMusicalConductor(eventBus as any);
    await conductor.registerCIAPlugins();

    const requestId = await conductor.play(
      "Canvas.component-create-symphony",
      "Canvas.component-create-symphony",
      { component: { metadata: { type: "button" } }, position: { x: 1, y: 2 } }
    );

    expect(typeof requestId === "string" || requestId === null).toBe(true);
  });
});
