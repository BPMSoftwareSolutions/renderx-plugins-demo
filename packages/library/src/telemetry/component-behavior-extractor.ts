// Lightweight log pattern extractor used by tests to derive plugin-sequence mappings,
// event sequences (movements/beats), and DataBaton data-flow patterns from RenderX logs.
// Intentionally minimal and heuristics-based; not a full parser.

export interface LogChunkLike {
  lines: string[];
  metadata?: Record<string, any>;
}

type ChangeType = 'added' | 'modified' | 'removed';

interface PluginSequenceMapping {
  topic: string;
  pluginId: string;
  sequenceId: string;
  sequenceName: string;
}

interface BeatInfo {
  number: number;
  title: string;
  event: string;
  duration: number;
}

interface MovementInfo {
  name: string;
  beats: BeatInfo[];
  duration: number;
}

interface EventSequenceInfo {
  sequenceId: string;
  sequenceName: string;
  movements: MovementInfo[];
  eventCount: number;
  totalDuration: number;
}

interface DataFlowPattern {
  event: string;
  changes: string[];
  changeType: ChangeType;
}

interface OperationAggregate {
  pluginSequenceMappings: PluginSequenceMapping[];
  eventSequences: EventSequenceInfo[];
  dataFlowPatterns: DataFlowPattern[];
  averageDuration: number;
  frequency: number;
}

interface Pattern {
  componentType: string; // e.g., 'library', 'control-panel'
  operations: Record<string, OperationAggregate>; // e.g., 'load', 'ui'
}

function ensureOp(patterns: Map<string, Pattern>, componentType: string, opKey: string): OperationAggregate {
  if (!patterns.has(componentType)) {
    patterns.set(componentType, { componentType, operations: {} });
  }
  const p = patterns.get(componentType)!;
  if (!p.operations[opKey]) {
    p.operations[opKey] = {
      pluginSequenceMappings: [],
      eventSequences: [],
      dataFlowPatterns: [],
      averageDuration: 0,
      frequency: 0,
    };
  }
  return p.operations[opKey];
}

function toComponentFromTopic(topic: string): { component: string; op: string } {
  const parts = topic.split('.');
  if (parts[0] === 'control' && parts[1] === 'panel') {
    return { component: 'control-panel', op: parts[2] || 'unknown' };
  }
  return { component: parts[0] || 'unknown', op: parts[1] || 'unknown' };
}

function normalizeOp(op: string): string {
  if (op === 'load') return 'components';
  return op || 'unknown';
}


function toComponentFromEvent(event: string): { component: string; op: string } {
  // Examples:
  //  - 'library:components:load' => library, op=components
  //  - 'control:panel:ui:init:config' => control-panel, op=ui
  const segs = event.split(':');
  if (segs.length === 0) return { component: 'unknown', op: 'unknown' };
  if (segs[0] === 'control' && segs[1] === 'panel') {
    return { component: 'control-panel', op: segs[2] || 'unknown' };
  }
  return { component: segs[0] || 'unknown', op: segs[1] || 'unknown' };
}

function extractSequenceIdFromRequestIdLine(line: string): string | null {
  // Example: '🆔 Request ID: library-load-symphony-1761945322347-lczbz743s'
  const m = line.match(/Request ID: ([a-z0-9-]+)-\d/);
  return m ? m[1] : null;
}

function titleFromSequenceId(id: string): string {
  // library-load-symphony => "Library Load Symphony"
  return id
    .split('-')
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ');
}

export class ComponentBehaviorExtractor {
  async extractPatterns(chunks: LogChunkLike[]): Promise<Pattern[]> {
    const lines: string[] = [];
    for (const c of chunks) lines.push(...c.lines);

    const patterns = new Map<string, Pattern>();


    // 1) Plugin/Sequence mappings via topics router
    for (const raw of lines) {
      const line = raw.trim();
      const m = line.match(/^\[topics\]\s+Routing '([^']+)'\s*->\s*([A-Za-z0-9]+)::([a-z0-9-]+)/i);
      if (m) {
        const topic = m[1];
        const pluginId = m[2];
        const sequenceId = m[3];
        const { component, op } = toComponentFromTopic(topic);
        const opKey = normalizeOp(op);
        const opAgg = ensureOp(patterns, component, opKey);
        opAgg.pluginSequenceMappings.push({
          topic,
          pluginId,
          sequenceId,
          sequenceName: titleFromSequenceId(sequenceId),
        });
      }
    }

    // 2) Sequence structure (movements, beats, durations)
    interface InFlightSequence {
      id: string;
      name: string;
      movements: MovementInfo[];
      totalDuration: number;
      firstEvent?: string;
    }
    const active: InFlightSequence[] = [];
    let lastSequenceName: string | null = null;

    const pushSequenceByComponent = (seq: InFlightSequence) => {
      // Determine component + op from the first beat's event if available
      const event = seq.firstEvent || '';
      const { component, op } = toComponentFromEvent(event || 'unknown:unknown');
      const opAgg = ensureOp(patterns, component, op);
      const eventCount = seq.movements.reduce((acc, m) => acc + m.beats.length, 0);
      opAgg.eventSequences.push({
        sequenceId: seq.id,
        sequenceName: seq.name,
        movements: seq.movements,
        eventCount,
        totalDuration: seq.totalDuration,
      });
    };

