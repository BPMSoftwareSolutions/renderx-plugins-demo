using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Components.Controls
{
    /// <summary>
    /// Component loader
    /// </summary>
    public partial class ComponentLoader : UserControl
    {
        public ComponentLoader()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
