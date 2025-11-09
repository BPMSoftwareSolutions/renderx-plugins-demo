using System;

namespace RenderX.Shell.Avalonia.Infrastructure
{
    /// <summary>
    /// Manages theme switching between light and dark modes.
    /// Provides centralized control over application-wide styling.
    ///
    /// Note: Theme styles are loaded via App.axaml StyleInclude directives.
    /// This manager provides the API for future dynamic theme switching.
    /// </summary>
    public class ThemeManager
    {
        private static ThemeManager? _instance;
        private ThemeMode _currentTheme = ThemeMode.Light;

        public event EventHandler<ThemeModeChangedEventArgs>? ThemeModeChanged;

        public static ThemeManager Instance => _instance ??= new ThemeManager();

        public ThemeMode CurrentTheme
        {
            get => _currentTheme;
            set => SetTheme(value);
        }

        /// <summary>
        /// Sets the application theme.
        /// Currently supports Light and Dark modes.
        /// </summary>
        public void SetTheme(ThemeMode theme)
        {
            if (_currentTheme == theme)
                return;

            var oldTheme = _currentTheme;
            _currentTheme = theme;

            // TODO: Implement dynamic theme switching via DynamicResource updates
            // For now, themes are loaded statically via App.axaml

            ThemeModeChanged?.Invoke(this, new ThemeModeChangedEventArgs(oldTheme, theme));
        }

        /// <summary>
        /// Toggles between light and dark themes.
        /// </summary>
        public void ToggleTheme()
        {
            SetTheme(_currentTheme == ThemeMode.Light ? ThemeMode.Dark : ThemeMode.Light);
        }
    }
    
    /// <summary>
    /// Represents the available theme modes.
    /// </summary>
    public enum ThemeMode
    {
        Light,
        Dark
    }
    
    /// <summary>
    /// Event arguments for theme mode changes.
    /// </summary>
    public class ThemeModeChangedEventArgs : EventArgs
    {
        public ThemeModeChangedEventArgs(ThemeMode oldTheme, ThemeMode newTheme)
        {
            OldTheme = oldTheme;
            NewTheme = newTheme;
        }
        
        public ThemeMode OldTheme { get; }
        public ThemeMode NewTheme { get; }
    }
}

