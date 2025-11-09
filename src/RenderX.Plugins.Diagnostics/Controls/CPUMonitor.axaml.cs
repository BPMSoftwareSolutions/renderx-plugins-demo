using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Diagnostics.Controls
{
    /// <summary>
    /// CPU usage monitor
    /// </summary>
    public partial class CPUMonitor : UserControl
    {
        public CPUMonitor()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
