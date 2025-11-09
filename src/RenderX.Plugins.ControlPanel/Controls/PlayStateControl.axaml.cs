using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.ControlPanel.Controls
{
    /// <summary>
    /// Play state control
    /// </summary>
    public partial class PlayStateControl : UserControl
    {
        public PlayStateControl()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
