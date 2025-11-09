using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.ControlPanel.Controls
{
    /// <summary>
    /// Transform panel
    /// </summary>
    public partial class TransformPanel : UserControl
    {
        public TransformPanel()
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
