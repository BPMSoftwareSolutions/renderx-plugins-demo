#!/usr/bin/env node
/**
 * Validate presence and basic conformity of feature shape contracts.
 * Future: deep schema validation against telemetry record examples.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const CONTRACTS_DIR = path.join(ROOT, 'contracts');
const TELEMETRY_INDEX = path.join(ROOT, '.generated', 'telemetry', 'index.json');

function loadJson(p, fallback) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return fallback; } }

function main() {
  const index = loadJson(TELEMETRY_INDEX, null);
  if (!index) {
    console.log('[shape-contracts] No telemetry index; skipping contract validation.');
    return;
  }
  const features = Object.keys(index.features || {});
  let missing = 0;
  for (const f of features) {
    const contractPath = path.join(CONTRACTS_DIR, `${f}.contract.json`);
    if (!fs.existsSync(contractPath)) {
      console.error(`[shape-contracts] Missing contract for feature=${f}`);
      missing++;
      continue;
    }
    const contract = loadJson(contractPath, null);
    if (!contract || contract.feature !== f) {
      console.error(`[shape-contracts] Invalid contract meta for feature=${f}`);
      missing++;
      continue;
    }
    if (!Array.isArray(contract.required) || contract.required.length === 0) {
      console.error(`[shape-contracts] Contract missing required field list for feature=${f}`);
      missing++;
    }
  }
  if (missing) {
    console.error(`[shape-contracts] ${missing} contract issue(s) detected.`);
    if (process.env.SHAPE_CONTRACTS_ENFORCE === '1') process.exit(1);
  } else {
    console.log('[shape-contracts] All feature contracts present.');
  }
}

main();