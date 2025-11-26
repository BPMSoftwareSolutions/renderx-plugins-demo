#!/usr/bin/env node
/**
 * PHASE 1B-FIX: Remove redundant root beats field from sequences
 * 
 * The audit rule domain-handler-beats-present expects phases (movements)
 * to have items matching their beats count. Files with both movements AND
 * a root beats field cause false violations. This fixer removes the
 * redundant root beats field.
 */

const fs = require('fs');
const path = require('path');

const SEQUENCE_PATHS = [
    'packages/ographx/.ographx/sequences',
    'packages/orchestration/json-sequences',
    'docs/governance'
];

const HEADER = `
╔════════════════════════════════════════════════════════════════════╗
║  🔧 PHASE 1B-FIX: REDUNDANT ROOT BEATS FIELD REMOVAL               ║
╚════════════════════════════════════════════════════════════════════╝
`;

console.log(HEADER);

// Scan for files
console.log('📂 Scanning for sequence files...');
const files = [];
SEQUENCE_PATHS.forEach(dir => {
    try {
        const walkDir = (dirPath) => {
            if (!fs.existsSync(dirPath)) return [];
            const entries = fs.readdirSync(dirPath);
            let results = [];
            entries.forEach(entry => {
                const fullPath = path.join(dirPath, entry);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    results = results.concat(walkDir(fullPath));
                } else if (entry.endsWith('.json')) {
                    results.push(fullPath);
                }
            });
            return results;
        };
        
        const matches = walkDir(dir);
        files.push(...matches);
    } catch (e) {
        // Dir might not exist
    }
});

console.log(`✅ Found ${files.length} files\n`);

// Analyze and fix
console.log('🔍 Analyzing sequence beat structure...\n');

const issuesByFile = {};
let totalIssues = 0;

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(content);
        
        // Check if file has both movements AND root beats
        if (data.movements && Array.isArray(data.movements) && data.beats !== undefined) {
            const fileName = path.basename(file);
            issuesByFile[fileName] = {
                path: file,
                rootBeats: data.beats,
                movementCount: data.movements.length,
                movementBeats: data.movements.map((m, i) => ({
                    index: i,
                    name: m.name,
                    beats: m.beats
                }))
            };
            totalIssues++;
        }
    } catch (e) {
        // Skip non-JSON or malformed files
    }
});

// Report findings
Object.entries(issuesByFile).forEach(([fileName, info]) => {
    console.log(`   ⚠️  ${fileName}: root beats=${info.rootBeats}, movements=${info.movementCount}`);
    console.log(`       Movement beats: [${info.movementBeats.map(m => m.beats).join(', ')}]`);
});

console.log(`\n📊 Found ${totalIssues} files with redundant root beats field\n`);

// Apply fixes
console.log('🔧 Applying fixes...\n');

const fixedFiles = [];
const failedFiles = [];

Object.entries(issuesByFile).forEach(([fileName, info]) => {
    try {
        const content = fs.readFileSync(info.path, 'utf8');
        let data = JSON.parse(content);
        
        // Remove the root beats field - movements already have their own beats
        delete data.beats;
        
        // Write fixed file
        fs.writeFileSync(info.path, JSON.stringify(data, null, 2));
        fixedFiles.push(fileName);
        console.log(`   ✅ Fixed: ${fileName}`);
    } catch (e) {
        failedFiles.push(fileName);
        console.log(`   ❌ Failed: ${fileName} - ${e.message}`);
    }
});

// Generate report
const reportDir = '.generated/conformity-fixes';
if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const reportPath = path.join(reportDir, `phase-1b-fix-report-${timestamp}.json`);

const report = {
    timestamp: new Date().toISOString(),
    phase: '1b-fix',
    description: 'Redundant Root Beats Field Removal Report',
    summary: {
        filesAnalyzed: Object.keys(issuesByFile).length,
        filesFixed: fixedFiles.length,
        filesFailed: failedFiles.length,
        successRate: fixedFiles.length > 0 ? `${(fixedFiles.length / (fixedFiles.length + failedFiles.length) * 100).toFixed(1)}%` : 'N/A'
    },
    issues: issuesByFile,
    fixed: fixedFiles,
    failed: failedFiles
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📊 Detailed report saved to:\n   ${reportPath}\n`);

// Summary
console.log(`╔════════════════════════════════════════════════════════════════════╗`);
console.log(`║  📈 PHASE 1B-FIX SUMMARY                                          ║`);
console.log(`╚════════════════════════════════════════════════════════════════════╝\n`);
console.log(`✨ Files Analyzed: ${Object.keys(issuesByFile).length}`);
console.log(`✨ Files Fixed: ${fixedFiles.length}`);
console.log(`✨ Files Failed: ${failedFiles.length}`);
console.log(`✨ Success Rate: ${fixedFiles.length > 0 ? (fixedFiles.length / (fixedFiles.length + failedFiles.length) * 100).toFixed(1) : 0}%\n`);

console.log(`💡 Next Steps:`);
console.log(`   1. Run: npm run audit:symphonia:conformity`);
console.log(`   2. Review updated sequences for correctness`);
console.log(`   3. Verify conformity improvements\n`);
console.log(`╔════════════════════════════════════════════════════════════════════╗\n`);

process.exit(failedFiles.length > 0 ? 1 : 0);
