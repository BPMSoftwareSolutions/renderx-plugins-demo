import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_PATH = path.join(__dirname, '..', 'orchestration-domains.json');

// Read registry
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));

// Infrastructure packages that need orchestration domains
const infrastructurePackages = [
  {
    id: 'host-sdk-infrastructure',
    name: 'Host SDK Infrastructure',
    category: 'infrastructure',
    status: 'active',
    description: 'Core Host SDK providing the plugin hosting environment, manifest management, and integration APIs for all UI components',
    npmScripts: ['@renderx-plugins/host-sdk'],
    parent: 'safe-continuous-delivery-pipeline'
  },
  {
    id: 'manifest-tools-infrastructure',
    name: 'Manifest Tools Infrastructure',
    category: 'infrastructure',
    status: 'active',
    description: 'Manifest generation and validation tools for orchestration domain definitions, sequence specifications, and plugin registrations',
    npmScripts: ['@renderx-plugins/manifest-tools'],
    parent: 'safe-continuous-delivery-pipeline'
  },
  {
    id: 'components-library-infrastructure',
    name: 'Components Library Infrastructure',
    category: 'infrastructure',
    status: 'active',
    description: 'Foundational component library providing base UI components and utility wrappers for all RenderX plugins',
    npmScripts: ['@renderx-plugins/components'],
    parent: 'renderx-web-orchestration'
  },
  {
    id: 'digital-assets-infrastructure',
    name: 'Digital Assets Infrastructure',
    category: 'infrastructure',
    status: 'active',
    description: 'Asset management system for icons, themes, branding, and static resources used across all UI plugins',
    npmScripts: ['@renderx-plugins/digital-assets'],
    parent: 'renderx-web-orchestration'
  }
];

console.log('\n' + '═'.repeat(80));
console.log('REGISTERING INFRASTRUCTURE PACKAGES AS ORCHESTRATION DOMAINS');
console.log('═'.repeat(80) + '\n');

let added = 0;
infrastructurePackages.forEach(pkg => {
  // Check if already exists
  const exists = registry.domains.some(d => d.id === pkg.id);
  
  if (exists) {
    console.log(`⏭️  Skipping ${pkg.id} (already registered)`);
  } else {
    registry.domains.push(pkg);
    console.log(`✅ Added ${pkg.id}`);
    console.log(`   Category: ${pkg.category}`);
    console.log(`   Parent: ${pkg.parent}`);
    added++;
  }
});

// Write back
fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));

console.log(`\n📊 SUMMARY`);
console.log('─'.repeat(80));
console.log(`Total infrastructure packages added: ${added}`);
console.log(`Registry now contains: ${registry.domains.length} domains`);
console.log(`Orchestration domains: ${registry.domains.filter(d => d.category === 'orchestration').length}`);
console.log(`Infrastructure domains: ${registry.domains.filter(d => d.category === 'infrastructure').length}`);
console.log(`Plugin domains: ${registry.domains.filter(d => d.category === 'plugin').length}\n`);
