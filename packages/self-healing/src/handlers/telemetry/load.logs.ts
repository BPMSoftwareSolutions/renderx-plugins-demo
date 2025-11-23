import { TelemetryEvent } from '../../types/index';
import * as fs from 'fs';
import * as path from 'path';

export interface LoadedLogFile {
  path: string;
  size: number;
  content: string;
  skipped?: boolean;
  reason?: string;
}

export interface LoadLogsResult extends TelemetryEvent {
  context: {
    paths: string[]; // original input paths (files or directories)
    files: LoadedLogFile[]; // loaded files (may be subset if skipped/corrupted)
    discoveredCount: number; // total discovered candidates
    loadedCount: number; // successfully loaded
    skippedCount: number; // skipped (too large/corrupted)
  };
}

interface LoadOptions {
  /** Maximum file size to fully read (bytes). Larger files will be truncated to head + tail sample. */
  maxBytes?: number;
  /** If true, include a tail sample for large files. */
  includeTailSample?: boolean;
  /** Extension filter (default ['.log']). */
  extensions?: string[];
}

const DEFAULT_OPTIONS: Required<LoadOptions> = {
  maxBytes: 2 * 1024 * 1024, // 2MB
  includeTailSample: true,
  extensions: ['.log']
};

function isDirectory(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function discoverPaths(input: string[], exts: string[]): string[] {
  const files: string[] = [];
  for (const p of input) {
    if (isDirectory(p)) {
      try {
        const entries = fs.readdirSync(p);
        for (const e of entries) {
          const full = path.join(p, e);
          if (fs.statSync(full).isFile() && exts.includes(path.extname(e))) {
            files.push(full);
          }
        }
      } catch {/* ignore directory read errors */}
    } else {
      files.push(p);
    }
  }
  return files;
}

function readFileAdaptive(filePath: string, opts: Required<LoadOptions>): LoadedLogFile {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return { path: filePath, size: 0, content: '', skipped: true, reason: 'not-a-file' };
    }
    const size = stat.size;
    if (size === 0) return { path: filePath, size, content: '' };
    if (size <= opts.maxBytes) {
      return { path: filePath, size, content: fs.readFileSync(filePath, 'utf8') };
    }
    // Large file: read head and optional tail sample
    const fd = fs.openSync(filePath, 'r');
    const headBytes = Math.min(opts.maxBytes, size);
    const headBuffer = Buffer.alloc(headBytes);
    fs.readSync(fd, headBuffer, 0, headBytes, 0);
    let content = headBuffer.toString('utf8');
    if (opts.includeTailSample) {
      const tailBytes = Math.min(32 * 1024, size - headBytes); // 32KB tail
      if (tailBytes > 0) {
        const tailBuffer = Buffer.alloc(tailBytes);
        fs.readSync(fd, tailBuffer, 0, tailBytes, size - tailBytes);
        content += `\n/*__TAIL_SAMPLE__*/\n` + tailBuffer.toString('utf8');
      }
    }
    fs.closeSync(fd);
    return { path: filePath, size, content, skipped: true, reason: 'truncated-large-file' };
  } catch (err: any) {
    return { path: filePath, size: 0, content: '', skipped: true, reason: 'read-error:' + err?.message };
  }
}

/**
 * Loads raw log files given paths (files or directories). Performs size-based truncation for large files.
 */
export async function loadLogFiles(paths: string[], options: LoadOptions = {}): Promise<LoadLogsResult> {
  if (!Array.isArray(paths)) throw new Error('paths must be an array');
  const opts: Required<LoadOptions> = { ...DEFAULT_OPTIONS, ...options };
  const discovered = discoverPaths(paths, opts.extensions);
  const loaded = discovered.map(p => readFileAdaptive(p, opts));
  const loadedCount = loaded.filter(f => !f.skipped || f.content).length;
  const skippedCount = loaded.filter(f => f.skipped && !f.content).length;
  return {
    timestamp: new Date().toISOString(),
    handler: 'loadLogFiles',
    event: 'telemetry.load.logs',
    context: {
      paths,
      files: loaded,
      discoveredCount: discovered.length,
      loadedCount,
      skippedCount
    }
  };
}
