const fs = require('fs');
const path = require('path');
const os = require('os');

const { findLatestAnalysis } = require('../generate-readme.cjs');

function makeFile(fullPath, content = '', mtime = Date.now()) {
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  // set mtime/atime
  const time = new Date(mtime / 1);
  fs.utimesSync(fullPath, time, time);
}

describe('generate-readme.findLatestAnalysis', () => {
  let tmpDir;
  let origCwd;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-test-'));
    origCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    try {
      process.chdir(origCwd);
    } catch (e) {}
    // best-effort cleanup
    try {
      fs.rmdirSync(tmpDir, { recursive: true });
    } catch (e) {}
  });

  it('finds a report located under .generated/analysis/<domain>/', () => {
    const domain = 'renderx-web-orchestration';
    const targetDir = path.join('.generated', 'analysis', 'renderx-web');
    const fileName = `${domain}-rich-markdown-2025-12-05T04-07-07-642Z.md`;
    const full = path.join(targetDir, fileName);

    makeFile(full, '# test report', Date.now());

    const found = findLatestAnalysis(domain);
    expect(found).toBeTruthy();
    expect(path.relative(tmpDir, found).replace(/\\/g, '/')).toBe(path.join(targetDir, fileName).replace(/\\/g, '/'));
  });

  it('finds the most recently modified matching file anywhere under .generated/analysis', () => {
    const domain = 'renderx-web-orchestration';
    const oldPath = path.join('.generated', 'analysis', 'old', `${domain}-rich-markdown-old.md`);
    const newPath = path.join('.generated', 'analysis', 'nested', 'deep', `${domain}-rich-markdown-new.md`);

    // older file
    makeFile(oldPath, 'old', Date.now() - 10000);
    // newer file
    makeFile(newPath, 'new', Date.now());

    const found = findLatestAnalysis(domain);
    expect(found).toBeTruthy();
    expect(found.endsWith('rich-markdown-new.md')).toBe(true);
  });
});
