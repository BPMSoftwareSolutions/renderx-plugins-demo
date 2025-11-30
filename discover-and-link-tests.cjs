#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test discovery configuration
const testPatterns = [
  { ext: '.spec.ts', dir: '__tests__', priority: 10 },
  { ext: '.spec.ts', dir: 'tests', priority: 9 },
  { ext: '.spec.js', dir: '__tests__', priority: 8 },
  { ext: '.spec.js', dir: 'tests', priority: 7 },
  { ext: '.test.ts', dir: '__tests__', priority: 6 },
  { ext: '.test.ts', dir: 'tests', priority: 5 },
  { ext: '.test.js', dir: '__tests__', priority: 4 },
  { ext: '.test.js', dir: 'tests', priority: 3 },
];

const basePath = 'c:\\source\\repos\\bpm\\Internal\\renderx-plugins-demo';

/**
 * Extract handler name and normalize for test matching
 */
function extractHandlerName(handler) {
  if (typeof handler === 'string') {
    const parts = handler.split('#');
    const lastPart = parts[parts.length - 1] || handler;
    return lastPart.split('/').pop().split('.').pop();
  } else if (handler?.name) {
    const lastPart = handler.name.split('#').pop();
    return lastPart.split('/').pop().split('.').pop();
  }
  return 'unknown';
}

/**
 * Normalize handler name for test file matching
 * Examples: loadComponents -> load-components, validateField -> validate-field
 */
function normalizeForTestMatching(handlerName) {
  return handlerName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

/**
 * Score a test file for matching a handler
 * Higher score = better match
 */
function scoreTestMatch(testFile, handlerName) {
  const normalized = normalizeForTestMatching(handlerName);
  const testName = path.basename(testFile, path.extname(testFile)).toLowerCase();
  
  let score = 0;
  
  // Exact match
  if (testName === normalized || testName === handlerName.toLowerCase()) {
    score += 1000;
  }
  // Contains full handler name
  else if (testName.includes(normalized)) {
    score += 500;
  }
  // Contains handler name parts (for compound names)
  else {
    const parts = normalized.split('-');
    const matches = parts.filter(p => testName.includes(p)).length;
    score += matches * 100;
  }
  
  return score;
}

/**
 * Discover all test files in the repository
 */
function discoverAllTests() {
  const tests = new Map(); // handler normalized name -> array of test files with scores
  
  function walkDir(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.startsWith('.')) continue;
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (file.match(/\.(spec|test)\.(ts|js)$/)) {
          const relPath = path.relative(basePath, fullPath);
          
          // Extract potential handler name from test file
          const testName = path.basename(file, path.extname(file))
            .replace(/\.spec$|\.test$/, '')
            .toLowerCase();
          
          // Store this test for all matching patterns
          if (!tests.has(testName)) {
            tests.set(testName, []);
          }
          tests.get(testName).push(relPath);
        }
      }
    } catch (e) {
      // Skip permission errors
    }
  }
  
  walkDir(basePath);
  return tests;
}

/**
 * Find best matching test for a handler
 */
function findTestForHandler(allTests, handlerName) {
  if (!handlerName || handlerName === 'unknown') return null;
  
  const normalized = normalizeForTestMatching(handlerName);
  
  // Exact match on normalized name
  if (allTests.has(normalized)) {
    return allTests.get(normalized)[0];
  }
  
  // Try handler name directly
  if (allTests.has(handlerName.toLowerCase())) {
    return allTests.get(handlerName.toLowerCase())[0];
  }
  
  // Score all tests and return best match
  let bestScore = 0;
  let bestTest = null;
  
  for (const [testKey, testFiles] of allTests.entries()) {
    const score = scoreTestMatch(testFiles[0], handlerName);
    if (score > bestScore && score > 50) {
      bestScore = score;
      bestTest = testFiles[0];
    }
  }
  
  return bestTest;
}

/**
 * Extract test cases (describe/it blocks) from a test file
 */
