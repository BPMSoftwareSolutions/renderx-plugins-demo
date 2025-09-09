export function normalizeHandlersImportSpec(isBrowser: boolean, handlersPath: string): string {
  const raw = (handlersPath || '').trim();
  if (!raw) return raw;
  // URL: http(s)://...
  if (/^https?:\/\//i.test(raw)) return raw;
  // Treat project-relative paths like 'plugins/...', 'json-sequences/...' as paths
  const looksProjectPath = raw.startsWith('plugins/') || raw.startsWith('json-sequences/') || raw.startsWith('public/');
  // Bare package specifier (initial support: scoped packages like @scope/pkg/...)
  const isBare = !raw.startsWith('/') && !raw.startsWith('.') && !looksProjectPath && raw.startsWith('@');
  // In the browser, try to resolve bare specifiers to fully-qualified URLs so native import() works
  if (isBrowser && isBare) {
    try {
      const resolver: any = (import.meta as any).resolve;
      if (typeof resolver === 'function') {
        return resolver(raw);
      }
    } catch {}
    return raw; // fallback
  }
  // Path normalization for non-bare specs
  if (isBrowser) {
    return raw.startsWith('/') ? raw : '/' + raw.replace(/^\.\/?/, '');
  } else {
    return raw.startsWith('/') ? `..${raw}` : `../${raw.replace(/^\.\/?/, '')}`;
  }
}

export function isBareSpecifier(spec: string): boolean {
  const s = (spec || '').trim();
  if (!s) return false;
  if (/^https?:\/\//i.test(s)) return false; // URL is not considered "bare"
  const looksProjectPath = s.startsWith('plugins/') || s.startsWith('json-sequences/') || s.startsWith('public/');
  return !s.startsWith('/') && !s.startsWith('.') && !looksProjectPath && s.startsWith('@');
}

