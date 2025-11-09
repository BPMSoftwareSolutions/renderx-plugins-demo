using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.ControlPanel.Controls
{
    /// <summary>
    /// Easing function selector
    /// </summary>
    public partial class EasingSelector : UserControl
    {
        public EasingSelector()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
