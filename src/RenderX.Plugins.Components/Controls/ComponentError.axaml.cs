using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Components.Controls
{
    /// <summary>
    /// Component error display
    /// </summary>
    public partial class ComponentError : UserControl
    {
        public ComponentError()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
