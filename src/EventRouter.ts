import { getTopicDef, initTopicsManifest, type TopicRoute } from "./topicsManifest";
import { isFlagEnabled } from "./feature-flags/flags";

export type Unsubscribe = () => void;
export type TopicHandler = (payload: any) => void;

const subscribers = new Map<string, Set<TopicHandler>>();

function throttle(fn: Function, ms: number) {
  let last = 0;
  let pending: any = null;
  return (arg: any) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(arg);
    } else {
      pending = arg;
      setTimeout(() => {
        const n2 = Date.now();
        if (n2 - last >= ms && pending !== null) {
          last = n2;
          const p = pending;
          pending = null;
          fn(p);
        }
      }, ms - (now - last));
    }
  };
}

function debounce(fn: Function, ms: number) {
  let t: any = null;
  return (arg: any) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(arg), ms);
  };
}

const __publishStack: string[] = [];

export const EventRouter = {
  async init() {
    await initTopicsManifest();
  },

  subscribe(topic: string, handler: TopicHandler): Unsubscribe {
    const set = subscribers.get(topic) || new Set<TopicHandler>();
    set.add(handler);
    subscribers.set(topic, set);
    return () => {
      const s = subscribers.get(topic);
      if (!s) return;
      s.delete(handler);
      if (s.size === 0) subscribers.delete(topic);
    };
  },

  async publish(topic: string, payload: any, conductor?: any) {
    const def = getTopicDef(topic);
    if (!def) throw new Error(`Unknown topic: ${topic}`);

    // Reentrancy guard: block immediate same-topic republish in the current call stack
    if (__publishStack.includes(topic)) {
      try { console.warn(`[topics] Blocking immediate republish of '${topic}' to prevent feedback loop`); } catch {}
      return;
    }

    // Optional runtime validation: gate by feature flag
    try {
      if (isFlagEnabled("lint.topics.runtime-validate") && def.payloadSchema) {
        // Lazy import ajv if present; avoid adding dependency requirement
        const AjvMod: any = await import("ajv");
        const Ajv: any = AjvMod?.default || AjvMod;
        const ajv: any = new Ajv({ allErrors: true });
        const validate: any = ajv.compile(def.payloadSchema as any);
        if (!validate(payload)) {
          const errs: any[] = (validate.errors || []) as any[];
          const msg = errs.map((e: any) => `${(e.instancePath || e.dataPath || "")} ${(e.message || "")}`.trim()).join("; ");
          throw new Error(`Payload validation failed for ${topic}: ${msg}`);
        }
      }
    } catch {}

    // Resolve conductor: prefer provided; otherwise fall back to global
    const resolvedConductor = (conductor && typeof conductor.play === 'function')
      ? conductor
      : (typeof window !== 'undefined'
          ? ((window as any).RenderX?.conductor || (window as any).renderxCommunicationSystem?.conductor)
          : undefined);

    // Perf guards
    let deliver = async (p: any) => {
      // Route to sequences via conductor (pure dispatcher)
      for (const r of def.routes as TopicRoute[]) {
        try {
          const hasPlay = !!(resolvedConductor && typeof resolvedConductor.play === 'function');
          try { console.log(`[topics] Routing '${topic}' -> ${r.pluginId}::${r.sequenceId} (hasPlay=${hasPlay})`); } catch {}
          await resolvedConductor?.play?.(r.pluginId, r.sequenceId, p);
        } catch (e) {
          try { console.warn(`[topics] Failed to route '${topic}' -> ${r.pluginId}::${r.sequenceId}:`, e); } catch {}
        }
      }
      // Notify subscribers
      const set = subscribers.get(topic);
      if (set) for (const h of Array.from(set)) try { h(p); } catch {}
    };

    const perf = def.perf || {};
    if (typeof perf.throttleMs === "number" && perf.throttleMs > 0) {
      const d = deliver;
      const t = throttle((x: any) => d(x), perf.throttleMs);
      t(payload);
      return;
    }
    if (typeof perf.debounceMs === "number" && perf.debounceMs > 0) {
      const d = deliver;
      const f = debounce((x: any) => d(x), perf.debounceMs);
      f(payload);
      return;
    }

    __publishStack.push(topic);
    try {
      await deliver(payload);
    } finally {
      __publishStack.pop();
    }
  },
};

