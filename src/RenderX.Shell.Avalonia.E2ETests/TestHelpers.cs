using System;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.E2ETests;

/// <summary>
/// Shared helper methods for E2E tests
/// </summary>
public static class TestHelpers
{
    /// <summary>
    /// Resolves the path to the RenderX.Shell.Avalonia.exe executable
    /// </summary>
    public static string ResolveAppExePath()
    {
        var baseDir = AppContext.BaseDirectory;
        var root = Path.GetFullPath(Path.Combine(baseDir, "../../../../.."));
        
        // Try different possible locations
        var paths = new[]
        {
            Path.Combine(root, "src", "RenderX.Shell.Avalonia", "bin", "Debug", "net8.0", "win-x64", "RenderX.Shell.Avalonia.exe"),
            Path.Combine(root, "src", "RenderX.Shell.Avalonia", "bin", "Debug", "net8.0", "RenderX.Shell.Avalonia.exe"),
            Path.Combine(root, "src", "RenderX.Shell.Avalonia", "bin", "Release", "net8.0", "win-x64", "RenderX.Shell.Avalonia.exe"),
            Path.Combine(root, "src", "RenderX.Shell.Avalonia", "bin", "Release", "net8.0", "RenderX.Shell.Avalonia.exe")
        };
        
        foreach (var path in paths)
        {
            if (File.Exists(path))
            {
                return path;
            }
        }
        
        throw new FileNotFoundException("RenderX.Shell.Avalonia.exe not found. Build the project first.");
    }

    /// <summary>
    /// Waits for the backend health endpoint to become ready
    /// </summary>
    public static async Task WaitForHealthAsync(TimeSpan timeout)
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

    /// <summary>
    /// Makes an HTTP GET request and deserializes the JSON response
    /// </summary>
    public static async Task<T?> GetAsync<T>(string path)
    {
        using var client = new HttpClient { BaseAddress = new Uri("http://localhost:5000") };
        var resp = await client.GetAsync(path);
        resp.EnsureSuccessStatusCode();
        var json = await resp.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    /// <summary>
    /// Writes an artifact to the .logs directory for debugging
    /// </summary>
    public static async Task WriteArtifactAsync(string fileName, object content)
    {
        var logsDir = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", ".logs");
        Directory.CreateDirectory(logsDir);
        var filePath = Path.Combine(logsDir, fileName);
        var json = JsonSerializer.Serialize(content, new JsonSerializerOptions { WriteIndented = true });
        await File.WriteAllTextAsync(filePath, json);
    }
}

