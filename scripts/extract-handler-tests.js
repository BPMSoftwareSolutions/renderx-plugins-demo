#!/usr/bin/env node

/**
 * Phase 2: Extract Handler Tests
 * 
 * Scans for test files and maps them to handlers
 * - Finds *.spec.ts, *.test.ts files
 * - Extracts test names and handler references
 * - Generates ir-handler-tests.json
 */

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const PLUGIN_PACKAGES = [
  "packages/canvas",
  "packages/canvas-component",
  "packages/components",
  "packages/control-panel",
  "packages/header",
  "packages/library",
  "packages/library-component"
];

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
}

async function readFile2(path) {
  try {
    return await readFile(path, "utf-8");
  } catch (err) {
    return null;
  }
}

async function walkDir(dir, callback) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walkDir(fullPath, callback);
      } else if (entry.name.endsWith(".spec.ts") || entry.name.endsWith(".test.ts")) {
        await callback(fullPath);
      }
    }
  } catch (err) {
    // Directory may not exist
  }
}

async function findAllTestFiles() {
  const testFiles = [];

  // Scan all packages for test files
  const packagesDir = join(rootDir, "packages");
  await walkDir(packagesDir, async (filePath) => {
    testFiles.push(filePath);
  });

  return testFiles;
}

function extractTestsFromFile(content, filePath) {
  const tests = [];
  
  // Match: describe('...', () => { ... })
  const describeRegex = /describe\s*\(\s*['"`]([^'"`]+)['"`]\s*,/g;
  let match;
  
  while ((match = describeRegex.exec(content)) !== null) {
    tests.push({
      type: "describe",
      name: match[1]
    });
  }
  
  // Match: it('...', () => { ... })
  const itRegex = /it\s*\(\s*['"`]([^'"`]+)['"`]\s*,/g;
  while ((match = itRegex.exec(content)) !== null) {
    tests.push({
      type: "it",
      name: match[1]
    });
  }
  
  // Match: test('...', () => { ... })
  const testRegex = /test\s*\(\s*['"`]([^'"`]+)['"`]\s*,/g;
  while ((match = testRegex.exec(content)) !== null) {
    tests.push({
      type: "test",
      name: match[1]
    });
  }
  
  return tests;
}

function extractHandlerReferences(content) {
  const handlers = new Set();
  
  // Match: handler name references in test (common patterns)
  // import { handlerName } from ...
  const importRegex = /import\s+\{\s*([^}]+)\s*\}\s+from/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const imports = match[1].split(",").map(i => i.trim());
    imports.forEach(imp => handlers.add(imp));
  }
  
  return Array.from(handlers);
}

async function extractHandlerTests() {
  console.log("🧪 Phase 2: Extracting Handler Tests");
  console.log("=" .repeat(60));

  const outputDir = join(rootDir, "packages", "ographx", ".ographx", "artifacts", "renderx-web", "ir");
  const outputFile = join(outputDir, "ir-handler-tests.json");

  await ensureDir(outputDir);

  const testFiles = [];
  const handlerTestMap = {}; // Maps handler name to tests
  let fileCount = 0;

  // Find ALL test files in packages
  const allTestFiles = await findAllTestFiles();
  console.log(`📁 Found ${allTestFiles.length} test files total`);

  for (const filePath of allTestFiles) {
    const content = await readFile2(filePath);
    if (!content) continue;

    fileCount++;
    const tests = extractTestsFromFile(content, filePath);
    const handlerRefs = extractHandlerReferences(content);

    if (tests.length > 0 || handlerRefs.length > 0) {
      const relPath = filePath.replace(rootDir, "");
      const pluginName = filePath.split("packages")[1]?.split("\\")[1] || "unknown";

      testFiles.push({
        file: relPath,
        plugin: pluginName,
        testCount: tests.length,
        tests,
        handlerReferences: handlerRefs
      });

      // Map handlers to tests
      handlerRefs.forEach(handler => {
        if (!handlerTestMap[handler]) {
          handlerTestMap[handler] = [];
        }
        handlerTestMap[handler].push({
          testFile: relPath,
          testCount: tests.length,
          testNames: tests.map(t => t.name)
        });
      });
    }
  }

  // Generate IR
  const ir = {
    metadata: {
      generated: new Date().toISOString(),
      phase: "Phase 2: Handler Test Extraction",
      sourceDirectories: PLUGIN_PACKAGES.map(p => `${p}/src/`),
      fileCount
    },
    summary: {
      totalTestFiles: testFiles.length,
      totalTests: testFiles.reduce((sum, f) => sum + f.testCount, 0),
      handlersWithTests: Object.keys(handlerTestMap).length,
      handlersWithoutTests: 0 // Will be calculated in Phase 3
    },
    testFiles,
    handlerTestMap
  };

  // Write output
  await writeFile(outputFile, JSON.stringify(ir, null, 2));
  console.log("\n" + "=" .repeat(60));
  console.log(`📝 Output: ${outputFile.replace(rootDir, "")}`);
  console.log(`📊 Summary:`);
  console.log(`   - Test Files: ${testFiles.length}`);
  console.log(`   - Total Tests: ${ir.summary.totalTests}`);
  console.log(`   - Handlers with Tests: ${Object.keys(handlerTestMap).length}`);
  console.log(`   - Files Scanned: ${fileCount}`);
  console.log("✅ Phase 2 Complete: Handler Tests Extracted");
}

extractHandlerTests().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

