#!/usr/bin/env node
/**
 * Inject Test Coverage Into Plan Metrics
 * - Reads handler coverage (.generated/handler-coverage.json)
 * - Optionally reads test coverage summary (.generated/test-coverage-summary.json)
 * - Updates current sprint metrics with handlerCoveragePercent / testCoveragePercent
 * - Does not bump version; focuses on metrics enrichment
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PLAN_FILE = path.join(ROOT,'orchestration-audit-system-project-plan.json');
const HANDLER_COV = path.join(ROOT,'.generated','handler-coverage.json');
const TEST_COV = path.join(ROOT,'.generated','test-coverage-summary.json');

function load(p){ try { return JSON.parse(fs.readFileSync(p,'utf-8')); } catch { return null; } }
function save(p,data){ fs.writeFileSync(p, JSON.stringify(data,null,2)); }

function main(){
  if(!fs.existsSync(PLAN_FILE)){
    console.error('[inject-coverage] Plan file missing');
    process.exit(1);
  }
  const plan = load(PLAN_FILE);
  const currentId = plan.currentSprint;
  const sprint = (plan.sprints||[]).find(s=>s.id===currentId);
  if(!sprint){
    console.error('[inject-coverage] Current sprint not found in plan');
    process.exit(1);
  }
  sprint.metrics = sprint.metrics || {};

  const handler = load(HANDLER_COV);
  if(handler){
    sprint.metrics.handlerCoveragePercent = handler.percent === null ? 0 : handler.percent;
  }
  const testCoverage = load(TEST_COV);
  if(testCoverage){
    sprint.metrics.testCoveragePercent = testCoverage.total?.lines?.pct ?? testCoverage.total?.statements?.pct ?? null;
  }
  plan.updatedAt = new Date().toISOString();
  save(PLAN_FILE, plan);
  console.log('[inject-coverage] Updated plan metrics with coverage data');
}

main();
