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

    // Optional runtime validation: gate by feature flag
    try {
      if (isFlagEnabled("lint.topics.runtime-validate") && def.payloadSchema) {
        // Lazy import ajv if present; avoid adding dependency requirement
        const Ajv = (await import("ajv")).default;
        const ajv = new Ajv({ allErrors: true, strict: false });
        const validate = ajv.compile(def.payloadSchema);
        if (!validate(payload)) {
          const msg = (validate.errors || []).map((e) => `${e.instancePath} ${e.message}`).join("; ");
          throw new Error(`Payload validation failed for ${topic}: ${msg}`);
        }
      }
    } catch {}

    // Perf guards
    let deliver = async (p: any) => {
      // Route to sequences via conductor
      for (const r of def.routes as TopicRoute[]) {
        await conductor?.play?.(r.pluginId, r.sequenceId, p);
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

    await deliver(payload);
  },
};

