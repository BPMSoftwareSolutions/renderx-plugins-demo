using Avalonia.Data.Converters;
using Avalonia.Media;
using RenderX.HostSDK.Avalonia.Services;
using System;
using System.Globalization;

namespace RenderX.Shell.Avalonia.UI.Converters;

/// <summary>
/// Converts LogLevel to a color brush for UI display.
/// </summary>
public class LogLevelColorConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo? culture)
    {
        if (value is not LogLevel level)
            return new SolidColorBrush(Colors.Gray);

        return level switch
        {
            LogLevel.Debug => new SolidColorBrush(Color.Parse("#6B7280")),    // Gray
            LogLevel.Info => new SolidColorBrush(Color.Parse("#3B82F6")),     // Blue
            LogLevel.Warning => new SolidColorBrush(Color.Parse("#F59E0B")),  // Amber
            LogLevel.Error => new SolidColorBrush(Color.Parse("#EF4444")),    // Red
            _ => new SolidColorBrush(Colors.Gray)
        };
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo? culture)
    {
        throw new NotImplementedException();
    }
}

