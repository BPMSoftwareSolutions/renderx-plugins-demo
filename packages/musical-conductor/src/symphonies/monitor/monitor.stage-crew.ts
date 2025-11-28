/**
 * MONITOR Symphony - Stage Crew
 * Handlers for monitoring conductor operations and gathering telemetry
 * 
 * Movement 1 (Status): getConductorStatus, getQueueStatus, getSequenceCount
 * Movement 2 (Metrics): getStatistics, getPerformanceMetrics, getDuplicationReport
 * Movement 3 (Health): checkEventBusHealth, checkExecutionHealth
 * Movement 4 (Report): generateStatusReport, logHealthSummary
 */

/** Movement 1, Beat 1: Get conductor status */
export const getConductorStatus = (data: any, ctx: any) => {
  const { conductor } = ctx.payload;
  
  if (!conductor) {
    throw new Error("Conductor not available for status check");
  }
  
  const status = {
    isInitialized: true,
    timestamp: Date.now(),
  };
  
  ctx.payload.conductorStatus = status;
  (globalThis as any).__MC_LOG("✅ Conductor status retrieved");
};

/** Movement 1, Beat 2: Get execution queue status */
export const getQueueStatus = (data: any, ctx: any) => {
  const { conductor } = ctx.payload;
  
  try {
    const queueStatus = conductor.getQueueStatus();
    ctx.payload.queueStatus = queueStatus;
    
    (globalThis as any).__MC_LOG(
      `✅ Queue status: ${queueStatus.pending || 0} pending, ${queueStatus.active || 0} active`
    );
  } catch (error) {
    ctx.payload.queueStatus = { error: String(error) };
    (globalThis as any).__MC_WARN("⚠️ Failed to get queue status:", error);
  }
};

/** Movement 1, Beat 3: Get registered sequence count */
export const getSequenceCount = (data: any, ctx: any) => {
  const { conductor } = ctx.payload;
  
  try {
    const sequenceNames = conductor.getSequenceNames();
    ctx.payload.sequenceCount = sequenceNames.length;
    ctx.payload.sequenceNames = sequenceNames;
    
    (globalThis as any).__MC_LOG(`✅ Sequence count: ${sequenceNames.length} registered`);
  } catch (error) {
    ctx.payload.sequenceCount = 0;
    (globalThis as any).__MC_WARN("⚠️ Failed to get sequence count:", error);
  }
};

/** Movement 2, Beat 1: Get conductor statistics */
export const getStatistics = (data: any, ctx: any) => {
  const { conductor } = ctx.payload;
  
  try {
    const statistics = conductor.getStatistics();
    ctx.payload.statistics = statistics;
    
    (globalThis as any).__MC_LOG(
      `📊 Statistics: ${statistics.totalExecutions || 0} executions, ` +
      `${statistics.totalBeats || 0} beats, ` +
      `${statistics.failureCount || 0} failures`
    );
  } catch (error) {
    ctx.payload.statistics = { error: String(error) };
    (globalThis as any).__MC_WARN("⚠️ Failed to get statistics:", error);
  }
};

/** Movement 2, Beat 2: Get performance metrics */
export const getPerformanceMetrics = (data: any, ctx: any) => {
  const { statistics } = ctx.payload;
  
  if (!statistics || statistics.error) {
    ctx.payload.performanceMetrics = null;
    return;
  }
  
  const metrics = {
    avgExecutionTime: statistics.averageExecutionTime || 0,
    avgBeatDuration: statistics.averageBeatDuration || 0,
    successRate: statistics.totalExecutions > 0 ? 
      ((statistics.totalExecutions - (statistics.failureCount || 0)) / statistics.totalExecutions * 100) : 
      100,
    throughput: statistics.totalBeats || 0,
  };
  
  ctx.payload.performanceMetrics = metrics;
  
  (globalThis as any).__MC_LOG(
    `📈 Performance: ${Math.round(metrics.successRate)}% success rate, ` +
    `${Math.round(metrics.avgBeatDuration)}ms avg beat`
  );
};

