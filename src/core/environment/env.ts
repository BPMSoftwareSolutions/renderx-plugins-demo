// Environment helpers for external artifacts consumption.
// Canonical location after Phase 2 refactor (migrated from src/env.ts)
// Prefer HOST_ARTIFACTS_DIR (new) then ARTIFACTS_DIR (legacy) then Vite env var.

export function getArtifactsDir(): string | null {
	try {
		// @ts-ignore process may be undefined in browser
		if (typeof process !== 'undefined' && (process as any)?.env) {
			// @ts-ignore
			const dir = (process as any).env.HOST_ARTIFACTS_DIR || (process as any).env.ARTIFACTS_DIR;
			if (dir) return dir as string;
		}
	} catch {}
	try {
		// @ts-ignore
		const viteVar = (import.meta as any)?.env?.VITE_ARTIFACTS_DIR;
		if (viteVar) return viteVar;
	} catch {}
	return null;
}

export function artifactsEnabled(): boolean {
	return !!getArtifactsDir();
}

// Environment gates for fallback behavior
export function isTestEnv(): boolean {
	try {
		// Vitest exposes import.meta.vitest
		if (typeof import.meta !== 'undefined' && (import.meta as any)?.vitest) return true;
	} catch {}
	try {
		// Node test runner convention
		// @ts-ignore
		if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') return true;
	} catch {}
	return false;
}

export function isDevEnv(): boolean {
	try {
		// @ts-ignore
		const v = (import.meta as any)?.env?.DEV;
		if (typeof v === 'boolean') return v;
	} catch {}
	try {
		// @ts-ignore
		if (typeof process !== 'undefined') return process.env?.NODE_ENV !== 'production' && process.env?.NODE_ENV !== 'test';
	} catch {}
	return false;
}

// Only allow fallbacks in tests by default. Dev must mirror production (no masking).
export function allowFallbacks(): boolean {
	try {
		// Emergency override if ever needed in CI: RENDERX_ALLOW_FALLBACKS=1
		// @ts-ignore
		if (typeof process !== 'undefined' && process.env?.RENDERX_ALLOW_FALLBACKS === '1') return true;
	} catch {}
	return isTestEnv();
}
