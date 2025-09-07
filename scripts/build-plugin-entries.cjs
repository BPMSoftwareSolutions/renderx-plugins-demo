const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const pluginDirs = [
  'header',
  'canvas-component',
  'canvas',
  'library',
  'library-component',
  'control-panel'
];

const pluginsRoot = path.resolve(__dirname, '../plugins');
const outRoot = path.resolve(__dirname, '../dist/artifacts/plugins');

for (const dir of pluginDirs) {
  const entry = path.join(pluginsRoot, dir, 'index.ts');
  const outdir = path.join(outRoot, dir);
  if (fs.existsSync(entry)) {
    esbuild.buildSync({
      entryPoints: [entry],
      bundle: false,
      platform: 'browser',
      format: 'esm',
      outdir,
      sourcemap: false,
      minify: false,
      target: ['esnext'],
    });
    console.log(`✅ Built ${dir}/index.js`);
  } else {
    console.warn(`⚠️ Missing entry: ${entry}`);
  }
}
console.log('✅ All plugin entry points built to dist/artifacts/plugins');
