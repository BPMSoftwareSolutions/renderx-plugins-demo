using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Components.Controls
{
    /// <summary>
    /// Component events
    /// </summary>
    public partial class ComponentEvents : UserControl
    {
        public ComponentEvents()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
