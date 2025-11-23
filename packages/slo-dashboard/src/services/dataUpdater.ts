import { 
  SLIMetricsData, 
  ErrorBudgetsData
} from '../types/slo.types';

/**
 * Data Updater Service
 * Handles real-time data streaming and updates
 */

export type DataUpdateCallback = (data: any) => void;
export type UpdateType = 'metrics' | 'slo' | 'budgets' | 'compliance' | 'healing';

export class DataUpdater {
  private updateIntervals: Map<UpdateType, NodeJS.Timeout> = new Map();
  private callbacks: Map<UpdateType, Set<DataUpdateCallback>> = new Map();
  private streamConnections: Map<string, WebSocket> = new Map();

  constructor() {
    // Initialize callback sets
    const updateTypes: UpdateType[] = ['metrics', 'slo', 'budgets', 'compliance', 'healing'];
    updateTypes.forEach(type => {
      this.callbacks.set(type, new Set());
    });
  }

  /**
   * Subscribe to data updates
   */
  subscribe(type: UpdateType, callback: DataUpdateCallback): () => void {
    this.callbacks.get(type)?.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.get(type)?.delete(callback);
    };
  }

  /**
   * Publish data update to all subscribers
   */
  private publish(type: UpdateType, data: any): void {
    this.callbacks.get(type)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in callback for ${type}:`, error);
      }
    });
  }

  /**
   * Start polling for metrics updates
   */
  startMetricsPolling(loader: () => Promise<SLIMetricsData>, intervalMs: number = 30000): void {
    // Clear existing interval if any
    this.stopMetricsPolling();

    const poll = async () => {
      try {
        const data = await loader();
        this.publish('metrics', data);
      } catch (error) {
        console.error('Error polling metrics:', error);
      }
    };

    // Run immediately
    poll();
    
    // Then set interval
    const interval = setInterval(poll, intervalMs);
    this.updateIntervals.set('metrics', interval);
  }

  /**
   * Stop metrics polling
   */
  stopMetricsPolling(): void {
    const interval = this.updateIntervals.get('metrics');
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete('metrics');
    }
  }

  /**
   * Start polling for budget updates
   */
  startBudgetPolling(loader: () => Promise<ErrorBudgetsData>, intervalMs: number = 60000): void {
    this.stopBudgetPolling();

    const poll = async () => {
      try {
        const data = await loader();
        this.publish('budgets', data);
      } catch (error) {
        console.error('Error polling budgets:', error);
      }
    };

    poll();
    const interval = setInterval(poll, intervalMs);
    this.updateIntervals.set('budgets', interval);
  }

  /**
   * Stop budget polling
   */
  stopBudgetPolling(): void {
    const interval = this.updateIntervals.get('budgets');
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete('budgets');
    }
  }

  /**
   * Connect to WebSocket stream for real-time updates
   */
  connectToStream(type: UpdateType, wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log(`Connected to ${type} stream`);
          this.streamConnections.set(type, ws);
          resolve();
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.publish(type, data);
          } catch (error) {
            console.error(`Error parsing ${type} stream data:`, error);
          }
        };

        ws.onerror = (error) => {
          console.error(`WebSocket error for ${type}:`, error);
          reject(error);
        };

        ws.onclose = () => {
          console.log(`Disconnected from ${type} stream`);
          this.streamConnections.delete(type);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket stream
   */
  disconnectFromStream(type: UpdateType): void {
    const ws = this.streamConnections.get(type);
    if (ws) {
      ws.close();
      this.streamConnections.delete(type);
    }
  }

  /**
   * Disconnect all streams
   */
  disconnectAllStreams(): void {
    this.streamConnections.forEach(ws => {
      try {
        ws.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
    });
    this.streamConnections.clear();
  }

  /**
   * Stop all polling intervals
   */
  stopAllPolling(): void {
    this.updateIntervals.forEach(interval => {
      clearInterval(interval);
    });
    this.updateIntervals.clear();
  }

  /**
   * Clean up all resources
   */
  destroy(): void {
    this.stopAllPolling();
    this.disconnectAllStreams();
    this.callbacks.clear();
  }

  /**
   * Get connection status
   */
  getStatus(): {
    activePolls: (UpdateType)[];
    activeStreams: (UpdateType)[];
  } {
    return {
      activePolls: Array.from(this.updateIntervals.keys()),
      activeStreams: Array.from(this.streamConnections.keys()) as UpdateType[],
    };
  }
}

export default DataUpdater;
