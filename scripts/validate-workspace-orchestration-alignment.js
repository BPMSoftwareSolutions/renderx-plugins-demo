import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_PATH = path.join(__dirname, '..', 'orchestration-domains.json');
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

// Read registry
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));

// Get workspace packages
const workspacePatterns = packageJson.workspaces || [];
const workspacePkgDirs = workspacePatterns.map(p => 
  p.replace('/*', '').replace(/\/$/, '')
);

// Find all workspace package.json files
function getWorkspacePackages() {
  const packages = new Map();
  
  workspacePkgDirs.forEach(dir => {
    const baseDir = path.join(__dirname, '..', dir);
    if (!fs.existsSync(baseDir)) return;
    
    const subdirs = fs.readdirSync(baseDir);
    subdirs.forEach(subdir => {
      const pkgPath = path.join(baseDir, subdir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        packages.set(pkg.name, {
          workspace: `${dir}/${subdir}`,
          name: pkg.name,
          version: pkg.version
        });
      }
    });
  });
  
  return packages;
}

// Get root dependencies
function getRootDependencies() {
  const all = new Map();
  
  const deps = { ...packageJson.dependencies || {}, ...packageJson.devDependencies || {} };
  Object.entries(deps).forEach(([name, version]) => {
    all.set(name, { type: 'dependency', version });
  });
  
  return all;
}

// Check for orchestration domains
function getOrchestratedPackages() {
  const orchestrated = new Set();
  
  registry.domains.forEach(domain => {
    // Try to infer package name from domain ID
    const candidates = [
      // Direct match (e.g., 'canvas-component' -> '@renderx-plugins/canvas-component')
      `@renderx-plugins/${domain.id}`,
      // Try removing -symphony suffix
      domain.id.endsWith('-symphony') ? 
        `@renderx-plugins/${domain.id.replace('-symphony', '')}` : null,
      // Try removing -pipeline suffix
      domain.id.endsWith('-pipeline') ? 
        `@renderx-plugins/${domain.id.replace('-pipeline', '')}` : null,
      // Direct name for non-scoped
      domain.id,
      // With music conductor
      domain.id === 'musical-conductor-orchestration' ? 'musical-conductor' : null
    ].filter(Boolean);
    
    candidates.forEach(candidate => {
      if (candidate) orchestrated.add(candidate);
    });
  });
  
  return orchestrated;
}

console.log('\n' + '═'.repeat(80));
console.log('WORKSPACE-ORCHESTRATION ALIGNMENT VALIDATION');
console.log('═'.repeat(80) + '\n');

const workspacePackages = getWorkspacePackages();
const rootDependencies = getRootDependencies();
const orchestratedPackages = getOrchestratedPackages();

console.log(`📦 Workspace Packages: ${workspacePackages.size}`);
console.log(`📚 Root Dependencies: ${rootDependencies.size}`);
console.log(`🎼 Orchestrated Packages: ${orchestratedPackages.size}\n`);

// Analysis 1: Workspaces without orchestration
console.log('🔍 ANALYSIS 1: Workspaces Missing Orchestration Domains');
console.log('─'.repeat(80));

const missingOrchestration = [];
workspacePackages.forEach((pkg, name) => {
  if (!orchestratedPackages.has(name)) {
    missingOrchestration.push({ name, workspace: pkg.workspace });
  }
});

if (missingOrchestration.length === 0) {
  console.log('✅ All workspace packages have orchestration domains\n');
} else {
  console.log(`⚠️  ${missingOrchestration.length} workspace packages lack orchestration domains:\n`);
  missingOrchestration.forEach(pkg => {
    console.log(`  ❌ ${pkg.name}`);
    console.log(`     Workspace: ${pkg.workspace}`);
    console.log(`     Recommended: Create orchestration domain or register in registry\n`);
  });
}

// Analysis 2: Dependencies without orchestration
console.log('🔍 ANALYSIS 2: Root Dependencies Missing Orchestration Domains');
console.log('─'.repeat(80));

const missingDeps = [];
rootDependencies.forEach((dep, name) => {
  // Skip non-plugin infrastructure
  if (name.includes('testing') || name.includes('lint') || name.includes('vite') ||
      name === 'react' || name === 'react-dom' || name === 'lucide-react' ||
      name === 'gif.js.optimized' || name === 'chokidar' || name === 'typescript' ||
      name === 'cypress' || name === 'eslint' || name === 'jsdom' || 
      name === 'start-server-and-test' || name === 'tsup' || name === 'ws' ||
      name.includes('rollup') || name.includes('@vitejs')) {
    return;
  }
  
  if (!orchestratedPackages.has(name)) {
    missingDeps.push({ name, type: dep.type, version: dep.version });
  }
});

