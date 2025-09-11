import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { normalizeHandlersImportSpec, isBareSpecifier } from '../../src/handlersPath';

/**
 * Guardrail tests for externalized plugins (issue #130)
 * - Verify manifest runtime exports exist and are callable for bare package specifiers
 * - Verify JSON-mounted sequences that use bare package handlersPath export a handlers object
 *   and that all referenced beat.handler names exist in that object
 */

describe('Externalized plugins: runtime register and handlers exports', () => {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const publicDir = path.join(repoRoot, 'public');

  it('manifest runtime exports are callable for bare package plugins', async () => {
    const manifestPath = path.join(publicDir, 'plugins', 'plugin-manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as any;
    const plugins = Array.isArray(manifest?.plugins) ? manifest.plugins : [];

    // Only check bare package specifiers (externalized plugins)
    const targets = plugins.filter((p: any) => p?.runtime?.module && isBareSpecifier(p.runtime.module));
    expect(targets.length).toBeGreaterThan(0);

    for (const p of targets) {
      const modSpec = p.runtime.module as string;
      const exportName = p.runtime.export as string;
      // For Node/Vitest, pass isBrowser=false; bare spec remains unchanged
      const spec = normalizeHandlersImportSpec(false, modSpec);
      const mod: any = await import(spec);
      const fn = mod?.[exportName];
      expect(typeof fn, `Plugin '${p.id}' missing runtime export '${exportName}' in module '${modSpec}'`).toBe('function');
    }
  });

  it('bare handlersPath sequences export handlers and include all referenced beat.handler names', async () => {
    const seqRoot = path.join(publicDir, 'json-sequences');
    expect(fs.existsSync(seqRoot)).toBe(true);

    const dirs = fs.readdirSync(seqRoot).filter((d) => fs.statSync(path.join(seqRoot, d)).isDirectory());

    // For each catalog dir, if it has an index.json, load it and check entries with bare handlersPath
    for (const dir of dirs) {
      const indexPath = path.join(seqRoot, dir, 'index.json');
      if (!fs.existsSync(indexPath)) continue;

      const indexJson = JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as any;
      const sequences = Array.isArray(indexJson?.sequences) ? indexJson.sequences : [];

      for (const ent of sequences) {
        const handlersPath = (ent && ent.handlersPath) || '';
        if (!handlersPath || !isBareSpecifier(String(handlersPath))) continue; // only bare specs

        const spec = normalizeHandlersImportSpec(false, String(handlersPath));
        const mod: any = await import(spec);
        const handlers = mod?.handlers || mod?.default?.handlers;
        expect(!!handlers, `handlers export not found at '${handlersPath}' for catalog '${dir}'`).toBe(true);

        // Load the sequence JSON and validate handler names exist
        const file = String(ent.file || '').trim();
        const seqPath = path.join(seqRoot, dir, file);
        expect(fs.existsSync(seqPath), `Missing sequence file '${file}' for catalog '${dir}'`).toBe(true);
        const seq = JSON.parse(fs.readFileSync(seqPath, 'utf-8')) as any;

        const beats: any[] = [];
        const movements: any[] = Array.isArray(seq?.movements) ? seq.movements : [];
        for (const m of movements) {
          const b = Array.isArray(m?.beats) ? m.beats : [];
          beats.push(...b);
        }

        const referenced = Array.from(
          new Set(
            beats
              .map((b: any) => String(b?.handler || '').trim())
              .filter((name) => !!name)
          )
        );

        const missing = referenced.filter((name) => !(name in (handlers || {})));
        const seqId = String(seq?.id || file);
        expect(missing.length, `Missing handler(s) [${missing.join(', ')}] in '${handlersPath}' for sequence '${seqId}'`).toBe(0);
      }
    }
  });
});

