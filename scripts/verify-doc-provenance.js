#!/usr/bin/env node
/**
 * verify-doc-provenance.js
 * Validates provenance banners & hashes for generated documentation.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const docsDir = path.join(ROOT, 'docs', 'generated');
const governanceSpecPath = path.join(ROOT, 'governance', 'json-doc-governance-spec.json');

function sha256(c){ return crypto.createHash('sha256').update(c).digest('hex'); }
function fail(msg){ console.error('\n[provenance] FAIL:', msg); process.exitCode = 1; }

function main(){
  const gov = JSON.parse(fs.readFileSync(governanceSpecPath,'utf8'));
  if(!fs.existsSync(docsDir)){ console.log('[provenance] No docs/generated directory yet'); return; }
  const files = fs.readdirSync(docsDir).filter(f=>f.endsWith('.md'));
  for(const f of files){
    const abs = path.join(docsDir,f);
    const content = fs.readFileSync(abs,'utf8');
    if(!content.startsWith('<!-- AUTO-GENERATED')){ fail(`Missing banner in ${f}`); continue; }
    const bannerEnd = content.indexOf('-->');
    if(bannerEnd === -1){ fail(`Malformed banner in ${f}`); continue; }
    const banner = content.slice(0, bannerEnd+3);
    const body = content.slice(bannerEnd+3).trimStart();
    const docHashLine = banner.split('\n').find(l=>l.startsWith('Doc-Hash:')) || banner.split('\n').find(l=>l.includes('Doc-Hash:'));
    if(!docHashLine){ fail(`No Doc-Hash line in ${f}`); continue; }
    const declared = docHashLine.split('Doc-Hash:')[1].trim();
    const actual = sha256(body);
    if(declared !== actual){ fail(`Doc hash mismatch in ${f} declared=${declared} actual=${actual}`); }
  }
  if(process.exitCode === 1){
    console.error('[provenance] Verification completed with errors');
    process.exit(1);
  } else {
    console.log('[provenance] All generated docs passed banner & hash verification');
  }
}

main();
