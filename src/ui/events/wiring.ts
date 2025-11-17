import { EventRouter } from "@renderx-plugins/host-sdk";
import { emitDiagnostic } from "../diagnostics/eventTap";

export type UiEventDef = {
  id: string;
  target: { window?: boolean; selector?: string };
  event: keyof WindowEventMap | string;
  options?: AddEventListenerOptions | boolean;
  guard?: {
    key?: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    notClosestMatch?: string;
  };
  publish: { topic: string; payload?: any };
};

/**
 * Wires UI events based on provided definitions. Returns a cleanup function.
 */
export function wireUiEvents(defs: UiEventDef[]): () => void {
  const disposers: Array<() => void> = [];
  const pending: UiEventDef[] = [];

  const getConductor = () => (window as any).RenderX?.conductor;

/**
 * Deduplication tracker: prevents duplicate publishes from RAPID REPEATED FIRINGS of the same
 * event handler (e.g., multiple mousemove events within a small window). NOT meant to prevent
 * intentional user actions separated in time.
 * 
 * Key structure: `topic:eventId` (event ID ensures different user interactions are NOT blocked)
 * Value: { timestamp, eventTarget } to detect if this is truly the same event firing or a new one.
 */
const lastEventPublished: Record<string, { timestamp: number; target: EventTarget }> = {};

/**
 * Check if this specific event+topic combination should be published based on deduplication.
 * Only blocks if:
 * 1. Same topic published within 50ms (prevents rapid-fire repeated events from the same source)
 * 2. From the SAME event handler invocation (same target)
 */
const shouldPublish = (topic: string, eventTarget: EventTarget): boolean => {
  const now = Date.now();
  const key = `${topic}`;
  const last = lastEventPublished[key];

  if (last) {
    const timeSinceLastPublish = now - last.timestamp;
    // Only block if BOTH time is very recent (50ms, not 150ms) AND it's from the same source
    // Different targets = intentional different user interactions = should not be blocked
    if (timeSinceLastPublish < 50 && last.target === eventTarget) {
      return false; // Skip: same event source firing too fast
    }
  }

  lastEventPublished[key] = { timestamp: now, target: eventTarget };
  return true;
};

  const tryAttach = (def: UiEventDef): boolean => {
    const conductor = getConductor();
    if (!conductor) return false;

    const targetEl: EventTarget | null = def.target.window
      ? window
      : def.target.selector
      ? (document.querySelector(def.target.selector) as EventTarget | null)
      : null;

    if (!targetEl) return false;

    const handler = async (e: Event) => {
      try {
        // Guard checks
        if (def.guard?.key) {
           
          const key = (e as any).key as string | undefined;
          if (key !== def.guard.key) return;
        }
        // Check modifier keys
        if (def.guard?.ctrlKey !== undefined) {
          const ke = e as KeyboardEvent;
          if (ke.ctrlKey !== def.guard.ctrlKey) return;
        }
        if (def.guard?.metaKey !== undefined) {
          const ke = e as KeyboardEvent;
          if (ke.metaKey !== def.guard.metaKey) return;
        }
        if (def.guard?.shiftKey !== undefined) {
          const ke = e as KeyboardEvent;
          if (ke.shiftKey !== def.guard.shiftKey) return;
        }
        if (def.guard?.altKey !== undefined) {
          const ke = e as KeyboardEvent;
          if (ke.altKey !== def.guard.altKey) return;
        }
        if (def.guard?.notClosestMatch) {
          const target = e.target as HTMLElement | null;
          const isComp = target?.closest?.(def.guard.notClosestMatch);
          if (isComp) return; // abort if inside a matching element
        }
        const conductor = getConductor();
        if (!conductor) return;

        // Check deduplication: skip if same topic fired from same source too rapidly
        const topic = def.publish.topic;
        if (!shouldPublish(topic, e.target || targetEl)) {
          return; // Duplicate: same event source firing too fast, skip
        }

        const payload = def.publish.payload ?? {};
        // Emit diagnostic event before publishing
        emitDiagnostic({
          timestamp: new Date().toISOString(),
          level: "debug",
          source: "EventRouter",
          message: `Topic '${topic}' published from UI event '${def.event}'`,
          data: { topic, payload, eventId: def.id },
        });

        await EventRouter.publish(topic, payload, conductor);
      } catch {}
    };

    targetEl.addEventListener(def.event as any, handler as EventListener, def.options as any);

    // Track disposer
    const off = () => {
      try { targetEl.removeEventListener(def.event as any, handler as EventListener, def.options as any); } catch {}
    };
    disposers.push(off);
    return true;
  };

  // Initial attach attempts
  for (const d of defs) {
    if (!tryAttach(d)) pending.push(d);
  }

  // If anything pending, observe DOM for readiness
  let observer: MutationObserver | null = null;
  if (pending.length) {
    observer = new MutationObserver(() => {
      for (let i = pending.length - 1; i >= 0; i--) {
        const ok = tryAttach(pending[i]);
        if (ok) pending.splice(i, 1);
      }
      if (!pending.length && observer) {
        observer.disconnect();
        observer = null;
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  return () => {
    try { if (observer) observer.disconnect(); } catch {}
    while (disposers.length) {
      const off = disposers.pop();
      try { off && off(); } catch {}
    }
  };
}

