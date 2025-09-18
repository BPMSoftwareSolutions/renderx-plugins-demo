// Runtime loaders & JSON sequence catalog mounting (migrated from src/conductor.ts)
// Type declarations for plugin packages may be absent; dynamic imports are intentionally untyped.
import { isBareSpecifier, normalizeHandlersImportSpec } from '../../infrastructure/handlers/handlersPath';
import { resolveModuleSpecifier } from './conductor';

// Statically known runtime package loaders to ensure Vite can analyze and bundle
export const runtimePackageLoaders: Record<string, () => Promise<any>> = {
	// @ts-ignore missing d.ts (external plugin package)
	'@renderx-plugins/header': () => import('@renderx-plugins/header'),
	// @ts-ignore missing d.ts
	'@renderx-plugins/library': () => import('@renderx-plugins/library'),
	// @ts-ignore missing d.ts
	'@renderx-plugins/library-component': () => import('@renderx-plugins/library-component'),
	// @ts-ignore missing d.ts
	'@renderx-plugins/canvas': () => import('@renderx-plugins/canvas'),
	// @ts-ignore missing d.ts
	'@renderx-plugins/canvas-component': () => import('@renderx-plugins/canvas-component'),
	// @ts-ignore missing d.ts
	'@renderx-plugins/control-panel': () => import('@renderx-plugins/control-panel'),
};

export type ConductorClient = any; // re-declared for local file cohesion

