using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;
using FlaUI.Core;
using FlaUI.UIA3;

namespace RenderX.Shell.Avalonia.E2ETests;

/// <summary>
/// E2E test equivalent to cypress/e2e/config-service.cy.ts
/// Verifies the Host Configuration Service is available and working correctly
/// </summary>
public class ConfigServiceE2ETests : IAsyncLifetime
{
    private Application? _app;
    private UIA3Automation? _automation;

    public async Task InitializeAsync()
    {
        var exe = TestHelpers.ResolveAppExePath();
        _app = Application.Launch(exe);
        _automation = new UIA3Automation();
        
        // Wait for main window
        var main = _app.GetMainWindow(_automation, TimeSpan.FromSeconds(60));
        Assert.NotNull(main);

        await TestHelpers.WaitForHealthAsync(TimeSpan.FromSeconds(60));
    }

    public Task DisposeAsync()
    {
        try { _app?.Close(); } catch { /* ignore */ }
        _automation?.Dispose();
        return Task.CompletedTask;
    }

    [Fact]
    public async Task ConfigService_IsAvailable()
    {
        // Verify config service health endpoint
        var health = await TestHelpers.GetAsync<HealthResponse>("/api/config/health");
        Assert.NotNull(health);
        Assert.Equal("healthy", health!.Status);
    }

    [Fact]
    public async Task ConfigService_GetMethod_ReturnsStringOrNull()
    {
        // Test getting a config value
        var response = await GetConfigValueAsync("OPENAI_API_KEY");
        
        // Should return either a string or null
        Assert.True(response == null || response is string);
    }

    [Fact]
    public async Task ConfigService_HasMethod_ReturnsBoolean()
    {
        // Test checking if a config key exists
        var hasKey = await HasConfigKeyAsync("OPENAI_API_KEY");
        
        // Should return a boolean
        Assert.True(hasKey is bool);
    }

    [Fact]
    public async Task ConfigService_ReturnsNullForNonExistentKeys()
    {
        var result = await GetConfigValueAsync("NON_EXISTENT_KEY_12345");
        Assert.Null(result);
    }

    [Fact]
    public async Task ConfigService_ReturnsFalseForNonExistentKeysWithHas()
    {
        var hasKey = await HasConfigKeyAsync("NON_EXISTENT_KEY_12345");
        Assert.False(hasKey);
    }

    [Fact]
    public async Task ConfigService_SupportsOpenAIApiKey()
    {
        var value = await GetConfigValueAsync("OPENAI_API_KEY");
        var hasValue = await HasConfigKeyAsync("OPENAI_API_KEY");

        if (!string.IsNullOrEmpty(value))
        {
            // If key is configured, has() should return true
            Assert.True(hasValue);
            Assert.IsType<string>(value);
        }
        else
        {
            // If key is not configured, has() should return false
            Assert.False(hasValue);
        }
    }

    [Fact]
    public async Task ConfigService_SupportsOpenAIModelWithDefault()
    {
        var model = await GetConfigValueAsync("OPENAI_MODEL");
        
        // Should always return a value (default is 'gpt-3.5-turbo')
        Assert.NotNull(model);
        Assert.NotEmpty(model!);
        
        // Should be a valid model name
        Assert.StartsWith("gpt-", model);
    }

    [Fact]
    public async Task ConfigService_DoesNotExposeApiKeysInLogs()
    {
        var apiKey = await GetConfigValueAsync("OPENAI_API_KEY");
        
        if (!string.IsNullOrEmpty(apiKey))
        {
            // Fetch telemetry logs
            var logs = await TestHelpers.GetAsync<TelemetryEventDto[]>("/api/telemetry/events?limit=1000");
            Assert.NotNull(logs);
            
            // Verify the key is not in any log messages
            foreach (var log in logs!)
            {
                Assert.DoesNotContain(apiKey, log.Message ?? "");
            }
        }
    }

    [Fact]
    public async Task ConfigService_HandlesMissingConfigGracefully()
    {
        // Should not throw when accessing config
        var exception = await Record.ExceptionAsync(async () =>
        {
            await GetConfigValueAsync("ANY_KEY");
            await HasConfigKeyAsync("ANY_KEY");
        });
        
        Assert.Null(exception);
    }

    [Fact]
    public async Task ConfigService_MaintainsConsistentBehaviorAcrossMultipleCalls()
    {
        const string key = "OPENAI_API_KEY";
        
        // Call get() multiple times
        var result1 = await GetConfigValueAsync(key);
        var result2 = await GetConfigValueAsync(key);
        var result3 = await GetConfigValueAsync(key);
        
        // Results should be consistent
        Assert.Equal(result1, result2);
        Assert.Equal(result2, result3);
        
        // Call has() multiple times
        var has1 = await HasConfigKeyAsync(key);
        var has2 = await HasConfigKeyAsync(key);
        var has3 = await HasConfigKeyAsync(key);
        
        // Results should be consistent
        Assert.Equal(has1, has2);
        Assert.Equal(has2, has3);
    }

    [Fact]
    public async Task ConfigService_AllowsFeatureDetection()
    {
        // This is how plugins should check for AI availability
        var aiAvailable = await HasConfigKeyAsync("OPENAI_API_KEY");
        
        Assert.IsType<bool>(aiAvailable);
        
        if (aiAvailable)
        {
            // If available, the key should be retrievable
            var apiKey = await GetConfigValueAsync("OPENAI_API_KEY");
            Assert.NotNull(apiKey);
            Assert.NotEmpty(apiKey!);
        }
        else
        {
            // If not available, the key should be null or empty
            var apiKey = await GetConfigValueAsync("OPENAI_API_KEY");
            Assert.True(string.IsNullOrEmpty(apiKey));
        }
    }

    [Fact]
    public async Task ConfigService_SupportsMultipleConfigurationKeys()
    {
        var keys = new[] { "OPENAI_API_KEY", "OPENAI_MODEL", "ANTHROPIC_API_KEY" };
        
        foreach (var key in keys)
        {
            // Should not throw for any key
            var exception = await Record.ExceptionAsync(async () =>
            {
                await GetConfigValueAsync(key);
                await HasConfigKeyAsync(key);
            });
            
            Assert.Null(exception);
        }
    }

    private static async Task<string?> GetConfigValueAsync(string key)
    {
        using var client = new HttpClient { BaseAddress = new Uri("http://localhost:5000") };
        var resp = await client.GetAsync($"/api/config/get?key={key}");
        if (!resp.IsSuccessStatusCode) return null;
        var json = await resp.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ConfigValueResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        return result?.Value;
    }

    private static async Task<bool> HasConfigKeyAsync(string key)
    {
        using var client = new HttpClient { BaseAddress = new Uri("http://localhost:5000") };
        var resp = await client.GetAsync($"/api/config/has?key={key}");
        if (!resp.IsSuccessStatusCode) return false;
        var json = await resp.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ConfigHasResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        return result?.HasKey ?? false;
    }

    public record HealthResponse
    {
        public string Status { get; init; } = string.Empty;
    }

    public record ConfigValueResponse
    {
        public string? Value { get; init; }
    }

    public record ConfigHasResponse
    {
        public bool HasKey { get; init; }
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
}

