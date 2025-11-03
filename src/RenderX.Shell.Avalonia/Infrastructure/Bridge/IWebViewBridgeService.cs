using System.Threading.Tasks;
using Microsoft.Web.WebView2.Core;

namespace RenderX.Shell.Avalonia.Infrastructure.Bridge
{
    /// <summary>
    /// Bridge service that enables .NET to communicate with the WebView-hosted frontend.
    /// </summary>
    public interface IWebViewBridgeService
    {
        /// <summary>
        /// Attach the CoreWebView2 instance once the WebView is initialized.
        /// </summary>
        void Attach(CoreWebView2 webView);

        /// <summary>
        /// True when a WebView has been attached and is ready for messaging.
        /// </summary>
        bool IsAttached { get; }

        /// <summary>
        /// Publish a topic/payload into the frontend EventRouter.
        /// </summary>
        Task PublishToEventRouterAsync(string topic, object? payload);

        /// <summary>
        /// Invoke the TypeScript conductor to execute a sequence.
        /// </summary>
        Task ExecuteSequenceAsync(string pluginId, string sequenceId, object? payload);
    }
}

