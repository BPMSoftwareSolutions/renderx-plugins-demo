using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Diagnostics.Controls
{
    /// <summary>
    /// Metrics table
    /// </summary>
    public partial class MetricsTable : UserControl
    {
        public MetricsTable()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
