using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Shell.Avalonia.UI.Controls
{
    /// <summary>
    /// Hyperlink control
    /// </summary>
    public partial class RxLink : UserControl
    {
        public RxLink()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
