/**
 * Simple HTTP Server for E2E Test App
 *
 * Serves the test application with proper MIME types and CORS headers
 * for testing MusicalConductor in a browser environment
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

// MIME types
const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // Route handling
  if (pathname === "/") {
    pathname = "/index.html";
  } else if (pathname === "/cached") {
    pathname = "/index-cached.html";
  } else if (pathname === "/bundled") {
    pathname = "/index-bundled.html";
  }

  // Resolve file path
  const filePath = path.join(__dirname, "test-app", pathname);

  // Debug logging
  console.log(`🔍 Request: ${pathname} -> ${filePath}`);

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found
      console.log(`❌ File not found: ${filePath}`);
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    // Get file extension and MIME type
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || "application/octet-stream";

    // Read and serve file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("500 Internal Server Error");
        return;
      }

      // Set headers
      res.writeHead(200, {
        "Content-Type": mimeType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "no-cache",
      });

      res.end(data);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(
    `🎼 MusicalConductor E2E Test Server running at http://${HOST}:${PORT}`
  );
  console.log(`📁 Serving files from: ${path.join(__dirname, "test-app")}`);
  console.log("🚀 Ready for E2E testing!");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Shutting down test server...");
  server.close(() => {
    console.log("✅ Test server stopped");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 Shutting down test server...");
  server.close(() => {
    console.log("✅ Test server stopped");
    process.exit(0);
  });
});