// Loads and mounts sequences from per-plugin JSON catalogs.
export async function loadJsonSequenceCatalogs(
	conductor: ConductorClient,
	pluginIds?: string[]
) {
	let artifactsDir: string | null = null;
	try { const envMod = await import(/* @vite-ignore */ '../environment/env'); artifactsDir = (envMod as any).getArtifactsDir?.() || null; } catch {}
	let plugins: string[] = pluginIds || [];
	if (!plugins.length) {
		let manifest: any = null; let externalOnly = false;
		try {
			const isBrowser = typeof window !== 'undefined' && typeof (globalThis as any).fetch === 'function';
			if (isBrowser) {
				try { const res = await fetch('/plugins/plugin-manifest.json'); if (res.ok) manifest = await res.json(); } catch {}
			}
			if (!manifest) {
				if (artifactsDir) {
					externalOnly = true;
					try {
						const fs = await import('fs/promises');
						const path = await import('path');
						const procAny: any = (globalThis as any).process;
						const cwd = procAny && typeof procAny.cwd === 'function' ? procAny.cwd() : '';
						const p = path.join(cwd, artifactsDir, 'plugins', 'plugin-manifest.json');
						const raw = await fs.readFile(p, 'utf-8').catch(()=>null as any);
						if (raw) manifest = JSON.parse(raw || '{}');
					} catch {}
				}
				if (!externalOnly) {
					try {
						// @ts-ignore raw JSON import for dev fallback
						const mod = await import(/* @vite-ignore */ '../../../public/plugins/plugin-manifest.json?raw');
						const txt: string = (mod as any)?.default || (mod as any) || '{}';
						manifest = JSON.parse(txt);
					} catch {}
				}
			}
		} catch {}
		if (manifest && Array.isArray(manifest.plugins)) {
			plugins = Array.from(new Set(manifest.plugins.map((p: any) => p?.id).filter((id: any) => typeof id === 'string' && id.length)));
			try {
				const catalogDirs = new Set<string>();
				for (const p of manifest.plugins) {
					const modPath = p?.ui?.module;
					if (typeof modPath === 'string') { const m = modPath.match(/^\/plugins\/([^\/]+)\//); if (m) catalogDirs.add(m[1]); }
				}
				catalogDirs.add('library-component');
				catalogDirs.add('canvas-component');
				if (catalogDirs.size) {
					(conductor as any)._sequenceCatalogDirsFromManifest = Array.from(catalogDirs);
					plugins = Array.from(new Set([...(plugins || []), ...Array.from(catalogDirs)]));
				}
			} catch {}
		}
		try {
			const proc: any = (globalThis as any).process;
			if (proc && typeof proc.cwd === 'function') {
				const fs = await import('fs/promises');
				const path = await import('path');
				const base = artifactsDir ? path.resolve(proc.cwd(), artifactsDir, 'json-sequences') : path.join(proc.cwd(), 'json-sequences');
				const entries = await fs.readdir(base).catch(() => [] as string[]);
				const seqDirs = entries.filter((e: string) => !e.startsWith('.'));
				plugins = Array.from(new Set([...(plugins || []), ...seqDirs]));
			}
		} catch {}
	}
	(conductor as any)._discoveredPlugins = plugins;
	const isTestEnv = typeof import.meta !== 'undefined' && !!(import.meta as any).vitest;
	const forcedBrowser = typeof globalThis !== 'undefined' && (globalThis as any).__RENDERX_FORCE_BROWSER === true;
	const isBrowser = (forcedBrowser || !isTestEnv) && typeof globalThis !== 'undefined' && typeof (globalThis as any).window !== 'undefined' && typeof (globalThis as any).document !== 'undefined' && typeof (globalThis as any).fetch === 'function';

	type CatalogEntry = { file: string; handlersPath: string };
	type SequenceJson = { pluginId: string; id: string; name: string; movements: Array<{ id: string; name?: string; beats: Array<{ beat: number; event: string; title?: string; dynamics?: string; handler: string; timing?: string; kind?: string; }> }> };

	const seen = new Set<string>();
	const runtimeMounted: Set<string> = (conductor as any)._runtimeMountedSeqIds instanceof Set ? (conductor as any)._runtimeMountedSeqIds : new Set<string>(Array.isArray((conductor as any)._runtimeMountedSeqIds) ? (conductor as any)._runtimeMountedSeqIds : []);
	const mountFrom = async (seq: SequenceJson, handlersPath: string) => {
		try {
			if (seen.has(seq.id) || runtimeMounted.has(seq.id)) { (conductor as any).logger?.warn?.(`Sequence ${seq.id} already mounted; skipping`); return; }
			let spec = normalizeHandlersImportSpec(isBrowser, handlersPath);
			if (isBrowser && isBareSpecifier(handlersPath)) { try { spec = resolveModuleSpecifier(handlersPath); } catch {} }
			let mod: any = await import(/* @vite-ignore */ spec as any);
			const handlers = (mod as any)?.handlers || mod?.default?.handlers;
			if (!handlers) { (conductor as any).logger?.warn?.(`No handlers export found at ${handlersPath} for ${seq.id}`); }
			await (conductor as any)?.mount?.(seq, handlers, seq.pluginId);
			seen.add(seq.id); try { runtimeMounted.add(seq.id); (conductor as any)._runtimeMountedSeqIds = runtimeMounted; } catch {}
		} catch (e) { (conductor as any).logger?.warn?.(`Failed to mount sequence ${seq?.id} from ${handlersPath}: ${e}`); }
	};

	for (const plugin of plugins) {
		const dir = plugin === 'CanvasComponentPlugin' ? 'canvas-component' : plugin === 'LibraryPlugin' ? 'library' : plugin === 'ControlPanelPlugin' ? 'control-panel' : (plugin === 'HeaderThemePlugin' || plugin === 'HeaderControlsPlugin' || plugin === 'HeaderTitlePlugin') ? 'header' : plugin;
		try {
			let entries: CatalogEntry[] = [];
			if (isBrowser) { try { const idxRes = await fetch(`/json-sequences/${dir}/index.json`); if (idxRes.ok) { const idxJson = await idxRes.json(); entries = idxJson?.sequences || []; } } catch {} }
			if (!entries.length) {
				if (!isBrowser && artifactsDir) { try { const fs = await import('fs/promises'); const path = await import('path'); const procAny2: any = (globalThis as any).process; const cwd = procAny2 && typeof procAny2.cwd === 'function' ? procAny2.cwd() : ''; const idxPath = path.join(cwd, artifactsDir, 'json-sequences', dir, 'index.json'); const raw = await fs.readFile(idxPath, 'utf-8').catch(()=>null as any); if (raw) { const idxJson = JSON.parse(raw || '{}'); entries = idxJson?.sequences || []; } } catch {} }
						if (!entries.length && !artifactsDir) {
							// @ts-ignore raw JSON import
							const idxMod = await import(/* @vite-ignore */ `../../../json-sequences/${dir}/index.json?raw`);
							const idxText: string = (idxMod as any)?.default || (idxMod as any);
							const idxJson = JSON.parse(idxText || '{}');
							entries = idxJson?.sequences || [];
						}
			}
			const tasks = entries.map(async (ent) => {
				let seqJson: SequenceJson | null = null;
				if (isBrowser) { try { const filePath = ent.file.startsWith('/') ? ent.file : `/json-sequences/${dir}/${ent.file}`; const seqRes = await fetch(filePath); if (seqRes.ok) seqJson = await seqRes.json(); } catch {} }
				if (!seqJson && !isBrowser && artifactsDir) { try { const fs = await import('fs/promises'); const path = await import('path'); const procAny3: any = (globalThis as any).process; const cwd = procAny3 && typeof procAny3.cwd === 'function' ? procAny3.cwd() : ''; const seqPath = path.join(cwd, artifactsDir, 'json-sequences', dir, ent.file); const raw = await fs.readFile(seqPath, 'utf-8').catch(()=>null as any); if (raw) seqJson = JSON.parse(raw || '{}'); } catch {} }
						if (!seqJson && !artifactsDir) {
							// @ts-ignore raw JSON import
							const seqMod = await import(/* @vite-ignore */ `../../../json-sequences/${dir}/${ent.file}?raw`);
							const seqText: string = (seqMod as any)?.default || (seqMod as any);
							seqJson = JSON.parse(seqText || '{}');
						}
				await mountFrom(seqJson as SequenceJson, ent.handlersPath);
			});
			await Promise.all(tasks);
		} catch (e) { (conductor as any).logger?.warn?.(`Failed to load catalog for ${plugin}: ${e}`); }
	}
}
