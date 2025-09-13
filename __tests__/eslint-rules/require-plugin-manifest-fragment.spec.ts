import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import rule from "../../eslint-rules/require-plugin-manifest-fragment.js";

function mkdtemp(prefix = "rx-plugin-test-") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  return dir;
}

function writeJson(p: string, obj: any) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

function rimraf(dir: string) {
  // Best-effort recursive delete with retries (Windows-friendly)
  for (let i = 0; i < 3; i++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
    }
  }
}

describe("require-plugin-manifest-fragment ESLint rule", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtemp();
  });

  afterEach(() => {
    rimraf(tmp);
  });

  it("reports when a renderx-plugin package lacks any manifest fragment", () => {
    const pkgRoot = path.join(tmp, "packages", "renderx-plugin-missing");
    fs.mkdirSync(path.join(pkgRoot, "src"), { recursive: true });
    writeJson(path.join(pkgRoot, "package.json"), {
      name: "@renderx-plugins/missing",
      version: "0.0.0",
      private: true,
      keywords: ["renderx-plugin"],
    });
    const filename = path.join(pkgRoot, "src", "index.ts");
    fs.writeFileSync(filename, "export {}\n");

    const messages: any[] = [];
    const context: any = {
      getFilename: () => filename,
      report: (m: any) => messages.push(m),
    };

    const visitor = (rule as any).rules["require-plugin-manifest-fragment"].create(
      context
    );
    visitor.Program?.({} as any);

    expect(messages.length).toBe(1);
    expect(messages[0].messageId).toBe("missing");
  });

  it("does not report when package.json has renderx.plugins entries", () => {
    const pkgRoot = path.join(tmp, "packages", "renderx-plugin-ok");
    fs.mkdirSync(path.join(pkgRoot, "src"), { recursive: true });
    writeJson(path.join(pkgRoot, "package.json"), {
      name: "@renderx-plugins/ok",
      version: "0.0.0",
      private: true,
      keywords: ["renderx-plugin"],
      renderx: {
        plugins: [
          {
            id: "OkPlugin",
            ui: { slot: "canvas", module: "@renderx-plugins/ok", export: "Canvas" },
          },
        ],
      },
    });
    const filename = path.join(pkgRoot, "src", "index.ts");
    fs.writeFileSync(filename, "export {}\n");

    const messages: any[] = [];
    const context: any = {
      getFilename: () => filename,
      report: (m: any) => messages.push(m),
    };

    const visitor = (rule as any).rules["require-plugin-manifest-fragment"].create(
      context
    );
    visitor.Program?.({} as any);

    expect(messages.length).toBe(0);
  });

  it("does not report when renderx.manifest points to an existing file", () => {
    const pkgRoot = path.join(tmp, "packages", "renderx-plugin-manifest-path");
    fs.mkdirSync(path.join(pkgRoot, "dist"), { recursive: true });
    writeJson(path.join(pkgRoot, "package.json"), {
      name: "@renderx-plugins/path",
      version: "0.0.0",
      private: true,
      keywords: ["renderx-plugin"],
      renderx: { manifest: "./dist/plugin-manifest.json" },
    });
    writeJson(path.join(pkgRoot, "dist", "plugin-manifest.json"), {
      plugins: [{ id: "PathPlugin" }],
    });
    const filename = path.join(pkgRoot, "src", "index.ts");
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, "export {}\n");

    const messages: any[] = [];
    const context: any = {
      getFilename: () => filename,
      report: (m: any) => messages.push(m),
    };

    const visitor = (rule as any).rules["require-plugin-manifest-fragment"].create(
      context
    );
    visitor.Program?.({} as any);

    expect(messages.length).toBe(0);
  });

  it("host scan: reports installed renderx-plugin packages in node_modules missing manifest fragment", () => {
    // Arrange a fake node_modules with one offending package and one valid package
    const nodeModules = path.join(tmp, "node_modules");
    const badDir = path.join(nodeModules, "@renderx-plugins", "library-component");
    const okDir = path.join(nodeModules, "@renderx-plugins", "canvas");
    fs.mkdirSync(path.join(badDir), { recursive: true });
    fs.mkdirSync(path.join(okDir, "dist"), { recursive: true });

    writeJson(path.join(badDir, "package.json"), {
      name: "@renderx-plugins/library-component",
      version: "0.1.0",
      keywords: ["renderx-plugin"],
      // no renderx field and no dist/plugin-manifest.json -> should be reported
    });

    writeJson(path.join(okDir, "package.json"), {
      name: "@renderx-plugins/canvas",
      version: "0.1.0",
      keywords: ["renderx-plugin"],
      renderx: { manifest: "./dist/plugin-manifest.json" },
    });
    writeJson(path.join(okDir, "dist", "plugin-manifest.json"), { plugins: [{ id: "CanvasPlugin" }] });

    const sentinel = path.join(tmp, "scripts", "aggregate-plugins.js");
    fs.mkdirSync(path.dirname(sentinel), { recursive: true });
    fs.writeFileSync(sentinel, "// sentinel file for ESLint host scan\n");

    const prev = process.env.RENDERX_PLUGIN_MANIFEST_HOST_SCAN;
    process.env.RENDERX_PLUGIN_MANIFEST_HOST_SCAN = '1';

    try {
      const messages: any[] = [];
      const context: any = {
        getFilename: () => sentinel,
        getCwd: () => tmp,
        report: (m: any) => messages.push(m),
      };

      const visitor = (rule as any).rules["require-plugin-manifest-fragment"].create(context);
      visitor.Program?.({} as any);

      expect(messages.length).toBe(1);
    } finally {
      if (prev === undefined) delete (process.env as any).RENDERX_PLUGIN_MANIFEST_HOST_SCAN;
      else process.env.RENDERX_PLUGIN_MANIFEST_HOST_SCAN = prev;
    }
  });
});

