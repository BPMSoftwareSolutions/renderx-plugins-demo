using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Library.Controls
{
    /// <summary>
    /// Library browser
    /// </summary>
    public partial class LibraryBrowser : UserControl
    {
        public LibraryBrowser()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
