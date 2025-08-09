/**
 * ConductorLogger - Phase 1
 * Nested logging of sequence/movement/beat and plugin handler messages.
 */

import { EventBus } from "../../EventBus.js";
import { MUSICAL_CONDUCTOR_EVENT_TYPES } from "../SequenceTypes.js";

interface Scope {
  type: "sequence" | "movement" | "beat" | "handler";
  label: string;
}

interface LogEvent {
  level: "log" | "info" | "warn" | "error";
  message: any[];
  requestId?: string;
  pluginId?: string;
  handlerName?: string;
}

export class ConductorLogger {
  private eventBus: EventBus;
  private stacks: Map<string, Scope[]> = new Map();
  private enabled: boolean;

  constructor(eventBus: EventBus, enabled = true) {
    this.eventBus = eventBus;
    this.enabled = enabled;
  }

  init(): void {
    if (!this.enabled) return;

    // Sequence scope
    this.eventBus.subscribe(
      MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_STARTED,
      (data: any) => this.push(data.requestId, {
        type: "sequence",
        label: `🎼 ${data.sequenceName}`,
      })
    );
    this.eventBus.subscribe(
      MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_COMPLETED,
      (data: any) => this.pop(data.requestId, "sequence")
    );

    // Movement scope
    this.eventBus.subscribe(
      MUSICAL_CONDUCTOR_EVENT_TYPES.MOVEMENT_STARTED,
      (data: any) => this.push(data.requestId, {
        type: "movement",
        label: `🎵 ${data.movementName}`,
      })
    );
    this.eventBus.subscribe(
      MUSICAL_CONDUCTOR_EVENT_TYPES.MOVEMENT_COMPLETED,
      (data: any) => this.pop(data.requestId, "movement")
    );

    // Beat scope
    this.eventBus.subscribe(
      MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_STARTED,
      (data: any) => this.push(data.requestId, {
        type: "beat",
        label: `🥁 ${data.beat}: ${data.event}`,
      })
    );
    this.eventBus.subscribe(
      MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_COMPLETED,
      (data: any) => this.pop(data.requestId, "beat")
    );
    this.eventBus.subscribe(
      MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_FAILED,
      (data: any) => this.pop(data.requestId, "beat")
    );

    // Handler scopes (emitted by PluginManager wrapping)
    this.eventBus.subscribe("plugin:handler:start", (data: any) =>
      this.push(data.requestId, {
        type: "handler",
        label: `🔧 ${data.pluginId}.${data.handlerName}`,
      })
    );
    this.eventBus.subscribe("plugin:handler:end", (data: any) =>
      this.pop(data.requestId, "handler")
    );

    // Plugin log messages
    this.eventBus.subscribe("musical-conductor:log", (evt: LogEvent) => {
      const indent = this.getIndent(evt.requestId);
      const prefix = evt.pluginId
        ? `🧩 ${evt.pluginId}${evt.handlerName ? "." + evt.handlerName : ""}`
        : "🎼";
      const line = `${indent}${prefix}`;
      switch (evt.level) {
        case "warn":
          console.warn(line, ...evt.message);
          break;
        case "error":
          console.error(line, ...evt.message);
          break;
        case "info":
        case "log":
        default:
          console.log(line, ...evt.message);
      }
    });
  }

  private push(requestId: string | undefined, scope: Scope): void {
    const key = requestId || "__global__";
    const stack = this.stacks.get(key) || [];
    stack.push(scope);
    this.stacks.set(key, stack);
    const indent = this.getIndent(requestId);
    console.log(`${indent}${scope.label}`);
  }

  private pop(requestId: string | undefined, type: Scope["type"]): void {
    const key = requestId || "__global__";
    const stack = this.stacks.get(key) || [];
    // Pop last matching type
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].type === type) {
        stack.splice(i, 1);
        break;
      }
    }
    this.stacks.set(key, stack);
  }

  private getIndent(requestId?: string): string {
    const key = requestId || "__global__";
    const depth = (this.stacks.get(key) || []).length;
    return "  ".repeat(Math.max(0, depth));
  }
}

