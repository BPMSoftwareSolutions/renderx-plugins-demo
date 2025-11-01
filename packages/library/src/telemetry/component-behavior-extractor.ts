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

