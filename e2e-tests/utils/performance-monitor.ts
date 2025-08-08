/**
 * Performance Monitoring System for MusicalConductor E2E Tests
 *
 * This module provides comprehensive performance tracking and analysis
 * to measure the effectiveness of optimization strategies including:
 * - Module loading times
 * - HTTP request counts
 * - Cache performance
 * - Test execution duration
 * - Memory usage
 * - Network activity
 */

import { Page } from "@playwright/test";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface PerformanceMetrics {
  testName: string;
  timestamp: string;
  duration: number;

  // Module loading metrics
  moduleLoadTime: number;
  httpRequests: number;
  totalBytesTransferred: number;

  // Cache metrics
  cacheHitRatio: number;
  cacheHits: number;
  cacheMisses: number;
  modulesCached: number;

  // Conductor metrics
  conductorInitTime: number;
  isSharedConductor: boolean;
  isCachedModules: boolean;

  // Test execution metrics
  eventCount: number;
  sequenceCount: number;
  pluginCount: number;
  errorCount: number;

  // Browser performance
  memoryUsage?: number;
  cpuUsage?: number;

  // Network timing
  dnsLookupTime?: number;
  connectionTime?: number;
  responseTime?: number;
}

export interface PerformanceComparison {
  baseline: PerformanceMetrics;
  optimized: PerformanceMetrics;
  improvements: {
    httpRequestReduction: number;
    loadTimeImprovement: number;
    cacheEffectiveness: number;
    overallImprovement: number;
  };
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private currentTest: Partial<PerformanceMetrics> = {};
  private startTime: number = 0;

  constructor(private outputDir: string = "test-results/performance") {
    this.ensureOutputDirectory();
  }

  private ensureOutputDirectory(): void {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Start monitoring a test
   */
  startTest(testName: string): void {
    this.startTime = Date.now();
    this.currentTest = {
      testName,
      timestamp: new Date().toISOString(),
    };

    console.log(`📊 Performance monitoring started for: ${testName}`);
  }

  /**
   * Set up performance monitoring on a page
   */
  async setupPageMonitoring(page: Page): Promise<void> {
    // Monitor network requests
    const requests: any[] = [];
    let totalBytes = 0;

    page.on("request", (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now(),
      });
    });

    page.on("response", (response) => {
      const request = requests.find((r) => r.url === response.url());
      if (request) {
        request.status = response.status();
        request.size = response.headers()["content-length"] || 0;
        totalBytes += parseInt(request.size) || 0;
      }
    });

