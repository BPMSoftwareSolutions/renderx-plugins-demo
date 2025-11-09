using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.ControlPanel.Controls
{
    /// <summary>
    /// Options panel
    /// </summary>
    public partial class OptionsPanel : UserControl
    {
        public OptionsPanel()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
