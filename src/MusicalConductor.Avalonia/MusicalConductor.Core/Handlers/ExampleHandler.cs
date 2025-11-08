using MusicalConductor.Core.Interfaces;

namespace MusicalConductor.Core.Handlers;

/// <summary>
/// Example handler demonstrating best practices.
/// </summary>
public class ExampleHandler : HandlerBase
{
    public ExampleHandler() : base("ExampleHandler")
    {
    }

    public override async Task Execute(IHandlerContext context, object? data)
    {
        try
        {
            LogInfo(context, "Starting execution");

            // Simulate some work
            await Task.Delay(100);

            // Access context data
            var message = data as string ?? "No data provided";
            LogInfo(context, $"Received: {message}");

            // Example: Play a nested sequence
            // var requestId = PlaySequence(context, "PluginId", "SequenceId", new { result = "success" });
            // LogInfo(context, $"Nested sequence started: {requestId}");

            LogInfo(context, "Execution completed successfully");
        }
        catch (Exception ex)
        {
            LogError(context, "Execution failed", ex);
            throw;
        }
    }
}

