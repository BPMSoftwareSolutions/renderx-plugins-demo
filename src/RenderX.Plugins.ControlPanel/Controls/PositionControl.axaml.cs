using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.ControlPanel.Controls
{
    /// <summary>
    /// Position control
    /// </summary>
    public partial class PositionControl : UserControl
    {
        public PositionControl()
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
