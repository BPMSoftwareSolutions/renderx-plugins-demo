using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Shell.Avalonia.UI.Controls
{
    /// <summary>
    /// Output text
    /// </summary>
    public partial class RxOutput : UserControl
    {
        public RxOutput()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
