using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Shell.Avalonia.UI.Controls
{
    /// <summary>
    /// Address text
    /// </summary>
    public partial class RxAddress : UserControl
    {
        public RxAddress()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
