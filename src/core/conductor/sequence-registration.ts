// Sequence registration (migrated from src/conductor.ts)
import { runtimePackageLoaders, loadJsonSequenceCatalogs } from './runtime-loaders';
import { resolveModuleSpecifier } from './conductor';

export type ConductorClient = any; // local alias

export async function registerAllSequences(conductor: ConductorClient) {
	// 1) Discover runtime registration modules via plugin manifest (ui + optional runtime section)
	let manifest: any = null;
	try {
		const isBrowser = typeof window !== 'undefined' && typeof (globalThis as any).fetch === 'function';
		if (isBrowser) {
			try { const res = await fetch('/plugins/plugin-manifest.json'); if (res.ok) manifest = await res.json(); } catch {}
		}
		if (!manifest) {
			try {
				const envMod = await import(/* @vite-ignore */ '../environment/env');
				const artifactsDir2 = (envMod as any).getArtifactsDir?.();
				if (artifactsDir2) {
					try {
						const fs = await import('fs/promises');
						const path = await import('path');
						const procAny4: any = (globalThis as any).process;
						const cwd = procAny4 && typeof procAny4.cwd === 'function' ? procAny4.cwd() : '';
						const p = path.join(cwd, artifactsDir2, 'plugins', 'plugin-manifest.json');
						const raw = await fs.readFile(p, 'utf-8').catch(()=>null as any);
						if (raw) manifest = JSON.parse(raw || '{}');
					} catch {}
				}
			} catch {}
			if (!manifest) {
				try {
					const env = await import(/* @vite-ignore */ '../environment/env');
					if ((env as any).allowFallbacks?.()) {
						// @ts-ignore raw JSON import fallback (tests only)
						const mod = await import(/* @vite-ignore */ '../../../public/plugins/plugin-manifest.json?raw');
						const txt: string = (mod as any)?.default || (mod as any) || '{}';
						manifest = JSON.parse(txt);
					}
				} catch {}
			}
		}
	} catch { manifest = { plugins: [] }; }
	const plugins = Array.isArray(manifest.plugins) ? manifest.plugins : [];

	// 2) Register runtime modules (prioritize certain ids)
	const prioritized = plugins.slice().sort((a: any, b: any) => {
		const prio = (x: any) => (x?.id === 'LibraryComponentPlugin' || x?.id === 'CanvasComponentPlugin') ? 1 : 0;
		return prio(b) - prio(a);
	});
	for (const p of prioritized) {
		const runtime = p.runtime;
		if (!runtime || !runtime.module || !runtime.export) continue;
		try {
			const isTestEnv = typeof import.meta !== 'undefined' && !!(import.meta as any).vitest;
			const forceLibraryResolutionError = isTestEnv && typeof globalThis !== 'undefined' && (globalThis as any).__RENDERX_FORCE_LIBRARY_RESOLUTION_ERROR === true;
			if (forceLibraryResolutionError && runtime.module === '@renderx-plugins/library') {
				throw new TypeError("Failed to resolve module specifier '@renderx-plugins/library'");
			}
			const loader = runtimePackageLoaders[runtime.module];
			const mod = loader ? await loader() : await import(/* @vite-ignore */ resolveModuleSpecifier(runtime.module));
			console.log('🔌 Registered plugin runtime:', p.id);
			const reg = (mod as any)?.[runtime.export] || (mod as any)?.default?.[runtime.export];
			if (typeof reg === 'function') {
				console.log('🎯 Calling register function for:', p.id);
				await reg(conductor);
				console.log('✅ Register function completed for:', p.id);
			} else {
				console.warn('⚠️ No register function found for:', p.id, 'Available exports:', Object.keys(mod || {}));
			}
		} catch (e) {
			console.error('❌ Failed runtime register for', p.id, e);
			console.error('❌ Stack trace:', (e as Error)?.stack || 'No stack trace available');
		}
	}

	// 3) Mount sequences from JSON catalogs
	await loadJsonSequenceCatalogs(conductor);

	// 3b) Removed: do not auto-mount library-component sequences in dev/prod.
	// Tests that need this behavior should explicitly mount sequences in their setup.

	// 4) Debug logs
	try {
		const ids = (conductor as any).getMountedPluginIds?.() || [];
		console.log('🔎 Mounted plugin IDs after registration:', ids);
		for (const id of ids) { try { console.log('Plugin mounted successfully:', id); } catch {} }
	} catch {}
}
