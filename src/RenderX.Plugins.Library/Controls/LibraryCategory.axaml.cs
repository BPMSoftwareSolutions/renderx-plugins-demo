using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Library.Controls
{
    /// <summary>
    /// Library category
    /// </summary>
    public partial class LibraryCategory : UserControl
    {
        public LibraryCategory()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
