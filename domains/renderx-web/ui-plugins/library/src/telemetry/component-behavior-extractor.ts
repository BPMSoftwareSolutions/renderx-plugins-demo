/**
 * ComponentBehaviorExtractor (library-local)
 *
 * Analyzes conductor telemetry logs to extract component behavior patterns:
 * - Plugin/sequence mappings for canvas operations
 * - Event sequences and their order
 * - Timing data and performance characteristics
 * - Data flow patterns (DataBaton changes)
 */

// Local minimal LogChunk type to avoid cross-package imports
export interface LogChunk {
  lines: string[];
  metadata: {
    timestamp: string;
    eventType?: string;
    sessionId?: string;
    [key: string]: any;
  };
}

export interface PluginSequenceMapping {
  topic: string;
  pluginId: string;
  sequenceId: string;
  sequenceName: string;
}

export interface EventSequence {
  sequenceId: string;
  sequenceName: string;
  movements: Movement[];
  totalDuration: number;
  eventCount: number;
}

export interface Movement {
  name: string;
  beats: Beat[];
  duration: number;
}

export interface Beat {
  number: number;
  title: string;
  event: string;
  duration: number;
  dataChanges?: string[];
}

export interface DataFlowPattern {
  event: string;
  handler?: string;
  pluginId?: string;
  changes: string[];
  changeType: 'added' | 'modified' | 'removed';
}

export interface ComponentBehaviorPattern {
  componentType: string;
  operations: {
    [operation: string]: {
      pluginSequenceMappings: PluginSequenceMapping[];
      eventSequences: EventSequence[];
      dataFlowPatterns: DataFlowPattern[];
      averageDuration: number;
      frequency: number;
    };
  };
}

export class ComponentBehaviorExtractor {
  async extractPatterns(chunks: LogChunk[]): Promise<ComponentBehaviorPattern[]> {
    const patterns: Map<string, ComponentBehaviorPattern> = new Map();

    const mappings = this.extractPluginSequenceMappings(chunks);
    const sequences = this.extractEventSequences(chunks);
    const dataFlows = this.extractDataFlowPatterns(chunks);

    for (const mapping of mappings) {
      const componentType = this.inferComponentType(mapping.topic);
      const operation = this.inferOperation(mapping.topic);

      if (!patterns.has(componentType)) {
        patterns.set(componentType, { componentType, operations: {} });
      }

      const pattern = patterns.get(componentType)!;
      if (!pattern.operations[operation]) {
        pattern.operations[operation] = {
          pluginSequenceMappings: [],
          eventSequences: [],
          dataFlowPatterns: [],
          averageDuration: 0,
          frequency: 0,
        };
      }

      pattern.operations[operation].pluginSequenceMappings.push(mapping);
    }

    for (const pattern of patterns.values()) {
      for (const operation of Object.keys(pattern.operations)) {
        const opData = pattern.operations[operation];

        opData.eventSequences = sequences.filter((seq) =>
          opData.pluginSequenceMappings.some((m) => m.sequenceId === seq.sequenceId)
        );

        if (opData.eventSequences.length > 0) {
          opData.averageDuration =
            opData.eventSequences.reduce((sum, seq) => sum + seq.totalDuration, 0) /
            opData.eventSequences.length;
        }

        opData.frequency = opData.eventSequences.length;

        opData.dataFlowPatterns = dataFlows.filter((df) =>
          opData.eventSequences.some((seq) =>
            seq.movements.some((mov) => mov.beats.some((beat) => beat.event === df.event))
          )
        );

      }
    }

    return Array.from(patterns.values());
  }

  /*
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
>>>>>>> origin/main
      }
    }

    return Array.from(patterns.values());
  }

*/

  private extractPluginSequenceMappings(chunks: LogChunk[]): PluginSequenceMapping[] {
    const mappings: PluginSequenceMapping[] = [];
    const seen = new Set<string>();

    for (const chunk of chunks) {
      for (const line of chunk.lines) {
        const routingMatch = line.match(/\[topics\]\s+Routing\s+'([^']+)'\s+->\s+(\w+)::([a-z0-9\-]+)/);
        if (routingMatch) {
          const [, topic, pluginId, sequenceId] = routingMatch;
          const key = `${topic}:${pluginId}:${sequenceId}`;
          if (!seen.has(key)) {
            seen.add(key);
            mappings.push({
              topic,
              pluginId,
              sequenceId,
              sequenceName: this.inferSequenceName(sequenceId),
            });
          }
        }
      }
    }

