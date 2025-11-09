using Xunit;
using RenderX.HostSDK.Avalonia.Services;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Styling;
using Microsoft.Extensions.Logging;
using Moq;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Threading;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Tests.Styling
{
    /// <summary>
    /// Tests for CSS Registry Service and style conversion.
    /// Note: These are integration tests that verify the style converter works correctly.
    /// Full UI tests would require AvaloniaHeadless which is not currently configured.
    /// </summary>
    public class CssRegistryServiceTests
    {
        [Fact]
        public void AvaloniaStyleConverter_ParsesColorCorrectly()
        {
            // Arrange
            var converter = new RenderX.HostSDK.Avalonia.Styling.AvaloniaStyleConverter(null);
            
            // Act - This would be called internally by CreateClassAsync
            // We're testing the converter directly to avoid needing the full Jint engine
            var cssRules = ".test-button { color: #FF0000; background-color: #0000FF; }";
            var style = converter.ConvertToStyle("test-button", cssRules);
            
            // Assert
            Assert.NotNull(style);
            Assert.Equal("Control.test-button", style.Selector?.ToString());
            Assert.NotEmpty(style.Setters);
        }
        
        [Fact]
        public void AvaloniaStyleConverter_ParsesSizeProperties()
        {
            // Arrange
            var converter = new RenderX.HostSDK.Avalonia.Styling.AvaloniaStyleConverter(null);
            
            // Act
            var cssRules = ".test-box { width: 100px; height: 50px; padding: 10px; }";
            var style = converter.ConvertToStyle("test-box", cssRules);
            
            // Assert
            Assert.NotNull(style);
            Assert.NotEmpty(style.Setters);
            // Should have width, height, and padding setters
            Assert.True(style.Setters.Count >= 3, $"Expected at least 3 setters, got {style.Setters.Count}");
        }
        
        [Fact]
        public void AvaloniaStyleConverter_ParsesFontProperties()
        {
            // Arrange
            var converter = new RenderX.HostSDK.Avalonia.Styling.AvaloniaStyleConverter(null);
            
            // Act
            var cssRules = ".test-text { font-size: 14px; font-weight: bold; font-family: Arial; }";
            var style = converter.ConvertToStyle("test-text", cssRules);
            
            // Assert
            Assert.NotNull(style);
            Assert.NotEmpty(style.Setters);
            // Should have font-size, font-weight, and font-family setters
            Assert.True(style.Setters.Count >= 3, $"Expected at least 3 setters, got {style.Setters.Count}");
        }
        
        [Fact]
        public void AvaloniaStyleConverter_HandlesInvalidCss()
        {
            // Arrange
            var converter = new RenderX.HostSDK.Avalonia.Styling.AvaloniaStyleConverter(null);
            
            // Act
            var cssRules = "not-valid-css { }";
            var style = converter.ConvertToStyle("invalid", cssRules);
            
            // Assert - Should return a style even if no properties parsed
            Assert.NotNull(style);
        }
    }
}
