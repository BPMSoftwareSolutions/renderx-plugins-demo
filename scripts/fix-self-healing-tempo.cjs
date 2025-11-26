#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = 'packages/self-healing/json-sequences';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'package.json' && f !== 'tsconfig.json');

files.forEach(file => {
    const filePath = path.join(dir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (content.tempo === undefined) {
        content.tempo = 120;
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        console.log(`Fixed: ${file}`);
    }
});

console.log(`\nTotal files fixed: ${files.length}`);
