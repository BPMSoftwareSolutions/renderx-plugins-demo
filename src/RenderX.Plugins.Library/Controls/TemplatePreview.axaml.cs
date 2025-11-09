using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Library.Controls
{
    /// <summary>
    /// Template preview
    /// </summary>
    public partial class TemplatePreview : UserControl
    {
        public TemplatePreview()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
