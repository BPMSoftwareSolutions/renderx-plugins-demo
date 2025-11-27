import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_PATH = path.join(__dirname, '..', 'orchestration-domains.json');
const content = fs.readFileSync(REGISTRY_PATH, 'utf-8');
const { domains } = JSON.parse(content);

// Helper functions
const line = (char = '─', count = 80) => char.repeat(count);
const box = (title, width = 80) => {
  const padding = Math.max(0, width - title.length - 4);
  const right = Math.ceil(padding / 2);
  const left = padding - right;
  return `┌${line('─', width - 2)}┐\n│${' '.repeat(left)}${title}${' '.repeat(right)}│\n└${line('─', width - 2)}┘`;
};

const truncate = (str, len = 60) => str.length > len ? str.substring(0, len - 3) + '...' : str.padEnd(len);

// Command handlers
const commands = {
  hierarchy: generateHierarchySketch,
  network: generateNetworkSketch,
  stats: generateStatsSketch,
  categories: generateCategoriesSketch,
  matrix: generateDependencyMatrix,
  blueprint: generateBlueprint,
  summary: generateSummary,
  all: generateAllVisualizations,
};

function generateHierarchySketch() {
  console.log('\n' + box('ORCHESTRATION DOMAIN HIERARCHY SKETCH', 80));
  console.log();

  const topLevel = domains.filter(d => !d.parent && d.category === 'orchestration');
  
  topLevel.forEach((parent, idx) => {
    const children = domains.filter(d => d.parent === parent.id);
    const isLast = idx === topLevel.length - 1;
    const prefix = isLast ? '└─' : '├─';
    
    console.log(`${prefix}● ${parent.id}`);
    console.log(`${'  '.repeat(1)}  │   Name: ${truncate(parent.name, 50)}`);
    
    if (children.length > 0) {
      children.forEach((child, cIdx) => {
        const isLastChild = cIdx === children.length - 1;
        const childPrefix = isLastChild ? '   └─' : '   ├─';
        console.log(`${childPrefix}○ ${truncate(child.id, 50)}`);
      });
    }
    console.log();
  });
}

function generateNetworkSketch() {
  console.log('\n' + box('DOMAIN NETWORK TOPOLOGY', 80));
  console.log();

  const orchestrations = domains.filter(d => d.category === 'orchestration');
  const parentMap = {};
  
  orchestrations.forEach(d => {
    if (d.parent) {
      if (!parentMap[d.parent]) parentMap[d.parent] = [];
      parentMap[d.parent].push(d.id);
    }
  });

  console.log('  Network Nodes:');
  console.log(`  ╔═══════════════════════════════════╗`);
  console.log(`  ║ Total: ${orchestrations.length} orchestrations`.padEnd(35) + '║');
  console.log(`  ║ Parents: ${Object.keys(parentMap).length} hubs`.padEnd(35) + '║');
  const topLevel = orchestrations.filter(d => !d.parent).length;
  console.log(`  ║ Top-level: ${topLevel}`.padEnd(35) + '║');
  console.log(`  ║ Sub-domains: ${orchestrations.length - topLevel}`.padEnd(35) + '║');
  console.log(`  ╚═══════════════════════════════════╝`);
  console.log();

  console.log('  Connection Map:');
  Object.entries(parentMap).forEach(([parent, children]) => {
    console.log(`\n  ┌─ ${parent}`);
    console.log(`  │  ├─ ${children.length} connections:`);
    children.slice(0, 5).forEach((child, idx) => {
      const isLast = idx === Math.min(4, children.length - 1);
      const marker = isLast && children.length <= 5 ? '└─' : '├─';
      console.log(`  │  ${marker} ${truncate(child, 45)}`);
    });
    if (children.length > 5) {
      console.log(`  │  └─ ... and ${children.length - 5} more`);
    }
  });
  console.log();
}

function generateStatsSketch() {
  console.log('\n' + box('DOMAIN REGISTRY STATISTICS', 80));
  console.log();

  const stats = {
    total: domains.length,
    orchestrations: domains.filter(d => d.category === 'orchestration').length,
    plugins: domains.filter(d => d.category === 'plugin').length,
    byStatus: {},
    byCategory: {},
  };

  domains.forEach(d => {
    stats.byStatus[d.status] = (stats.byStatus[d.status] || 0) + 1;
    stats.byCategory[d.category] = (stats.byCategory[d.category] || 0) + 1;
  });

  const renderChart = (label, value, max, width = 30) => {
    const percent = ((value / max) * 100).toFixed(0);
    const filled = Math.round((value / max) * width);
    const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
    return `  ${label.padEnd(15)} │ ${bar} │ ${value.toString().padStart(3)} (${percent}%)`;
  };

  const maxStatus = Math.max(...Object.values(stats.byStatus));
  console.log('  Distribution by Status:');
  Object.entries(stats.byStatus).forEach(([status, count]) => {
    console.log(renderChart(status, count, maxStatus));
  });

  console.log();
  const maxCategory = Math.max(...Object.values(stats.byCategory));
  console.log('  Distribution by Category:');
  Object.entries(stats.byCategory).forEach(([cat, count]) => {
    console.log(renderChart(cat, count, maxCategory));
  });

  console.log();
  console.log(`  Overall:`);
  console.log(`  ├─ Total domains: ${stats.total}`);
  console.log(`  ├─ Orchestrations: ${stats.orchestrations}`);
  console.log(`  ├─ Plugins: ${stats.plugins}`);
  console.log(`  └─ Other: ${stats.total - stats.orchestrations - stats.plugins}`);
  console.log();
}

