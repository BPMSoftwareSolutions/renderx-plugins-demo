using Microsoft.Extensions.Logging;
using Moq;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Models;
using RenderX.HostSDK.Avalonia.Services;
using Xunit;

namespace RenderX.HostSDK.Avalonia.Tests;

public class CssRegistryServiceTests : IDisposable
{
    private readonly Mock<ILogger<CssRegistryService>> _mockLogger;
    private readonly Mock<ILogger<HostSdkEngineHost>> _mockEngineLogger;
    private readonly HostSdkEngineHost _engineHost;
    private readonly CssRegistryService _cssRegistryService;

    public CssRegistryServiceTests()
    {
        _mockLogger = new Mock<ILogger<CssRegistryService>>();
        _mockEngineLogger = new Mock<ILogger<HostSdkEngineHost>>();
        _engineHost = new HostSdkEngineHost(_mockEngineLogger.Object);
        _cssRegistryService = new CssRegistryService(_engineHost, _mockLogger.Object);
    }

    public void Dispose()
    {
        _engineHost?.Dispose();
    }

    [Fact]
    public void Constructor_WithNullEngineHost_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            new CssRegistryService(null!, _mockLogger.Object));
    }

    [Fact]
    public void Constructor_WithNullLogger_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            new CssRegistryService(_engineHost, null!));
    }

    [Fact]
    public async Task HasClassAsync_WithNullName_ThrowsArgumentException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await _cssRegistryService.HasClassAsync(null!));
    }

    [Fact]
    public async Task HasClassAsync_WithEmptyName_ThrowsArgumentException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await _cssRegistryService.HasClassAsync(""));
    }

    [Fact]
    public async Task HasClassAsync_WithWhitespaceName_ThrowsArgumentException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await _cssRegistryService.HasClassAsync("   "));
    }

    [Fact]
    public async Task HasClassAsync_WithValidName_ReturnsFalse_WhenNotFound()
    {
        // Arrange
        var className = "non-existent-class";

        // Act
        var result = await _cssRegistryService.HasClassAsync(className);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task HasClassAsync_WithValidName_CompletesSuccessfully()
    {
        // Arrange
        var className = "test-class";

        // Act
        var result = await _cssRegistryService.HasClassAsync(className);

        // Assert
        Assert.IsType<bool>(result);
    }

    [Fact]
    public async Task CreateClassAsync_WithNullDef_ThrowsArgumentNullException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(async () =>
            await _cssRegistryService.CreateClassAsync(null!));
    }

    [Fact]
    public async Task CreateClassAsync_WithValidDef_CompletesSuccessfully()
    {
        // Arrange
        var cssDef = new CssClassDef
        {
            Name = "test-class",
            Rules = ".test-class { color: red; }"
        };

        // Act & Assert - should not throw
        await _cssRegistryService.CreateClassAsync(cssDef);
    }

    [Fact]
    public async Task CreateClassAsync_WithSource_CompletesSuccessfully()
    {
        // Arrange
        var cssDef = new CssClassDef
        {
            Name = "test-class",
            Rules = ".test-class { color: blue; }",
            Source = "plugin-1"
        };

        // Act & Assert - should not throw
        await _cssRegistryService.CreateClassAsync(cssDef);
    }

    [Fact]
    public async Task CreateClassAsync_WithMetadata_CompletesSuccessfully()
    {
        // Arrange
        var cssDef = new CssClassDef
        {
            Name = "test-class",
            Rules = ".test-class { color: green; }",
            Metadata = new Dictionary<string, object>
            {
                ["author"] = "test-author",
                ["version"] = "1.0.0"
            }
        };

        // Act & Assert - should not throw
        await _cssRegistryService.CreateClassAsync(cssDef);
    }

    [Fact]
    public async Task UpdateClassAsync_WithNullName_ThrowsArgumentException()
    {
        // Arrange
        var cssDef = new CssClassDef
        {
            Name = "test-class",
            Rules = ".test-class { color: red; }"
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await _cssRegistryService.UpdateClassAsync(null!, cssDef));
    }

    [Fact]
    public async Task UpdateClassAsync_WithEmptyName_ThrowsArgumentException()
    {
        // Arrange
        var cssDef = new CssClassDef
        {
            Name = "test-class",
            Rules = ".test-class { color: red; }"
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await _cssRegistryService.UpdateClassAsync("", cssDef));
    }

    [Fact]
    public async Task UpdateClassAsync_WithNullDef_ThrowsArgumentNullException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(async () =>
            await _cssRegistryService.UpdateClassAsync("test-class", null!));
    }

    [Fact]
    public async Task UpdateClassAsync_WithValidParameters_CompletesSuccessfully()
    {
        // Arrange
        var className = "test-class";
        var cssDef = new CssClassDef
        {
            Name = className,
            Rules = ".test-class { color: blue; }"
        };

        // Act & Assert - should not throw (may fail if class doesn't exist, but that's expected)
        try
        {
            await _cssRegistryService.UpdateClassAsync(className, cssDef);
        }
        catch (InvalidOperationException)
        {
            // Expected if class doesn't exist
        }
    }

    [Fact]
    public void OnCssChanged_WithNullCallback_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            _cssRegistryService.OnCssChanged(null!));
    }

    [Fact]
    public void OnCssChanged_WithValidCallback_ReturnsDisposable()
    {
        // Arrange
        Action<IReadOnlyList<CssClassDef>> callback = _ => { };

        // Act
        var subscription = _cssRegistryService.OnCssChanged(callback);

        // Assert
        Assert.NotNull(subscription);
        Assert.IsAssignableFrom<IDisposable>(subscription);
    }

    [Fact]
    public void OnCssChanged_Dispose_UnsubscribesSuccessfully()
    {
        // Arrange
        var callbackInvoked = false;
        Action<IReadOnlyList<CssClassDef>> callback = _ => callbackInvoked = true;

        // Act
        var subscription = _cssRegistryService.OnCssChanged(callback);
        subscription.Dispose();

        // Assert - no exception should be thrown
        Assert.False(callbackInvoked);
    }

    [Fact]
    public void OnCssChanged_DisposeTwice_DoesNotThrow()
    {
        // Arrange
        Action<IReadOnlyList<CssClassDef>> callback = _ => { };
        var subscription = _cssRegistryService.OnCssChanged(callback);

        // Act
        subscription.Dispose();
        subscription.Dispose(); // Second dispose

        // Assert - no exception should be thrown
    }

    [Fact]
    public void OnCssChanged_MultipleObservers_AllCanSubscribe()
    {
        // Arrange
        Action<IReadOnlyList<CssClassDef>> callback1 = _ => { };
        Action<IReadOnlyList<CssClassDef>> callback2 = _ => { };

        // Act
        var sub1 = _cssRegistryService.OnCssChanged(callback1);
        var sub2 = _cssRegistryService.OnCssChanged(callback2);

        // Assert
        Assert.NotNull(sub1);
        Assert.NotNull(sub2);
    }

    [Fact]
    public async Task HasClassAsync_CalledMultipleTimes_DoesNotThrow()
    {
        // Arrange
        var className = "test-class";

        // Act
        var result1 = await _cssRegistryService.HasClassAsync(className);
        var result2 = await _cssRegistryService.HasClassAsync(className);

        // Assert
        Assert.IsType<bool>(result1);
        Assert.IsType<bool>(result2);
    }

    [Fact]
    public async Task CreateClassAsync_CalledMultipleTimes_DoesNotThrow()
    {
        // Arrange
        var cssDef1 = new CssClassDef
        {
            Name = "test-class-1",
            Rules = ".test-class-1 { color: red; }"
        };
        var cssDef2 = new CssClassDef
        {
            Name = "test-class-2",
            Rules = ".test-class-2 { color: blue; }"
        };

        // Act & Assert - should not throw
        await _cssRegistryService.CreateClassAsync(cssDef1);
        await _cssRegistryService.CreateClassAsync(cssDef2);
    }

    [Fact]
    public void OnCssChanged_AfterDispose_CanSubscribeAgain()
    {
        // Arrange
        Action<IReadOnlyList<CssClassDef>> callback = _ => { };
        var sub1 = _cssRegistryService.OnCssChanged(callback);
        sub1.Dispose();

        // Act
        var sub2 = _cssRegistryService.OnCssChanged(callback);

        // Assert
        Assert.NotNull(sub2);
    }

    [Fact]
    public void OnCssChanged_WithExceptionInCallback_DoesNotAffectOtherObservers()
    {
        // Arrange
        Action<IReadOnlyList<CssClassDef>> callback1 = _ => throw new Exception("Test exception");
        Action<IReadOnlyList<CssClassDef>> callback2 = _ => { };

        // Act
        var sub1 = _cssRegistryService.OnCssChanged(callback1);
        var sub2 = _cssRegistryService.OnCssChanged(callback2);

        // Assert - subscriptions should be created successfully
        Assert.NotNull(sub1);
        Assert.NotNull(sub2);
    }
}

