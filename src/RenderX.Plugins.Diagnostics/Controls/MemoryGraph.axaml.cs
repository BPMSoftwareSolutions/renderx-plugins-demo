using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.Diagnostics.Controls
{
    /// <summary>
    /// Memory graph
    /// </summary>
    public partial class MemoryGraph : UserControl
    {
        public MemoryGraph()
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