function generateCategoriesSketch() {
  console.log('\n' + box('DOMAINS BY CATEGORY', 80));
  console.log();

  const byCategory = {};
  domains.forEach(d => {
    if (!byCategory[d.category]) byCategory[d.category] = [];
    byCategory[d.category].push(d);
  });

  Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length).forEach(([cat, items]) => {
    const icon = {
      orchestration: '🎼',
      plugin: '🔌',
      catalog: '📚',
    }[cat] || '📦';

    console.log(`\n  ${icon} ${cat.toUpperCase()} (${items.length})`);
    console.log(`  ${'═'.repeat(50)}`);
    
    items.slice(0, 8).forEach((item, idx) => {
      const isLast = idx === Math.min(7, items.length - 1);
      const marker = isLast && items.length <= 8 ? '└─' : '├─';
      const status = item.status === 'active' ? '✓' : '◯';
      console.log(`  ${marker} [${status}] ${truncate(item.id, 45)}`);
    });
    
    if (items.length > 8) {
      console.log(`  └─ ... and ${items.length - 8} more`);
    }
  });
  console.log();
}

function generateDependencyMatrix() {
  console.log('\n' + box('PARENT-CHILD DEPENDENCY MATRIX', 80));
  console.log();

  const orchestrations = domains.filter(d => d.category === 'orchestration').sort((a, b) => a.id.localeCompare(b.id));
  
  console.log('  Legend: ↓ = Has children | ← = Has parent | ◆ = Both\n');
  console.log('  ID'.padEnd(35) + ' │ Children │ Parent │ Type');
  console.log(`  ${line('─', 75)}`);

  orchestrations.forEach(domain => {
    const children = domains.filter(d => d.parent === domain.id).length;
    const hasParent = domain.parent ? '◀' : '─';
    const hasChildren = children > 0 ? `▶ ${children}` : '─';
    const type = domain.parent ? 'sub' : 'top';
    
    console.log(
      `  ${truncate(domain.id, 33)} │ ${hasChildren.padEnd(8)} │ ${hasParent.padEnd(6)} │ ${type}`
    );
  });
  console.log();
}

