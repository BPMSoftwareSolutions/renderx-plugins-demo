#!/usr/bin/env node
/**
 * BDD SPEC FIXER
 * 
 * Ensures BDD specifications are complete and compliant.
 * Checks for proper feature/scenario structure, step definitions, and assertions.
 */

const fs = require('fs');
const path = require('path');

const BDD_PATHS = [
    'packages/components/__tests__/bdd',
    'packages/canvas-component/__tests__/bdd',
    'packages/control-panel/__tests__/bdd',
    'packages/slo-dashboard/__tests__/bdd',
    'packages/host-sdk/__tests__/bdd',
    'cypress/e2e',
    '__tests__/bdd'
];

const HEADER = `
╔════════════════════════════════════════════════════════════════════╗
║  ✅ BDD SPEC FIXER - Ensure Scenario Completeness                  ║
╚════════════════════════════════════════════════════════════════════╝
`;

console.log(HEADER);

// Scan for BDD spec files
console.log('📂 Scanning for BDD specification files...');
const files = [];
BDD_PATHS.forEach(dir => {
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
                } else if (entry.endsWith('.feature') || (entry.endsWith('.spec.ts') && entry.includes('bdd')) || entry.endsWith('.cy.ts')) {
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

console.log(`✅ Found ${files.length} BDD spec files\n`);

// Analyze BDD specifications
console.log('🔍 Analyzing BDD specifications...\n');

const specsNeedingFix = {};
let totalIssues = 0;

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const fileName = path.basename(file);
        
        // Check for common BDD issues
        const issues = [];
        
        // Check 1: Feature description present
        if (!content.match(/Feature:|describe\(|it\(/) && !content.includes('Scenario:')) {
            issues.push('Missing feature/scenario structure');
        }
        
        // Check 2: Given-When-Then structure (for .feature files)
        if (fileName.endsWith('.feature')) {
            if (!content.includes('Given') && !content.includes('Scenario')) {
                issues.push('Missing Given-When-Then steps');
            }
        }
        
        // Check 3: Proper assertions
        if ((fileName.includes('spec') || fileName.includes('test')) && !content.includes('expect') && !content.includes('assert') && !content.includes('should')) {
            issues.push('Missing assertions');
        }
        
        // Check 4: Step definitions implemented
        if (content.match(/Given\(|When\(|Then\(/)) {
            if (!content.match(/\.step\(|\.given\(|\.when\(|\.then\(/)) {
                issues.push('Scenario steps not implemented');
            }
        }
        
        if (issues.length > 0) {
            specsNeedingFix[fileName] = {
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
Object.entries(specsNeedingFix).forEach(([fileName, info]) => {
    console.log(`   ⚠️  ${fileName}: ${info.issueCount} issues`);
    info.issues.forEach(issue => {
        console.log(`       - ${issue}`);
    });
});

console.log(`\n📊 Found ${Object.keys(specsNeedingFix).length} BDD specs with issues\n`);

// Group by issue type
const issuesByType = {};
Object.values(specsNeedingFix).forEach(spec => {
    spec.issues.forEach(issue => {
        if (!issuesByType[issue]) {
            issuesByType[issue] = 0;
        }
        issuesByType[issue]++;
    });
});

console.log('Issue Breakdown:');
Object.entries(issuesByType).forEach(([issue, count]) => {
    console.log(`   • ${issue}: ${count} specs`);
});

// Generate report
const reportDir = '.generated/conformity-fixes';
if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const reportPath = path.join(reportDir, `bdd-spec-analysis-${timestamp}.json`);

const report = {
    timestamp: new Date().toISOString(),
    type: 'bdd-spec-analysis',
    description: 'BDD Specification Analysis Report',
    summary: {
        specsScanned: files.length,
        specsWithIssues: Object.keys(specsNeedingFix).length,
        totalIssuesFound: totalIssues,
        automationRate: '0% (requires manual implementation)'
    },
    issuesByType,
    details: specsNeedingFix,
    recommendations: [
        'Implement complete Given-When-Then scenarios',
        'Add step definitions for all scenario steps',
        'Ensure all assertions are present and meaningful',
        'Add descriptive comments for complex scenarios',
        'Link scenarios to user stories/requirements',
        'Test both happy path and error scenarios'
    ]
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📊 Analysis report saved to:\n   ${reportPath}\n`);

// Summary
console.log(`╔════════════════════════════════════════════════════════════════════╗`);
console.log(`║  📈 BDD SPEC ANALYSIS SUMMARY                                      ║`);
console.log(`╚════════════════════════════════════════════════════════════════════╝\n`);
console.log(`✨ BDD Specs Scanned: ${files.length}`);
console.log(`✨ Specs with Issues: ${Object.keys(specsNeedingFix).length}`);
console.log(`✨ Total Issues Found: ${totalIssues}`);
console.log(`✨ Automation Rate: 0% (manual implementation recommended)\n`);

console.log(`💡 Recommended Actions:`);
console.log(`   1. Review bdd-spec-analysis report`);
console.log(`   2. Implement missing Given-When-Then scenarios`);
console.log(`   3. Add step definitions and assertions`);
console.log(`   4. Link scenarios to requirements`);
console.log(`   5. Re-run: npm run audit:symphonia:conformity\n`);
console.log(`╔════════════════════════════════════════════════════════════════════╗\n`);

process.exit(0);
