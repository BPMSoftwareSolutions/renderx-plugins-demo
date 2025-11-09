using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Components.Controls
{
    /// <summary>
    /// Component wrapper
    /// </summary>
    public partial class ComponentWrapper : UserControl
    {
        public ComponentWrapper()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
