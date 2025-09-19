// Vite config: data-driven prebundle hints from aggregated manifest; keep safe fallback
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

function isBare(spec) {
  return (
    typeof spec === "string" &&
    spec.length &&
    !spec.startsWith(".") &&
    !spec.startsWith("/") &&
    !spec.startsWith("http")
  );
}

function packageRoot(spec) {
  if (spec.startsWith("@")) {
    const parts = spec.split("/");
    return parts.length >= 2 ? parts.slice(0, 2).join("/") : spec;
  }
  const idx = spec.indexOf("/");
  return idx > 0 ? spec.slice(0, idx) : spec;
}

const fallbackInclude = [
  "@renderx-plugins/header",
  "@renderx-plugins/library",
  "@renderx-plugins/library-component",
  "@renderx-plugins/control-panel",
  "@renderx-plugins/host-sdk",
];

function computeInclude() {
  const m = readManifest();
  const set = new Set();
  if (m && Array.isArray(m.plugins)) {
    for (const p of m.plugins) {
      const mods = [p?.ui?.module, p?.runtime?.module];
      for (const s of mods) {
        if (isBare(s)) set.add(packageRoot(s));
      }
    }
  }
  set.add("@renderx-plugins/host-sdk");
  const arr = Array.from(set);
  return arr.length ? arr : fallbackInclude;
}

const includeList = computeInclude();

// Virtual module that exposes literal dynamic imports for plugin modules so Vite can rewrite them.
function pluginModuleLoaders() {
  const m = readManifest();
  const specs = new Set();
  if (m && Array.isArray(m.plugins)) {
    for (const p of m.plugins) {
      const mods = [p?.ui?.module, p?.runtime?.module];
      for (const s of mods) {
        if (isBare(s)) specs.add(packageRoot(s));
      }
    }
  }
  // Always include host-sdk in case it appears in manifests
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
    "  // Fallback for relative/absolute/URL specifiers",
    "  return import(/* @vite-ignore */ spec);",
    "}",
  ];
  const code = lines.join("\n");
  const VIRTUAL_ID = "virtual:plugin-module-loaders";
  const RESOLVED_VIRTUAL_ID = "\0" + VIRTUAL_ID;
  return {
    name: "plugin-module-loaders",
    enforce: "pre",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) return code;
    },
  };
}

export default {
  resolve: {
    alias: {
      // Host SDK alias (legacy import name)
      "@renderx/host-sdk": "@renderx-plugins/host-sdk",
    },
    // Ensure a single React instance across host and plugins
    dedupe: ["react", "react-dom"],
  },
  plugins: [pluginModuleLoaders()],
  optimizeDeps: {
    // Data-driven dev prebundle list computed from aggregated plugin manifest
    include: includeList,
    // Avoid esbuild trying to load asset query imports like ?url in dependencies
    exclude: ["@renderx-plugins/canvas-component", "gif.js.optimized"],
  },
  build: {
    rollupOptions: {
      // Include a stable-named vendor entry that bundles the workspace Control Panel for preview/E2E
      input: {
        main: "index.html",
        "vendor-control-panel": "src/vendor/vendor-control-panel.ts",
      },
      output: {
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === "vendor-control-panel"
            ? "assets/vendor-control-panel.js"
            : "assets/[name]-[hash].js",
      },
      // Do NOT externalize host-sdk for this app; we need it bundled for preview/E2E
      // external: ['@renderx-plugins/host-sdk']
    },
  },
};
