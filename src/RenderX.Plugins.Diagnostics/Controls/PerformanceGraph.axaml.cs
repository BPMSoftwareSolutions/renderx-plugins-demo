using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.Diagnostics.Controls
{
    /// <summary>
    /// Performance graph
    /// </summary>
    public partial class PerformanceGraph : UserControl
    {
        public PerformanceGraph()
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
