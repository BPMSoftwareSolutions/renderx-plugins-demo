#!/usr/bin/env node
/**
 * HANDLER SPEC FIXER
 * 
 * Aligns handler specifications with their implementations.
 * Checks for missing metadata, inconsistent naming, and incomplete specifications.
 */

const fs = require('fs');
const path = require('path');

const HANDLER_PATHS = [
    'packages/components/src/handlers',
    'packages/canvas-component/src/handlers',
    'packages/control-panel/src/handlers',
    'packages/slo-dashboard/src/handlers',
    'src/handlers',
    'packages/host-sdk/src'
];

const HEADER = `
╔════════════════════════════════════════════════════════════════════╗
║  🔧 HANDLER SPEC FIXER - Align Handler Implementations             ║
╚════════════════════════════════════════════════════════════════════╝
`;

console.log(HEADER);

// Scan for handler files
console.log('📂 Scanning for handler specification files...');
const files = [];
HANDLER_PATHS.forEach(dir => {
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
                } else if ((entry.endsWith('.ts') || entry.endsWith('.js')) && (entry.includes('handler') || entry.includes('spec'))) {
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

console.log(`✅ Found ${files.length} handler files\n`);

// Analyze handler specifications
console.log('🔍 Analyzing handler specifications...\n');

const handlersNeedingAlignment = {};
let totalIssues = 0;

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const fileName = path.basename(file);
        
        // Check for common handler issues
        const issues = [];
        
        // Check 1: Missing JSDoc comments
        if (!content.includes('/**') && (content.includes('export') || content.includes('function'))) {
            issues.push('Missing JSDoc documentation');
        }
        
        // Check 2: Missing error handling
        if ((content.includes('async') || content.includes('await')) && !content.includes('try') && !content.includes('catch')) {
            issues.push('Missing error handling');
        }
        
        // Check 3: Missing type annotations (TypeScript files)
        if (file.endsWith('.ts') && content.includes('function') && !content.includes(': ')) {
            issues.push('Missing type annotations');
        }
        
        if (issues.length > 0) {
            handlersNeedingAlignment[fileName] = {
                path: file,
                issues: issues,
                issueCount: issues.length
            };
            totalIssues += issues.length;
        }
    } catch (e) {
        // Skip files we can't read
    }
});

// Report findings
Object.entries(handlersNeedingAlignment).forEach(([fileName, info]) => {
    console.log(`   ⚠️  ${fileName}: ${info.issueCount} issues`);
    info.issues.forEach(issue => {
        console.log(`       - ${issue}`);
    });
});

console.log(`\n📊 Found ${Object.keys(handlersNeedingAlignment).length} handlers with specification issues\n`);

// For this iteration, we identify issues but note that full fixes require manual review
console.log('🔍 Handler Analysis Results:\n');

// Group by issue type
const issuesByType = {};
Object.values(handlersNeedingAlignment).forEach(handler => {
    handler.issues.forEach(issue => {
        if (!issuesByType[issue]) {
            issuesByType[issue] = 0;
        }
        issuesByType[issue]++;
    });
});

console.log('Issue Breakdown:');
Object.entries(issuesByType).forEach(([issue, count]) => {
    console.log(`   • ${issue}: ${count} handlers`);
});

// Generate report
const reportDir = '.generated/conformity-fixes';
if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const reportPath = path.join(reportDir, `handler-spec-analysis-${timestamp}.json`);

const report = {
    timestamp: new Date().toISOString(),
    type: 'handler-spec-analysis',
    description: 'Handler Specification Analysis Report',
    summary: {
        handlersScanned: files.length,
        handlersWithIssues: Object.keys(handlersNeedingAlignment).length,
        totalIssuesFound: totalIssues,
        automationRate: '0% (requires manual review)'
    },
    issuesByType,
    details: handlersNeedingAlignment,
    recommendations: [
        'Add JSDoc comments to all public handler functions',
        'Implement try-catch for async operations',
        'Add strict TypeScript type annotations',
        'Add unit tests for each handler',
        'Document error handling strategy'
    ]
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📊 Analysis report saved to:\n   ${reportPath}\n`);

// Summary
console.log(`╔════════════════════════════════════════════════════════════════════╗`);
console.log(`║  📈 HANDLER SPEC ANALYSIS SUMMARY                                 ║`);
console.log(`╚════════════════════════════════════════════════════════════════════╝\n`);
console.log(`✨ Handlers Scanned: ${files.length}`);
console.log(`✨ Handlers with Issues: ${Object.keys(handlersNeedingAlignment).length}`);
console.log(`✨ Total Issues Found: ${totalIssues}`);
console.log(`✨ Automation Rate: 0% (manual review recommended)\n`);

console.log(`💡 Recommended Actions:`);
console.log(`   1. Review handler-spec-analysis report`);
console.log(`   2. Add JSDoc documentation to handlers`);
console.log(`   3. Add error handling and type annotations`);
console.log(`   4. Write unit tests for handlers`);
console.log(`   5. Re-run: npm run audit:symphonia:conformity\n`);
console.log(`╔════════════════════════════════════════════════════════════════════╗\n`);

process.exit(0);
