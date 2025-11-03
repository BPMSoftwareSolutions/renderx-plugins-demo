/* Simple HTTP client for .NET backend APIs (IPC/HTTP bridge)
 * Runs in the browser (WebView) and talks to ASP.NET Core minimal APIs hosted by the Avalonia shell.
 */

export type TelemetryEventRequest = {
  eventType: string;
  payload?: any;
  source?: string; // 'frontend' | 'backend'
  correlationId?: string;
  timestamp?: string;
};

export type TelemetryResponse = {
  success: boolean;
  message?: string;
  recordId?: string;
};

export type PluginInfo = {
  id: string;
  name?: string;
  version?: string;
  description?: string;
  manifest?: any;
  isEnabled?: boolean;
};

export type PluginDiscoveryResponse = {
  plugins: PluginInfo[];
  totalCount: number;
  discoveredAt: string;
};

const DEFAULT_BASE = "http://localhost:5000"; // ASP.NET Core server started by the Avalonia shell

function getBaseUrl(): string {
  try {
    // Allow overriding via global for tests or alternate ports
    const g: any = (globalThis as any);
    if (g && g.__RENDERX_DOTNET_BASE_URL) return String(g.__RENDERX_DOTNET_BASE_URL);
  } catch {}
  return DEFAULT_BASE;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const resp = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers || {}),
    },
    // Do not block the UI thread; keep timeouts modest
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`HTTP ${resp.status} ${resp.statusText} for ${path}: ${txt}`);
  }
  // Some endpoints may return no content
  const ct = resp.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return undefined as unknown as T;
  return (await resp.json()) as T;
}

// Telemetry
export async function recordTelemetryEvent(evt: TelemetryEventRequest): Promise<TelemetryResponse> {
  try {
    const payload: TelemetryEventRequest = {
      source: evt.source || 'frontend',
      timestamp: evt.timestamp || new Date().toISOString(),
      ...evt,
    };
    return await http<TelemetryResponse>(`/api/telemetry/event`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // Swallow network errors by default to avoid impacting UX; caller may choose to log
    return { success: false, message: String(e || 'telemetry_error') };
  }
}

export async function recordTelemetryBatch(sessionId: string, events: TelemetryEventRequest[]): Promise<TelemetryResponse> {
  return http<TelemetryResponse>(`/api/telemetry/batch`, {
    method: 'POST',
    body: JSON.stringify({ sessionId, events }),
  });
}

// Plugins
export async function getPlugins(): Promise<PluginDiscoveryResponse> {
  return http<PluginDiscoveryResponse>(`/api/plugins/`);
}

export async function enablePlugin(pluginId: string): Promise<PluginInfo | null> {
  return http<PluginInfo | null>(`/api/plugins/${encodeURIComponent(pluginId)}/enable`, { method: 'POST' });
}

export async function disablePlugin(pluginId: string): Promise<PluginInfo | null> {
  return http<PluginInfo | null>(`/api/plugins/${encodeURIComponent(pluginId)}/disable`, { method: 'POST' });
}

// Optional helper: normalize PluginDiscoveryResponse to the public plugin-manifest.json shape
export function toPluginManifestJson(resp: PluginDiscoveryResponse): { plugins: Array<{ id: string; ui?: { slot?: string; module?: string; export?: string }; runtime?: { module?: string; export?: string } }> } {
  // For now, keep it minimal; map by id only. Slots/modules belong to UI packages and are fixed in our demo.
  return {
    plugins: resp.plugins.map(p => ({ id: p.id }))
  };
}

