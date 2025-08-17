import type { EventBus } from "../../EventBus.js";

export type StageOp =
  | { op: "classes.add"; selector: string; value: string }
  | { op: "classes.remove"; selector: string; value: string }
  | { op: "attr.set"; selector: string; key: string; value: string }
  | { op: "style.set"; selector: string; key: string; value: string }
  | { op: "remove"; selector: string };

export interface BeatTxnMeta {
  handlerName?: string;
  [k: string]: any;
}

export interface StageCueLog {
  pluginId: string;
  correlationId: string;
  operations: StageOp[];
  meta?: BeatTxnMeta;
}

class BeatTxn {
  private ops: StageOp[] = [];
  constructor(
    private eventBus: EventBus,
    private pluginId: string,
    private correlationId: string,
    private meta?: BeatTxnMeta
  ) {}

  update(selector: string, opts: { classes?: { add?: string[]; remove?: string[] } }): BeatTxn {
    if (opts?.classes?.add) {
      for (const v of opts.classes.add) this.ops.push({ op: "classes.add", selector, value: v });
    }
    if (opts?.classes?.remove) {
      for (const v of opts.classes.remove) this.ops.push({ op: "classes.remove", selector, value: v });
    }
    return this;
  }

  commit(): void {
    const cue: StageCueLog = {
      pluginId: this.pluginId,
      correlationId: this.correlationId,
      operations: [...this.ops],
      meta: this.meta,
    };
    // Emit synchronously for test observability; can switch to async/rAF later
    (this.eventBus as any).emit("stage:cue", cue);
  }
}

export class StageCrew {
  constructor(private eventBus: EventBus, private pluginId: string) {}
  beginBeat(correlationId: string, meta?: BeatTxnMeta) {
    return new BeatTxn(this.eventBus, this.pluginId, correlationId, meta);
  }
}

