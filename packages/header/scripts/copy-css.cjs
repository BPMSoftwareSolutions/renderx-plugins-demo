const fs = require('fs');
const path = require('path');

function copy(src, dest) {
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`[copy-css] copied ${src} -> ${dest}`);
}

try {
  const root = path.resolve(__dirname, '..');
  const srcCss = path.join(root, 'src', 'ui', 'Header.css');
  const distCss = path.join(root, 'dist', 'ui', 'Header.css');
  if (fs.existsSync(srcCss)) {
    copy(srcCss, distCss);
  } else {
    console.warn('[copy-css] source css not found:', srcCss);
  }
} catch (e) {
  console.warn('[copy-css] failed:', e && e.message ? e.message : e);
}

