import React from "react";
import { EventRouter as SdkEventRouter } from "@renderx-plugins/host-sdk";
import {
  controlPanelReducer,
  initialControlPanelState,
} from "../state/control-panel.reducer";
import type { ControlPanelAction as _ControlPanelAction } from "../types/control-panel.types";

export function useControlPanelState() {
  const [state, dispatch] = React.useReducer(
    controlPanelReducer,
    initialControlPanelState
  );

  React.useEffect(() => {
    // Resolve EventRouter references. For UI subscriptions we PREFER the host global router,
    // because selection updates are published via window.RenderX.EventRouter by the symphonies.
    const globalRouter = (globalThis as any)?.RenderX?.EventRouter;
    const hasGlobal = !!(globalRouter && typeof globalRouter.subscribe === 'function');
    const hasSdk = !!(SdkEventRouter && typeof (SdkEventRouter as any).subscribe === 'function');

    try {
      console.log('[cp] useControlPanelState: mounting subscriptions', {
        hasSdkRouter: !!SdkEventRouter,
        sdkHasSubscribe: hasSdk,
        hasGlobalRouter: !!(globalThis as any)?.RenderX?.EventRouter,
        globalHasSubscribe: hasGlobal,
      });
    } catch {}

    if (!hasGlobal && !hasSdk) {
      try { console.warn('[cp] useControlPanelState: No EventRouter available; UI will not react to selection updates'); } catch {}
      return () => {};
    }

    const unsubs: Array<() => void> = [];

    const subscribeWith = (router: any, label: string) => {
      try {
        const u1 = router.subscribe('control.panel.selection.updated', (selectionModel: any) => {
          try { console.log(`[cp] useControlPanelState:${label} selection.updated`, { id: selectionModel?.header?.id, type: selectionModel?.header?.type }); } catch {}
          dispatch({ type: "SET_SELECTED_ELEMENT", payload: selectionModel });
          dispatch({ type: "SET_CLASSES", payload: selectionModel?.classes || [] });
        });
        const u2 = router.subscribe('control.panel.classes.updated', (classData: any) => {
          try { console.log(`[cp] useControlPanelState:${label} classes.updated`, { count: Array.isArray(classData?.classes) ? classData.classes.length : 0 }); } catch {}
          if (classData?.classes) {
            dispatch({ type: "SET_CLASSES", payload: classData.classes });
          }
        });
        if (typeof u1 === 'function') unsubs.push(u1);
        if (typeof u2 === 'function') unsubs.push(u2);
      } catch (e) {
        try { console.warn(`[cp] useControlPanelState: failed to subscribe via ${label}:`, e); } catch {}
      }
    };

    // Prefer global router, but also subscribe to SDK router if it's a different instance
    if (hasGlobal) subscribeWith(globalRouter, 'global');
    if (hasSdk && SdkEventRouter !== globalRouter) subscribeWith(SdkEventRouter as any, 'sdk');

    return () => {
      for (const u of unsubs) {
        try { u(); } catch {}
      }
    };
  }, []);

  return { state, dispatch };
}
