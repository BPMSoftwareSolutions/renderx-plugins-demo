using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.DigitalAssets.Controls
{
    /// <summary>
    /// Asset card
    /// </summary>
    public partial class AssetCard : UserControl
    {
        public AssetCard()
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
