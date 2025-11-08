using System;
using System.Threading.Tasks;
using Avalonia.Controls;

namespace RenderX.Shell.Avalonia.Infrastructure.Plugins
{
    /// <summary>
    /// Loads UI controls for named slots using dynamic type resolution.
    /// Avoids direct compile-time references to plugin controls.
    /// </summary>
    public interface IPluginLoader
    {
        /// <summary>
        /// Load and initialize a control for the given slot name.
        /// Returns null if no control is mapped for the slot.
        /// </summary>
        Task<Control?> LoadControlForSlotAsync(string slotName, IServiceProvider services);
    }
}

