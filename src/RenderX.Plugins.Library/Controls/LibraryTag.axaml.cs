using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Library.Controls
{
    /// <summary>
    /// Library tag
    /// </summary>
    public partial class LibraryTag : UserControl
    {
        public LibraryTag()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
