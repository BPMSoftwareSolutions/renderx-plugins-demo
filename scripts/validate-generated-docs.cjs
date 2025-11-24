#!/usr/bin/env node
/**
 * Validates auto-generated governance markdown docs against JSON sources.
 * Compares embedded hash or regenerates content and diffs.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MANIFEST_PATH = path.resolve(__dirname, '../docs/governance/generated-docs-manifest.json');

function sha256(content){
  return crypto.createHash('sha256').update(content).digest('hex');
}

function loadManifest(){
  if(!fs.existsSync(MANIFEST_PATH)){
    console.error('Manifest not found:', MANIFEST_PATH); process.exit(1);
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH,'utf8'));
}

function regenerate(entry){
  const srcPath = path.resolve(__dirname, '..', entry.source);
  const plan = JSON.parse(fs.readFileSync(srcPath,'utf8'));
  const hash = sha256(JSON.stringify(plan));
  return { hash, plan };
}

function extractEmbeddedHash(md){
  const match = md.match(/hash=([a-f0-9]{64})/);
  return match ? match[1] : null;
}

function validate(){
  const manifest = loadManifest();
  let failures = 0;
  for(const entry of manifest.generated){
    const outPath = path.resolve(__dirname, '..', entry.output);
    if(!fs.existsSync(outPath)){
      console.error('Missing generated file:', outPath); failures++; continue;
    }
    const md = fs.readFileSync(outPath,'utf8');
    const { hash } = regenerate(entry);
    const embedded = extractEmbeddedHash(md);
    if(!embedded){
      console.error('No embedded hash found in', outPath); failures++; continue;
    }
    if(embedded !== hash){
      console.error('Hash mismatch for', outPath); failures++;
      continue;
    }
    console.log('OK', entry.id, 'hash', hash.slice(0,12)+'...');
  }
  if(failures){
    console.error('Validation failed with', failures, 'issue(s).');
    process.exit(1);
  } else {
    console.log('All generated governance docs validated successfully.');
  }
}

validate();
