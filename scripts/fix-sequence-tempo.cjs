#!/usr/bin/env node
/**
 * SEQUENCE TEMPO FIXER
 * 
 * Adds missing tempo fields to sequences that lack this required metadata.
 * Tempo must be between 60-240 BPM (standard: 120).
 */

const fs = require('fs');
const path = require('path');

const SEQUENCE_PATHS = [
    'catalog/json-sequences',
    'packages/orchestration/json-sequences',
    'packages/slo-dashboard/json-sequences',
    'packages/control-panel/json-sequences',
    'packages/ographx/.ographx/sequences'
];

const HEADER = `
╔════════════════════════════════════════════════════════════════════╗
║  🎵 SEQUENCE TEMPO FIXER - Add Missing Tempo Fields                ║
╚════════════════════════════════════════════════════════════════════╝
`;

console.log(HEADER);

// Scan for sequence files
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

console.log(`✅ Found ${files.length} sequence files\n`);

// Analyze and identify sequences missing tempo
console.log('🔍 Analyzing sequences for missing tempo...\n');

const sequencesNeedingTempo = {};
let totalIssues = 0;

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(content);
        
        // Check if this looks like a sequence and is missing tempo
        if ((data.movements || data.beats !== undefined) && data.tempo === undefined) {
            const fileName = path.basename(file);
            sequencesNeedingTempo[fileName] = {
                path: file,
                name: data.name || fileName,
                hasMovements: !!data.movements,
                hasBeat: data.beats !== undefined
            };
            totalIssues++;
        }
    } catch (e) {
        // Skip non-JSON or malformed files
    }
});

// Report findings
Object.entries(sequencesNeedingTempo).forEach(([fileName, info]) => {
    console.log(`   ⚠️  ${fileName}: ${info.name}`);
});

console.log(`\n📊 Found ${totalIssues} sequences missing tempo field\n`);

// Apply fixes
console.log('🔧 Applying fixes...\n');

const fixedSequences = [];
const failedSequences = [];

Object.entries(sequencesNeedingTempo).forEach(([fileName, info]) => {
    try {
        const content = fs.readFileSync(info.path, 'utf8');
        let data = JSON.parse(content);
        
        // Add tempo field (default: 120 BPM)
        // Use existing tempo from similar sequences if file references it, otherwise standard 120
        data.tempo = data.tempo || 120;
        
        // Write fixed file
        fs.writeFileSync(info.path, JSON.stringify(data, null, 2));
        fixedSequences.push(fileName);
        console.log(`   ✅ Fixed: ${fileName} (tempo: 120)`);
    } catch (e) {
        failedSequences.push(fileName);
        console.log(`   ❌ Failed: ${fileName} - ${e.message}`);
    }
});

// Generate report
const reportDir = '.generated/conformity-fixes';
if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const reportPath = path.join(reportDir, `sequence-tempo-fix-report-${timestamp}.json`);

const report = {
    timestamp: new Date().toISOString(),
    type: 'sequence-tempo-fix',
    description: 'Sequence Tempo Field Addition Report',
    summary: {
        sequencesScanned: files.length,
        sequencesNeedingTempo: totalIssues,
        sequencesFixed: fixedSequences.length,
        sequencesFailed: failedSequences.length,
        successRate: fixedSequences.length > 0 ? `${(fixedSequences.length / (fixedSequences.length + failedSequences.length) * 100).toFixed(1)}%` : 'N/A'
    },
    fixed: fixedSequences,
    failed: failedSequences
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📊 Report saved to:\n   ${reportPath}\n`);

// Summary
console.log(`╔════════════════════════════════════════════════════════════════════╗`);
console.log(`║  📈 SEQUENCE TEMPO FIX SUMMARY                                    ║`);
console.log(`╚════════════════════════════════════════════════════════════════════╝\n`);
console.log(`✨ Sequences Scanned: ${files.length}`);
console.log(`✨ Sequences Missing Tempo: ${totalIssues}`);
console.log(`✨ Sequences Fixed: ${fixedSequences.length}`);
console.log(`✨ Sequences Failed: ${failedSequences.length}`);
console.log(`✨ Success Rate: ${fixedSequences.length > 0 ? (fixedSequences.length / (fixedSequences.length + failedSequences.length) * 100).toFixed(1) : 0}%\n`);

console.log(`💡 Next Steps:`);
console.log(`   1. Run: npm run audit:symphonia:conformity`);
console.log(`   2. Verify sequence violation count decreased\n`);
console.log(`╔════════════════════════════════════════════════════════════════════╗\n`);

process.exit(failedSequences.length > 0 ? 1 : 0);
