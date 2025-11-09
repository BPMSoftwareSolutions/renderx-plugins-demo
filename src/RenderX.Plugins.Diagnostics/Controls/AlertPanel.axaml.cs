using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Diagnostics.Controls
{
    /// <summary>
    /// Alert panel
    /// </summary>
    public partial class AlertPanel : UserControl
    {
        public AlertPanel()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
