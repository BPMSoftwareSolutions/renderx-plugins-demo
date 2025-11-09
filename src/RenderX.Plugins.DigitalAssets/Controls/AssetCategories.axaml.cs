using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.DigitalAssets.Controls
{
    /// <summary>
    /// Asset categories
    /// </summary>
    public partial class AssetCategories : UserControl
    {
        public AssetCategories()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
