// Interaction manifest loader (migrated from src/interactionManifest.ts)
type Route = { pluginId: string; sequenceId: string };
let routes: Record<string, Route> = {};
let loaded = false;

// Built-in defaults to guarantee test/runtime stability even if manifest isn't preloaded
const DEFAULT_ROUTES: Record<string, Route> = {
	'library.load': { pluginId: 'LibraryPlugin', sequenceId: 'library-load-symphony' },
	// Removed hardcoded library-component routes - now auto-derived from external package sequences
	'canvas.component.create': { pluginId: 'CanvasComponentPlugin', sequenceId: 'canvas-component-create-symphony' },
	'canvas.component.drag.move': { pluginId: 'CanvasComponentDragPlugin', sequenceId: 'canvas-component-drag-symphony' },
	'canvas.component.select': { pluginId: 'CanvasComponentSelectionPlugin', sequenceId: 'canvas-component-select-symphony' },
	'canvas.component.resize.start': { pluginId: 'CanvasComponentResizeStartPlugin', sequenceId: 'canvas-component-resize-start-symphony' },
	'canvas.component.resize.move': { pluginId: 'CanvasComponentResizeMovePlugin', sequenceId: 'canvas-component-resize-move-symphony' },
	'canvas.component.resize.end': { pluginId: 'CanvasComponentResizeEndPlugin', sequenceId: 'canvas-component-resize-end-symphony' },
	'control.panel.selection.show': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-selection-show-symphony' },
	'control.panel.classes.add': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-classes-add-symphony' },
	'control.panel.classes.remove': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-classes-remove-symphony' },
	'control.panel.update': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-update-symphony' },
	'control.panel.css.create': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-css-create-symphony' },
	'control.panel.css.edit': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-css-edit-symphony' },
	'control.panel.css.delete': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-css-delete-symphony' },
	'control.panel.ui.init': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-ui-init-symphony' },
	'control.panel.ui.render': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-ui-render-symphony' },
	'control.panel.ui.field.change': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-ui-field-change-symphony' },
	'control.panel.ui.field.validate': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-ui-field-validate-symphony' },
	'control.panel.ui.section.toggle': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-ui-section-toggle-symphony' },
	'control.panel.ui.init.batched': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-ui-init-batched-symphony' },
	'canvas.component.update': { pluginId: 'CanvasComponentPlugin', sequenceId: 'canvas-component-update-symphony' },
	'canvas.component.deselect': { pluginId: 'CanvasComponentDeselectionPlugin', sequenceId: 'canvas-component-deselect-symphony' },
	'canvas.component.deselect.all': { pluginId: 'CanvasComponentDeselectionPlugin', sequenceId: 'canvas-component-deselect-all-symphony' },
};

// Removed static eager preload to avoid dual static+dynamic import warnings in Vite.

async function loadManifest(): Promise<void> {
	try {
		const isBrowser = typeof globalThis !== 'undefined' && typeof (globalThis as any).fetch === 'function';
		if (isBrowser) {
			const res = await fetch('/interaction-manifest.json');
			if (res.ok) {
				const json = await res.json();
				routes = json?.routes || {};
				loaded = true;
				return;
			}
		}
		// Node/tests fallback: import raw JSON at repo root
		// @ts-ignore - Vite raw JSON import
		const mod = await import(/* @vite-ignore */ '../../../interaction-manifest.json?raw');
		const text: string = (mod as any)?.default || (mod as any) || '{}';
		const json = JSON.parse(text);
		routes = json?.routes || {};
		loaded = true;
		return;
	} catch {}
	try {
		// Fallback: direct JSON module import for test environments
		// @ts-ignore
		const jsonMod = await import(/* @vite-ignore */ '../../../interaction-manifest.json');
		const json = (jsonMod as any)?.default || (jsonMod as any) || {};
		routes = json?.routes || {};
		loaded = true;
		return;
	} catch {
		console.warn('[interactionManifest] Failed to load interaction-manifest.json; using defaults only');
		routes = {};
		loaded = true; // avoid retry storms; callers can handle missing keys
	}
}

export async function initInteractionManifest(): Promise<void> {
	if (!loaded) await loadManifest();
}

export function resolveInteraction(key: string): Route {
	if (!loaded) {
		// Lazy trigger load; not awaited to keep call sites simple. Tests should init explicitly.
		// @ts-ignore
		loadManifest();
		// Use defaults immediately to avoid empty ids in early calls (tests)
		if (!loaded) {
			routes = { ...DEFAULT_ROUTES };
			loaded = true;
		}
	}
	const r = routes[key] || DEFAULT_ROUTES[key];
	if (!r) throw new Error(`Unknown interaction: ${key}`);
	return r;
}

// Diagnostics for startup validation
export function getInteractionManifestStats() {
	return { loaded, routeCount: Object.keys(routes).length };
}
