import fs from 'fs';
import path from 'path';

export function loadRenderXPlugin(relativePathFromRepoRoot: string): any {
  const abs = path.resolve(__dirname, '../../', relativePathFromRepoRoot);
  const code = fs.readFileSync(abs, 'utf8');
  const transpiled = code
    .replace(/export const (\w+)\s*=\s*/g, 'moduleExports.$1 = ')
    .replace(/export default\s+/g, 'moduleExports.default = ');
  const moduleExports: any = {};
  const fn = new Function('moduleExports', 'fetch', transpiled);
  fn(moduleExports, (global as any).fetch);
  return moduleExports;
}

export function createTestLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

