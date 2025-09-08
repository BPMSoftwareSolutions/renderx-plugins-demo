export function normalizeHandlersImportSpec(isBrowser: boolean, handlersPath: string): string {
  const raw = (handlersPath || '').trim();
  if (!raw) return raw;
  // URL: http(s)://...
  if (/^https?:\/\//i.test(raw)) return raw;
  // Treat project-relative paths like 'plugins/...', 'json-sequences/...' as paths
  const looksProjectPath = raw.startsWith('plugins/') || raw.startsWith('json-sequences/') || raw.startsWith('public/');
  // Bare package specifier (initial support: scoped packages like @scope/pkg/...)
  const isBare = !raw.startsWith('/') && !raw.startsWith('.') && !looksProjectPath && raw.startsWith('@');
  if (isBare) return raw;
  // Path normalization
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

