/**
 * Global Setup for MusicalConductor E2E Tests
 * 
 * Handles global test environment setup including:
 * - Test server startup
 * - Browser installation verification
 * - Log directory creation
 * - Environment validation
 */

import { chromium, FullConfig } from '@playwright/test';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🎼 Setting up MusicalConductor E2E Test Environment...');

  // Create necessary directories
  const testResultsDir = 'test-results';
  const consoleLogsDir = join(testResultsDir, 'console-logs');
  const videosDir = join(testResultsDir, 'videos');
  const screenshotsDir = join(testResultsDir, 'screenshots');

  [testResultsDir, consoleLogsDir, videosDir, screenshotsDir].forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  // Verify browser installation
  try {
    const browser = await chromium.launch();
    await browser.close();
    console.log('✅ Browser installation verified');
  } catch (error) {
    console.error('❌ Browser installation failed:', error);
    throw error;
  }

  // Verify musical-conductor package is available
  try {
    require('musical-conductor');
    console.log('✅ musical-conductor package is available');
  } catch (error) {
    console.warn('⚠️  musical-conductor package not found - this is expected if running from source');
  }

  console.log('🚀 E2E Test Environment setup complete');
}

export default globalSetup;
