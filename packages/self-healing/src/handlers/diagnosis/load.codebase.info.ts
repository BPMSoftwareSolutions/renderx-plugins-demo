import { TelemetryEvent } from '../../types/index';
import * as fs from 'fs';
import * as path from 'path';

export interface LoadCodebaseInfoResult extends TelemetryEvent { context: { tsFiles: number; tsxFiles: number; totalFiles: number; root: string; error?: string; }; }

function walk(dir: string, acc: { ts: number; tsx: number; total: number }) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // skip heavy directories (node_modules, dist, .git)
      if (/node_modules|dist|\.git|\.generated/.test(full)) continue;
      walk(full, acc);
    } else {
      acc.total++;
      if (e.name.endsWith('.ts') && !e.name.endsWith('.d.ts')) acc.ts++;
      if (e.name.endsWith('.tsx')) acc.tsx++;
    }
  }
}

export function loadCodebaseInfo(root: string = path.resolve(process.cwd())): LoadCodebaseInfoResult {
  let tsFiles = 0, tsxFiles = 0, totalFiles = 0; let error: string | undefined;
  try {
    walk(root, { ts: tsFiles, tsx: tsxFiles, total: totalFiles });
    // values mutated inside walk wont reflect initial vars; recompute via closure result
    const res = { ts: 0, tsx: 0, total: 0 };
    walk(root, res);
    tsFiles = res.ts; tsxFiles = res.tsx; totalFiles = res.total;
  } catch (err: any) {
    error = err?.message || 'codebase-scan-failed';
  }
  return {
    timestamp: new Date().toISOString(),
    handler: 'loadCodebaseInfo',
    event: 'diagnosis.load.codebase',
    context: { tsFiles, tsxFiles, totalFiles, root, error }
  };
}

export default loadCodebaseInfo;