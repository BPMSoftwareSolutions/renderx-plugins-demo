import type { EventBus } from "../../EventBus.js";

export type StageOp =
  | { op: "classes.add"; selector: string; value: string }
  | { op: "classes.remove"; selector: string; value: string }
  | { op: "attr.set"; selector: string; key: string; value: string }
  | { op: "style.set"; selector: string; key: string; value: string }
  | {
      op: "create";
      tag: string;
      parent: string;
      attrs?: Record<string, string>;
      classes?: string[];
    }
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

  update(
    selector: string,
    opts: {
      classes?: { add?: string[]; remove?: string[] };
      attrs?: Record<string, string>;
      style?: Record<string, string>;
    }
  ): BeatTxn {
    if (opts?.classes?.add) {
      for (const v of opts.classes.add)
        this.ops.push({ op: "classes.add", selector, value: v });
    }
    if (opts?.classes?.remove) {
      for (const v of opts.classes.remove)
        this.ops.push({ op: "classes.remove", selector, value: v });
    }
    if (opts?.attrs) {
      for (const [k, v] of Object.entries(opts.attrs))
        this.ops.push({ op: "attr.set", selector, key: k, value: v });
    }
    if (opts?.style) {
      for (const [k, v] of Object.entries(opts.style))
        this.ops.push({ op: "style.set", selector, key: k, value: v });
    }
    return this;
  }

  create(
    tag: string,
    opts: { classes?: string[]; attrs?: Record<string, string> }
  ) {
    const record: any = { op: "create", tag };
    if (opts?.classes?.length) record.classes = [...opts.classes];
    if (opts?.attrs) record.attrs = { ...opts.attrs };
    return {
      appendTo: (parent: string) => {
        this.ops.push({ ...record, parent });
        return this;
      },
    } as any;
  }

  remove(selector: string): BeatTxn {
    this.ops.push({ op: "remove", selector });
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
