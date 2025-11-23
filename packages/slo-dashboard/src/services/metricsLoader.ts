import { SLIMetricsData, SLOTargetsData, ErrorBudgetsData, SLAComplianceData } from '../types/slo.types';

/**
 * Metrics Loader Service
 * Loads SLI metrics from ANY source (file, API, WebSocket)
 */

export class MetricsLoader {
  private cache: Map<string, SLIMetricsData> = new Map();
  private cacheExpiry: number = 60000; // 1 minute

  /**
   * Load metrics from file path (in Node.js environment)
   */
  async loadFromFile(filePath: string): Promise<SLIMetricsData> {
    const cacheKey = `file:${filePath}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(filePath);
      const data = await response.json();
      this.validateMetricsData(data);
      this.cache.set(cacheKey, data);
      
      // Clear cache after expiry
      setTimeout(() => this.cache.delete(cacheKey), this.cacheExpiry);
      
      return data;
    } catch (error) {
      throw new Error(`Failed to load metrics from ${filePath}: ${error}`);
    }
  }

  /**
   * Load metrics from API endpoint
   */
  async loadFromAPI(endpoint: string): Promise<SLIMetricsData> {
    const cacheKey = `api:${endpoint}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      this.validateMetricsData(data);
      this.cache.set(cacheKey, data);
      
      setTimeout(() => this.cache.delete(cacheKey), this.cacheExpiry);
      
      return data;
    } catch (error) {
      throw new Error(`Failed to load metrics from API: ${error}`);
    }
  }

  /**
   * Validate metrics data structure
   */
  private validateMetricsData(data: SLIMetricsData): void {
    if (!data.metadata || !data.componentMetrics || !Array.isArray(data.componentMetrics)) {
      throw new Error('Invalid metrics data structure');
    }

    data.componentMetrics.forEach((metric, index) => {
      if (!metric.component_id || typeof metric.availability !== 'number') {
        throw new Error(`Invalid metric at index ${index}`);
      }
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Set cache expiry time
   */
  setCacheExpiry(ms: number): void {
    this.cacheExpiry = ms;
  }
}

/**
 * SLO Targets Loader
 */
export class SLOTargetsLoader {
  private cache: Map<string, SLOTargetsData> = new Map();
  private cacheExpiry: number = 60000;

  async loadFromFile(filePath: string): Promise<SLOTargetsData> {
    const cacheKey = `file:${filePath}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(filePath);
      const data = await response.json();
      this.validateTargetsData(data);
      this.cache.set(cacheKey, data);
      
      setTimeout(() => this.cache.delete(cacheKey), this.cacheExpiry);
      
      return data;
    } catch (error) {
      throw new Error(`Failed to load SLO targets: ${error}`);
    }
  }

  private validateTargetsData(data: SLOTargetsData): void {
    if (!data.metadata || !data.slo_targets || !Array.isArray(data.slo_targets)) {
      throw new Error('Invalid SLO targets data structure');
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Error Budgets Loader
 */
export class ErrorBudgetsLoader {
  private cache: Map<string, ErrorBudgetsData> = new Map();
  private cacheExpiry: number = 60000;

  async loadFromFile(filePath: string): Promise<ErrorBudgetsData> {
    const cacheKey = `file:${filePath}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(filePath);
      const data = await response.json();
      this.validateBudgetsData(data);
      this.cache.set(cacheKey, data);
      
      setTimeout(() => this.cache.delete(cacheKey), this.cacheExpiry);
      
      return data;
    } catch (error) {
      throw new Error(`Failed to load error budgets: ${error}`);
    }
  }

  private validateBudgetsData(data: ErrorBudgetsData): void {
    if (!data.metadata || !data.budgets || !Array.isArray(data.budgets)) {
      throw new Error('Invalid error budgets data structure');
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Compliance Data Loader
 */
export class ComplianceLoader {
  private cache: Map<string, SLAComplianceData> = new Map();
  private cacheExpiry: number = 60000;

  async loadFromFile(filePath: string): Promise<SLAComplianceData> {
    const cacheKey = `file:${filePath}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(filePath);
      const data = await response.json();
      this.validateComplianceData(data);
      this.cache.set(cacheKey, data);
      
      setTimeout(() => this.cache.delete(cacheKey), this.cacheExpiry);
      
      return data;
    } catch (error) {
      throw new Error(`Failed to load compliance data: ${error}`);
    }
  }

  private validateComplianceData(data: SLAComplianceData): void {
    if (!data.metadata || !data.compliance_entries || !Array.isArray(data.compliance_entries)) {
      throw new Error('Invalid compliance data structure');
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}
