using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.Diagnostics.Controls
{
    /// <summary>
    /// State tree view
    /// </summary>
    public partial class StateTree : UserControl
    {
        public StateTree()
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