function extractTestCases(testFilePath) {
  try {
    const fullPath = path.join(basePath, testFilePath);
    if (!fs.existsSync(fullPath)) return [];
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const testCases = [];
    
    // Match: it('test name', ...)
    const itRegex = /it\(['"]([^'"]+)['"]/g;
    let match;
    while ((match = itRegex.exec(content)) !== null) {
      testCases.push(match[1]);
    }
    
    // Match: test('test name', ...)
    const testRegex = /test\(['"]([^'"]+)['"]/g;
    while ((match = testRegex.exec(content)) !== null) {
      testCases.push(match[1]);
    }
    
    return [...new Set(testCases)]; // Deduplicate
  } catch (e) {
    return [];
  }
}

/**
 * Find symphony JSON files
 */
function findSymphonies(basePath) {
  const symphonies = [];
  
  const packages = [
    'orchestration', 'control-panel', 'self-healing', 'slo-dashboard',
    'canvas-component', 'header', 'library', 'library-component', 'real-estate-analyzer'
  ];
  
  // Flat structure
  for (const pkg of packages) {
    const flatPath = path.join(basePath, `packages/${pkg}/json-sequences`);
    if (fs.existsSync(flatPath)) {
      try {
        const files = fs.readdirSync(flatPath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            symphonies.push(path.join(flatPath, file));
          }
        }
      } catch (e) {}
    }
  }
  
  // Nested structure
  for (const pkg of packages) {
    const nestedBase = path.join(basePath, `packages/${pkg}/json-sequences`);
    if (fs.existsSync(nestedBase)) {
      const dirs = fs.readdirSync(nestedBase);
      for (const dir of dirs) {
        const nestedPath = path.join(nestedBase, dir);
        if (fs.statSync(nestedPath).isDirectory()) {
          try {
            const files = fs.readdirSync(nestedPath);
            for (const file of files) {
              if (file.endsWith('.json')) {
                symphonies.push(path.join(nestedPath, file));
              }
            }
          } catch (e) {}
        }
      }
    }
  }
  
  // RenderX packages
  const srcPath = path.join(basePath, 'src');
  if (fs.existsSync(srcPath)) {
    try {
      const dirs = fs.readdirSync(srcPath);
      for (const dir of dirs) {
        if (dir.startsWith('RenderX.Plugins.')) {
          const seqPath = path.join(srcPath, dir, 'json-sequences');
          if (fs.existsSync(seqPath)) {
            // Check for both flat and nested
            const files = fs.readdirSync(seqPath);
            for (const file of files) {
              if (file.endsWith('.json')) {
                symphonies.push(path.join(seqPath, file));
              }
            }
            
            // Check nested
            for (const file of files) {
              const nested = path.join(seqPath, file);
              if (fs.statSync(nested).isDirectory()) {
                try {
                  const nestedFiles = fs.readdirSync(nested);
                  for (const nf of nestedFiles) {
                    if (nf.endsWith('.json')) {
                      symphonies.push(path.join(nested, nf));
                    }
                  }
                } catch (e) {}
              }
            }
          }
        }
      }
    } catch (e) {}
  }
  
  return symphonies;
}

/**
 * Link tests to symphonies
 */
function linkTestsToSymphonies() {
  console.log('🔍 Discovering all tests...');
  const allTests = discoverAllTests();
  console.log(`✅ Found ${allTests.size} test file patterns\n`);
  
  console.log('📖 Finding symphonies...');
  const symphonies = findSymphonies(basePath);
  console.log(`✅ Found ${symphonies.length} symphonies\n`);
  
  let results = { total: 0, linked: 0, failed: 0, testCasesLinked: 0 };
  
  for (const symphonyPath of symphonies) {
    try {
      const content = fs.readFileSync(symphonyPath, 'utf8');
      const symphony = JSON.parse(content);
      let hasChanges = false;
      
      // Process all movements
      if (symphony.movements && Array.isArray(symphony.movements)) {
        for (const movement of symphony.movements) {
          if (movement.beats && Array.isArray(movement.beats)) {
            for (const beat of movement.beats) {
              if (beat.handler) {
                const handlerName = extractHandlerName(beat.handler);
                const testFile = findTestForHandler(allTests, handlerName);
                
                if (testFile) {
                  const testCases = extractTestCases(testFile);
                  const testCase = testCases.length > 0 ? testCases[0] : `should ${normalizeForTestMatching(handlerName)}`;
                  
                  // Update beat with test info
                  if (beat.testFile !== testFile || beat.testCase !== testCase) {
                    beat.testFile = testFile;
                    beat.testCase = testCase;
                    hasChanges = true;
                    results.linked++;
                    results.testCasesLinked += testCases.length;
                  }
                }
                results.total++;
              }
            }
          }
        }
      }
      
      // Write back if changed
      if (hasChanges) {
        fs.writeFileSync(symphonyPath, JSON.stringify(symphony, null, 2));
      }
    } catch (error) {
      results.failed++;
    }
  }
  
  console.log('📊 Summary:');
  console.log(`   Total Beats: ${results.total}`);
  console.log(`   Beats Linked to Tests: ${results.linked} (${Math.round(results.linked / results.total * 100)}%)`);
  console.log(`   Test Cases Discovered: ${results.testCasesLinked}`);
  console.log(`   Failed: ${results.failed}`);
}

linkTestsToSymphonies();
