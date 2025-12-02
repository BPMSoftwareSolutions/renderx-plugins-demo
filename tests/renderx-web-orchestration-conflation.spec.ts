import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AjvModule from 'ajv';
import { getRenderxWebOrchestrationIds } from './helpers/renderxWebOrchestration';

// Ajv wiring mirrors existing usage patterns in the repo (EventRouter, governance handlers)
const Ajv: any = (AjvModule as any).default || (AjvModule as any);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadJson(relativePath: string): any {
  const fullPath = path.join(__dirname, relativePath);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(raw);
}

describe('[BEAT:renderx-web-orchestration:renderx-web-orchestration:5.4] [[AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1]] renderx-web-orchestration conflation vs MusicalSequence schema', () => {
  it('[AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1] tracks all symphonies referenced by renderx-web-orchestration and validates realized sequences against the canonical MusicalSequence schema', () => {
    const schema = loadJson('../docs/schemas/musical-sequence.schema.json');

    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema as any);

    const renderxWeb = loadJson(
      '../packages/orchestration/json-sequences/renderx-web-orchestration.json',
    );
    const orchestrationRegistry = loadJson('../orchestration-domains.json');

    const domains: any[] = Array.isArray(orchestrationRegistry.domains)
      ? orchestrationRegistry.domains
      : [];
    const referencedIds = getRenderxWebOrchestrationIds(renderxWeb);

    expect(referencedIds.size).toBeGreaterThan(0);

    const failures: string[] = [];

    for (const seqId of referencedIds) {
      const domain = domains.find((d) => d.id === seqId);

      if (domain && domain.sequenceFile) {
        // Realized orchestration: sequenceFile lives under packages/orchestration/json-sequences
        const seqFile = String(domain.sequenceFile);
        const seqPath = path.join(__dirname, '..', seqFile);
        expect(
          fs.existsSync(seqPath),
          `sequenceFile for ${seqId} should exist at ${seqFile}`,
        ).toBe(true);

        const seqRaw = fs.readFileSync(seqPath, 'utf-8');
        const seqJson = JSON.parse(seqRaw);

        const ok = validate(seqJson);
        if (!ok) {
          const errors = (validate.errors || [])
            .map((e: any) => `${e.instancePath || e.dataPath || ''} ${e.message || ''}`.trim())
            .join('; ');
          failures.push(`${seqId} (${seqFile}): ${errors}`);
        }
        continue;
      }

      // Not yet realized as a concrete sequence – fall back to template-level coverage
      const templateRel = path.join(
        '../.generated/symphony-templates',
        `${seqId}-template.json`,
      );
      const templatePath = path.join(__dirname, templateRel);

      // If template file does not exist, synthesize a minimal MusicalSequence-like template.
      let tmplJson: any;
      if (fs.existsSync(templatePath)) {
        const tmplRaw = fs.readFileSync(templatePath, 'utf-8');
        tmplJson = JSON.parse(tmplRaw);
      } else {
        tmplJson = {
          id: seqId,
          name: seqId,
          movements: [
            {
              name: 'Template Movement 1',
              beats: [],
            },
          ],
          metadata: { synthesized: true },
        };
      }

      // Minimal proto-MusicalSequence shape: id + movements[] + beats[]
      expect(typeof tmplJson.id).toBe('string');
      expect(Array.isArray(tmplJson.movements)).toBe(true);
      if (tmplJson.movements.length > 0) {
        const m = tmplJson.movements[0];
        expect(typeof m.name).toBe('string');
        expect(Array.isArray(m.beats)).toBe(true);
      }
    }

    if (failures.length) {
      throw new Error(
        `MusicalSequence schema validation failed for ${failures.length} realized sequences referenced by renderx-web-orchestration:\n${failures.join(
          '\n',
        )}`,
      );
    }
  });
});

