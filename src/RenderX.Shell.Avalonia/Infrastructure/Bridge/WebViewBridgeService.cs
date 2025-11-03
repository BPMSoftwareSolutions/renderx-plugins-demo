using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Web.WebView2.Core;

namespace RenderX.Shell.Avalonia.Infrastructure.Bridge
{
    /// <summary>
    /// Default implementation that uses CoreWebView2 to execute scripts in the frontend.
    /// </summary>
    public class WebViewBridgeService : IWebViewBridgeService
    {
        private readonly ILogger<WebViewBridgeService> _logger;
        private CoreWebView2? _webView;

        public WebViewBridgeService(ILogger<WebViewBridgeService> logger)
        {
            _logger = logger;
        }

        public bool IsAttached => _webView != null;

        public void Attach(CoreWebView2 webView)
        {
            _webView = webView ?? throw new ArgumentNullException(nameof(webView));
            _logger.LogInformation("WebViewBridgeService attached to CoreWebView2 instance.");
        }

        public async Task PublishToEventRouterAsync(string topic, object? payload)
        {
            if (_webView == null)
            {
                _logger.LogWarning("PublishToEventRouterAsync called before WebView is attached. topic={Topic}", topic);
                throw new InvalidOperationException("WebView not attached");
            }

            var topicJson = JsonSerializer.Serialize(topic);
            var payloadJson = JsonSerializer.Serialize(payload);
            var script = $@"(function() {{
                try {{
                    var t = {topicJson};
                    var p = {payloadJson};
                    if (window && (window as any).RenderX && (window as any).RenderX.EventRouter && typeof (window as any).RenderX.EventRouter.publish === 'function') {{
                        (window as any).RenderX.EventRouter.publish(t, p);
                    }} else {{
                        window.postMessage({{ source: 'dotnet-host', topic: t, payload: p }}, '*');
                    }}
                }} catch (e) {{ }}
            }})();";
            await _webView.ExecuteScriptAsync(script);
        }

        public async Task ExecuteSequenceAsync(string pluginId, string sequenceId, object? payload)
        {
            if (_webView == null)
            {
                _logger.LogWarning("ExecuteSequenceAsync called before WebView is attached. {PluginId}.{SequenceId}", pluginId, sequenceId);
                throw new InvalidOperationException("WebView not attached");
            }

            var pluginJson = JsonSerializer.Serialize(pluginId);
            var seqJson = JsonSerializer.Serialize(sequenceId);
            var payloadJson = JsonSerializer.Serialize(payload);
            var script = $@"(function() {{
                try {{
                    var pid = {pluginJson};
                    var sid = {seqJson};
                    var p = {payloadJson};
                    if (window && (window as any).RenderX && (window as any).RenderX.conductor && typeof (window as any).RenderX.conductor.play === 'function') {{
                        (window as any).RenderX.conductor.play(pid, sid, p);
                    }} else {{
                        // fallback: publish a request event for the frontend bridge to handle
                        window.postMessage({{ source: 'dotnet-host', topic: 'sequences.execute.requested', payload: {{ pluginId: pid, sequenceId: sid, payload: p }} }}, '*');
                    }}
                }} catch (e) {{ }}
            }})();";
            await _webView.ExecuteScriptAsync(script);
        }
    }
}

