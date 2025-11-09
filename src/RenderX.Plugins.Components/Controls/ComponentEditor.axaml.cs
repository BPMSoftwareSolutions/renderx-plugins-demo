using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Components.Controls
{
    /// <summary>
    /// Component editor
    /// </summary>
    public partial class ComponentEditor : UserControl
    {
        public ComponentEditor()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
