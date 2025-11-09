using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.DigitalAssets.Controls
{
    /// <summary>
    /// Asset tags
    /// </summary>
    public partial class AssetTags : UserControl
    {
        public AssetTags()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
