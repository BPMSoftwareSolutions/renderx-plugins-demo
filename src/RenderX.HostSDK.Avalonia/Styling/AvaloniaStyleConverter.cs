using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia.Styling;
using Avalonia.Threading;
using Microsoft.Extensions.Logging;
using System.Globalization;
using System.Text.RegularExpressions;

namespace RenderX.HostSDK.Avalonia.Styling;

/// <summary>
/// Converts CSS rules to Avalonia Style objects.
/// Handles common CSS properties and maps them to Avalonia property setters.
/// </summary>
public class AvaloniaStyleConverter
{
    private readonly ILogger<AvaloniaStyleConverter>? _logger;

    public AvaloniaStyleConverter(ILogger<AvaloniaStyleConverter>? logger = null)
    {
        _logger = logger;
    }

    /// <summary>
    /// Convert a CSS rule string to an Avalonia Style object.
    /// </summary>
    /// <param name="className">CSS class name (e.g., "rx-button")</param>
    /// <param name="cssRules">CSS rules string (e.g., ".rx-button { color: red; }")</param>
    /// <returns>Avalonia Style object or null if conversion fails</returns>
    public Style? ConvertToStyle(string className, string cssRules)
    {
        if (string.IsNullOrWhiteSpace(className) || string.IsNullOrWhiteSpace(cssRules))
        {
            _logger?.LogWarning("⚠️ Cannot convert empty className or cssRules");
            return null;
        }

        try
        {
            // Parse CSS properties from the rules
            var properties = ParseCssProperties(cssRules);
            
            if (properties.Count == 0)
            {
                _logger?.LogWarning("⚠️ No CSS properties found in rules for {ClassName}", className);
                return null;
            }

            // Create Avalonia Style with class selector
            // Selector format: "Button.rx-button" matches Button controls with Classes containing "rx-button"
            var style = new Style(x => x.OfType<Control>().Class(className));

            // Convert each CSS property to Avalonia Setter
            foreach (var (cssProperty, cssValue) in properties)
            {
                var setter = ConvertPropertyToSetter(cssProperty, cssValue);
                if (setter != null)
                {
                    style.Setters.Add(setter);
                    _logger?.LogDebug("✅ Converted {CssProperty}: {CssValue} → {AvaloniaProperty}", 
                        cssProperty, cssValue, setter.Property.Name);
                }
                else
                {
                    _logger?.LogDebug("⚠️ Could not convert {CssProperty}: {CssValue}", cssProperty, cssValue);
                }
            }

            _logger?.LogInformation("✅ Created Avalonia Style for .{ClassName} with {Count} setters", 
                className, style.Setters.Count);

            return style;
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "❌ Failed to convert CSS to Avalonia Style for {ClassName}", className);
            return null;
        }
    }

    /// <summary>
    /// Parse CSS properties from a CSS rule string.
    /// </summary>
    private Dictionary<string, string> ParseCssProperties(string cssRules)
    {
        var properties = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        // Extract content between { }
        var match = Regex.Match(cssRules, @"\{([^}]+)\}");
        if (!match.Success)
        {
            return properties;
        }

        var declarations = match.Groups[1].Value;

        // Split by semicolon and parse each property
        var pairs = declarations.Split(';', StringSplitOptions.RemoveEmptyEntries);
        foreach (var pair in pairs)
        {
            var colonIndex = pair.IndexOf(':');
            if (colonIndex > 0)
            {
                var property = pair.Substring(0, colonIndex).Trim();
                var value = pair.Substring(colonIndex + 1).Trim();
                properties[property] = value;
            }
        }

        return properties;
    }

    /// <summary>
    /// Convert a single CSS property to an Avalonia Setter.
    /// </summary>
    private Setter? ConvertPropertyToSetter(string cssProperty, string cssValue)
    {
        return cssProperty.ToLowerInvariant() switch
        {
            // Color properties
            "color" => CreateSetter(TemplatedControl.ForegroundProperty, ParseColor(cssValue)),
            "background-color" or "background" => CreateSetter(TemplatedControl.BackgroundProperty, ParseColor(cssValue)),
            "border-color" => CreateSetter(Border.BorderBrushProperty, ParseColor(cssValue)),

            // Size properties
            "width" => CreateSetter(Layoutable.WidthProperty, ParseSize(cssValue)),
            "height" => CreateSetter(Layoutable.HeightProperty, ParseSize(cssValue)),
            "min-width" => CreateSetter(Layoutable.MinWidthProperty, ParseSize(cssValue)),
            "min-height" => CreateSetter(Layoutable.MinHeightProperty, ParseSize(cssValue)),
            "max-width" => CreateSetter(Layoutable.MaxWidthProperty, ParseSize(cssValue)),
            "max-height" => CreateSetter(Layoutable.MaxHeightProperty, ParseSize(cssValue)),

            // Margin and Padding
            "margin" => CreateSetter(Layoutable.MarginProperty, ParseThickness(cssValue)),
            "padding" => CreateSetter(Decorator.PaddingProperty, ParseThickness(cssValue)),

            // Border
            "border-width" => CreateSetter(Border.BorderThicknessProperty, ParseThickness(cssValue)),

            // Font properties
            "font-size" => CreateSetter(TemplatedControl.FontSizeProperty, ParseFontSize(cssValue)),
            "font-weight" => CreateSetter(TemplatedControl.FontWeightProperty, ParseFontWeight(cssValue)),
            "font-family" => CreateSetter(TemplatedControl.FontFamilyProperty, ParseFontFamily(cssValue)),

            // Opacity
            "opacity" => CreateSetter(Visual.OpacityProperty, ParseOpacity(cssValue)),

            _ => null
        };
    }

    private Setter? CreateSetter(AvaloniaProperty property, object? value)
    {
        if (value == null)
            return null;

        return new Setter(property, value);
    }

    // Parsing helper methods

    private IBrush? ParseColor(string cssColor)
    {
        try
        {
            // Handle common formats: #RGB, #RRGGBB, #RRGGBBAA, rgb(), rgba(), named colors
            cssColor = cssColor.Trim().ToLowerInvariant();

            // Named colors
            if (cssColor == "transparent")
                return Brushes.Transparent;

            // Hex colors
            if (cssColor.StartsWith("#"))
            {
                return new SolidColorBrush(Color.Parse(cssColor));
            }

            // rgb/rgba
            if (cssColor.StartsWith("rgb"))
            {
                var match = Regex.Match(cssColor, @"rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)");
                if (match.Success)
                {
                    byte r = byte.Parse(match.Groups[1].Value);
                    byte g = byte.Parse(match.Groups[2].Value);
                    byte b = byte.Parse(match.Groups[3].Value);
                    byte a = match.Groups[4].Success 
                        ? (byte)(double.Parse(match.Groups[4].Value, CultureInfo.InvariantCulture) * 255)
                        : (byte)255;
                    return new SolidColorBrush(Color.FromArgb(a, r, g, b));
                }
            }

            // Try parsing as named color
            return new SolidColorBrush(Color.Parse(cssColor));
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "⚠️ Failed to parse color: {Color}", cssColor);
            return null;
        }
    }

    private double? ParseSize(string cssSize)
    {
        try
        {
            cssSize = cssSize.Trim().ToLowerInvariant();

            // Handle px, rem, em, % - convert all to pixels for simplicity
            if (cssSize.EndsWith("px"))
            {
                return double.Parse(cssSize.Replace("px", ""), CultureInfo.InvariantCulture);
            }
            else if (cssSize.EndsWith("rem") || cssSize.EndsWith("em"))
            {
                // Assume 1rem = 16px
                var value = double.Parse(cssSize.Replace("rem", "").Replace("em", ""), CultureInfo.InvariantCulture);
                return value * 16;
            }
            else if (cssSize == "auto")
            {
                return double.NaN; // Avalonia uses NaN for auto
            }
            else
            {
                // Try parsing as plain number (assume px)
                return double.Parse(cssSize, CultureInfo.InvariantCulture);
            }
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "⚠️ Failed to parse size: {Size}", cssSize);
            return null;
        }
    }

    private Thickness? ParseThickness(string cssThickness)
    {
        try
        {
            cssThickness = cssThickness.Trim().ToLowerInvariant();

            // Remove 'px' suffix
            cssThickness = cssThickness.Replace("px", "");

            var parts = cssThickness.Split(new[] { ' ', ',' }, StringSplitOptions.RemoveEmptyEntries);

            return parts.Length switch
            {
                1 => new Thickness(double.Parse(parts[0], CultureInfo.InvariantCulture)), // all sides
                2 => new Thickness(
                    double.Parse(parts[0], CultureInfo.InvariantCulture), // left/right
                    double.Parse(parts[1], CultureInfo.InvariantCulture), // top/bottom
                    double.Parse(parts[0], CultureInfo.InvariantCulture),
                    double.Parse(parts[1], CultureInfo.InvariantCulture)),
                4 => new Thickness(
                    double.Parse(parts[3], CultureInfo.InvariantCulture), // left
                    double.Parse(parts[0], CultureInfo.InvariantCulture), // top
                    double.Parse(parts[1], CultureInfo.InvariantCulture), // right
                    double.Parse(parts[2], CultureInfo.InvariantCulture)), // bottom
                _ => null
            };
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "⚠️ Failed to parse thickness: {Thickness}", cssThickness);
            return null;
        }
    }

    private double? ParseFontSize(string cssFontSize)
    {
        return ParseSize(cssFontSize);
    }

    private FontWeight? ParseFontWeight(string cssFontWeight)
    {
        try
        {
            cssFontWeight = cssFontWeight.Trim().ToLowerInvariant();

            return cssFontWeight switch
            {
                "normal" => FontWeight.Normal,
                "bold" => FontWeight.Bold,
                "lighter" => FontWeight.Light,
                "bolder" => FontWeight.Bold,
                "100" => FontWeight.Thin,
                "200" => FontWeight.ExtraLight,
                "300" => FontWeight.Light,
                "400" => FontWeight.Normal,
                "500" => FontWeight.Medium,
                "600" => FontWeight.SemiBold,
                "700" => FontWeight.Bold,
                "800" => FontWeight.ExtraBold,
                "900" => FontWeight.Black,
                _ => null
            };
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "⚠️ Failed to parse font-weight: {FontWeight}", cssFontWeight);
            return null;
        }
    }

    private FontFamily? ParseFontFamily(string cssFontFamily)
    {
        try
        {
            // Remove quotes and trim
            cssFontFamily = cssFontFamily.Trim().Trim('"', '\'');

            // Take first font family (ignore fallbacks for now)
            var firstFont = cssFontFamily.Split(',')[0].Trim();

            return new FontFamily(firstFont);
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "⚠️ Failed to parse font-family: {FontFamily}", cssFontFamily);
            return null;
        }
    }

    private double? ParseOpacity(string cssOpacity)
    {
        try
        {
            var opacity = double.Parse(cssOpacity.Trim(), CultureInfo.InvariantCulture);
            return Math.Clamp(opacity, 0.0, 1.0);
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "⚠️ Failed to parse opacity: {Opacity}", cssOpacity);
            return null;
        }
    }
}
