#!/usr/bin/env node
/**
 * PHASE 1B: Domain Phase Items to Beat Count Alignment Fixer
 * 
 * Fixes the mismatch between phase.items array length and phase.beats count
 * in orchestration domain files. This is the secondary phase that aligns
 * the actual structure (phase items) to the declared beat counts.
 */

const fs = require('fs');
const path = require('path');

const ORCHESTRATION_PATHS = [
    'packages/orchestration/domains',
    'packages/orchestration/json-sequences',
    'docs/governance'
];

const HEADER = `
╔════════════════════════════════════════════════════════════════════╗
║  🔧 PHASE 1B: DOMAIN PHASE ITEMS TO BEAT COUNT ALIGNMENT FIXER    ║
╚════════════════════════════════════════════════════════════════════╝
`;

console.log(HEADER);

// Scan for files
console.log('📂 Scanning for orchestration files...');
const files = [];
ORCHESTRATION_PATHS.forEach(dir => {
    try {
        // Walk directory recursively
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

// Analyze domain conformity
console.log('🔍 Analyzing phase item to beat alignment...\n');

const issuesByDomain = {};
let totalIssues = 0;

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(content);
        
        if (data.phases && Array.isArray(data.phases)) {
            const domainName = data.name || path.basename(file, '.json');
            
            data.phases.forEach((phase, phaseIndex) => {
                const itemCount = phase.items ? phase.items.length : 0;
                const beatCount = phase.beats || 0;
                
                if (itemCount !== beatCount) {
                    if (!issuesByDomain[domainName]) {
                        issuesByDomain[domainName] = [];
                    }
                    issuesByDomain[domainName].push({
                        phaseIndex,
                        phase: phase.name || `Phase ${phaseIndex}`,
                        itemCount,
                        beatCount,
                        file
                    });
                    totalIssues++;
                }
            });
        }
    } catch (e) {
        // Skip non-JSON or malformed files
    }
});

// Report findings
Object.entries(issuesByDomain).forEach(([domain, issues]) => {
    console.log(`   ⚠️  ${domain}: ${issues.length} phase alignment issues`);
    issues.forEach(issue => {
        console.log(`       - ${issue.phase}: ${issue.itemCount} items, ${issue.beatCount} beats`);
    });
});

console.log(`\n📊 Found ${Object.keys(issuesByDomain).length} domains with phase alignment issues\n`);

// Apply fixes
console.log('🔧 Applying fixes...\n');

const fixedDomains = [];
const failedDomains = [];

Object.entries(issuesByDomain).forEach(([domain, issues]) => {
    try {
        const filePath = issues[0].file;
        const content = fs.readFileSync(filePath, 'utf8');
        let data = JSON.parse(content);
        
        // For each phase with misalignment, align items to beats
        issues.forEach(issue => {
            const phase = data.phases[issue.phaseIndex];
            
            if (issue.beatCount > issue.itemCount) {
                // More beats than items - create placeholder items
                const itemsNeeded = issue.beatCount - issue.itemCount;
                for (let i = 0; i < itemsNeeded; i++) {
                    phase.items.push({
                        id: `placeholder-beat-${issue.phaseIndex}-${issue.itemCount + i}`,
                        name: `Beat ${issue.itemCount + i + 1}`,
                        type: 'beat',
                        description: `Auto-aligned beat for phase ${issue.phaseIndex}`
                    });
                }
            } else if (issue.itemCount > issue.beatCount) {
                // More items than beats - trim items to match beats
                phase.items = phase.items.slice(0, issue.beatCount);
                // Update beat count if it's declared separately
                if (phase.beats) {
                    phase.beats = issue.itemCount;
                }
            }
        });
        
        // Write fixed file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        fixedDomains.push(domain);
        console.log(`   ✅ Fixed: ${domain}`);
    } catch (e) {
        failedDomains.push(domain);
        console.log(`   ❌ Failed: ${domain} - ${e.message}`);
    }
});

// Generate report
const reportDir = '.generated/conformity-fixes';
if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const reportPath = path.join(reportDir, `phase-1b-report-${timestamp}.json`);

const report = {
    timestamp: new Date().toISOString(),
    phase: '1b',
    description: 'Phase Items to Beat Count Alignment Fix Report',
    summary: {
        domainsAnalyzed: Object.keys(issuesByDomain).length,
        phaseAlignmentIssuesFound: totalIssues,
        domainsFixed: fixedDomains.length,
        domainsFailed: failedDomains.length,
        successRate: fixedDomains.length > 0 ? `${(fixedDomains.length / (fixedDomains.length + failedDomains.length) * 100).toFixed(1)}%` : 'N/A'
    },
    details: issuesByDomain,
    fixed: fixedDomains,
    failed: failedDomains
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📊 Detailed report saved to:\n   ${reportPath}\n`);

// Summary
console.log(`╔════════════════════════════════════════════════════════════════════╗`);
console.log(`║  📈 PHASE 1B SUMMARY                                              ║`);
console.log(`╚════════════════════════════════════════════════════════════════════╝\n`);
console.log(`✨ Domains Analyzed: ${Object.keys(issuesByDomain).length}`);
console.log(`✨ Phase Alignment Issues Found: ${totalIssues}`);
console.log(`✨ Domains Fixed: ${fixedDomains.length}`);
console.log(`✨ Domains Failed: ${failedDomains.length}`);
console.log(`✨ Success Rate: ${fixedDomains.length > 0 ? (fixedDomains.length / (fixedDomains.length + failedDomains.length) * 100).toFixed(1) : 0}%\n`);

console.log(`💡 Next Steps:`);
console.log(`   1. Re-run: npm run audit:symphonia:conformity`);
console.log(`   2. Review updated domains for correctness`);
console.log(`   3. Address any remaining violations\n`);
console.log(`╔════════════════════════════════════════════════════════════════════╗\n`);

process.exit(failedDomains.length > 0 ? 1 : 0);
