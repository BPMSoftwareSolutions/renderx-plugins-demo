import fs from 'fs/promises';
import path from 'path';

export interface ComponentLoaderOptions {
  basePath?: string;  // Default: './json-components'
  indexFile?: string; // Default: 'index.json'
}

export interface LoadedComponent {
  id: string;
  filename: string;
  data: Record<string, unknown>;
}

export class ComponentLoader {
  async getComponentIndex(basePath: string = './json-components', indexFile: string = 'index.json'): Promise<string[]> {
    const indexPath = path.join(basePath, indexFile);
    const content = await fs.readFile(indexPath, 'utf-8');
    const files = JSON.parse(content);
    if (Array.isArray(files)) return files;
    if (Array.isArray(files.components)) return files.components;
    throw new Error('Invalid index.json format');
  }

  async loadComponent(filename: string, basePath: string = './json-components'): Promise<LoadedComponent> {
    const filePath = path.join(basePath, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    const id = path.basename(filename, path.extname(filename));
    return { id, filename, data };
  }

  async loadAll(options: ComponentLoaderOptions = {}): Promise<LoadedComponent[]> {
    const basePath = options.basePath || './json-components';
    const indexFile = options.indexFile || 'index.json';
    const files = await this.getComponentIndex(basePath, indexFile);
    const results: LoadedComponent[] = [];
    for (const filename of files) {
      const comp = await this.loadComponent(filename, basePath);
      if (!comp) throw new Error(`Failed to load component: ${filename}`);
      results.push(comp);
    }
    return results;
  }
}
