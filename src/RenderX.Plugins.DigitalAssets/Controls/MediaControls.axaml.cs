using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.DigitalAssets.Controls
{
    /// <summary>
    /// Media controls
    /// </summary>
    public partial class MediaControls : UserControl
    {
        public MediaControls()
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
