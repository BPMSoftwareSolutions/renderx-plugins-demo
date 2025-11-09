using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Diagnostics.Controls
{
    /// <summary>
    /// Memory snapshot viewer
    /// </summary>
    public partial class MemorySnapshot : UserControl
    {
        public MemorySnapshot()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
