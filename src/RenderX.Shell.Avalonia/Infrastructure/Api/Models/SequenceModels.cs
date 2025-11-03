namespace RenderX.Shell.Avalonia.Infrastructure.Api.Models
{
    public class SequenceExecuteRequest
    {
        public string PluginId { get; set; } = string.Empty;
        public string SequenceId { get; set; } = string.Empty;
        public object? Payload { get; set; }
    }

    public class PublishRequest
    {
        public string Topic { get; set; } = string.Empty;
        public object? Payload { get; set; }
    }

    public class BridgeResponse
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
    }
}