if (missingDeps.length === 0) {
  console.log('✅ All plugin dependencies have orchestration domains\n');
} else {
  console.log(`⚠️  ${missingDeps.length} plugin dependencies lack orchestration domains:\n`);
  missingDeps.forEach(dep => {
    console.log(`  ❌ ${dep.name}`);
    console.log(`     Type: ${dep.type} | Version: ${dep.version}`);
    console.log(`     Recommended: Create orchestration domain or update registry\n`);
  });
}

// Analysis 3: Category breakdown
console.log('🔍 ANALYSIS 3: Orchestration Coverage by Package Type');
console.log('─'.repeat(80));

const coverage = {
  'UI Plugins': [],
  'Infrastructure': [],
  'External': [],
  'Unclear': []
};

orchestratedPackages.forEach(pkg => {
  if (pkg.includes('@renderx-plugins/')) {
    const base = pkg.replace('@renderx-plugins/', '');
    if (['canvas', 'control-panel', 'header', 'library', 'real-estate'].some(p => base.includes(p))) {
      coverage['UI Plugins'].push(pkg);
    } else if (['host-sdk', 'manifest-tools', 'components', 'digital-assets'].includes(base)) {
      coverage['Infrastructure'].push(pkg);
    } else {
      coverage['Unclear'].push(pkg);
    }
  } else {
    coverage['External'].push(pkg);
  }
});

Object.entries(coverage).forEach(([category, packages]) => {
  if (packages.length > 0) {
    console.log(`\n${category}: ${packages.length}`);
    packages.forEach(pkg => {
      console.log(`  ✓ ${pkg}`);
    });
  }
});

// Analysis 4: Governance recommendations
console.log('\n🎯 GOVERNANCE RECOMMENDATIONS');
console.log('─'.repeat(80));

const recommendations = [];

if (missingOrchestration.length > 0) {
  recommendations.push({
    severity: 'CRITICAL',
    issue: 'Workspace-Orchestration Misalignment',
    count: missingOrchestration.length,
    packages: missingOrchestration.map(p => p.name),
    resolution: 'Create orchestration domains for infrastructure packages or update workspace configuration',
    impact: 'Infrastructure packages are not tracked in the orchestration registry'
  });
}

if (missingDeps.length > 0) {
  recommendations.push({
    severity: 'HIGH',
    issue: 'Dependency-Orchestration Misalignment',
    count: missingDeps.length,
    packages: missingDeps.map(d => d.name),
    resolution: 'Register missing packages in orchestration domain registry',
    impact: 'Package dependency graph is incomplete in orchestration system'
  });
}

if (recommendations.length === 0) {
  console.log('✅ All validations passed! Workspace and orchestration are aligned.\n');
} else {
  recommendations.forEach((rec, idx) => {
    console.log(`\n${idx + 1}. [${rec.severity}] ${rec.issue}`);
    console.log(`   Count: ${rec.count} packages`);
    console.log(`   Packages: ${rec.packages.join(', ')}`);
    console.log(`   Resolution: ${rec.resolution}`);
    console.log(`   Impact: ${rec.impact}`);
  });
}

// Summary statistics
console.log('\n📊 ALIGNMENT SUMMARY');
console.log('─'.repeat(80));

const totalWorkspaces = workspacePackages.size;
const orchestratedWorkspaces = Array.from(workspacePackages.keys())
  .filter(name => orchestratedPackages.has(name)).length;

const pluginDeps = Array.from(rootDependencies.keys())
  .filter(name => name.includes('@renderx-plugins') || name === 'musical-conductor');
const orchestratedPluginDeps = pluginDeps
  .filter(name => orchestratedPackages.has(name)).length;

console.log(`Workspace Coverage:    ${orchestratedWorkspaces}/${totalWorkspaces} (${((orchestratedWorkspaces/totalWorkspaces)*100).toFixed(1)}%)`);
console.log(`Dependency Coverage:   ${orchestratedPluginDeps}/${pluginDeps} (${((orchestratedPluginDeps/pluginDeps)*100).toFixed(1)}%)`);
console.log(`Registry Completeness: ${missingOrchestration.length === 0 && missingDeps.length === 0 ? '✅ COMPLETE' : '⚠️  INCOMPLETE'}\n`);

// Exit code
const hasIssues = missingOrchestration.length > 0 || missingDeps.length > 0;
process.exit(hasIssues ? 1 : 0);
