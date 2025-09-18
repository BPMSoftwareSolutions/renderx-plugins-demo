/* Host-side cssRegistry facade (Phase 2 groundwork)
 * Exposes minimal APIs per ADR-0026 and forwards ops via EventRouter topics.
 *
 * Note: This thin facade is for runtime bridging to plugins via SDK. It does not
 * directly synchronize with the Control Panel store; it publishes requests.
 */
import { EventRouter } from "../core/events/EventRouter";
import { initConductor } from "../core/conductor";

export type CssRegistryFacade = {
  hasClass: (className: string) => Promise<boolean>;
  createClass: (id: string, className: string, content: string) => Promise<void>;
  updateClass: (id: string, className: string, content: string) => Promise<void>;
};

async function getConductor() {
  try {
    const g: any = (globalThis as any);
    const c = g?.window?.renderxCommunicationSystem?.conductor;
    if (c) return c;
  } catch {}
  return await initConductor();
}

export const cssRegistry: CssRegistryFacade = {
  async hasClass(_className: string) {
    // Minimal placeholder; real implementation will query host store via SDK in future
    return false;
  },
  async createClass(id: string, className: string, content: string) {
    const conductor = await getConductor();
    await EventRouter.publish("control.panel.css.create.requested", { id, className, content }, conductor);
  },
  async updateClass(id: string, className: string, content: string) {
    const conductor = await getConductor();
    await EventRouter.publish("control.panel.css.edit.requested", { id, className, content }, conductor);
  },
};

