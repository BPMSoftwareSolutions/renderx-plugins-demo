/**
 * Mock Handler Registry
 * 
 * Manages mock implementations for different beat kinds.
 * Allows incremental unmocking to isolate performance bottlenecks.
 */

export type BeatKind = 'pure' | 'io' | 'stage-crew' | 'api';

export interface MockOptions {
  mockServices?: BeatKind[];
  mockBeats?: number[];
  unmockServices?: BeatKind[];
  unmockBeats?: number[];
}

export interface MockContext {
  isMocked: boolean;
  kind: BeatKind;
  beatNumber: number;
  handler: string;
}

/**
 * Determines if a beat should be mocked based on options
 */
export function shouldMockBeat(
  beatNumber: number,
  kind: BeatKind,
  options: MockOptions
): boolean {
  // If explicitly unmocked, don't mock
  if (options.unmockBeats?.includes(beatNumber)) {
    return false;
  }
  if (options.unmockServices?.includes(kind)) {
    return false;
  }

  // If explicitly mocked, mock it
  if (options.mockBeats?.includes(beatNumber)) {
    return true;
  }
  if (options.mockServices?.includes(kind)) {
    return true;
  }

  // Default: don't mock
  return false;
}

/**
 * Get mock delay for a beat kind
 * Simulates the beat without executing real code
 */
export function getMockDelay(kind: BeatKind): number {
  switch (kind) {
    case 'pure':
      return 1; // Pure computation is very fast
    case 'io':
      return 5; // I/O is slightly slower
    case 'stage-crew':
      return 2; // DOM operations are mocked quickly
    case 'api':
      return 10; // API calls are mocked with slight delay
    default:
      return 1;
  }
}

/**
 * Format mock context for logging
 */
export function formatMockContext(ctx: MockContext): string {
  const status = ctx.isMocked ? '🎭 MOCKED' : '✨ UNMOCKED';
  return `${status} [Beat ${ctx.beatNumber}] ${ctx.handler} (${ctx.kind})`;
}

/**
 * Parse mock options from CLI arguments
 */
export function parseMockOptions(args: Record<string, any>): MockOptions {
  const options: MockOptions = {};

  if (args.mock) {
    // --mock pure,io,stage-crew
    options.mockServices = (args.mock as string).split(',').map(s => s.trim()) as BeatKind[];
  }

  if (args['mock-beat']) {
    // --mock-beat 1,2,3
    options.mockBeats = (args['mock-beat'] as string).split(',').map(s => parseInt(s.trim()));
  }

  if (args.unmock) {
    // --unmock pure,io
    options.unmockServices = (args.unmock as string).split(',').map(s => s.trim()) as BeatKind[];
  }

  if (args['unmock-beat']) {
    // --unmock-beat 1,2
    options.unmockBeats = (args['unmock-beat'] as string).split(',').map(s => parseInt(s.trim()));
  }

  return options;
}

