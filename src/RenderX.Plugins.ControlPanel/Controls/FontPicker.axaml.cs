using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.ControlPanel.Controls
{
    /// <summary>
    /// Font picker
    /// </summary>
    public partial class FontPicker : UserControl
    {
        public FontPicker()
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
