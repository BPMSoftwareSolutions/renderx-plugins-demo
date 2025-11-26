#!/usr/bin/env node
/**
 * Fix critical beat count violations
 * Adds root beats field calculated from movements for pipeline files
 */
const fs = require('fs');
const path = require('path');

const files = [
    'packages/orchestration/json-sequences/symphonia-conformity-alignment-pipeline.json',
    'packages/orchestration/json-sequences/symphony-report-pipeline.json',
    'packages/self-healing/json-sequences/baseline.metrics.establish.json',
    'packages/self-healing/json-sequences/handler-implementation.workflow.json'
];

console.log('🔧 Fixing critical beat count violations...\n');

let fixed = 0;
files.forEach(filePath => {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⊘ File not found: ${filePath}`);
            return;
        }
        
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const fileName = path.basename(filePath);
        
        // Calculate beats from movements
        let beats = 0;
        if (content.movements && Array.isArray(content.movements)) {
            beats = content.movements.length;
        } else if (content.handlers && Array.isArray(content.handlers)) {
            beats = content.handlers.length;
        } else {
            // Default fallback
            beats = 1;
        }
        
        // Ensure beats is positive
        if (beats <= 0) beats = 1;
        
        // Set beats
        content.beats = beats;
        
        // Write back
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        console.log(`✅ Fixed: ${fileName} (beats: ${beats})`);
        fixed++;
    } catch (e) {
        console.log(`❌ Error fixing ${path.basename(filePath)}: ${e.message}`);
    }
});

console.log(`\n📊 Fixed ${fixed} files\n`);
