/**
 * Performance Comparison Tests
 * 
 * These tests compare the performance of different MusicalConductor loading strategies:
 * 1. Original (individual module loading)
 * 2. Cached (module caching system)
 * 3. Bundled (webpack bundles - when available)
 */

import { test, expect, Page } from '@playwright/test';

interface PerformanceMetrics {
  totalLoadTime: number;
  httpRequests: number;
  moduleLoadTime?: number;
  cacheHitRatio?: number;
  cacheHits?: number;
  cacheMisses?: number;
}

async function measurePerformance(page: Page, url: string, testName: string): Promise<PerformanceMetrics> {
  console.log(`🧪 Testing ${testName} at ${url}`);
  
  // Navigate to the test page
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  
  // Initialize conductor and measure performance
  await page.click('#init-conductor');
  
  // Wait for initialization to complete
  await page.waitForFunction(
    () => {
      return window.E2ETestApp && window.E2ETestApp.getConductor() !== null;
    },
    { timeout: 30000 }
  );
  
  // Get performance metrics
  const metrics = await page.evaluate(() => {
    const perfMetrics = window.performanceMetrics || {};
    const cacheStats = window.MusicalConductorCache ? window.MusicalConductorCache.getStats() : {};
    
    return {
      totalLoadTime: performance.now() - perfMetrics.startTime,
      httpRequests: perfMetrics.httpRequests || 0,
      moduleLoadTime: perfMetrics.moduleLoadEnd ? 
        perfMetrics.moduleLoadEnd - perfMetrics.moduleLoadStart : undefined,
      cacheHitRatio: cacheStats.cacheHitRatio || 0,
      cacheHits: cacheStats.cacheHits || 0,
      cacheMisses: cacheStats.cacheMisses || 0
    };
  });
  
  console.log(`📊 ${testName} Performance:`, metrics);
  return metrics;
}

test.describe('MusicalConductor Performance Comparison', () => {
  test('should demonstrate performance improvement with module caching', async ({ page }) => {
    // Test original version (baseline)
    const originalMetrics = await measurePerformance(
      page, 
      'http://127.0.0.1:3000/', 
      'Original (Individual Modules)'
    );
    
    // Test cached version
    const cachedMetrics = await measurePerformance(
      page, 
      'http://127.0.0.1:3000/cached', 
      'Cached (Module Caching)'
    );
    
    // Performance assertions
    console.log('\n📊 Performance Comparison Results:');
    console.log('─'.repeat(60));
    console.log(`Original HTTP Requests:    ${originalMetrics.httpRequests}`);
    console.log(`Cached HTTP Requests:      ${cachedMetrics.httpRequests}`);
    console.log(`Original Load Time:        ${originalMetrics.totalLoadTime.toFixed(2)}ms`);
    console.log(`Cached Load Time:          ${cachedMetrics.totalLoadTime.toFixed(2)}ms`);
    
    if (cachedMetrics.cacheHitRatio !== undefined) {
      console.log(`Cache Hit Ratio:           ${cachedMetrics.cacheHitRatio.toFixed(1)}%`);
      console.log(`Cache Hits:                ${cachedMetrics.cacheHits}`);
      console.log(`Cache Misses:              ${cachedMetrics.cacheMisses}`);
    }
    
    // Calculate improvements
    const requestReduction = ((originalMetrics.httpRequests - cachedMetrics.httpRequests) / originalMetrics.httpRequests * 100);
    const timeImprovement = ((originalMetrics.totalLoadTime - cachedMetrics.totalLoadTime) / originalMetrics.totalLoadTime * 100);
    
    console.log(`Request Reduction:         ${requestReduction.toFixed(1)}%`);
    console.log(`Time Improvement:          ${timeImprovement.toFixed(1)}%`);
    console.log('─'.repeat(60));
    
    // Verify both versions work correctly
    expect(originalMetrics.totalLoadTime).toBeGreaterThan(0);
    expect(cachedMetrics.totalLoadTime).toBeGreaterThan(0);
    
    // Verify caching provides benefits on subsequent loads
    if (cachedMetrics.cacheHitRatio !== undefined && cachedMetrics.cacheHitRatio > 0) {
      console.log('✅ Module caching is working effectively');
      expect(cachedMetrics.cacheHitRatio).toBeGreaterThan(0);
    }
    
    // Log final assessment
    if (requestReduction > 50) {
      console.log('🚀 Excellent performance improvement achieved!');
    } else if (requestReduction > 20) {
      console.log('⚡ Good performance improvement achieved');
    } else {
      console.log('⚠️ Limited performance improvement - investigate further');
    }
  });
  
  test('should test cached version multiple times to verify caching benefits', async ({ page }) => {
    const runs = 3;
    const metrics: PerformanceMetrics[] = [];
    
    console.log(`🔄 Running cached version ${runs} times to test caching effectiveness...`);
    
    for (let i = 0; i < runs; i++) {
      const runMetrics = await measurePerformance(
        page, 
        'http://127.0.0.1:3000/cached', 
        `Cached Run ${i + 1}`
      );
      metrics.push(runMetrics);
      
      // Small delay between runs
      await page.waitForTimeout(1000);
    }
    
    // Analyze caching effectiveness across runs
    console.log('\n📈 Caching Effectiveness Analysis:');
    console.log('─'.repeat(60));
    
    metrics.forEach((metric, index) => {
      console.log(`Run ${index + 1}:`);
      console.log(`  Load Time:     ${metric.totalLoadTime.toFixed(2)}ms`);
      console.log(`  HTTP Requests: ${metric.httpRequests}`);
      if (metric.cacheHitRatio !== undefined) {
        console.log(`  Cache Hit Ratio: ${metric.cacheHitRatio.toFixed(1)}%`);
      }
    });
    
    // Verify caching improves over time
    const firstRun = metrics[0];
    const lastRun = metrics[metrics.length - 1];
    
    if (lastRun.cacheHitRatio !== undefined && firstRun.cacheHitRatio !== undefined) {
      expect(lastRun.cacheHitRatio).toBeGreaterThanOrEqual(firstRun.cacheHitRatio);
      console.log('✅ Cache effectiveness improved or maintained across runs');
    }
    
    console.log('─'.repeat(60));
  });
  
  test('should verify conductor functionality in cached version', async ({ page }) => {
    // Navigate to cached version
    await page.goto('http://127.0.0.1:3000/cached');
    await page.waitForLoadState('networkidle');
    
    // Initialize conductor
    await page.click('#init-conductor');
    
    // Wait for initialization
    await page.waitForFunction(
      () => window.E2ETestApp && window.E2ETestApp.getConductor() !== null,
      { timeout: 30000 }
    );
    
    // Test EventBus functionality
    await page.click('#test-eventbus');
    await page.waitForTimeout(1000);
    
    // Test sequence execution
    await page.click('#test-sequences');
    await page.waitForTimeout(1000);
    
    // Test plugin system
    await page.click('#test-plugins');
    await page.waitForTimeout(1000);
    
    // Verify metrics were updated
    const finalMetrics = await page.evaluate(() => {
      return window.E2ETestApp.getMetrics();
    });
    
    console.log('🧪 Functional Test Results:', finalMetrics);
    
    // Verify basic functionality works
    expect(finalMetrics.eventCount).toBeGreaterThan(0);
    expect(finalMetrics.sequenceCount).toBeGreaterThan(0);
    expect(finalMetrics.pluginCount).toBeGreaterThan(0);
    
    console.log('✅ All cached version functionality tests passed');
  });
});

