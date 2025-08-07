/**
 * Fix ES Module imports to include .js extensions for browser compatibility
 */
const fs = require("fs");
const path = require("path");

function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  let changesMade = false;

  // Fix relative imports to include .js extension
  const fixedContent = content
    .replace(/from\s+["'](\.\/.+?)["']/g, (match, importPath) => {
      const fixedPath = fixImportPath(importPath, filePath);
      if (fixedPath !== importPath) {
        changesMade = true;
        console.log(`  📝 ${importPath} → ${fixedPath}`);
        return match.replace(importPath, fixedPath);
      }
      return match;
    })
    .replace(/import\s*\(\s*["'](\.\/.+?)["']\s*\)/g, (match, importPath) => {
      const fixedPath = fixImportPath(importPath, filePath);
      if (fixedPath !== importPath) {
        changesMade = true;
        console.log(`  📝 ${importPath} → ${fixedPath}`);
        return match.replace(importPath, fixedPath);
      }
      return match;
    });

  if (changesMade) {
    fs.writeFileSync(filePath, fixedContent);
    console.log(`✅ Fixed imports in: ${filePath}`);
  }
}

function fixImportPath(importPath, currentFilePath) {
  // Skip if already has .js extension
  if (importPath.endsWith(".js")) {
    return importPath;
  }

  // Get the directory of the current file
  const currentDir = path.dirname(currentFilePath);

  // Resolve the full path of the import
  const fullImportPath = path.resolve(currentDir, importPath);

  // Check if it's a file that exists with .js extension
  if (fs.existsSync(fullImportPath + ".js")) {
    return importPath + ".js";
  }

  // Check if it's a directory with index.js
  if (fs.existsSync(path.join(fullImportPath, "index.js"))) {
    return importPath + "/index.js";
  }

  // If neither exists, default to .js extension (for files)
  return importPath + ".js";
}

function fixImportsInDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      fixImportsInDirectory(itemPath);
    } else if (item.endsWith(".js")) {
      fixImportsInFile(itemPath);
    }
  }
}

// Fix imports in the test-app dist directory
const distPath = path.join(__dirname, "test-app", "dist");
console.log(`🔧 Fixing ES module imports in: ${distPath}`);
fixImportsInDirectory(distPath);
console.log("✅ Import fixing complete!");