    // We scan once; maintain pointer to current active sequence (most recent)
    for (const line of lines) {
      // Track 'Sequence: <Name>' lines to attach to next Request ID line
      const seqName = line.match(/^🎼 Sequence: (.+)$/);
      if (seqName) {
        lastSequenceName = seqName[1].trim();
        continue;
      }

      const req = extractSequenceIdFromRequestIdLine(line);
      if (req) {
        const name = lastSequenceName ?? titleFromSequenceId(req);
        lastSequenceName = null;
        active.push({ id: req, name, movements: [], totalDuration: 0 });
        continue;
      }

      // Movement started
      const mv = line.match(/^🎵 Movement Started: (.+) \((\d+) beats\)/);
      if (mv && active.length > 0) {
        const movementName = mv[1].trim();
        active[active.length - 1].movements.push({ name: movementName, beats: [], duration: 0 });
        continue;
      }

      // Beat started
      const beat = line.match(/^🎵 Beat (\d+) Started: (.+) \(([^)]+)\)/);
      if (beat && active.length > 0) {
        const current = active[active.length - 1];
        if (current.movements.length === 0) {
          current.movements.push({ name: 'Movement 1', beats: [], duration: 0 });
        }
        const number = parseInt(beat[1], 10);
        const title = beat[2].trim();
        const event = beat[3].trim();
        const mvInfo = current.movements[current.movements.length - 1];
        mvInfo.beats.push({ number, title, event, duration: 0 });
        if (!current.firstEvent) current.firstEvent = event;
        continue;
      }

      // Beat duration
      const beatDur = line.match(/^⏱️ PerformanceTracker: Beat \d+ completed in ([\d.]+)ms/);
      if (beatDur && active.length > 0) {
        const mvInfo = active[active.length - 1].movements.at(-1);
        const btInfo = mvInfo?.beats.at(-1);
        if (btInfo) btInfo.duration = parseFloat(beatDur[1]);
        continue;
      }

      // Movement duration
      const mvDur = line.match(/^⏱️ PerformanceTracker: Movement .+ completed in ([\d.]+)ms/);
      if (mvDur && active.length > 0) {
        const mvInfo = active[active.length - 1].movements.at(-1);
        if (mvInfo) mvInfo.duration = parseFloat(mvDur[1]);
        continue;
      }

      // Sequence completed duration
      const seqDur = line.match(/^✅ SequenceExecutor: Sequence .+ completed in (\d+)ms/);
      if (seqDur && active.length > 0) {
        const seq = active.pop()!;
        seq.totalDuration = parseFloat(seqDur[1]);
        pushSequenceByComponent(seq);
        continue;
      }
    }

    // 2.5) Plugin-sequence mappings from PluginInterfaceFacade.play()
    for (const raw of lines) {
      const line = raw.trim();
      const routingMatch = line.match(/PluginInterfaceFacade\.play\(\):\s+([^\s]+)\s*->\s*([^\s]+)/);
      if (routingMatch) {
        const pluginId = routingMatch[1];
        const sequenceId = routingMatch[2];

        // Determine component type from plugin ID
        let componentType = 'unknown';
        if (/Library/i.test(pluginId)) componentType = 'library';
        else if (/ControlPanel/i.test(pluginId)) componentType = 'control-panel';
        else if (/Canvas/i.test(pluginId)) componentType = 'canvas';

        // Determine operation from sequence ID
        let operation = 'unknown';
        if (sequenceId.includes('load')) operation = 'components';
        else if (sequenceId.includes('ui') || sequenceId.includes('render')) operation = 'ui';

        // Determine topic from component and operation
        const topic = `${componentType}.${operation}.requested`;

        const opAgg = ensureOp(patterns, componentType, operation);
        opAgg.pluginSequenceMappings.push({
          topic,
          pluginId,
          sequenceId,
          sequenceName: titleFromSequenceId(sequenceId),
        });
      }
    }

    // 3) DataBaton patterns
    for (const line of lines) {
      if (!line.includes('🎽 DataBaton:')) continue;

      let changeType: ChangeType | null = null;
      let changes: string[] = [];
      if (line.includes('🎽 DataBaton: +')) {
        changeType = 'added';
        const m = line.match(/🎽 DataBaton: \+([^|]+)\s*\|/);
        if (m) changes = m[1].split(',').map((s) => s.trim()).filter(Boolean);
      } else if (line.includes('🎽 DataBaton: ~')) {
        changeType = 'modified';
        const m = line.match(/🎽 DataBaton: ~([^|]+)\s*\|/);
        if (m) changes = m[1].split(',').map((s) => s.trim()).filter(Boolean);
      } else if (line.includes('🎽 DataBaton: -')) {
        changeType = 'removed';
        const m = line.match(/🎽 DataBaton: -([^|]+)\s*\|/);
        if (m) changes = m[1].split(',').map((s) => s.trim()).filter(Boolean);
      }

      const evMatch = line.match(/event=([^\s]+)/);
      const event = evMatch ? evMatch[1] : '';
      const { component, op } = toComponentFromEvent(event || 'unknown:unknown');
      const opAgg = ensureOp(patterns, component, op);
      if (changeType && changes.length > 0) {
        opAgg.dataFlowPatterns.push({ event, changes, changeType });
      }
    }

    // 4) Aggregates
    for (const p of patterns.values()) {
      for (const opKey of Object.keys(p.operations)) {
        const opAgg = p.operations[opKey];
        opAgg.frequency = opAgg.eventSequences.length;
        if (opAgg.eventSequences.length > 0) {
          const sum = opAgg.eventSequences.reduce((acc, s) => acc + (s.totalDuration || 0), 0);
          opAgg.averageDuration = sum / opAgg.eventSequences.length;
        } else {
          opAgg.averageDuration = 0;
        }
      }
    }

    return Array.from(patterns.values());
  }
}

