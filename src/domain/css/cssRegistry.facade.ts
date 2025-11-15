// Inlined implementation (Phase 2) formerly at src/cssRegistry/facade.ts
// Host-side cssRegistry facade
import { EventRouter } from '@renderx-plugins/host-sdk';
import { initConductor } from '@renderx-plugins/host-sdk/core/conductor/conductor';

export type CssRegistryFacade = {
	hasClass: (className: string) => Promise<boolean>;
	createClass: (id: string, className: string, content: string) => Promise<void>;
	updateClass: (id: string, className: string, content: string) => Promise<void>;
};

async function getConductor() {
	try {
		// Check for our new global conductor first
		const globalCond = (window as any).renderxGlobalConductor;
		if (globalCond) return globalCond;
		
		// Fallback to legacy global reference
		const g: any = (globalThis as any);
		const c = g?.window?.renderxCommunicationSystem?.conductor;
		if (c) return c;
	} catch {}
	// Last resort: initialize new conductor (though this should be rare now)
	console.warn('🎼 CSS Registry: Creating new conductor instance - consider checking initialization order');
	return await initConductor();
}

export const cssRegistry: CssRegistryFacade = {
	async hasClass(_className: string) {
		return false;
	},
	async createClass(id: string, className: string, content: string) {
		const conductor = await getConductor();
		await EventRouter.publish('control.panel.css.create.requested', { id, className, content }, conductor);
	},
	async updateClass(id: string, className: string, content: string) {
		const conductor = await getConductor();
		await EventRouter.publish('control.panel.css.edit.requested', { id, className, content }, conductor);
	},
};

