using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Shell.Avalonia.UI.Controls
{
    /// <summary>
    /// Preformatted text
    /// </summary>
    public partial class RxPre : UserControl
    {
        public RxPre()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
