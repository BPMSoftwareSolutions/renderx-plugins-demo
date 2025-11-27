import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the registry
const filePath = path.join(__dirname, 'orchestration-domains.json');
const content = fs.readFileSync(filePath, 'utf-8');
const json = JSON.parse(content);

// Define parent relationships
const parentMap = {
  'symphonia-conformity-alignment-pipeline': 'architecture-governance-enforcement-symphony',
  'symphonic-code-analysis-pipeline': 'architecture-governance-enforcement-symphony',
  'orchestration-registry-audit-pipeline': 'architecture-governance-enforcement-symphony',
  'orchestration-audit-session': 'orchestration-audit-system',
  'renderx-web-orchestration': 'safe-continuous-delivery-pipeline',
  'musical-conductor-orchestration': 'renderx-web-orchestration'
};

// RenderX UI patterns
const renderxPatterns = ['canvas-', 'control-panel-', 'header-ui-', 'library-', 'real-estate-'];

let count = 0;

// Update domains with direct parent mappings
json.domains.forEach(domain => {
  if (parentMap[domain.id]) {
    domain.parent = parentMap[domain.id];
    count++;
  }
});

// Update RenderX plugins
json.domains.forEach(domain => {
  for (const pattern of renderxPatterns) {
    if (domain.id.startsWith(pattern)) {
      domain.parent = 'renderx-web-orchestration';
      count++;
      break;
    }
  }
});

// Write back
fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
console.log(`✅ Updated ${count} domains with parent relationships`);
