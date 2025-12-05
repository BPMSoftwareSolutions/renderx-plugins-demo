#!/usr/bin/env node

// AC Tag Suggester - Part 1
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const DOMAIN = process.env.ANALYSIS_DOMAIN_ID || "renderx-web-orchestration";
const THRESHOLD = 25;
const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, ".generated", "acs", DOMAIN + ".registry.json");
const OUTPUT_PATH = path.join(ROOT, ".generated", "ac-alignment", "suggestions.json");

const TEST_PATTERNS = [
  "tests/**/*.spec.ts",
  "tests/**/*.spec.tsx",
  "tests/**/*.test.ts",
  "tests/**/*.test.tsx"
];

function calculateMatchScore(testTitle, fileName, ac) {
  let score = 0;
  const lowerTitle = testTitle.toLowerCase();
  const lowerFile = fileName.toLowerCase();

  const beatNameStr = (ac.beatName && typeof ac.beatName === 'string') ? ac.beatName : "";
  const handlerStr = (ac.handler && typeof ac.handler === 'string') ? ac.handler : "";
  const thenStr = (ac.then && typeof ac.then === 'string') ? ac.then : "";
  const whenStr = (ac.when && typeof ac.when === 'string') ? ac.when : "";

  const beatNameWords = beatNameStr.toLowerCase().split(/[-_\s]+/).filter(w => w.length > 2);
  const handlerWords = handlerStr.toLowerCase().split(/[-_\s]+/).filter(w => w.length > 2);
  const thenWords = thenStr.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const whenWords = whenStr.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  beatNameWords.forEach(word => {
    if (lowerTitle.includes(word)) score += 8;
    if (lowerFile.includes(word)) score += 4;
  });

  handlerWords.forEach(word => {
    if (lowerTitle.includes(word)) score += 8;
    if (lowerFile.includes(word)) score += 4;
  });

  thenWords.forEach(word => {
    if (lowerTitle.includes(word)) score += 3;
  });

  whenWords.forEach(word => {
    if (lowerTitle.includes(word)) score += 2;
  });

  if (ac.sequenceId && lowerFile.includes(ac.sequenceId)) score += 10;
  if (ac.sequenceId && lowerTitle.includes(ac.sequenceId)) score += 5;
  if (ac.beatId && lowerFile.includes(ac.beatId)) score += 12;
  if (thenStr && lowerTitle.includes(thenStr.toLowerCase())) score += 15;
  if (whenStr && lowerTitle.includes(whenStr.toLowerCase())) score += 10;

  return Math.min(score, 100);
}

function normalizeTestTitle(title) {
  return title.replace(/\[AC:[^\]]+\]/g, "").replace(/\[BEAT:[^\]]+\]/g, "").trim();
}

function checkExistingTags(title) {
  return {
    hasAcTag: /\[AC:[^\]]+\]/.test(title),
    hasBeatTag: /\[BEAT:[^\]]+\]/.test(title)
  };
}

function findTestFiles() {
  const testFiles = new Set();
  TEST_PATTERNS.forEach(pattern => {
    try {
      const result = execSync('npx glob "' + pattern + '"', {
        cwd: ROOT, encoding: "utf8", stdio: ["pipe", "pipe", "ignore"]
      });
      result.split("\n").filter(Boolean).forEach(file => testFiles.add(file));
    } catch (error) {}
  });
  return Array.from(testFiles);
}

function extractTestsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const tests = [];
    const describeRegex = /describe\s*\(\s*['"`]([^'"`]+)['"`]/g;
    const itRegex = /it\s*\(\s*['"`]([^'"`]+)['"`]/g;

    const describeBlocks = [];
    let match;
    while ((match = describeRegex.exec(content)) !== null) {
      describeBlocks.push({ title: match[1], index: match.index });
    }

    while ((match = itRegex.exec(content)) !== null) {
      let describeTitle = "";
      for (let i = describeBlocks.length - 1; i >= 0; i--) {
        if (describeBlocks[i].index < match.index) {
          describeTitle = describeBlocks[i].title;
          break;
        }
      }
      tests.push({
        file: filePath,
        describeTitle,
        testTitle: match[1],
        fullTitle: describeTitle ? describeTitle + " " + match[1] : match[1],
        line: content.substring(0, match.index).split("\n").length
      });
    }
    return tests;
  } catch (error) {
    return [];
  }
}

function generateSuggestions(tests, acs) {
  const suggestions = {};
  let totalSuggestions = 0;
  let skippedWithTags = 0;
  
  tests.forEach(test => {
    const existing = checkExistingTags(test.fullTitle);
    if (existing.hasAcTag) {
      skippedWithTags++;
      return;
    }
    
    const normalizedTitle = normalizeTestTitle(test.fullTitle);
    const fileName = path.basename(test.file);
    
    const scored = acs.map(ac => ({
      ac, score: calculateMatchScore(normalizedTitle, fileName, ac)
    }));
    
    const matches = scored.filter(s => s.score >= THRESHOLD).sort((a, b) => b.score - a.score);
    
    if (matches.length > 0) {
      const topMatch = matches[0];
      const acIdValue = topMatch.ac.acId || topMatch.ac.id;
      const tag = "[AC:" + acIdValue + "]";
      const beatTag = "[BEAT:" + DOMAIN + ":" + topMatch.ac.sequenceId + ":" + topMatch.ac.beatId + "]";

      if (!suggestions[test.file]) suggestions[test.file] = [];

      suggestions[test.file].push({
        line: test.line,
        testTitle: test.testTitle,
        describeTitle: test.describeTitle,
        fullTitle: test.fullTitle,
        tag,
        beatTag: existing.hasBeatTag ? null : beatTag,
        acId: acIdValue,
        score: topMatch.score,
        confidence: topMatch.score >= 60 ? "high" : topMatch.score >= 40 ? "medium" : "low"
      });
      totalSuggestions++;
    }
  });
  
  console.log("Generated " + totalSuggestions + " suggestions");
  console.log("Skipped " + skippedWithTags + " tests (already tagged)");
  return suggestions;
}

function main() {
  console.log("AC Tag Suggester for " + DOMAIN);
  
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error("Registry not found: " + REGISTRY_PATH);
    process.exit(1);
  }
  
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  const acs = registry.items || registry.acs || [];
  console.log("Loaded " + acs.length + " ACs");
  
  const testFiles = findTestFiles();
  console.log("Found " + testFiles.length + " test files");
  
  const allTests = [];
  testFiles.forEach(file => {
    const tests = extractTestsFromFile(file);
    allTests.push(...tests);
  });
  console.log("Extracted " + allTests.length + " test cases");
  
  const suggestions = generateSuggestions(allTests, acs);
  
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  const output = {
    generatedAt: new Date().toISOString(),
    domain: DOMAIN,
    threshold: THRESHOLD,
    totalTests: allTests.length,
    totalACs: acs.length,
    suggestionsGenerated: Object.values(suggestions).flat().length,
    filesAffected: Object.keys(suggestions).length,
    suggestions
  };
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log("Suggestions written to: " + OUTPUT_PATH);
}

if (require.main === module) main();

module.exports = { calculateMatchScore, generateSuggestions };
