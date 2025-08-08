import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Custom plugin for runtime TypeScript transformation
    {
      name: "runtime-plugin-loader",
      configureServer(server) {
        server.middlewares.use("/plugins", async (req, res, next) => {
          try {
            const reqUrl = new URL(req.url || "", "http://localhost");
            const pathname = reqUrl.pathname; // ignore query like ?import
            const isTS = pathname.endsWith(".ts") || pathname.endsWith(".tsx");
            const isJS = pathname.endsWith(".js") || pathname.endsWith(".mjs");

            if (!isTS && !isJS) return next();

            const fs = await import("fs/promises");
            const nodePath = await import("path");

            // Construct on-disk path under public/plugins
            const filePath = nodePath.join(
              process.cwd(),
              "public",
              "plugins",
              pathname.replace(/^\/?plugins\//, "")
            );

            if (isTS) {
              const { transformSync } = await import("esbuild");
              console.log(
                `🔄 Transforming TS plugin: ${pathname} -> ${filePath}`
              );
              const content = await fs.readFile(filePath, "utf-8");
              const result = transformSync(content, {
                loader: pathname.endsWith(".tsx") ? "tsx" : "ts",
                format: "esm",
                target: "es2020",
                jsx: "automatic",
                jsxImportSource: "react",
              });
              res.setHeader("Content-Type", "application/javascript");
              res.end(result.code);
              return;
            } else if (isJS) {
              console.log(`📦 Serving JS plugin: ${pathname} -> ${filePath}`);
              const content = await fs.readFile(filePath, "utf-8");
              res.setHeader("Content-Type", "application/javascript");
              res.end(content);
              return;
            }
          } catch (error) {
            console.error("❌ Plugin serve/transform error:", error);
            res.statusCode = 500;
            res.end(`// Plugin load failed: ${error?.message || error}`);
            return;
          }
        });
      },
    },
  ],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    // Configure middleware to serve plugin files correctly
    middlewareMode: false,
    fs: {
      // Allow serving files from the plugins directory
      allow: ["..", "public/plugins", "public/json-components"],
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": "/src",
      "musical-conductor": path.resolve(__dirname, "../modules/communication"),
    },
  },
  // Ensure static assets are served correctly
  publicDir: "public",
  // Configure how SPA fallback works
  appType: "spa",
});
