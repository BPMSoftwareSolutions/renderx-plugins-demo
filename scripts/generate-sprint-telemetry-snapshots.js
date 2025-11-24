#!/usr/bin/env node
/**
 * Sprint Telemetry Snapshot Generator
 * Persists per-sprint telemetry baseline definitions to .generated/sprint-telemetry/sprint-X.json
 * Captures requiredShapes, signatures, and baselineDefined state for audit trail.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const PLAN = path.join(ROOT,'orchestration-audit-system-project-plan.json');
const TELEMETRY_DIR = path.join(ROOT,'.generated','sprint-telemetry');

function load(p){ try { return JSON.parse(fs.readFileSync(p,'utf-8')); } catch { return null; } }
function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }

function hashTelemetry(tel){
  const canonical = { requiredShapes: tel.requiredShapes, signatures: tel.signatures, baselineDefined: tel.baselineDefined };
  return crypto.createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

function main(){
  const plan = load(PLAN);
  if(!plan){ console.error('[telemetry-snapshot] Plan missing'); process.exit(1); }
  ensureDir(TELEMETRY_DIR);
  let created = 0;
  for(const sprint of plan.sprints){
    const tel = sprint.telemetry || {};
    const snapshot = {
      sprint: sprint.id,
      name: sprint.name,
      status: sprint.status,
      generatedAt: new Date().toISOString(),
      telemetryHash: hashTelemetry(tel),
      telemetry: {
        requiredShapes: tel.requiredShapes || [],
        baselineDefined: !!tel.baselineDefined,
        signatures: tel.signatures || [],
        notes: tel.notes || ''
      }
    };
    const filePath = path.join(TELEMETRY_DIR, `sprint-${sprint.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
    created++;
    console.log(`[telemetry-snapshot] Wrote ${filePath}`);
  }
  console.log(`[telemetry-snapshot] Created ${created} sprint telemetry snapshots`);
}

main();