    return mappings;
  }

  private extractEventSequences(chunks: LogChunk[]): EventSequence[] {
    const sequences: Map<string, EventSequence> = new Map();
    let currentSequence: EventSequence | null = null;
    let currentMovement: Movement | null = null;

    for (const chunk of chunks) {
      for (const line of chunk.lines) {
        const playMatch = line.match(/PluginInterfaceFacade\.play\(\):\s+\w+\s+->\s+([a-z0-9\-]+)/);
        if (playMatch) {
          const sequenceId = playMatch[1];
          if (!sequences.has(sequenceId)) {
            currentSequence = {
              sequenceId,
              sequenceName: this.inferSequenceName(sequenceId),
              movements: [],
              totalDuration: 0,
              eventCount: 0,
            };
            sequences.set(sequenceId, currentSequence);
          } else {
            currentSequence = sequences.get(sequenceId)!;
          }
        }

        const movementMatch = line.match(/Movement Started:\s+(\w+)\s+\((\d+)\s+beats\)/);
        if (movementMatch && currentSequence) {
          const [, name] = movementMatch;
          currentMovement = { name, beats: [], duration: 0 };
          currentSequence.movements.push(currentMovement);
        }

        const beatMatch = line.match(/Beat\s+(\d+)\s+Started:\s+([^(]+)\s+\(([^)]+)\)/);
        if (beatMatch && currentMovement) {
          const [, beatNum, title, event] = beatMatch;
          currentMovement.beats.push({
            number: parseInt(beatNum),
            title: title.trim(),
            event,
            duration: 0,
          });
        }

        const beatDurationMatch = line.match(/Beat\s+(\d+)\s+\(([^)]+)\)\s+completed in\s+([\d.]+)ms/);
        if (beatDurationMatch && currentMovement) {
          const [, beatNum, , duration] = beatDurationMatch;
          const beat = currentMovement.beats.find((b) => b.number === parseInt(beatNum));
          if (beat) {
            beat.duration = parseFloat(duration);
            currentMovement.duration += beat.duration;
          }
        }

        const seqDurationMatch = line.match(/Sequence\s+"[^"]+"\s+completed in\s+(\d+)ms/);
        if (seqDurationMatch && currentSequence) {
          currentSequence.totalDuration = parseInt(seqDurationMatch[1]);
          currentSequence.eventCount = currentSequence.movements.reduce(
            (sum, m) => sum + m.beats.length,
            0
          );
        }
      }
    }

    return Array.from(sequences.values());
  }

  private extractDataFlowPatterns(chunks: LogChunk[]): DataFlowPattern[] {
    const patterns: DataFlowPattern[] = [];

    for (const chunk of chunks) {
      for (const line of chunk.lines) {
        const addMatch = line.match(/DataBaton:\s+\+([^|]+)\s+\|\s+.*event=([^\s]+)(?:\s+handler=([^\s]+))?(?:\s+plugin=([^\s]+))?/);
        if (addMatch) {
          const [, fields, event, handler, plugin] = addMatch;
          patterns.push({
            event,
            handler,
            pluginId: plugin,
            changes: fields.split(',').map((f) => f.trim()),
            changeType: 'added',
          });
        }

        const removeMatch = line.match(/DataBaton:\s+~([^|]+)\s+\|\s+.*event=([^\s]+)(?:\s+handler=([^\s]+))?(?:\s+plugin=([^\s]+))?/);
        if (removeMatch) {
          const [, fields, event, handler, plugin] = removeMatch;
          patterns.push({
            event,
            handler,
            pluginId: plugin,
            changes: fields.split(',').map((f) => f.trim()),
            changeType: 'removed',
          });
        }
      }
    }

    return patterns;
  }

  private inferComponentType(topic: string): string {
    if (topic.includes('canvas.component')) return 'canvas-component';
    if (topic.includes('canvas.line')) return 'canvas-line';
    if (topic.includes('library.component')) return 'library-component';
    if (topic.includes('library')) return 'library';
    if (topic.includes('control.panel')) return 'control-panel';
    return 'unknown';
  }

  /**
   * Examples:
   * - library.load.requested -> load
   * - canvas.component.create.requested -> create
   */
  private inferOperation(topic: string): string {
    let cleanTopic = topic.replace(/\.requested$/, '');
    const parts = cleanTopic.split('.');
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      if (
        part &&
        part !== 'component' &&
        part !== 'line' &&
        part !== 'canvas' &&
        part !== 'library' &&
        part !== 'control' &&
        part !== 'panel'
      ) {
        return part;
      }
    }
    return parts[parts.length - 1] || 'unknown';
  }

  private inferSequenceName(sequenceId: string): string {
    return sequenceId
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}