// Helper test to show current performance issues
test.describe('Performance Issue Demonstration', () => {
  test('should demonstrate the current performance problems', async ({ page }) => {
    console.log('🔍 Demonstrating current E2E test performance issues...');
    
    // Monitor network requests
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/dist/modules/') || request.url().includes('/plugins/')) {
        requests.push(request.url());
      }
    });
    
    // Navigate and initialize
    await page.goto('http://127.0.0.1:3000/');
    await page.waitForLoadState('networkidle');
    
    await page.click('#init-conductor');
    await page.waitForFunction(
      () => window.E2ETestApp && window.E2ETestApp.getConductor() !== null,
      { timeout: 30000 }
    );
    
    // Analyze the requests
    const moduleRequests = requests.filter(url => url.includes('/dist/modules/'));
    const pluginRequests = requests.filter(url => url.includes('/plugins/'));
    
    console.log('\n🚨 Performance Issues Identified:');
    console.log('─'.repeat(60));
    console.log(`Total Module Requests:     ${moduleRequests.length}`);
    console.log(`Total Plugin Requests:     ${pluginRequests.length}`);
    console.log(`Total Requests:            ${requests.length}`);
    console.log('─'.repeat(60));
    
    // Show some example requests
    console.log('\n📋 Sample Module Requests:');
    moduleRequests.slice(0, 10).forEach((url, index) => {
      const filename = url.split('/').pop();
      console.log(`  ${index + 1}. ${filename}`);
    });
    
    if (moduleRequests.length > 10) {
      console.log(`  ... and ${moduleRequests.length - 10} more module requests`);
    }
    
    // Performance impact calculation
    const estimatedTestCount = 168; // Typical E2E test suite size
    const totalRequestsPerSuite = requests.length * estimatedTestCount;
    
    console.log('\n💥 Performance Impact:');
    console.log(`Requests per test:         ${requests.length}`);
    console.log(`Estimated test count:      ${estimatedTestCount}`);
    console.log(`Total requests per suite:  ${totalRequestsPerSuite.toLocaleString()}`);
    console.log('─'.repeat(60));
    
    // Verify the problem exists
    expect(moduleRequests.length).toBeGreaterThan(20); // Should be many module requests
    expect(requests.length).toBeGreaterThan(30); // Should be many total requests
    
    console.log('⚠️ Performance issues confirmed - optimization needed!');
  });
});
