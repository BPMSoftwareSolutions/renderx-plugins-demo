import { defineConfig } from "vitest/config";
import fs from "node:fs";
import path from "node:path";

function readManifest() {
  try {
    const artifactsDir = process.env.HOST_ARTIFACTS_DIR || "public";
    const p = path.join(
      process.cwd(),
      artifactsDir,
      "plugins",
      "plugin-manifest.json"
    );
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf8");
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

function isBare(spec: string) {
  return (
    typeof spec === "string" &&
    spec.length &&
    !spec.startsWith(".") &&
    !spec.startsWith("/") &&
    !spec.startsWith("http")
  );
}

function packageRoot(spec: string) {
  if (spec.startsWith("@")) {
    const parts = spec.split("/");
    return parts.length >= 2 ? parts.slice(0, 2).join("/") : spec;
  }
  const idx = spec.indexOf("/");
  return idx > 0 ? spec.slice(0, idx) : spec;
}

function pluginModuleLoaders() {
  const m = readManifest();
  const specs = new Set<string>();
  if (m && Array.isArray(m.plugins)) {
    for (const p of m.plugins) {
      const mods = [p?.ui?.module, p?.runtime?.module];
      for (const s of mods) {
        if (isBare(s)) specs.add(packageRoot(s));
      }
    }
  }
  specs.add("@renderx-plugins/host-sdk");
  const arr = Array.from(specs);
  const lines = [
    "export const loaders = {",
    ...arr.map(
      (s) => `  ${JSON.stringify(s)}: () => import(${JSON.stringify(s)}),`
    ),
    "};",
    "export function loadPluginModule(spec) {",
    "  const f = loaders[spec];",
    "  if (f) return f();",
    "  return import(/* @vite-ignore */ spec);",
    "}",
  ];
  const code = lines.join("\n");
  const VIRTUAL_ID = "virtual:plugin-module-loaders";
  const RESOLVED_VIRTUAL_ID = "\0" + VIRTUAL_ID;
  return {
    name: "plugin-module-loaders-vitest",
    enforce: "pre" as const,
    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },
    load(id: string) {
      if (id === RESOLVED_VIRTUAL_ID) return code;
    },
  };
}

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Include tests from root and all workspace packages
    include: ["**/__tests__/**/*.spec.ts", "**/__tests__/**/*.spec.tsx"],
    setupFiles: ["tests/setup.sdk-bridge.ts"],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      // Map legacy package name used in tests to the actual dependency
      "@renderx/host-sdk": "@renderx-plugins/host-sdk",
    },
  },
  plugins: [pluginModuleLoaders()],
});