function generateBlueprint(complete = false) {
  console.log('\n' + box('ORCHESTRATION BLUEPRINT' + (complete ? ' (COMPLETE)' : ''), 80));
  console.log();

  const renderxWeb = domains.find(d => d.id === 'renderx-web-orchestration');
  const children = domains.filter(d => d.parent === 'renderx-web-orchestration').sort((a, b) => a.id.localeCompare(b.id));
  
  console.log('  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
  console.log('  ┃  RENDERX-WEB ORCHESTRATION SYSTEM  ┃');
  console.log('  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
  console.log();
  
  console.log(`  Master Orchestration: ${renderxWeb.id}`);
  console.log(`  Status: ${renderxWeb.status} | Sequences: ${renderxWeb.npmScripts?.length || 0}`);
  console.log();
  
  console.log(`  ┌─ Sub-Orchestrations: ${children.length} total`);
  
  const grouped = {
    canvas: children.filter(c => c.id.startsWith('canvas-')),
    control: children.filter(c => c.id.startsWith('control-')),
    header: children.filter(c => c.id.startsWith('header-')),
    library: children.filter(c => c.id.startsWith('library-')),
    real: children.filter(c => c.id.startsWith('real-')),
    other: children.filter(c => !['canvas-', 'control-', 'header-', 'library-', 'real-'].some(p => c.id.startsWith(p))),
  };

  const groups = Object.entries(grouped).filter(([_, items]) => items.length > 0);
  groups.forEach(([name, items], idx) => {
    const isLast = idx === groups.length - 1;
    const gPrefix = isLast ? '└─' : '├─';
    console.log(`  ${gPrefix} ${name.toUpperCase()} (${items.length})`);
    
    if (complete) {
      // Show all items without truncation
      items.forEach((item, iIdx) => {
        const isLastItem = iIdx === items.length - 1;
        const iPrefix = isLast && isLastItem ? '   ' : '  │ ';
        const marker = isLastItem ? '└─' : '├─';
        console.log(`  ${iPrefix}${marker} ${item.id}`);
      });
    } else {
      // Show first 3, truncate rest
      items.slice(0, 3).forEach((item, iIdx) => {
        const isLastItem = iIdx === Math.min(2, items.length - 1) && items.length <= 3;
        const iPrefix = isLast && isLastItem ? '   ' : '  │ ';
        const marker = isLastItem && items.length <= 3 ? '└─' : '├─';
        console.log(`  ${iPrefix}${marker} ${truncate(item.id, 40)}`);
      });
      
      if (items.length > 3) {
        const suffix = isLast ? '   ' : '  │ ';
        console.log(`  ${suffix}└─ ... and ${items.length - 3} more`);
      }
    }
  });
  console.log();
}

function generateSummary() {
  console.log('\n' + box('DOMAIN REGISTRY EXECUTIVE SUMMARY', 80));
  console.log();

  const orchestrations = domains.filter(d => d.category === 'orchestration');
  const topLevel = orchestrations.filter(d => !d.parent);
  const subDomains = orchestrations.filter(d => d.parent);
  const renderxPlugins = domains.filter(d => d.id.startsWith('canvas-') || 
                                             d.id.startsWith('control-') ||
                                             d.id.startsWith('header-') ||
                                             d.id.startsWith('library-') ||
                                             d.id.startsWith('real-'));

  console.log('  📊 QUICK FACTS:');
  console.log(`  ├─ Total registered domains: ${domains.length}`);
  console.log(`  ├─ Orchestration domains: ${orchestrations.length}`);
  console.log(`  │  ├─ Top-level: ${topLevel.length}`);
  console.log(`  │  └─ Sub-domains: ${subDomains.length}`);
  console.log(`  ├─ RenderX UI plugins: ${renderxPlugins.length}`);
  console.log(`  └─ Other categories: ${domains.length - orchestrations.length - renderxPlugins.length}`);
  console.log();

  console.log('  🏗️ MAIN ORCHESTRATION HUBS:');
  topLevel.slice(0, 5).forEach((orch, idx) => {
    const children = domains.filter(d => d.parent === orch.id).length;
    const marker = idx === Math.min(4, topLevel.length - 1) ? '└─' : '├─';
    console.log(`  ${marker} ${truncate(orch.id, 40)} (${children} children)`);
  });
  if (topLevel.length > 5) console.log(`  └─ ... and ${topLevel.length - 5} more`);
  console.log();

  console.log('  🎯 KEY METRICS:');
  const maxChildren = Math.max(...topLevel.map(d => domains.filter(ch => ch.parent === d.id).length));
  const avgChildren = (subDomains.length / topLevel.length).toFixed(1);
  console.log(`  ├─ Largest hub: ${maxChildren} children`);
  console.log(`  ├─ Average children per hub: ${avgChildren}`);
  console.log(`  ├─ Total parent-child relationships: ${subDomains.length}`);
  console.log(`  └─ Hierarchy depth: ${Math.max(1, Math.max(...orchestrations.map(d => {
    let depth = 1;
    let current = d;
    while (current.parent) {
      depth++;
      current = domains.find(ch => ch.id === current.parent);
    }
    return depth;
  })))}`);
  console.log();
}

function generateAllVisualizations(complete = false) {
  generateHierarchySketch();
  generateNetworkSketch();
  generateStatsSketch();
  generateCategoriesSketch();
  generateDependencyMatrix();
  generateBlueprint(complete);
  generateSummary();
  
  console.log('\n' + line('═', 80) + '\n');
  console.log('  📄 All visualizations generated successfully!');
  console.log('  💡 Use individual commands for focused views\n');
}

// Main
const command = process.argv[2] || 'summary';
const hasCompleteFlag = process.argv.includes('--complete');
const handler = commands[command];

if (!handler) {
  console.log('\n❌ Unknown command: ' + command);
  console.log('\nAvailable commands:');
  console.log('  • hierarchy    - Domain hierarchy sketch');
  console.log('  • network      - Network topology visualization');
  console.log('  • stats        - Registry statistics');
  console.log('  • categories   - Domains grouped by category');
  console.log('  • matrix       - Parent-child dependency matrix');
  console.log('  • blueprint    - RenderX Web orchestration blueprint');
  console.log('  • summary      - Executive summary (default)');
  console.log('  • all          - All visualizations at once');
  console.log('\nFlags:');
  console.log('  --complete     - Show full untruncated output (for blueprint)\n');
  process.exit(1);
}

// Call handler with complete flag if needed
if (command === 'blueprint' || command === 'all') {
  handler(hasCompleteFlag);
} else {
  handler();
}
