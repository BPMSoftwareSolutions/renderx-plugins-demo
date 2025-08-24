import { getContainerOf, getLocalPoint } from "./coordinates";

/**
 * Container telemetry utilities for enriching event payloads with container context
 */

export interface ContainerTelemetryData {
  containerId?: string;
  containerType?: string;
  localPosition?: { x: number; y: number };
  globalPosition?: { x: number; y: number };
  containerDepth?: number;
  containerPath?: string[];
}

export interface DataBaton {
  event: string;
  timestamp: number;
  sequenceId?: string;
  pluginId?: string;
  nodeId?: string;
  container?: ContainerTelemetryData;
  [key: string]: any;
}

/**
 * Enrich a telemetry payload with container context for a given element
 */
export function enrichWithContainerContext(
  element: HTMLElement,
  basePayload: Partial<DataBaton> = {}
): DataBaton {
  const container = getContainerOf(element);
  const timestamp = Date.now();
  
  const enriched: DataBaton = {
    ...basePayload,
    timestamp,
    event: basePayload.event || "unknown",
  };

  if (container) {
    const containerPath = getContainerPath(element);
    const globalRect = element.getBoundingClientRect();
    const globalPosition = {
      x: globalRect.left + globalRect.width / 2,
      y: globalRect.top + globalRect.height / 2,
    };
    const localPosition = getLocalPoint(globalPosition, container);

    enriched.container = {
      containerId: container.id,
      containerType: container.getAttribute('data-container-type') || 'generic',
      localPosition,
      globalPosition,
      containerDepth: containerPath.length,
      containerPath: containerPath.map(c => c.id).filter(Boolean),
    };
  }

  return enriched;
}

/**
 * Create a DataBaton for container-specific events
 */
export function createContainerDataBaton(
  event: string,
  nodeId: string,
  containerId: string,
  additionalData: Record<string, any> = {}
): DataBaton {
  const container = document.getElementById(containerId);
  const node = document.getElementById(nodeId);
  
  const baton: DataBaton = {
    event,
    timestamp: Date.now(),
    nodeId,
    ...additionalData,
  };

  if (container && node) {
    const containerPath = getContainerPath(node);
    const globalRect = node.getBoundingClientRect();
    const globalPosition = {
      x: globalRect.left + globalRect.width / 2,
      y: globalRect.top + globalRect.height / 2,
    };
    const localPosition = getLocalPoint(globalPosition, container);

    baton.container = {
      containerId,
      containerType: container.getAttribute('data-container-type') || 'generic',
      localPosition,
      globalPosition,
      containerDepth: containerPath.length,
      containerPath: containerPath.map(c => c.id).filter(Boolean),
    };
  }

  return baton;
}

/**
 * Log a DataBaton to console (dev) or send to telemetry service (prod)
 */
export function logDataBaton(baton: DataBaton): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 DataBaton:', {
      event: baton.event,
      timestamp: new Date(baton.timestamp).toISOString(),
      container: baton.container,
      ...baton,
    });
  } else {
    // In production, send to telemetry service
    // This would be replaced with actual telemetry integration
    try {
      // Example: send to analytics service
      // analytics.track(baton.event, baton);
    } catch (err) {
      console.warn('Failed to send telemetry:', err);
    }
  }
}

/**
 * Get the full container path from element to root
 */
function getContainerPath(element: HTMLElement): HTMLElement[] {
  const path: HTMLElement[] = [];
  let current = getContainerOf(element);
  
  while (current) {
    path.push(current);
    current = getContainerOf(current);
  }
  
  return path;
}

/**
 * Enhanced conductor play wrapper that automatically adds container telemetry
 */
export function playWithContainerTelemetry(
  conductor: any,
  pluginId: string,
  sequenceId: string,
  payload: any,
  element?: HTMLElement
): void {
  if (!conductor?.play) {
    console.warn('Conductor not available for telemetry-enhanced play');
    return;
  }

  let enrichedPayload = payload;
  
  if (element) {
    const baton = enrichWithContainerContext(element, {
      event: `${pluginId}:${sequenceId}`,
      sequenceId,
      pluginId,
      nodeId: element.id,
    });
    
    enrichedPayload = {
      ...payload,
      _telemetry: baton,
    };
    
    logDataBaton(baton);
  }

  conductor.play(pluginId, sequenceId, enrichedPayload);
}
