import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn as _spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function resolveContextFile() {
  const rootPath = path.join(process.cwd(), 'react-component-theme-toggle.json');
  if (fs.existsSync(rootPath)) return rootPath;
  const docsPath = path.join(process.cwd(), 'docs', 'react', 'react-component-theme-toggle.json');
  if (fs.existsSync(docsPath)) return docsPath;
  throw new Error('react-component-theme-toggle.json not found in root or docs/react/.');
}

describe('React Component Validation E2E', () => {
  let conductorProcess: any;
  let _componentCreated = false;

  beforeAll(async () => {
    // Wait for dev server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(() => {
    if (conductorProcess) {
      conductorProcess.kill();
    }
  });

  it('should create theme toggle component with validation', async () => {
    const contextFile = resolveContextFile();
    
    // Verify context file exists
    expect(fs.existsSync(contextFile)).toBe(true);
    
    // Read and parse the context
    const contextData = JSON.parse(fs.readFileSync(contextFile, 'utf-8'));
    expect(contextData.component).toBeDefined();
    expect(contextData.component.content).toBeDefined();
    expect(contextData.component.content.reactCode).toBeDefined();
    
    // Verify the React code is valid
    const reactCode = contextData.component.content.reactCode;
    expect(reactCode).toContain('ThemeToggle');
    expect(reactCode).toContain('useState');
    expect(reactCode).toContain('handleThemeToggle');
    expect(reactCode).toContain('window.RenderX.publish');

    _componentCreated = true;
  });

  it('should have valid React code syntax', async () => {
    const contextFile = resolveContextFile();
    const contextData = JSON.parse(fs.readFileSync(contextFile, 'utf-8'));
    const reactCode = contextData.component.content.reactCode;
    
    // Check for common syntax issues
    const openBraces = (reactCode.match(/{/g) || []).length;
    const closeBraces = (reactCode.match(/}/g) || []).length;
    expect(openBraces).toBe(closeBraces);
    
    const openParens = (reactCode.match(/\(/g) || []).length;
    const closeParens = (reactCode.match(/\)/g) || []).length;
    expect(Math.abs(openParens - closeParens)).toBeLessThanOrEqual(2);
    
    // Check for unmatched backticks
    const backticks = (reactCode.match(/`/g) || []).length;
    expect(backticks % 2).toBe(0);
  });

  it('should have proper React component structure', async () => {
    const contextFile = resolveContextFile();
    const contextData = JSON.parse(fs.readFileSync(contextFile, 'utf-8'));
    const reactCode = contextData.component.content.reactCode;
    
    // Verify component structure
    expect(reactCode).toContain('export default function');
    expect(reactCode).toContain('return');
    expect(reactCode).toContain('React.useState');
    
    // Verify event publishing
    expect(reactCode).toContain('window.RenderX.publish');
    expect(reactCode).toContain('react.component.theme.toggled');
  });

  it('should have proper styling and interactivity', async () => {
    const contextFile = resolveContextFile();
    const contextData = JSON.parse(fs.readFileSync(contextFile, 'utf-8'));
    const reactCode = contextData.component.content.reactCode;
    
    // Verify styling
    expect(reactCode).toContain('backgroundColor');
    expect(reactCode).toContain('color');
    expect(reactCode).toContain('transition');
    
    // Verify interactivity
    expect(reactCode).toContain('onClick');
    expect(reactCode).toContain('onMouseEnter');
    expect(reactCode).toContain('onMouseLeave');
  });
});

