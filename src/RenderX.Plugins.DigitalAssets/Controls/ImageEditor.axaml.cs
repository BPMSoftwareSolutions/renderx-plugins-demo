using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.DigitalAssets.Controls
{
    /// <summary>
    /// Image editor
    /// </summary>
    public partial class ImageEditor : UserControl
    {
        public ImageEditor()
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
