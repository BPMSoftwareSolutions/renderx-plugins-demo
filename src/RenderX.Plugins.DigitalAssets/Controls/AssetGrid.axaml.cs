using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.DigitalAssets.Controls
{
    /// <summary>
    /// Asset grid view
    /// </summary>
    public partial class AssetGrid : UserControl
    {
        public AssetGrid()
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
