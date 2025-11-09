using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.ControlPanel.Controls
{
    /// <summary>
    /// Iteration control
    /// </summary>
    public partial class IterationControl : UserControl
    {
        public IterationControl()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
