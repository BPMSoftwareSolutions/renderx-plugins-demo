using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.ControlPanel.Controls
{
    /// <summary>
    /// Timeline panel
    /// </summary>
    public partial class TimelinePanel : UserControl
    {
        public TimelinePanel()
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
