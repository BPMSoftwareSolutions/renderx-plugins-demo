#!/usr/bin/env node
/**
 * Validate blueprint sprint alignment against statusSummary.
 * Updates blueprintSprintIntegrity in plan JSON; exits non-zero on drift.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PLAN_PATH = path.join(ROOT, 'SHAPE_EVOLUTION_PLAN.json');

function load(){ return JSON.parse(fs.readFileSync(PLAN_PATH,'utf-8')); }
function save(obj){ fs.writeFileSync(PLAN_PATH, JSON.stringify(obj,null,2)); }

function main(){
  let plan;
  try { plan = load(); } catch { console.error('[integrity] plan load failed'); process.exit(1); }
  const completed = new Set(plan.statusSummary?.completedSprints || []);
  const current = plan.statusSummary?.currentSprint;
  const blueprints = plan.specGeneration?.blueprints || [];
  const statuses = plan.blueprintStatuses || {};
  const drift = [];
  for(const bp of blueprints){
    const sprint = bp.sprint;
    const st = statuses[bp.slug];
    // Allow completed blueprints in current sprint even if sprint not yet marked completed
    if(st?.status === 'completed' && !completed.has(sprint) && sprint !== current){
      drift.push({ slug: bp.slug, sprint, reason: 'completed-but-sprint-not-marked-complete'});
    }
    if(st?.status !== 'completed' && completed.has(sprint) && sprint !== current){
      drift.push({ slug: bp.slug, sprint, reason: 'blueprint-in-inactive-completed-sprint-but-not-completed'});
    }
  }
  plan.statusSummary = plan.statusSummary || {};
  if(drift.length){
    plan.statusSummary.blueprintSprintIntegrity = `drift:${drift.length}`;
    plan.statusSummary.blueprintSprintDriftDetails = drift;
    save(plan);
    console.error('[integrity] DRIFT detected:', JSON.stringify(drift,null,2));
    process.exit(2);
  } else {
    plan.statusSummary.blueprintSprintIntegrity = 'ok';
    delete plan.statusSummary.blueprintSprintDriftDetails;
    save(plan);
    console.log('[integrity] OK');
  }
}

if (process.argv[1].endsWith('validate-plan-integrity.js')) main();