    // Inject performance tracking script
    await page.addInitScript(() => {
      window.performanceMonitor = {
        startTime: performance.now(),
        httpRequests: 0,
        moduleLoadStart: null,
        moduleLoadEnd: null,
        conductorInitStart: null,
        conductorInitEnd: null,
        requests: [],
      };

      // Override fetch to track requests
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        window.performanceMonitor.httpRequests++;
        window.performanceMonitor.requests.push({
          url: args[0],
          timestamp: performance.now(),
        });
        return originalFetch.apply(window, args);
      };
    });

    // Store request tracking for later retrieval
    this.currentTest.httpRequests = 0;
    this.currentTest.totalBytesTransferred = 0;

    // Update metrics periodically
    const updateMetrics = async () => {
      const pageMetrics = await page.evaluate(() => {
        return {
          httpRequests: window.performanceMonitor?.httpRequests || 0,
          moduleLoadTime: window.performanceMonitor?.moduleLoadEnd
            ? window.performanceMonitor.moduleLoadEnd -
              window.performanceMonitor.moduleLoadStart
            : 0,
          conductorInitTime: window.performanceMonitor?.conductorInitEnd
            ? window.performanceMonitor.conductorInitEnd -
              window.performanceMonitor.conductorInitStart
            : 0,
        };
      });

      this.currentTest.httpRequests = pageMetrics.httpRequests;
      this.currentTest.moduleLoadTime = pageMetrics.moduleLoadTime;
      this.currentTest.conductorInitTime = pageMetrics.conductorInitTime;
      this.currentTest.totalBytesTransferred = totalBytes;
    };

    // Update metrics every 2 seconds
    const interval = setInterval(updateMetrics, 2000);

    // Clean up on page close
    page.on("close", () => {
      clearInterval(interval);
    });
  }

  /**
   * Collect cache metrics from the page
   */
  async collectCacheMetrics(page: Page): Promise<void> {
    try {
      const cacheStats = await page.evaluate(() => {
        return (
          window.MusicalConductorCache?.getStats() || {
            cacheHitRatio: 0,
            cacheHits: 0,
            cacheMisses: 0,
            modulesCached: 0,
          }
        );
      });

      this.currentTest.cacheHitRatio = cacheStats.cacheHitRatio;
      this.currentTest.cacheHits = cacheStats.cacheHits;
      this.currentTest.cacheMisses = cacheStats.cacheMisses;
      this.currentTest.modulesCached = cacheStats.modulesCached;
      this.currentTest.isCachedModules = cacheStats.modulesCached > 0;
    } catch (error) {
      console.warn("Could not collect cache metrics:", error.message);
    }
  }

  /**
   * Collect test execution metrics
   */
  async collectTestMetrics(page: Page): Promise<void> {
    try {
      const testMetrics = await page.evaluate(() => {
        const metrics = window.E2ETestApp?.getMetrics() || {};
        return {
          eventCount: metrics.eventCount || 0,
          sequenceCount: metrics.sequenceCount || 0,
          pluginCount: metrics.pluginCount || 0,
          errorCount: metrics.errorCount || 0,
        };
      });

      Object.assign(this.currentTest, testMetrics);
    } catch (error) {
      console.warn("Could not collect test metrics:", error.message);
    }
  }

  /**
   * Collect browser performance metrics
   */
  async collectBrowserMetrics(page: Page): Promise<void> {
    try {
      const browserMetrics = await page.evaluate(() => {
        const memory = (performance as any).memory;
        return {
          memoryUsage: memory ? memory.usedJSHeapSize : undefined,
          timing: performance.timing,
        };
      });

      this.currentTest.memoryUsage = browserMetrics.memoryUsage;

      // Calculate network timing metrics
      if (browserMetrics.timing) {
        const timing = browserMetrics.timing;
        this.currentTest.dnsLookupTime =
          timing.domainLookupEnd - timing.domainLookupStart;
        this.currentTest.connectionTime =
          timing.connectEnd - timing.connectStart;
        this.currentTest.responseTime =
          timing.responseEnd - timing.responseStart;
      }
    } catch (error) {
      console.warn("Could not collect browser metrics:", error.message);
    }
  }

  /**
   * Finish monitoring and save metrics
   */
  async finishTest(page?: Page): Promise<PerformanceMetrics> {
    this.currentTest.duration = Date.now() - this.startTime;

    if (page) {
      await this.collectCacheMetrics(page);
      await this.collectTestMetrics(page);
      await this.collectBrowserMetrics(page);
    }

    // Fill in defaults for missing metrics
    const completeMetrics: PerformanceMetrics = {
      testName: this.currentTest.testName || "Unknown",
      timestamp: this.currentTest.timestamp || new Date().toISOString(),
      duration: this.currentTest.duration || 0,
      moduleLoadTime: this.currentTest.moduleLoadTime || 0,
      httpRequests: this.currentTest.httpRequests || 0,
      totalBytesTransferred: this.currentTest.totalBytesTransferred || 0,
      cacheHitRatio: this.currentTest.cacheHitRatio || 0,
      cacheHits: this.currentTest.cacheHits || 0,
      cacheMisses: this.currentTest.cacheMisses || 0,
      modulesCached: this.currentTest.modulesCached || 0,
      conductorInitTime: this.currentTest.conductorInitTime || 0,
      isSharedConductor: this.currentTest.isSharedConductor || false,
      isCachedModules: this.currentTest.isCachedModules || false,
      eventCount: this.currentTest.eventCount || 0,
      sequenceCount: this.currentTest.sequenceCount || 0,
      pluginCount: this.currentTest.pluginCount || 0,
      errorCount: this.currentTest.errorCount || 0,
      memoryUsage: this.currentTest.memoryUsage,
      cpuUsage: this.currentTest.cpuUsage,
      dnsLookupTime: this.currentTest.dnsLookupTime,
      connectionTime: this.currentTest.connectionTime,
      responseTime: this.currentTest.responseTime,
    };

    this.metrics.push(completeMetrics);
    this.saveMetrics(completeMetrics);
    this.logMetrics(completeMetrics);

    return completeMetrics;
  }

  /**
   * Save metrics to file
   */
  private saveMetrics(metrics: PerformanceMetrics): void {
    const filename = `${metrics.testName.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_${Date.now()}.json`;
    const filepath = join(this.outputDir, filename);

    writeFileSync(filepath, JSON.stringify(metrics, null, 2));
    console.log(`📊 Performance metrics saved to: ${filepath}`);
  }

  /**
   * Log metrics to console
   */
  private logMetrics(metrics: PerformanceMetrics): void {
    console.log("\n📊 Performance Test Results:");
    console.log("─".repeat(60));
    console.log(`Test Name:           ${metrics.testName}`);
    console.log(`Duration:            ${metrics.duration}ms`);
    console.log(`Module Load Time:    ${metrics.moduleLoadTime}ms`);
    console.log(`Conductor Init Time: ${metrics.conductorInitTime}ms`);
    console.log(`HTTP Requests:       ${metrics.httpRequests}`);
    console.log(
      `Bytes Transferred:   ${(metrics.totalBytesTransferred / 1024).toFixed(
        2
      )} KB`
    );

    if (metrics.isCachedModules) {
      console.log(`Cache Hit Ratio:     ${metrics.cacheHitRatio.toFixed(1)}%`);
      console.log(`Cache Hits:          ${metrics.cacheHits}`);
      console.log(`Cache Misses:        ${metrics.cacheMisses}`);
      console.log(`Modules Cached:      ${metrics.modulesCached}`);
    }

    console.log(`Events:              ${metrics.eventCount}`);
    console.log(`Sequences:           ${metrics.sequenceCount}`);
    console.log(`Plugins:             ${metrics.pluginCount}`);
    console.log(`Errors:              ${metrics.errorCount}`);

    if (metrics.memoryUsage) {
      console.log(
        `Memory Usage:        ${(metrics.memoryUsage / 1024 / 1024).toFixed(
          2
        )} MB`
      );
    }

    console.log("─".repeat(60));
  }

  /**
   * Compare two performance metrics
   */
  static compareMetrics(
    baseline: PerformanceMetrics,
    optimized: PerformanceMetrics
  ): PerformanceComparison {
    const httpRequestReduction =
      baseline.httpRequests > 0
        ? ((baseline.httpRequests - optimized.httpRequests) /
            baseline.httpRequests) *
          100
        : 0;

    const loadTimeImprovement =
      baseline.duration > 0
        ? ((baseline.duration - optimized.duration) / baseline.duration) * 100
        : 0;

    const cacheEffectiveness = optimized.cacheHitRatio;

    const overallImprovement =
      (httpRequestReduction + loadTimeImprovement + cacheEffectiveness) / 3;

    return {
      baseline,
      optimized,
      improvements: {
        httpRequestReduction,
        loadTimeImprovement,
        cacheEffectiveness,
        overallImprovement,
      },
    };
  }
}
