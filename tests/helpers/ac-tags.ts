/**
 * AC Tag Helper Utilities
 *
 * Provides type-safe helper functions for creating AC and BEAT tags in tests.
 * Reduces typos and ensures consistency across test suite.
 *
 * Usage:
 *   import { acTag, beatTag } from '../helpers/ac-tags';
 *
 *   describe(beatTag('create', '1.1'), () => {
 *     it(acTag('create', '1.1', 1), () => { ... });
 *   });
 */

/**
 * Default domain for renderx-web-orchestration
 */
const DEFAULT_DOMAIN = 'renderx-web-orchestration';

/**
 * Create a full AC tag
 * @param sequence - Sequence ID (e.g., 'create', 'select', 'export')
 * @param beat - Beat ID (e.g., '1.1', '2.3')
 * @param acIndex - AC index (1-based)
 * @param domain - Optional domain ID (defaults to renderx-web-orchestration)
 * @returns Formatted AC tag
 *
 * @example
 * acTag('create', '1.1', 1)
 * // Returns: '[AC:renderx-web-orchestration:create:1.1:1]'
 */
export function acTag(
  sequence: string,
  beat: string,
  acIndex: number,
  domain: string = DEFAULT_DOMAIN
): string {
  return `[AC:${domain}:${sequence}:${beat}:${acIndex}]`;
}

/**
 * Create a BEAT tag
 * @param sequence - Sequence ID (e.g., 'create', 'select', 'export')
 * @param beat - Beat ID (e.g., '1.1', '2.3')
 * @param domain - Optional domain ID (defaults to renderx-web-orchestration)
 * @returns Formatted BEAT tag
 *
 * @example
 * beatTag('create', '1.1')
 * // Returns: '[BEAT:renderx-web-orchestration:create:1.1]'
 */
export function beatTag(
  sequence: string,
  beat: string,
  domain: string = DEFAULT_DOMAIN
): string {
  return `[BEAT:${domain}:${sequence}:${beat}]`;
}

/**
 * Create multiple AC tags
 * @param sequence - Sequence ID
 * @param beat - Beat ID
 * @param acIndices - Array of AC indices
 * @param domain - Optional domain ID
 * @returns Space-separated AC tags
 *
 * @example
 * multiAcTag('create', '1.1', [1, 2, 3])
 * // Returns: '[AC:renderx-web-orchestration:create:1.1:1] [AC:renderx-web-orchestration:create:1.1:2] [AC:renderx-web-orchestration:create:1.1:3]'
 */
export function multiAcTag(
  sequence: string,
  beat: string,
  acIndices: number[],
  domain: string = DEFAULT_DOMAIN
): string {
  return acIndices.map(idx => acTag(sequence, beat, idx, domain)).join(' ');
}

/**
 * Combine BEAT tag with description
 * @param sequence - Sequence ID
 * @param beat - Beat ID
 * @param description - Test description
 * @param domain - Optional domain ID
 * @returns Tagged description
 *
 * @example
 * beatDescription('create', '1.1', 'Component Serialization')
 * // Returns: '[BEAT:renderx-web-orchestration:create:1.1] Component Serialization'
 */
export function beatDescription(
  sequence: string,
  beat: string,
  description: string,
  domain: string = DEFAULT_DOMAIN
): string {
  return `${beatTag(sequence, beat, domain)} ${description}`;
}

/**
 * Combine AC tag with description
 * @param sequence - Sequence ID
 * @param beat - Beat ID
 * @param acIndex - AC index
 * @param description - Test description
 * @param domain - Optional domain ID
 * @returns Tagged description
 *
 * @example
 * acDescription('create', '1.1', 1, 'serializes deterministically')
 * // Returns: '[AC:renderx-web-orchestration:create:1.1:1] serializes deterministically'
 */
export function acDescription(
  sequence: string,
  beat: string,
  acIndex: number,
  description: string,
  domain: string = DEFAULT_DOMAIN
): string {
  return `${acTag(sequence, beat, acIndex, domain)} ${description}`;
}

/**
 * Sequence IDs for renderx-web-orchestration
 */
export const Sequences = {
  CREATE: 'create',
  SELECT: 'select',
  EXPORT: 'export',
  UI_INIT: 'ui-init',
  UI_THEME: 'ui-theme-toggle',
  AUGMENT: 'augment',
  DELETE: 'delete',
  COPY: 'copy',
} as const;

/**
 * Common beat IDs for quick reference
 */
export const Beats = {
  // Create sequence
  CREATE_1_1: '1.1',
  CREATE_1_2: '1.2',
  CREATE_2_1: '2.1',

  // Select sequence
  SELECT_1_1: '1.1',
  SELECT_1_2: '1.2',
  SELECT_2_1: '2.1',

  // Export sequence
  EXPORT_1_1: '1.1',
  EXPORT_1_2: '1.2',
  EXPORT_2_1: '2.1',
} as const;

/**
 * Type-safe AC tag builder
 */
export class ACTagBuilder {
  private domain: string = DEFAULT_DOMAIN;
  private sequence?: string;
  private beat?: string;

  withDomain(domain: string): this {
    this.domain = domain;
    return this;
  }

  withSequence(sequence: string): this {
    this.sequence = sequence;
    return this;
  }

  withBeat(beat: string): this {
    this.beat = beat;
    return this;
  }

  ac(acIndex: number): string {
    if (!this.sequence || !this.beat) {
      throw new Error('Sequence and beat must be set before creating AC tag');
    }
    return acTag(this.sequence, this.beat, acIndex, this.domain);
  }

  beat(): string {
    if (!this.sequence || !this.beat) {
      throw new Error('Sequence and beat must be set before creating BEAT tag');
    }
    return beatTag(this.sequence, this.beat, this.domain);
  }
}

/**
 * Factory function for type-safe tag building
 *
 * @example
 * const createTags = tagBuilder().withSequence('create').withBeat('1.1');
 * createTags.ac(1) // '[AC:renderx-web-orchestration:create:1.1:1]'
 * createTags.beat() // '[BEAT:renderx-web-orchestration:create:1.1]'
 */
export function tagBuilder(): ACTagBuilder {
  return new ACTagBuilder();
}
