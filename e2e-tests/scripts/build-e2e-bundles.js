#!/usr/bin/env node

/**
 * Build Script for MusicalConductor E2E Test Bundles
 * 
 * This script creates optimized bundles of MusicalConductor modules
 * to dramatically improve E2E test performance.
 * 
 * Usage:
 *   node scripts/build-e2e-bundles.js [options]
 * 
 * Options:
 *   --watch    Watch for changes and rebuild automatically
 *   --analyze  Generate bundle analysis report
 *   --verbose  Show detailed build information
 */

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Parse command line arguments
const args = process.argv.slice(2);
const isWatch = args.includes('--watch');
const isAnalyze = args.includes('--analyze');
const isVerbose = args.includes('--verbose');

// Load webpack configuration
const webpackConfig = require('../webpack.config.js');

// Add bundle analyzer plugin if requested
if (isAnalyze) {
  webpackConfig.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: true,
      reportFilename: 'bundle-analysis.html'
    })
  );
}

// Ensure output directory exists
const outputDir = path.resolve(__dirname, '../test-app/bundles');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created output directory: ${outputDir}`);
}

// Create webpack compiler
const compiler = webpack(webpackConfig);

// Build statistics configuration
const statsConfig = {
  colors: true,
  modules: isVerbose,
  children: isVerbose,
  chunks: isVerbose,
  chunkModules: isVerbose,
  assets: true,
  timings: true,
  performance: true
};

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function printBuildSummary(stats) {
  const compilation = stats.compilation;
  const assets = compilation.assets;
  
  console.log('\n📦 Bundle Summary:');
  console.log('─'.repeat(60));
  
  Object.keys(assets).forEach(assetName => {
    const asset = assets[assetName];
    const size = formatSize(asset.size());
    console.log(`  ${assetName.padEnd(30)} ${size.padStart(10)}`);
  });
  
  console.log('─'.repeat(60));
  
  const totalSize = Object.values(assets).reduce((total, asset) => total + asset.size(), 0);
  console.log(`  Total Bundle Size:              ${formatSize(totalSize).padStart(10)}`);
  
  // Calculate performance improvement estimate
  const moduleCount = 30; // Estimated modules per test
  const testCount = 168; // Estimated test count
  const bundleCount = Object.keys(assets).length;
  
  const beforeRequests = testCount * moduleCount;
  const afterRequests = testCount * bundleCount;
  const improvement = ((beforeRequests - afterRequests) / beforeRequests * 100).toFixed(1);
  
  console.log('\n🚀 Performance Impact:');
  console.log(`  Before: ${beforeRequests.toLocaleString()} HTTP requests`);
  console.log(`  After:  ${afterRequests.toLocaleString()} HTTP requests`);
  console.log(`  Improvement: ${improvement}% fewer requests`);
}

function handleBuildResult(err, stats) {
  if (err) {
    console.error('❌ Build failed with error:', err);
    process.exit(1);
  }
  
  if (stats.hasErrors()) {
    console.error('❌ Build completed with errors:');
    console.error(stats.toString(statsConfig));
    process.exit(1);
  }
  
  if (stats.hasWarnings()) {
    console.warn('⚠️  Build completed with warnings:');
    console.warn(stats.toString(statsConfig));
  }
  
  console.log('✅ Build completed successfully!');
  
  if (isVerbose) {
    console.log(stats.toString(statsConfig));
  }
  
  printBuildSummary(stats);
  
  // Generate import map for easy integration
  generateImportMap(stats);
}

function generateImportMap(stats) {
  const compilation = stats.compilation;
  const assets = Object.keys(compilation.assets);
  
  const importMap = {
    imports: {}
  };
  
  // Map main bundle
  const mainBundle = assets.find(name => name.includes('musical-conductor') && !name.includes('core'));
  if (mainBundle) {
    importMap.imports['musical-conductor'] = `./bundles/${mainBundle}`;
  }
  
  // Map core bundle
  const coreBundle = assets.find(name => name.includes('core'));
  if (coreBundle) {
    importMap.imports['musical-conductor/core'] = `./bundles/${coreBundle}`;
  }
  
  // Map plugin bundle
  const pluginBundle = assets.find(name => name.includes('plugins'));
  if (pluginBundle) {
    importMap.imports['musical-conductor/plugins'] = `./bundles/${pluginBundle}`;
  }
  
  // Write import map
  const importMapPath = path.resolve(__dirname, '../test-app/import-map.json');
  fs.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));
  
  console.log(`\n📋 Import map generated: ${importMapPath}`);
  console.log('   Add this to your HTML:');
  console.log('   <script type="importmap" src="./import-map.json"></script>');
}

// Main execution
console.log('🎼 Building MusicalConductor E2E Test Bundles...');
console.log(`📁 Output directory: ${outputDir}`);

if (isWatch) {
  console.log('👀 Watching for changes...');
  compiler.watch({
    aggregateTimeout: 300,
    poll: undefined
  }, handleBuildResult);
} else {
  compiler.run(handleBuildResult);
}
