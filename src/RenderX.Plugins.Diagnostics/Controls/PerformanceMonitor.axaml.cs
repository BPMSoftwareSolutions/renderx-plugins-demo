using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.Diagnostics.Controls
{
    /// <summary>
    /// Performance monitor
    /// </summary>
    public partial class PerformanceMonitor : UserControl
    {
        public PerformanceMonitor()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }

        // TODO: Add properties, commands, and logic here
    }
}
