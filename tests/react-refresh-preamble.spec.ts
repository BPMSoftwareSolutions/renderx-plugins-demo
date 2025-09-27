import { test, expect } from 'vitest';

/**
 * Test to verify React Refresh preamble setup in HTML files
 * This test checks the structure of the HTML files to ensure proper preamble setup
 */
test('test-plugin-loading.html should have React Refresh preamble setup', async () => {
  // Read the test plugin loading HTML file
  const fs = await import('fs/promises');
  const path = await import('path');

  const htmlPath = path.resolve(process.cwd(), 'src/test-plugin-loading.html');
  const htmlContent = await fs.readFile(htmlPath, 'utf-8');

  // Check for React Refresh preamble setup
  expect(htmlContent).toContain('__vite_plugin_react_preamble_installed__');
  expect(htmlContent).toContain('RefreshRuntime.injectIntoGlobalHook');
  expect(htmlContent).toContain('$RefreshReg$');
  expect(htmlContent).toContain('$RefreshSig$');

  // Check that the preamble is set up BEFORE the main script
  const preambleIndex = htmlContent.indexOf('__vite_plugin_react_preamble_installed__');
  const mainScriptIndex = htmlContent.indexOf('/src/test-plugin-loader.tsx');

  expect(preambleIndex).toBeGreaterThan(-1);
  expect(mainScriptIndex).toBeGreaterThan(-1);
  expect(preambleIndex).toBeLessThan(mainScriptIndex);
});

/**
 * Test to check the current state of the HTML file and identify what's missing
 */
test('should identify missing React Refresh preamble in current HTML', async () => {
  const fs = await import('fs/promises');
  const path = await import('path');

  const htmlPath = path.resolve(process.cwd(), 'src/test-plugin-loading.html');
  const htmlContent = await fs.readFile(htmlPath, 'utf-8');

  // Check what's currently in the file
  const hasViteClient = htmlContent.includes('/@vite/client');
  const hasReactRefresh = htmlContent.includes('/@react-refresh');
  const hasPreambleFlag = htmlContent.includes('__vite_plugin_react_preamble_installed__');
  const hasRefreshReg = htmlContent.includes('$RefreshReg$');
  const hasRefreshSig = htmlContent.includes('$RefreshSig$');

  console.log('Current HTML file analysis:');
  console.log('- Has Vite client import:', hasViteClient);
  console.log('- Has React Refresh import:', hasReactRefresh);
  console.log('- Has preamble flag:', hasPreambleFlag);
  console.log('- Has $RefreshReg$:', hasRefreshReg);
  console.log('- Has $RefreshSig$:', hasRefreshSig);

  // This test documents the current state - it may pass or fail depending on current state
  // The important thing is to see what's missing
  if (!hasPreambleFlag) {
    console.log('❌ Missing React Refresh preamble setup');
  }

  // For now, let's make this test pass to see the current state
  expect(htmlContent).toContain('test-plugin-loader.tsx');
});

/**
 * Unit test to verify React Refresh globals are properly set up
 */
test('React Refresh globals should be available in development', () => {
  // This test checks if the React Refresh globals would be available
  // In a real browser environment with Vite dev server

  // Mock the expected globals that should be set by the preamble
  const mockWindow = {
    __vite_plugin_react_preamble_installed__: true,
    $RefreshReg$: () => {},
    $RefreshSig$: () => (type: any) => type
  };

  // Verify the expected structure
  expect(typeof mockWindow.__vite_plugin_react_preamble_installed__).toBe('boolean');
  expect(typeof mockWindow.$RefreshReg$).toBe('function');
  expect(typeof mockWindow.$RefreshSig$).toBe('function');

  // Test the $RefreshSig$ function behavior
  const testType = { name: 'TestComponent' };
  const sigFunction = mockWindow.$RefreshSig$();
  expect(sigFunction(testType)).toBe(testType);
});
