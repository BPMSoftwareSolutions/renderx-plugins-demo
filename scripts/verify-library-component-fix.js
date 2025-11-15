// Verify that library-component has the direct conductor.play() fix
import fs from 'fs';
import path from 'path';

const checks = {
  passed: [],
  failed: []
};

function check(name, condition, details) {
  if (condition) {
    checks.passed.push({ name, details });
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    checks.failed.push({ name, details });
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

// Check 1: Package version
const pkgPath = 'packages/library-component/package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
check(
  'Package version is 1.0.4',
  pkg.version === '1.0.4',
  `Found: ${pkg.version}`
);

// Check 2: Built dist has the fix
const distPath = 'packages/library-component/dist/index.js';
const distCode = fs.readFileSync(distPath, 'utf8');
const hasResolveInteraction = distCode.includes('resolveInteraction');
const hasConductorPlay = distCode.includes('ctx.conductor?.play?.(route.pluginId, route.sequenceId');
const hasNoEventRouter = !distCode.includes('EventRouter.publish');

check(
  'Built dist uses resolveInteraction()',
  hasResolveInteraction,
  hasResolveInteraction ? 'Found resolveInteraction calls' : 'Missing resolveInteraction'
);

check(
  'Built dist uses direct conductor.play()',
  hasConductorPlay,
  hasConductorPlay ? 'Found ctx.conductor?.play?.(route.pluginId, route.sequenceId' : 'Missing direct conductor.play'
);

check(
  'Built dist does NOT use EventRouter.publish',
  hasNoEventRouter,
  hasNoEventRouter ? 'No EventRouter.publish found (good!)' : 'Still using EventRouter.publish (bad!)'
);

// Check 3: node_modules has the fix
const nodeModulesPath = 'node_modules/@renderx-plugins/library-component/dist/index.js';
if (fs.existsSync(nodeModulesPath)) {
  const nodeModulesCode = fs.readFileSync(nodeModulesPath, 'utf8');
  const nmHasResolveInteraction = nodeModulesCode.includes('resolveInteraction');
  const nmHasConductorPlay = nodeModulesCode.includes('ctx.conductor?.play?.(route.pluginId, route.sequenceId');
  const nmHasNoEventRouter = !nodeModulesCode.includes('EventRouter.publish');

  check(
    'node_modules dist uses resolveInteraction()',
    nmHasResolveInteraction,
    nmHasResolveInteraction ? 'Found resolveInteraction calls' : 'Missing resolveInteraction'
  );

  check(
    'node_modules dist uses direct conductor.play()',
    nmHasConductorPlay,
    nmHasConductorPlay ? 'Found ctx.conductor?.play?.(route.pluginId, route.sequenceId' : 'Missing direct conductor.play'
  );

  check(
    'node_modules dist does NOT use EventRouter.publish',
    nmHasNoEventRouter,
    nmHasNoEventRouter ? 'No EventRouter.publish found (good!)' : 'Still using EventRouter.publish (bad!)'
  );

  // Check version match
  const nmPkgPath = 'node_modules/@renderx-plugins/library-component/package.json';
  const nmPkg = JSON.parse(fs.readFileSync(nmPkgPath, 'utf8'));
  check(
    'node_modules version matches workspace',
    nmPkg.version === pkg.version,
    `Workspace: ${pkg.version}, node_modules: ${nmPkg.version}`
  );
} else {
  check('node_modules package exists', false, 'Package not found in node_modules');
}

// Check 4: Versions manifest
const manifestPath = 'public/build-versions.json';
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const libComponentEntry = manifest.packages.find(p => p.name === '@renderx-plugins/library-component');
  check(
    'Versions manifest has library-component@1.0.4',
    libComponentEntry && libComponentEntry.version === '1.0.4',
    libComponentEntry ? `Found: ${libComponentEntry.version}` : 'Not found in manifest'
  );
  console.log(`\n📦 Versions manifest built at: ${manifest.builtAt}`);
  console.log(`📦 Commit: ${manifest.commit}`);
} else {
  check('Versions manifest exists', false, 'public/build-versions.json not found');
}

// Summary
console.log('\n' + '═'.repeat(60));
console.log(`✅ Passed: ${checks.passed.length}`);
console.log(`❌ Failed: ${checks.failed.length}`);
console.log('═'.repeat(60));

if (checks.failed.length > 0) {
  console.log('\n❌ Fix verification FAILED. Issues found:');
  checks.failed.forEach(f => console.log(`   - ${f.name}`));
  process.exit(1);
} else {
  console.log('\n✅ All checks passed! The fix is properly deployed.');
  console.log('\n📋 Next steps:');
  console.log('   1. Restart dev server: npm run dev');
  console.log('   2. Open browser and check console for: VERSIONS: @renderx-plugins/library-component@1.0.4');
  console.log('   3. Do ONE library drop');
  console.log('   4. Parse the new log to verify the delay is gone');
  process.exit(0);
}

