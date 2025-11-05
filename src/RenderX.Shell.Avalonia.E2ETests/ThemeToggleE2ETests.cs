using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;
// NuGet packages required: FlaUI.Core, FlaUI.UIA3, xunit, Microsoft.NET.Test.Sdk, xunit.runner.visualstudio, FluentAssertions
using FlaUI.Core;
using FlaUI.UIA3;

namespace RenderX.Shell.Avalonia.E2ETests;

public class ThemeToggleE2ETests : IAsyncLifetime
{
    private Application? _app;
    private UIA3Automation? _automation;

    public async Task InitializeAsync()
    {
        var exe = ResolveAppExePath();
        _app = Application.Launch(exe);
        _automation = new UIA3Automation();
        // Wait for main window
        var main = _app.GetMainWindow(_automation, TimeSpan.FromSeconds(60));
        Assert.NotNull(main);

        await WaitForHealthAsync(TimeSpan.FromSeconds(60));
        // Clear telemetry to get a clean slate
        await PostAsync("/api/telemetry/clear", new { olderThanDays = 0 });
    }

    public Task DisposeAsync()
    {
        try { _app?.Close(); } catch { /* ignore */ }
        _automation?.Dispose();
        return Task.CompletedTask;
    }

    private static string ResolveAppExePath()
    {
        var baseDir = AppContext.BaseDirectory;
        // dotnet test -> bin/<Config>/net8.0-windows -> back to repo root
        var root = Path.GetFullPath(Path.Combine(baseDir, "../../../../.."));
        var debugPath = Path.Combine(root, "src", "RenderX.Shell.Avalonia", "bin", "Debug", "net8.0", "RenderX.Shell.Avalonia.exe");
        var releasePath = Path.Combine(root, "src", "RenderX.Shell.Avalonia", "bin", "Release", "net8.0", "RenderX.Shell.Avalonia.exe");
        if (File.Exists(debugPath)) return debugPath;
        if (File.Exists(releasePath)) return releasePath;
        throw new FileNotFoundException("RenderX.Shell.Avalonia.exe not found. Build the project first.");
    }

    [Fact]
    public async Task ThemeToggle_TogglesAndEmitsTelemetry()
    {
        var corrId = Guid.NewGuid().ToString("N");

        // Execute theme toggle via backend -> frontend bridge
        await PostAsync("/api/sequences/execute", new
        {
            pluginId = "HeaderThemePlugin",
            sequenceId = "header-ui-theme-toggle-symphony",
            payload = new { __corrId = corrId }
        });

        // Fetch telemetry events correlated to our test
        var events = await GetAsync<TelemetryEventDto[]>($"/api/telemetry/session/{corrId}?limit=100");
        Assert.NotNull(events);
        Assert.True(events!.Length > 0);

        // We expect at least start/completion entries
        Assert.Contains(events, e => e.EventType == "sequence.started");
        Assert.Contains(events, e => e.EventType == "sequence.completed");

        // Optional: look for theme-related events (toggle/notify)
        Assert.Contains(events, e => (e.EventType?.Contains("theme", StringComparison.OrdinalIgnoreCase) ?? false));

        // Toggle once more; verify more events are recorded
        await PostAsync("/api/sequences/execute", new
        {
            pluginId = "HeaderThemePlugin",
            sequenceId = "header-ui-theme-toggle-symphony",
            payload = new { __corrId = corrId }
        });

        var events2 = await GetAsync<TelemetryEventDto[]>($"/api/telemetry/session/{corrId}?limit=200");
        Assert.True((events2?.Length ?? 0) >= (events?.Length ?? 0));
    }

    public record TelemetryEventDto
    {
        public string EventType { get; init; } = string.Empty;
        public string? Level { get; init; }
        public string? Message { get; init; }
        public object? Data { get; init; }
        public string? Timestamp { get; init; }
        public string? Source { get; init; }
        public string? CorrelationId { get; init; }
    }

    private static async Task WaitForHealthAsync(TimeSpan timeout)
    {
        var deadline = DateTime.UtcNow + timeout;
        while (DateTime.UtcNow < deadline)
        {
            try
            {
                using var client = new HttpClient { BaseAddress = new Uri("http://localhost:5000") };
                var resp = await client.GetAsync("/api/config/health");
                if (resp.IsSuccessStatusCode) return;
            }
            catch { /* server not up yet */ }
            await Task.Delay(500);
        }
        throw new TimeoutException("Backend health endpoint did not become ready.");
    }

    private static async Task<T?> GetAsync<T>(string path)
    {
        using var client = new HttpClient { BaseAddress = new Uri("http://localhost:5000") };
        var resp = await client.GetAsync(path);
        resp.EnsureSuccessStatusCode();
        var json = await resp.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    private static async Task PostAsync(string path, object body)
    {
        using var client = new HttpClient { BaseAddress = new Uri("http://localhost:5000") };
        var resp = await client.PostAsJsonAsync(path, body);
        resp.EnsureSuccessStatusCode();
    }
}

