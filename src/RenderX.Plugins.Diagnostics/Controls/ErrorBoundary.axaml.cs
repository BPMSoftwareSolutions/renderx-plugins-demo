using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Diagnostics.Controls
{
    /// <summary>
    /// Error boundary wrapper
    /// </summary>
    public partial class ErrorBoundary : UserControl
    {
        public ErrorBoundary()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