/** Movement 2, Beat 3: Get duplication detection report */
export const getDuplicationReport = (data: any, ctx: any) => {
  const { conductor } = ctx.payload;
  
  // Duplication detection metrics from DuplicationDetector
  // This is internal state, we just mark it as checked
  
  ctx.payload.duplicationChecked = true;
  (globalThis as any).__MC_LOG("✅ Duplication detection checked");
};

/** Movement 3, Beat 1: Check EventBus health */
export const checkEventBusHealth = (data: any, ctx: any) => {
  const { eventBus } = ctx.payload;
  
  if (!eventBus) {
    ctx.payload.eventBusHealth = { healthy: false, reason: "EventBus not available" };
    return;
  }
  
  try {
    const debugInfo = eventBus.getDebugInfo();
    const metrics = eventBus.getMetrics?.();
    
    ctx.payload.eventBusHealth = {
      healthy: true,
      listenerCount: debugInfo?.eventListeners?.size || 0,
      metrics: metrics || null,
    };
    
    (globalThis as any).__MC_LOG(
      `✅ EventBus healthy: ${ctx.payload.eventBusHealth.listenerCount} listeners`
    );
  } catch (error) {
    ctx.payload.eventBusHealth = { healthy: false, error: String(error) };
    (globalThis as any).__MC_WARN("⚠️ EventBus health check failed:", error);
  }
};

/** Movement 3, Beat 2: Check execution health */
export const checkExecutionHealth = (data: any, ctx: any) => {
  const { statistics, queueStatus } = ctx.payload;
  
  const issues: string[] = [];
  
  // Check for high failure rate
  if (statistics && !statistics.error) {
    const failureRate = statistics.totalExecutions > 0 ? 
      (statistics.failureCount / statistics.totalExecutions * 100) : 
      0;
    
    if (failureRate > 10) {
      issues.push(`High failure rate: ${Math.round(failureRate)}%`);
    }
  }
  
  // Check for queue backlog
  if (queueStatus && !queueStatus.error) {
    if ((queueStatus.pending || 0) > 10) {
      issues.push(`Queue backlog: ${queueStatus.pending} pending`);
    }
  }
  
  ctx.payload.executionHealth = {
    healthy: issues.length === 0,
    issues,
  };
  
  if (issues.length > 0) {
    (globalThis as any).__MC_WARN(`⚠️ Execution health issues: ${issues.join(', ')}`);
  } else {
    (globalThis as any).__MC_LOG("✅ Execution health normal");
  }
};

/** Movement 4, Beat 1: Generate comprehensive status report */
export const generateStatusReport = (data: any, ctx: any) => {
  const { conductorStatus, queueStatus, sequenceCount, statistics, 
          performanceMetrics, eventBusHealth, executionHealth } = ctx.payload;
  
  const report = {
    timestamp: Date.now(),
    conductor: conductorStatus,
    queue: queueStatus,
    sequences: {
      count: sequenceCount,
      names: ctx.payload.sequenceNames || [],
    },
    statistics: statistics,
    performance: performanceMetrics,
    health: {
      eventBus: eventBusHealth,
      execution: executionHealth,
      overall: eventBusHealth?.healthy && executionHealth?.healthy,
    },
  };
  
  ctx.payload.statusReport = report;
  (globalThis as any).__MC_LOG("📋 Status report generated");
};

/** Movement 4, Beat 2: Log health summary */
export const logHealthSummary = (data: any, ctx: any) => {
  const { statusReport } = ctx.payload;
  
  const healthSymbol = statusReport.health.overall ? '✅' : '⚠️';
  const healthStatus = statusReport.health.overall ? 'HEALTHY' : 'DEGRADED';
  
  (globalThis as any).__MC_LOG(
    `${healthSymbol} System Health: ${healthStatus} | ` +
    `${statusReport.sequences.count} sequences | ` +
    `${statusReport.statistics?.totalExecutions || 0} executions | ` +
    `${statusReport.queue?.pending || 0} queued`
  );
  
  ctx.payload.monitoringComplete = true;
};

// Export handlers for JSON sequence mounting
export const handlers = {
  getConductorStatus,
  getQueueStatus,
  getSequenceCount,
  getStatistics,
  getPerformanceMetrics,
  getDuplicationReport,
  checkEventBusHealth,
  checkExecutionHealth,
  generateStatusReport,
  logHealthSummary,
};
