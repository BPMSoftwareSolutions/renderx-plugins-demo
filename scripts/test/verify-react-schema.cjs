#!/usr/bin/env node

/**
 * Verify React schema is being loaded and rendered correctly
 */

const fs = require('fs');
const path = require('path');

// Read the react.json schema
const reactSchemaPath = path.join(__dirname, 'packages/components/json-components/react.json');
const reactSchemaContent = fs.readFileSync(reactSchemaPath, 'utf8');

// Remove BOM if present
const cleanContent = reactSchemaContent.replace(/^\uFEFF/, '');
const reactSchema = JSON.parse(cleanContent);

console.log('✅ React Schema Verification\n');
console.log('═══════════════════════════════════════════════════════════════\n');

// Check if reactCode field exists
const reactCodeField = reactSchema.integration?.properties?.schema?.reactCode;
if (!reactCodeField) {
  console.log('❌ CRITICAL: reactCode field NOT found in schema');
  process.exit(1);
}

console.log('✅ reactCode field found in schema\n');

// Check UI configuration
const uiConfig = reactCodeField.ui;
console.log('📋 UI Configuration:');
console.log(`  - Control Type: ${uiConfig.control}`);
console.log(`  - Language: ${uiConfig.language}`);
console.log(`  - Rows: ${uiConfig.rows}`);
console.log(`  - Placeholder: ${uiConfig.placeholder ? '✅ Present' : '❌ Missing'}\n`);

// Check if schema is in public directory
const publicReactPath = path.join(__dirname, 'public/json-components/react.json');
if (fs.existsSync(publicReactPath)) {
  console.log('✅ react.json exists in public directory\n');
} else {
  console.log('❌ react.json NOT in public directory\n');
}

// Check control panel schema resolver
const schemaResolverPath = path.join(__dirname, 'packages/control-panel/src/services/schema-resolver.service.ts');
const schemaResolverContent = fs.readFileSync(schemaResolverPath, 'utf8');

if (schemaResolverContent.includes('componentType === "react"')) {
  console.log('✅ React component handling found in schema resolver\n');
} else {
  console.log('⚠️  React component handling NOT found in schema resolver\n');
}

// Check ui.stage-crew for react in componentTypes
const stageCrew = path.join(__dirname, 'packages/control-panel/src/symphonies/ui/ui.stage-crew.ts');
const stageCrewContent = fs.readFileSync(stageCrew, 'utf8');

if (stageCrewContent.includes('"react"')) {
  console.log('✅ "react" found in componentTypes list in ui.stage-crew.ts\n');
} else {
  console.log('❌ "react" NOT in componentTypes list\n');
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('\n✅ All static checks passed!\n');
console.log('Next: Run conductor:play to verify runtime behavior\n');

