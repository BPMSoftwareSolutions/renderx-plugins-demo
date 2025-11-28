import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(
  __dirname,
  '../docs/schemas/musical-sequence.schema.json',
);
const exampleSequencePath = path.join(
  __dirname,
  '../docs/samples/example-data-driven-sequence.json',
);
const fractalSequencePath = path.join(
  __dirname,
  '../packages/orchestration/json-sequences/fractal-orchestration-domain-symphony.json',
);

function loadSchema(): any {
  const raw = fs.readFileSync(schemaPath, 'utf-8');
  return JSON.parse(raw);
}

function loadExampleSequence(): any {
  const raw = fs.readFileSync(exampleSequencePath, 'utf-8');
  return JSON.parse(raw);
}

function loadFractalSequence(): any {
  const raw = fs.readFileSync(fractalSequencePath, 'utf-8');
  return JSON.parse(raw);
}

describe('Canonical MusicalSequence JSON Schema', () => {
  it('schema file should exist and be valid JSON', () => {
    expect(fs.existsSync(schemaPath)).toBe(true);

    const raw = fs.readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(raw);

    expect(schema).toHaveProperty('$schema');
    expect(schema).toHaveProperty('title', 'MusicalSequence');
    expect(schema).toHaveProperty('type', 'object');
  });

  it('defines core MusicalSequence properties aligned with SequenceTypes', () => {
    const schema = loadSchema();
    const props = schema.properties ?? {};

    const expectedProps = [
      'id',
      'name',
      'description',
      'key',
      'tempo',
      'timeSignature',
      'category',
      'movements',
      'metadata',
    ];

    expectedProps.forEach((p) => {
      expect(props).toHaveProperty(p);
    });

    const movements = props.movements;
    expect(movements).toBeDefined();
    expect(movements.type).toBe('array');
  });

  it('describes movements and beats with event/timing metadata', () => {
    const schema = loadSchema();

    const movementProps =
      schema.definitions?.SequenceMovement?.properties ??
      schema.properties?.movements?.items?.properties ?? {};
    expect(movementProps).toHaveProperty('beats');

    const beatProps =
      schema.definitions?.SequenceBeat?.properties ??
      schema.properties?.movements?.items?.properties?.beats?.items
        ?.properties ?? {};

    // Every beat must at least carry an event; numbering and dynamics are
    // modeled but may vary by sequence family.
    expect(beatProps).toHaveProperty('event');
    expect(beatProps).toHaveProperty('beat');
    expect(beatProps).toHaveProperty('number');
    expect(beatProps).toHaveProperty('timing');
  });

  it('accepts the example data-driven MusicalSequence core shape', () => {
    const schema = loadSchema();
    const seq = loadExampleSequence();

    // Core MusicalSequence fields
    expect(typeof seq.id).toBe('string');
    expect(typeof seq.name).toBe('string');
    expect(Array.isArray(seq.movements)).toBe(true);
    expect(seq.movements.length).toBeGreaterThan(0);

    // Movement-level requirements
    const movement = seq.movements[0];
    expect(typeof movement.name).toBe('string');
    expect(Array.isArray(movement.beats)).toBe(true);
    expect(movement.beats.length).toBeGreaterThan(0);

    // Beat-level requirements aligned with the schema
    const beat = movement.beats[0];
    expect(typeof beat.event).toBe('string');
    expect(typeof beat.beat).toBe('number');

    const beatProps =
      schema.definitions?.SequenceBeat?.properties ??
      schema.properties?.movements?.items?.properties?.beats?.items
        ?.properties ?? {};

    // The schema and the example agree on the presence of these fields.
    ['event', 'beat', 'timing', 'dynamics', 'kind'].forEach((prop) => {
      expect(beatProps).toHaveProperty(prop);
      // If present in the example, it should be of the right primitive type.
      if (prop in beat) {
        const expectedType = prop === 'beat' ? 'number' : 'string';
        expect(typeof beat[prop as keyof typeof beat]).toBe(expectedType);
      }
    });
  });

  it('accepts the fractal orchestration domain MusicalSequence core shape', () => {
    const seq = loadFractalSequence();

    expect(typeof seq.id).toBe('string');
    expect(typeof seq.name).toBe('string');
    expect(Array.isArray(seq.movements)).toBe(true);
    expect(seq.movements.length).toBeGreaterThan(0);

    const movement = seq.movements[0];
    expect(typeof movement.name).toBe('string');
    expect(Array.isArray(movement.beats)).toBe(true);
    expect(movement.beats.length).toBeGreaterThan(0);

    const beat = movement.beats[0];
    expect(typeof beat.event).toBe('string');
    expect(typeof beat.beat).toBe('number');
  });
});

