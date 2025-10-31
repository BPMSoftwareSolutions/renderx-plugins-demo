import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { ComponentLoader } from '../component-loader';

const TEST_DIR = path.join(__dirname, 'test-components');
const INDEX_FILE = 'index.json';
const COMPONENT_FILE = 'button.json';

const indexJson = JSON.stringify(['button.json']);
const buttonJson = JSON.stringify({
  metadata: {
    type: 'button',
    name: 'Button',
    description: 'A clickable button',
    category: 'basic',
    tags: ['ui', 'clickable']
  },
  ui: {
    template: '<button>Click me</button>',
    styles: { css: '.btn{color:red;}' }
  }
});

describe('ComponentLoader', () => {
  beforeAll(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
    await fs.writeFile(path.join(TEST_DIR, INDEX_FILE), indexJson);
    await fs.writeFile(path.join(TEST_DIR, COMPONENT_FILE), buttonJson);
  });

  afterAll(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });


  it('loads component index', async () => {
    const loader = new ComponentLoader();
    const files = await loader.getComponentIndex(TEST_DIR, INDEX_FILE);
    expect(files).toEqual(['button.json']);
  });

  it('loads a component', async () => {
    const loader = new ComponentLoader();
    const comp = await loader.loadComponent(COMPONENT_FILE, TEST_DIR);
    expect(comp).not.toBeNull();
    expect(comp?.id).toBe('button');
    expect(comp?.data.metadata.name).toBe('Button');
  });

  it('loads all components', async () => {
    const loader = new ComponentLoader();
    const all = await loader.loadAll({ basePath: TEST_DIR });
    expect(all.length).toBe(1);
    expect(all[0].id).toBe('button');
  });


  it('throws on missing index file', async () => {
    const loader = new ComponentLoader();
    await expect(loader.getComponentIndex(TEST_DIR, 'missing.json')).rejects.toThrow();
  });


  it('throws on malformed component JSON', async () => {
    await fs.writeFile(path.join(TEST_DIR, 'bad.json'), '{not valid json');
    const loader = new ComponentLoader();
    await expect(loader.loadComponent('bad.json', TEST_DIR)).rejects.toThrow();
  });
});
