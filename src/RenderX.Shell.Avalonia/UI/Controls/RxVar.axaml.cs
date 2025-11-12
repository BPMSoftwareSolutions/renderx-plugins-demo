using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Shell.Avalonia.UI.Controls
{
    /// <summary>
    /// Variable
    /// </summary>
    public partial class RxVar : UserControl
    {
        public RxVar()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
