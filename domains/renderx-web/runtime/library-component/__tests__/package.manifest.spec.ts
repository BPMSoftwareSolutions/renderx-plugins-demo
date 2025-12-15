import fs from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

describe('package manifest contribution', () => {
  let ctx: any;
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  it('contributes renderx plugin manifest', () => {
    const pkgPath = join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    
    // Verify keywords includes 'renderx-plugin'
    expect(pkg.keywords).toContain('renderx-plugin');
    
    // Verify renderx.plugins exists and contains LibraryComponentPlugin
    const plugins = pkg.renderx?.plugins ?? [];
    expect(plugins).toHaveLength(1);
    
    const entry = plugins.find((p: { id?: string }) => p?.id === 'LibraryComponentPlugin');
    expect(entry).toBeDefined();
    expect(entry?.runtime?.module).toBe('@renderx-web/library-component');
    expect(entry?.runtime?.export).toBe('register');
    
    // Verify existing renderx.sequences is preserved
    expect(pkg.renderx?.sequences).toEqual(['json-sequences']);
  });

  it('maintains existing package structure', () => {
    const pkgPath = join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    // Verify essential package properties are maintained
    expect(pkg.name).toBe('@renderx-web/library-component');
    expect(pkg.main).toBe('./dist/index.js');
    expect(pkg.exports['.']).toBe('./dist/index.js');

    // Verify files array includes necessary items
    expect(pkg.files).toContain('dist');
    expect(pkg.files).toContain('src');
    expect(pkg.files).toContain('json-sequences');
  });

  it('ensures consistent plugin ID across all plugin metadata and sequences', () => {
    const pkgPath = join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const expectedPluginId = 'LibraryComponentPlugin';

    // Verify plugin manifest declares the correct plugin ID
    const pluginEntry = pkg.renderx?.plugins?.[0];
    expect(pluginEntry?.id).toBe(expectedPluginId);

    // Verify all JSON sequences use the same plugin ID
    const dragSeqPath = join(__dirname, '..', 'json-sequences', 'library-component', 'drag.json');
    const dropSeqPath = join(__dirname, '..', 'json-sequences', 'library-component', 'drop.json');
    const containerDropSeqPath = join(__dirname, '..', 'json-sequences', 'library-component', 'container.drop.json');

    const dragSeq = JSON.parse(fs.readFileSync(dragSeqPath, 'utf-8'));
    const dropSeq = JSON.parse(fs.readFileSync(dropSeqPath, 'utf-8'));
    const containerDropSeq = JSON.parse(fs.readFileSync(containerDropSeqPath, 'utf-8'));

    expect(dragSeq.pluginId).toBe(expectedPluginId);
    expect(dropSeq.pluginId).toBe(expectedPluginId);
    expect(containerDropSeq.pluginId).toBe(expectedPluginId);

    // Verify no references to the old plugin ID exist
    const packageJsonContent = fs.readFileSync(pkgPath, 'utf-8');
    const dragContent = fs.readFileSync(dragSeqPath, 'utf-8');
    const dropContent = fs.readFileSync(dropSeqPath, 'utf-8');
    const containerDropContent = fs.readFileSync(containerDropSeqPath, 'utf-8');

    expect(packageJsonContent).not.toContain('LibraryComponentDropPlugin');
    expect(dragContent).not.toContain('LibraryComponentDropPlugin');
    expect(dropContent).not.toContain('LibraryComponentDropPlugin');
    expect(containerDropContent).not.toContain('LibraryComponentDropPlugin');
  });
});
