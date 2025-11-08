## RenderX Host SDK for Avalonia — Integration Guide

This guide shows how to add the RenderX Host SDK to your Avalonia/.NET 8 app, configure it via DI, and call the core APIs.

### Prerequisites
- .NET 8 SDK
- Avalonia 11 (Desktop)
- Microsoft.Extensions.Logging and Microsoft.Extensions.DependencyInjection

### 1) Install and reference
For local development in this repo, add a project reference to `RenderX.HostSDK.Avalonia`.
When distributed via NuGet, install the package and skip the project reference step.

### 2) Register services
Add the Host SDK to your DI container using the provided extension method.

<augment_code_snippet mode="EXCERPT">
````csharp
using Microsoft.Extensions.DependencyInjection;
using RenderX.HostSDK.Avalonia.Extensions;

var services = new ServiceCollection();
services.AddLogging();

// Default options
services.AddRenderXHostSdk();

// Or with options
services.AddRenderXHostSdk(options =>
{
    options.EnableDebugLogging = true;   // default: false
    options.OperationTimeoutMs = 30000;  // default: 30000
    // options.CustomBundlePath = "/path/to/host-sdk-bundle.js"; // optional
    // options.AutoInitialize   = true;   // default: true
});
````
</augment_code_snippet>

### 3) Use the APIs
Inject or resolve interfaces from your container. The most common entry points are:
- IEventRouter — topic-based pub/sub messaging
- IInventoryAPI — component inventory
- ICssRegistryAPI — CSS registry
- IConfigService — config access
- IFeatureFlagsService — feature flags
- IPluginManifestService / IInteractionManifestService / ITopicsManifestService — manifests

Example: subscribe and publish with IEventRouter.

<augment_code_snippet mode="EXCERPT">
````csharp
using RenderX.HostSDK.Avalonia.Interfaces;

public sealed class Demo(
    IEventRouter eventRouter,
    ILogger<Demo> logger)
{
    public async Task RunAsync()
    {
        using var _ = eventRouter.Subscribe("app.started", payload =>
        {
            logger.LogInformation("Received app.started with payload: {Payload}", payload);
        });

        await eventRouter.PublishAsync("app.started", new { user = "alice" });
    }
}
````
</augment_code_snippet>

Example: get inventory and register CSS classes.

<augment_code_snippet mode="EXCERPT">
````csharp
using RenderX.HostSDK.Avalonia.Interfaces;
using RenderX.HostSDK.Avalonia.Models;

public sealed class UiInit(
    IInventoryAPI inventory,
    ICssRegistryAPI css)
{
    public async Task InitAsync()
    {
        var components = await inventory.ListComponentsAsync();
        foreach (var c in components)
        {
            // Do something with component summaries
        }

        // Register a CSS utility class
        await css.CreateClassAsync(new CssClassDef
        {
            Name = "rx-hidden",
            Rules = ".rx-hidden { display: none; }"
        });
    }
}
````
</augment_code_snippet>

### 4) Sample app
A minimal example lives at `RenderX.HostSDK.Sample/`. It wires DI and opens a window that receives `IEventRouter` and `ILogger` via constructor injection.

Run a Release build:

<augment_code_snippet mode="EXCERPT">
````bash
# Build library + tests + sample
 dotnet build MusicalConductor.sln -c Release

# Or just the sample
 dotnet build RenderX.HostSDK.Sample/SampleApp.csproj -c Release
````
</augment_code_snippet>

### 5) Troubleshooting
- Ensure logging is registered before resolving services.
- If you need a custom JS bundle, set `HostSdkOptions.CustomBundlePath`.
- Default JS operation timeout is 30 seconds; adjust via `OperationTimeoutMs` for long-running calls.

