/**
 * Renderx-Web-Orchestration Sequences Validation Test
 * 
 * Validates all MusicalSequence instances referenced by renderx-web-orchestration
 * against the canonical musical-sequence.schema.json using Ajv.
 * 
 * This test focuses ONLY on child sequences and templates referenced by the
 * meta-orchestration, not on renderx-web-orchestration.json itself.
 * 
 * @issue #414 – DOMAIN_REGISTRY ↔ context tree ↔ orchestration invariants (MusicalSequence SSoT)
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AjvModule from 'ajv';
import { getRenderxWebOrchestrationIds } from './helpers/renderxWebOrchestration';

// Ajv instantiation pattern mirrors governance-handlers.js and conflation test
const Ajv: any = (AjvModule as any).default || (AjvModule as any);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Loads a JSON file relative to the test directory.
 */
function loadJson(relativePath: string): any {
  const fullPath = path.join(__dirname, relativePath);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Creates a reusable Ajv validator for the MusicalSequence schema.
 */
function createValidator() {
  const schema = loadJson('../docs/schemas/musical-sequence.schema.json');
  const ajv = new Ajv({ allErrors: true, strict: false });
  return ajv.compile(schema as any);
}

/**
 * Extracts validation errors into human-readable format.
 */
function formatValidationErrors(errors: any[] | null | undefined): string {
  if (!errors || errors.length === 0) return 'No errors';
  return errors
    .map((e: any) => {
      const path = e.instancePath || e.dataPath || '(root)';
      return `${path} ${e.message || ''}`.trim();
    })
    .join('; ');
}

// ============================================================================
// TESTS
// ============================================================================

describe('renderx-web-orchestration sequences validation', () => {
  /**
   * Core test: validates all realized sequences referenced by renderx-web-orchestration
   * against the canonical MusicalSequence schema using Ajv.
   * 
   * Currently, all referenced sequences are templates. Once sequenceFile entries are
   * populated in orchestration-domains.json, this test will validate them against
   * the canonical MusicalSequence schema.
   */
  it('validates any realized sequences referenced by renderx-web-orchestration against MusicalSequence schema', () => {
    const validate = createValidator();
    const renderxWeb = loadJson(
      '../packages/orchestration/json-sequences/renderx-web-orchestration.json',
    );
    const orchestrationRegistry = loadJson('../orchestration-domains.json');

    const referencedIds = getRenderxWebOrchestrationIds(renderxWeb);
    const domains: any[] = Array.isArray(orchestrationRegistry.domains)
      ? orchestrationRegistry.domains
      : [];

    expect(referencedIds.size).toBeGreaterThan(0);

    const validationFailures: Array<{ id: string; filePath: string; errors: string }> = [];

    // Validate only realized sequences (those with sequenceFile in orchestration-domains.json)
    for (const seqId of referencedIds) {
      const domain = domains.find((d) => d.id === seqId);

      if (!domain || !domain.sequenceFile) {
        // Skip non-realized sequences (templates will be covered separately)
        continue;
      }
      const seqFile = String(domain.sequenceFile);
      const seqPath = path.join(__dirname, '..', seqFile);

      expect(
        fs.existsSync(seqPath),
        `sequenceFile for ${seqId} should exist at ${seqFile}`,
      ).toBe(true);

      const seqRaw = fs.readFileSync(seqPath, 'utf-8');
      const seqJson = JSON.parse(seqRaw);

      const isValid = validate(seqJson);
      if (!isValid) {
        const errorMsg = formatValidationErrors(validate.errors);
        validationFailures.push({
          id: seqId,
          filePath: seqFile,
          errors: errorMsg,
        });
      }
    }

    if (validationFailures.length > 0) {
      const errorReport = validationFailures
        .map((f) => `  • ${f.id} (${f.filePath})\n    └ ${f.errors}`)
        .join('\n');
      throw new Error(
        `MusicalSequence schema validation failed for ${validationFailures.length} realized sequence(s):\n${errorReport}`,
      );
    }

    // Once sequenceFile entries are added to orchestration-domains.json, this counter
    // will track the number of realized sequences being validated.
    // For now, this passes because all references are template-based (covered by next test).
    expect(true).toBe(true);
  });

  /**
   * Template fallback test: validates that sequences not yet realized as concrete files
   * have templates with minimal MusicalSequence-like structure.
   */
  it('ensures all non-realized orchestration references have template fallbacks with MusicalSequence structure', () => {
    const renderxWeb = loadJson(
      '../packages/orchestration/json-sequences/renderx-web-orchestration.json',
    );
    const orchestrationRegistry = loadJson('../orchestration-domains.json');

    const referencedIds = getRenderxWebOrchestrationIds(renderxWeb);
    const domains: any[] = Array.isArray(orchestrationRegistry.domains)
      ? orchestrationRegistry.domains
      : [];

    const templateFailures: Array<{ id: string; reason: string }> = [];

    for (const seqId of referencedIds) {
      const domain = domains.find((d) => d.id === seqId);

      // Skip if already realized as a concrete sequence file
      if (domain && domain.sequenceFile) {
        continue;
      }

      // Not realized – must have a template
      const templateRel = path.join(
        '../.generated/symphony-templates',
        `${seqId}-template.json`,
      );
      const templatePath = path.join(__dirname, templateRel);

      if (!fs.existsSync(templatePath)) {
        templateFailures.push({
          id: seqId,
          reason: `expected either a realized sequenceFile in orchestration-domains.json or a template at ${templateRel}`,
        });
        continue;
      }

      const tmplRaw = fs.readFileSync(templatePath, 'utf-8');
      const tmplJson = JSON.parse(tmplRaw);

      // Validate minimal proto-MusicalSequence shape
      const issues: string[] = [];

      if (typeof tmplJson.id !== 'string') {
        issues.push('id must be a string');
      }

      if (!Array.isArray(tmplJson.movements)) {
        issues.push('movements must be an array');
      } else if (tmplJson.movements.length > 0) {
        const m = tmplJson.movements[0];
        if (typeof m.name !== 'string') {
          issues.push('first movement.name must be a string');
        }
        if (!Array.isArray(m.beats)) {
          issues.push('first movement.beats must be an array');
        }
      }

      if (issues.length > 0) {
        templateFailures.push({
          id: seqId,
          reason: `template structure issues: ${issues.join('; ')}`,
        });
      }
    }

    if (templateFailures.length > 0) {
      const errorReport = templateFailures
        .map((f) => `  • ${f.id}: ${f.reason}`)
        .join('\n');
      throw new Error(
        `Template validation failed for ${templateFailures.length} non-realized sequence(s):\n${errorReport}`,
      );
    }
  });

  /**
   * Schema conformance assertions: validates that the MusicalSequence schema
   * itself defines the core properties expected by this validation test.
   */
  it('confirms MusicalSequence schema defines core properties for renderx-web orchestration', () => {
    const schema = loadJson('../docs/schemas/musical-sequence.schema.json');

    // Schema should have properties defined
    expect(schema).toHaveProperty('properties');

    const props = schema.properties ?? {};

    // Verify schema includes expected MusicalSequence properties
    const expectedProps = [
      'id',
      'name',
      'movements',
      'metadata',
    ];

    for (const prop of expectedProps) {
      expect(props).toHaveProperty(prop);
    }

    // Verify movements is expected to be an array
    const movementsSchema = props.movements ?? {};
    expect(movementsSchema.type || movementsSchema.items).toBeTruthy();
  });

  /**
   * Registry consistency: documents which orchestration references from renderx-web
   * are currently in orchestration-domains.json vs using templates.
   */
  it('documents orchestration references from renderx-web by registry status', () => {
    const renderxWeb = loadJson(
      '../packages/orchestration/json-sequences/renderx-web-orchestration.json',
    );
    const orchestrationRegistry = loadJson('../orchestration-domains.json');

    const domains: any[] = Array.isArray(orchestrationRegistry.domains)
      ? orchestrationRegistry.domains
      : [];

    const referencedIds = getRenderxWebOrchestrationIds(renderxWeb);

    const domainIds = new Set(domains.map((d) => d.id));
    let registered = 0;
    let unregistered = 0;

    for (const seqId of referencedIds) {
      if (domainIds.has(seqId)) {
        registered++;
      } else {
        unregistered++;
      }
    }

    // Document current coverage
    expect(registered + unregistered).toEqual(referencedIds.size);

    // At minimum, renderx-web references should be tracked
    // (unregistered ones will be covered by template fallback test)
    expect(referencedIds.size).toBeGreaterThan(0);
  });
});
