export function normalizeHandlersImportSpec(isBrowser, handlersPath) {
    const raw = (handlersPath || '').trim();
    if (!raw)
        return raw;
    // URL: http(s)://...
    if (/^https?:\/\//i.test(raw))
        return raw;
    // Treat project-relative paths like 'plugins/...', 'json-sequences/...' as paths
    const looksProjectPath = raw.startsWith('plugins/') || raw.startsWith('json-sequences/') || raw.startsWith('public/');
    // Bare package specifier (initial support: scoped packages like @scope/pkg/...)
    const isBare = !raw.startsWith('/') && !raw.startsWith('.') && !looksProjectPath && raw.startsWith('@');
    // In the browser, try to resolve bare specifiers to fully-qualified URLs so native import() works
    if (isBrowser && isBare) {
        // In Vitest, let the transformer resolve bare imports; do not rewrite
        try {
            if (import.meta.vitest) {
                return raw;
            }
        }
        catch { }
        // Preferred: Vite/modern resolver
        try {
            const resolver = import.meta.resolve;
            if (typeof resolver === 'function') {
                const resolved = resolver(raw);
                if (typeof resolved === 'string' && resolved)
                    return resolved;
            }
        }
        catch { }
        // Dev fallback: Vite's /@id/<specifier> proxy
        try {
            const env = import.meta.env;
            if (env && env.DEV) {
                return '/@id/' + raw;
            }
        }
        catch { }
        // Last resort: return raw (lets bundlers handle it in non-browser contexts)
        return raw;
    }
    // Path normalization for non-bare specs
    if (isBrowser) {
        return raw.startsWith('/') ? raw : '/' + raw.replace(/^\.\/?/, '');
    }
    else {
        // In Node/test, prefer local sources for Canvas packages until published packages ship proper dist/exports
        if (isBare) {
            // Compute a Vite-friendly absolute FS path when possible so imports work regardless of caller location
            let cwd = '';
            try {
                const proc = globalThis.process;
                if (proc && typeof proc.cwd === 'function')
                    cwd = proc.cwd();
            }
            catch { }
            const base = cwd ? `/@fs/${String(cwd).replace(/\\/g, '/')}` : '';
            if (raw === '@renderx-plugins/canvas')
                return base ? `${base}/plugins/canvas/index.ts` : '../plugins/canvas/index.ts';
            if (raw === '@renderx-plugins/canvas-component')
                return base ? `${base}/plugins/canvas-component/index.ts` : '../plugins/canvas-component/index.ts';
            if (raw.startsWith('@renderx-plugins/canvas-component/symphonies')) {
                const suffix = raw.slice('@renderx-plugins/canvas-component/symphonies'.length);
                return base ? `${base}/plugins/canvas-component/symphonies${suffix}` : `../plugins/canvas-component/symphonies${suffix}`;
            }
            // Fallback: let resolver handle other bare packages
            return raw;
        }
        return raw.startsWith('/') ? `..${raw}` : `../${raw.replace(/^\.\/?/, '')}`;
    }
}
export function isBareSpecifier(spec) {
    const s = (spec || '').trim();
    if (!s)
        return false;
    if (/^https?:\/\//i.test(s))
        return false; // URL is not considered "bare"
    const looksProjectPath = s.startsWith('plugins/') || s.startsWith('json-sequences/') || s.startsWith('public/');
    return !s.startsWith('/') && !s.startsWith('.') && !looksProjectPath && s.startsWith('@');
}
//# sourceMappingURL=handlersPath.js.map