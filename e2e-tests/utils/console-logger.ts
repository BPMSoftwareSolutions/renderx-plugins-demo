/**
 * Console Logger Utilities for E2E Testing
 * 
 * Provides time-date stamped console logging capabilities
 * for capturing browser console messages during Playwright tests
 */

import { Page, ConsoleMessage } from '@playwright/test';
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface LogEntry {
  timestamp: string;
  type: 'log' | 'error' | 'warn' | 'info' | 'debug';
  message: string;
  args: any[];
  location?: string;
  testName?: string;
}

export class ConsoleLogger {
  private logs: LogEntry[] = [];
  private logFile: string;
  private testName: string;

  constructor(testName: string, outputDir: string = 'test-results/console-logs') {
    this.testName = testName;
    
    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    // Create log file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9-_]/g, '_');
    this.logFile = join(outputDir, `${sanitizedTestName}_${timestamp}.log`);
    
    // Initialize log file
    this.writeLogHeader();
  }

  /**
   * Set up console message capture for a Playwright page
   */
  public setupPageLogging(page: Page): void {
    page.on('console', (msg: ConsoleMessage) => {
      this.captureConsoleMessage(msg);
    });

    page.on('pageerror', (error: Error) => {
      this.capturePageError(error);
    });

    page.on('requestfailed', (request) => {
      this.captureRequestFailure(request);
    });
  }

  /**
   * Capture console message from browser
   */
  private captureConsoleMessage(msg: ConsoleMessage): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type: msg.type() as LogEntry['type'],
      message: msg.text(),
      args: msg.args().map(arg => arg.toString()),
      location: msg.location() ? `${msg.location().url}:${msg.location().lineNumber}` : undefined,
      testName: this.testName
    };

    this.logs.push(entry);
    this.writeLogEntry(entry);
  }

  /**
   * Capture page errors
   */
  private capturePageError(error: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type: 'error',
      message: `PAGE ERROR: ${error.message}`,
      args: [error.stack || ''],
      testName: this.testName
    };

    this.logs.push(entry);
    this.writeLogEntry(entry);
  }

  /**
   * Capture request failures
   */
  private captureRequestFailure(request: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type: 'error',
      message: `REQUEST FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`,
      args: [],
      testName: this.testName
    };

    this.logs.push(entry);
    this.writeLogEntry(entry);
  }

  /**
   * Write log file header
   */
  private writeLogHeader(): void {
    const header = [
      '='.repeat(80),
      `MusicalConductor E2E Test Console Log`,
      `Test: ${this.testName}`,
      `Started: ${new Date().toISOString()}`,
      '='.repeat(80),
      ''
    ].join('\n');

    writeFileSync(this.logFile, header);
  }

  /**
   * Write individual log entry to file
   */
  private writeLogEntry(entry: LogEntry): void {
    const logLine = [
      `[${entry.timestamp}]`,
      `[${entry.type.toUpperCase()}]`,
      entry.location ? `[${entry.location}]` : '',
      entry.message,
      entry.args.length > 0 ? `\n  Args: ${JSON.stringify(entry.args, null, 2)}` : '',
      ''
    ].filter(Boolean).join(' ') + '\n';

    appendFileSync(this.logFile, logLine);
  }

  /**
   * Get all captured logs
   */
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by type
   */
  public getLogsByType(type: LogEntry['type']): LogEntry[] {
    return this.logs.filter(log => log.type === type);
  }

  /**
   * Get logs containing specific text
   */
  public getLogsContaining(searchText: string): LogEntry[] {
    return this.logs.filter(log => 
      log.message.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  /**
   * Check if any errors were logged
   */
  public hasErrors(): boolean {
    return this.logs.some(log => log.type === 'error');
  }

  /**
   * Get error count
   */
  public getErrorCount(): number {
    return this.logs.filter(log => log.type === 'error').length;
  }

  /**
   * Export logs as JSON
   */
  public exportLogsAsJSON(): string {
    return JSON.stringify({
      testName: this.testName,
      timestamp: new Date().toISOString(),
      totalLogs: this.logs.length,
      errorCount: this.getErrorCount(),
      logs: this.logs
    }, null, 2);
  }

  /**
   * Save logs as JSON file
   */
  public saveLogsAsJSON(filename?: string): string {
    const outputFile = filename || this.logFile.replace('.log', '.json');
    writeFileSync(outputFile, this.exportLogsAsJSON());
    return outputFile;
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get log file path
   */
  public getLogFilePath(): string {
    return this.logFile;
  }
}

/**
 * Utility function to create a console logger for a test
 */
export function createConsoleLogger(testName: string): ConsoleLogger {
  return new ConsoleLogger(testName);
}

/**
 * Utility function to format timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Utility function to analyze logs for MusicalConductor specific patterns
 */
export function analyzeMusicalConductorLogs(logs: LogEntry[]): {
  eventBusMessages: LogEntry[];
  conductorMessages: LogEntry[];
  sequenceMessages: LogEntry[];
  pluginMessages: LogEntry[];
  errorMessages: LogEntry[];
  performanceMetrics: LogEntry[];
} {
  return {
    eventBusMessages: logs.filter(log => 
      log.message.includes('EventBus') || log.message.includes('📡')
    ),
    conductorMessages: logs.filter(log => 
      log.message.includes('MusicalConductor') || log.message.includes('🎼')
    ),
    sequenceMessages: logs.filter(log => 
      log.message.includes('sequence') || log.message.includes('🎵')
    ),
    pluginMessages: logs.filter(log => 
      log.message.includes('plugin') || log.message.includes('🔌')
    ),
    errorMessages: logs.filter(log => log.type === 'error'),
    performanceMetrics: logs.filter(log => 
      log.message.includes('performance') || log.message.includes('ms')
    )
  };
}
