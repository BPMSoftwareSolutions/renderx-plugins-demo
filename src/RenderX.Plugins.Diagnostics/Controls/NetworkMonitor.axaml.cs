using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.Diagnostics.Controls
{
    /// <summary>
    /// Network monitor
    /// </summary>
    public partial class NetworkMonitor : UserControl
    {
        public NetworkMonitor()
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
