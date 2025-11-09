using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.ControlPanel.Controls
{
    /// <summary>
    /// Control panel section
    /// </summary>
    public partial class ControlPanelSection : UserControl
    {
        public ControlPanelSection()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
