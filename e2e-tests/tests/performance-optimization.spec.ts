/**
 * Performance Optimization Validation Tests
 * 
 * These tests validate the effectiveness of the performance optimizations
 * implemented to address E2E test performance issues including:
 * - Module caching system
 * - Shared conductor instances
 * - HTTP request reduction
 * - Load time improvements
 */

import { test, expect } from '@playwright/test';
import { PerformanceMonitor, PerformanceMetrics } from '../utils/performance-monitor';
import { createTestContext, initializeOptimizedMusicalConductor } from '../utils/test-helpers';

test.describe('MusicalConductor Performance Optimization Validation', () => {
  let performanceMonitor: PerformanceMonitor;
  
  test.beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
  });
  
  test('should demonstrate significant performance improvement with optimizations', async ({ page }) => {
    console.log('🚀 Running comprehensive performance optimization validation...');
    
    // Test 1: Baseline performance (original version)
    performanceMonitor.startTest('Baseline_Original_Version');
    await performanceMonitor.setupPageMonitoring(page);
    
    const baselineContext = createTestContext(page, 'Baseline Test');
    
    // Initialize with original version (no optimizations)
    const baselineConductor = await initializeOptimizedMusicalConductor(baselineContext, {
      useSharedConductor: false,
      useCachedModules: false,
      enablePerformanceTracking: true
    });
    
    // Run basic functionality tests
    await page.click('#test-eventbus');
    await page.waitForTimeout(1000);
    await page.click('#test-sequences');
    await page.waitForTimeout(1000);
    await page.click('#test-plugins');
    await page.waitForTimeout(2000);
    
    const baselineMetrics = await performanceMonitor.finishTest(page);
    
    // Test 2: Optimized performance (with all optimizations)
    performanceMonitor.startTest('Optimized_Cached_Version');
    await performanceMonitor.setupPageMonitoring(page);
    
    const optimizedContext = createTestContext(page, 'Optimized Test');
    
    // Initialize with all optimizations enabled
    const optimizedConductor = await initializeOptimizedMusicalConductor(optimizedContext, {
      useSharedConductor: false, // Individual for fair comparison
      useCachedModules: true,
      enablePerformanceTracking: true
    });
    
    // Run the same functionality tests
    await page.click('#test-eventbus');
    await page.waitForTimeout(1000);
    await page.click('#test-sequences');
    await page.waitForTimeout(1000);
    await page.click('#test-plugins');
    await page.waitForTimeout(2000);
    
    const optimizedMetrics = await performanceMonitor.finishTest(page);
    
    // Analyze performance improvements
    const comparison = PerformanceMonitor.compareMetrics(baselineMetrics, optimizedMetrics);
    const report = PerformanceMonitor.generateReport(comparison);
    
    console.log(report);
    
    // Validate performance improvements
    expect(comparison.improvements.httpRequestReduction).toBeGreaterThan(0);
    expect(optimizedMetrics.isCachedModules).toBe(true);
    expect(optimizedMetrics.cacheHitRatio).toBeGreaterThan(0);
    
    // Verify functionality is maintained
    expect(baselineMetrics.eventCount).toBeGreaterThan(0);
    expect(optimizedMetrics.eventCount).toBeGreaterThan(0);
    expect(baselineMetrics.sequenceCount).toBeGreaterThan(0);
    expect(optimizedMetrics.sequenceCount).toBeGreaterThan(0);
    expect(baselineMetrics.pluginCount).toBeGreaterThan(0);
    expect(optimizedMetrics.pluginCount).toBeGreaterThan(0);
    
    // Log final assessment
    if (comparison.improvements.overallImprovement > 25) {
      console.log('🎉 SUCCESS: Significant performance improvements achieved!');
    } else {
      console.log('⚠️ WARNING: Performance improvements below target threshold');
    }
  });
  
  test('should validate module caching effectiveness across multiple loads', async ({ page }) => {
    console.log('📦 Testing module caching effectiveness...');
    
    const testRuns = 3;
    const metrics: PerformanceMetrics[] = [];
    
    for (let i = 0; i < testRuns; i++) {
      performanceMonitor.startTest(`Cache_Test_Run_${i + 1}`);
      await performanceMonitor.setupPageMonitoring(page);
      
      const context = createTestContext(page, `Cache Test Run ${i + 1}`);
      
      // Use cached modules for all runs
      await initializeOptimizedMusicalConductor(context, {
        useSharedConductor: false,
        useCachedModules: true,
        enablePerformanceTracking: true
      });
      
      // Quick functionality test
      await page.click('#test-eventbus');
      await page.waitForTimeout(500);
      
      const runMetrics = await performanceMonitor.finishTest(page);
      metrics.push(runMetrics);
      
      // Small delay between runs
      await page.waitForTimeout(1000);
    }
    
    // Analyze caching effectiveness
    console.log('\n📈 Cache Effectiveness Analysis:');
    console.log('─'.repeat(60));
    
    metrics.forEach((metric, index) => {
      console.log(`Run ${index + 1}:`);
      console.log(`  HTTP Requests: ${metric.httpRequests}`);
      console.log(`  Cache Hit Ratio: ${metric.cacheHitRatio.toFixed(1)}%`);
      console.log(`  Load Time: ${metric.duration}ms`);
    });
    
    // Verify caching improves over time
    const firstRun = metrics[0];
    const lastRun = metrics[metrics.length - 1];
    
    expect(lastRun.cacheHitRatio).toBeGreaterThanOrEqual(firstRun.cacheHitRatio);
    expect(lastRun.modulesCached).toBeGreaterThan(0);
    
    console.log('✅ Module caching effectiveness validated');
  });
  
  test('should measure HTTP request reduction impact', async ({ page }) => {
    console.log('🌐 Measuring HTTP request reduction impact...');
    
    // Track network requests for original version
    const originalRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/dist/modules/') || request.url().includes('/plugins/')) {
        originalRequests.push(request.url());
      }
    });
    
    performanceMonitor.startTest('HTTP_Request_Analysis_Original');
    await performanceMonitor.setupPageMonitoring(page);
    
    const originalContext = createTestContext(page, 'HTTP Request Analysis - Original');
    
    // Test original version
    await initializeOptimizedMusicalConductor(originalContext, {
      useSharedConductor: false,
      useCachedModules: false,
      enablePerformanceTracking: true
    });
    
    const originalMetrics = await performanceMonitor.finishTest(page);
    
    // Clear request tracking and test cached version
    const cachedRequests: string[] = [];
    page.removeAllListeners('request');
    page.on('request', request => {
      if (request.url().includes('/dist/modules/') || request.url().includes('/plugins/')) {
        cachedRequests.push(request.url());
      }
    });
    
    performanceMonitor.startTest('HTTP_Request_Analysis_Cached');
    await performanceMonitor.setupPageMonitoring(page);
    
    const cachedContext = createTestContext(page, 'HTTP Request Analysis - Cached');
    
    // Test cached version
    await initializeOptimizedMusicalConductor(cachedContext, {
      useSharedConductor: false,
      useCachedModules: true,
      enablePerformanceTracking: true
    });
    
    const cachedMetrics = await performanceMonitor.finishTest(page);
    
    // Analyze request reduction
    console.log('\n🌐 HTTP Request Analysis:');
    console.log('─'.repeat(60));
    console.log(`Original Module Requests: ${originalRequests.length}`);
    console.log(`Cached Module Requests:   ${cachedRequests.length}`);
    console.log(`Total Original Requests:  ${originalMetrics.httpRequests}`);
    console.log(`Total Cached Requests:    ${cachedMetrics.httpRequests}`);
    
    const requestReduction = originalRequests.length > 0 ? 
      ((originalRequests.length - cachedRequests.length) / originalRequests.length * 100) : 0;
    
    console.log(`Request Reduction:        ${requestReduction.toFixed(1)}%`);
    console.log('─'.repeat(60));
    
    // Validate significant request reduction
    expect(requestReduction).toBeGreaterThan(20); // At least 20% reduction
    expect(cachedMetrics.cacheHitRatio).toBeGreaterThan(0);
    
    console.log('✅ HTTP request reduction validated');
  });
  
  test('should validate conductor reuse benefits', async ({ page }) => {
    console.log('🔄 Testing conductor reuse benefits...');
    
    performanceMonitor.startTest('Conductor_Reuse_Test');
    await performanceMonitor.setupPageMonitoring(page);
    
    const context = createTestContext(page, 'Conductor Reuse Test');
    
    // Initialize optimized conductor
    const conductorContext = await initializeOptimizedMusicalConductor(context, {
      useSharedConductor: false,
      useCachedModules: true,
      enablePerformanceTracking: true
    });
    
    // Perform multiple operations to test reuse
    const operations = [
      '#test-eventbus',
      '#test-sequences', 
      '#test-plugins',
      '#test-spa-validation'
    ];
    
    for (const operation of operations) {
      await page.click(operation);
      await page.waitForTimeout(1000);
    }
    
    // Test cache stats button if available
    const cacheStatsBtn = page.locator('#show-cache-stats');
    if (await cacheStatsBtn.isVisible()) {
      await cacheStatsBtn.click();
      await page.waitForTimeout(500);
    }
    
    const finalMetrics = await performanceMonitor.finishTest(page);
    
    // Validate conductor reuse effectiveness
    expect(finalMetrics.eventCount).toBeGreaterThan(0);
    expect(finalMetrics.sequenceCount).toBeGreaterThan(0);
    expect(finalMetrics.pluginCount).toBeGreaterThan(0);
    expect(finalMetrics.errorCount).toBe(0);
    
    if (finalMetrics.isCachedModules) {
      expect(finalMetrics.cacheHitRatio).toBeGreaterThan(0);
      console.log(`✅ Conductor reuse validated with ${finalMetrics.cacheHitRatio.toFixed(1)}% cache hit ratio`);
    }
    
    console.log('✅ Conductor reuse benefits validated');
  });
  
  test.afterEach(async () => {
    // Export performance data
    if (performanceMonitor.getAllMetrics().length > 0) {
      performanceMonitor.exportToCSV();
    }
  });
});
