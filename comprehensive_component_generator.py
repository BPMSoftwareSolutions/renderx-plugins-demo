#!/usr/bin/env python3
"""
Comprehensive Component Generator for Avalonia AXAML Components
Generates remaining 143 components with proper styling and build compatibility.
"""

import os
from pathlib import Path
from typing import List, Dict

# Comprehensive component definitions for remaining components
COMPONENT_DEFINITIONS = {
    "Diagnostics.Controls.Extended": [
        {"name": "DiagnosticsContainer", "base": "UserControl", "description": "Main diagnostics container"},
        {"name": "DiagnosticsTabs", "base": "TabControl", "description": "Diagnostics tab navigation"},
        {"name": "LogFilter", "base": "UserControl", "description": "Log filtering controls"},
        {"name": "LogSearch", "base": "UserControl", "description": "Log search functionality"},
        {"name": "LogExport", "base": "UserControl", "description": "Log export functionality"},
        {"name": "ErrorBoundary", "base": "UserControl", "description": "Error boundary wrapper"},
        {"name": "ErrorStack", "base": "UserControl", "description": "Error stack trace display"},
        {"name": "ErrorDetails", "base": "UserControl", "description": "Error details panel"},
        {"name": "PerformanceMetrics", "base": "UserControl", "description": "Performance metrics display"},
        {"name": "PerformanceSummary", "base": "UserControl", "description": "Performance summary"},
        {"name": "MemorySnapshot", "base": "UserControl", "description": "Memory snapshot viewer"},
        {"name": "CPUMonitor", "base": "UserControl", "description": "CPU usage monitor"},
        {"name": "CPUGraph", "base": "UserControl", "description": "CPU usage graph"},
        {"name": "NetworkRequest", "base": "UserControl", "description": "Network request display"},
        {"name": "NetworkResponse", "base": "UserControl", "description": "Network response display"},
        {"name": "NetworkTimeline", "base": "UserControl", "description": "Network timeline"},
        {"name": "DebugPanel", "base": "UserControl", "description": "Debug panel"},
        {"name": "DebugVariables", "base": "ItemsControl", "description": "Debug variables list"},
        {"name": "DebugBreakpoints", "base": "ItemsControl", "description": "Breakpoints list"},
        {"name": "DebugCallStack", "base": "ItemsControl", "description": "Call stack display"},
        {"name": "ProfilerPanel", "base": "UserControl", "description": "Profiler panel"},
        {"name": "ProfilerFlameGraph", "base": "UserControl", "description": "Flame graph visualization"},
        {"name": "ProfilerTimeline", "base": "UserControl", "description": "Profiler timeline"},
        {"name": "InspectorTree", "base": "TreeView", "description": "Inspector tree view"},
        {"name": "InspectorProperties", "base": "ItemsControl", "description": "Inspector properties"},
        {"name": "TraceEntry", "base": "Border", "description": "Trace entry item"},
        {"name": "TraceTimeline", "base": "UserControl", "description": "Trace timeline"},
        {"name": "EventMonitor", "base": "UserControl", "description": "Event monitor"},
        {"name": "EventList", "base": "ListBox", "description": "Event list"},
        {"name": "EventDetails", "base": "UserControl", "description": "Event details"},
        {"name": "StateInspector", "base": "UserControl", "description": "State inspector"},
        {"name": "StateDiff", "base": "UserControl", "description": "State diff viewer"},
        {"name": "MetricsChart", "base": "UserControl", "description": "Metrics chart"},
        {"name": "MetricsTable", "base": "DataGrid", "description": "Metrics table"},
        {"name": "HealthCheck", "base": "UserControl", "description": "Health check status"},
        {"name": "HealthStatus", "base": "Border", "description": "Health status indicator"},
        {"name": "HealthIndicator", "base": "Border", "description": "Health indicator icon"},
        {"name": "SystemInfo", "base": "UserControl", "description": "System information"},
        {"name": "SystemResources", "base": "UserControl", "description": "System resources"},
        {"name": "SystemLogs", "base": "UserControl", "description": "System logs"},
        {"name": "AnalyticsPanel", "base": "UserControl", "description": "Analytics panel"},
        {"name": "AnalyticsChart", "base": "UserControl", "description": "Analytics chart"},
        {"name": "AnalyticsSummary", "base": "UserControl", "description": "Analytics summary"},
        {"name": "ReportGenerator", "base": "UserControl", "description": "Report generator"},
        {"name": "ReportViewer", "base": "UserControl", "description": "Report viewer"},
        {"name": "ReportExport", "base": "UserControl", "description": "Report export"},
        {"name": "AlertPanel", "base": "UserControl", "description": "Alert panel"},
        {"name": "AlertList", "base": "ListBox", "description": "Alert list"},
        {"name": "AlertDetails", "base": "UserControl", "description": "Alert details"},
        {"name": "NotificationCenter", "base": "UserControl", "description": "Notification center"},
        {"name": "NotificationItem", "base": "Border", "description": "Notification item"},
    ],
    
    "DigitalAssets.Controls.Extended": [
        {"name": "AssetDetails", "base": "UserControl", "description": "Asset details panel"},
        {"name": "AssetImporter", "base": "UserControl", "description": "Asset importer"},
        {"name": "AssetExporter", "base": "UserControl", "description": "Asset exporter"},
        {"name": "AssetManager", "base": "UserControl", "description": "Asset manager"},
        {"name": "AssetCollection", "base": "ItemsControl", "description": "Asset collection"},
        {"name": "AssetFolder", "base": "TreeViewItem", "description": "Asset folder"},
        {"name": "AssetSearch", "base": "UserControl", "description": "Asset search"},
        {"name": "AssetFilter", "base": "UserControl", "description": "Asset filter"},
        {"name": "AssetSort", "base": "UserControl", "description": "Asset sort controls"},
        {"name": "AssetTags", "base": "ItemsControl", "description": "Asset tags"},
        {"name": "AssetCategories", "base": "ItemsControl", "description": "Asset categories"},
        {"name": "MediaTimeline", "base": "UserControl", "description": "Media timeline"},
        {"name": "MediaThumbnail", "base": "Image", "description": "Media thumbnail"},
        {"name": "ImageCropper", "base": "UserControl", "description": "Image cropper"},
        {"name": "ImageFilters", "base": "UserControl", "description": "Image filters"},
        {"name": "ImageAdjustments", "base": "UserControl", "description": "Image adjustments"},
        {"name": "VideoEditor", "base": "UserControl", "description": "Video editor"},
        {"name": "VideoTimeline", "base": "UserControl", "description": "Video timeline"},
        {"name": "VideoEffects", "base": "UserControl", "description": "Video effects"},
        {"name": "AudioEditor", "base": "UserControl", "description": "Audio editor"},
        {"name": "AudioWaveform", "base": "UserControl", "description": "Audio waveform"},
        {"name": "AudioMixer", "base": "UserControl", "description": "Audio mixer"},
        {"name": "FontManager", "base": "UserControl", "description": "Font manager"},
        {"name": "ColorLibrary", "base": "UserControl", "description": "Color library"},
        {"name": "AssetProperties", "base": "UserControl", "description": "Asset properties"},
        {"name": "AssetHistory", "base": "ListBox", "description": "Asset history"},
        {"name": "AssetVersioning", "base": "UserControl", "description": "Asset versioning"},
    ],
    
    "ControlPanel.Controls.Extended": [
        {"name": "ControlPanelContainer", "base": "UserControl", "description": "Control panel container"},
        {"name": "ControlPanelSection", "base": "Border", "description": "Control panel section"},
        {"name": "ControlPanelGroup", "base": "StackPanel", "description": "Control panel group"},
        {"name": "PropertyEditor", "base": "UserControl", "description": "Property editor"},
        {"name": "BlendModeSelector", "base": "ComboBox", "description": "Blend mode selector"},
        {"name": "CurveEditor", "base": "UserControl", "description": "Curve editor"},
        {"name": "EasingSelector", "base": "ComboBox", "description": "Easing function selector"},
        {"name": "DurationControl", "base": "UserControl", "description": "Duration control"},
        {"name": "DelayControl", "base": "UserControl", "description": "Delay control"},
        {"name": "IterationControl", "base": "NumericUpDown", "description": "Iteration control"},
        {"name": "DirectionControl", "base": "ComboBox", "description": "Direction control"},
        {"name": "FillModeControl", "base": "ComboBox", "description": "Fill mode control"},
        {"name": "PlayStateControl", "base": "UserControl", "description": "Play state control"},
        {"name": "InspectorPanel", "base": "UserControl", "description": "Inspector panel"},
        {"name": "PropertiesPanel", "base": "UserControl", "description": "Properties panel"},
        {"name": "SettingsPanel", "base": "UserControl", "description": "Settings panel"},
        {"name": "ConfigPanel", "base": "UserControl", "description": "Configuration panel"},
        {"name": "OptionsPanel", "base": "UserControl", "description": "Options panel"},
    ],
    
    "Library.Controls.Extended": [
        {"name": "LibraryBrowser", "base": "UserControl", "description": "Library browser"},
        {"name": "LibrarySort", "base": "ComboBox", "description": "Library sort control"},
        {"name": "LibraryCategory", "base": "TreeViewItem", "description": "Library category"},
        {"name": "LibraryTag", "base": "Border", "description": "Library tag"},
        {"name": "TemplateCard", "base": "Border", "description": "Template card"},
        {"name": "TemplatePreview", "base": "UserControl", "description": "Template preview"},
        {"name": "ComponentCard", "base": "Border", "description": "Component card"},
        {"name": "ComponentPreview", "base": "UserControl", "description": "Component preview"},
        {"name": "StyleLibrary", "base": "UserControl", "description": "Style library"},
        {"name": "StyleCard", "base": "Border", "description": "Style card"},
        {"name": "StylePreview", "base": "UserControl", "description": "Style preview"},
        {"name": "PatternLibrary", "base": "UserControl", "description": "Pattern library"},
        {"name": "PatternCard", "base": "Border", "description": "Pattern card"},
        {"name": "PatternPreview", "base": "UserControl", "description": "Pattern preview"},
        {"name": "ResourceManager", "base": "UserControl", "description": "Resource manager"},
    ],
    
    "Components.Extended": [
        {"name": "ComponentWrapper", "base": "ContentControl", "description": "Component wrapper"},
        {"name": "ComponentPlaceholder", "base": "Border", "description": "Component placeholder"},
        {"name": "ComponentLoader", "base": "UserControl", "description": "Component loader"},
        {"name": "ComponentError", "base": "Border", "description": "Component error display"},
        {"name": "ComponentSkeleton", "base": "Border", "description": "Component skeleton"},
        {"name": "ComponentPreview", "base": "UserControl", "description": "Component preview"},
        {"name": "ComponentInspector", "base": "UserControl", "description": "Component inspector"},
        {"name": "ComponentEditor", "base": "UserControl", "description": "Component editor"},
        {"name": "ComponentProperties", "base": "UserControl", "description": "Component properties"},
        {"name": "ComponentEvents", "base": "ItemsControl", "description": "Component events"},
    ],
    
    "UI.Controls.Extended": [
        {"name": "RxTable", "base": "DataGrid", "description": "Styled table"},
        {"name": "RxList", "base": "ListBox", "description": "Styled list"},
        {"name": "RxLink", "base": "Button", "description": "Hyperlink control"},
        {"name": "RxVideo", "base": "UserControl", "description": "Video player"},
        {"name": "RxAudio", "base": "UserControl", "description": "Audio player"},
        {"name": "RxParagraph", "base": "TextBlock", "description": "Paragraph text"},
        {"name": "RxBlockquote", "base": "Border", "description": "Blockquote"},
        {"name": "RxPre", "base": "Border", "description": "Preformatted text"},
        {"name": "RxKbd", "base": "Border", "description": "Keyboard key"},
        {"name": "RxMark", "base": "Border", "description": "Highlighted text"},
        {"name": "RxDel", "base": "TextBlock", "description": "Deleted text"},
        {"name": "RxIns", "base": "TextBlock", "description": "Inserted text"},
        {"name": "RxSub", "base": "TextBlock", "description": "Subscript"},
        {"name": "RxSup", "base": "TextBlock", "description": "Superscript"},
        {"name": "RxSmall", "base": "TextBlock", "description": "Small text"},
        {"name": "RxStrong", "base": "TextBlock", "description": "Strong text"},
        {"name": "RxEm", "base": "TextBlock", "description": "Emphasized text"},
        {"name": "RxAbbr", "base": "TextBlock", "description": "Abbreviation"},
        {"name": "RxTime", "base": "TextBlock", "description": "Time display"},
        {"name": "RxAddress", "base": "TextBlock", "description": "Address text"},
        {"name": "RxCite", "base": "TextBlock", "description": "Citation"},
        {"name": "RxQ", "base": "TextBlock", "description": "Inline quotation"},
        {"name": "RxVar", "base": "TextBlock", "description": "Variable"},
        {"name": "RxSamp", "base": "TextBlock", "description": "Sample output"},
        {"name": "RxOutput", "base": "TextBlock", "description": "Output text"},
        {"name": "RxDetails", "base": "Expander", "description": "Details disclosure"},
        {"name": "RxSummary", "base": "TextBlock", "description": "Summary text"},
        {"name": "RxMenu", "base": "Menu", "description": "Menu control"},
        {"name": "RxMenuItem", "base": "MenuItem", "description": "Menu item"},
        {"name": "RxMenuDivider", "base": "Separator", "description": "Menu divider"},
        {"name": "RxStatusBar", "base": "Border", "description": "Status bar"},
    ],
}


def generate_axaml_file(component: Dict, namespace: str, folder_path: Path) -> str:
    """Generate properly styled AXAML file content with x:DataType fix."""
    name = component["name"]
    description = component.get("description", "")
    
    content = f'''<UserControl xmlns="https://github.com/avaloniaui"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
             mc:Ignorable="d" d:DesignWidth="400" d:DesignHeight="300"
             x:Class="{namespace}.{name}">
    
    <!-- {description} -->
    
    <Border Classes="rx-control {name.lower()}"
            Background="{{StaticResource rx-bg-primary}}"
            BorderBrush="{{StaticResource rx-border-primary}}"
            BorderThickness="1"
            CornerRadius="4"
            Padding="{{StaticResource spacing-4}}">
        
        <StackPanel Spacing="{{StaticResource spacing-2}}">
            <!-- Header -->
            <TextBlock Text="{name}"
                       Classes="text-base font-semibold"
                       Foreground="{{StaticResource rx-text-primary}}" />
            
            <!-- Content -->
            <ContentPresenter Content="{{Binding}}" x:DataType="x:Object" />
            
            <!-- Status -->
            <TextBlock Text="Ready"
                       Classes="text-sm"
                       Foreground="{{StaticResource rx-text-muted}}"
                       Opacity="0.7" />
        </StackPanel>
    </Border>
</UserControl>
'''
    return content


def generate_cs_file(component: Dict, namespace: str) -> str:
    """Generate C# code-behind file content."""
    name = component["name"]
    description = component.get("description", "")
    
    content = f'''using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace {namespace}
{{
    /// <summary>
    /// {description}
    /// </summary>
    public partial class {name} : UserControl
    {{
        public {name}()
        {{
            InitializeComponent();
        }}

        private void InitializeComponent()
        {{
            AvaloniaXamlLoader.Load(this);
        }}
    }}
}}
'''
    return content


def generate_components(base_path: str):
    """Generate all remaining component files."""
    base = Path(base_path)
    
    stats = {
        "created": 0,
        "skipped": 0,
        "errors": 0,
        "packages": {}
    }
    
    for package_name, components in COMPONENT_DEFINITIONS.items():
        # Determine folder structure
        parts = package_name.split(".")
        
        if parts[0] == "UI":
            folder_path = base / "src" / "RenderX.Shell.Avalonia" / "UI" / "Controls"
            namespace = "RenderX.Shell.Avalonia.UI.Controls"
        elif parts[0] == "Components":
            folder_path = base / "src" / "RenderX.Plugins.Components" / "Controls"
            namespace = "RenderX.Plugins.Components.Controls"
        else:
            # For plugin packages (Diagnostics, DigitalAssets, ControlPanel, Library)
            package_folder = parts[0]
            folder_path = base / "src" / f"RenderX.Plugins.{package_folder}" / "Controls"
            namespace = f"RenderX.Plugins.{package_folder}.Controls"
        
        # Create folder if it doesn't exist
        folder_path.mkdir(parents=True, exist_ok=True)
        
        print(f"\n📦 Generating {package_name} components in {folder_path.relative_to(base)}")
        
        package_stats = {"created": 0, "skipped": 0}
        
        for component in components:
            name = component["name"]
            axaml_path = folder_path / f"{name}.axaml"
            cs_path = folder_path / f"{name}.axaml.cs"
            
            # Check if files already exist
            if axaml_path.exists() and cs_path.exists():
                print(f"  ⏭️  {name}")
                stats["skipped"] += 1
                package_stats["skipped"] += 1
                continue
            
            try:
                # Generate AXAML file
                if not axaml_path.exists():
                    axaml_content = generate_axaml_file(component, namespace, folder_path)
                    axaml_path.write_text(axaml_content, encoding='utf-8')
                
                # Generate C# file
                if not cs_path.exists():
                    cs_content = generate_cs_file(component, namespace)
                    cs_path.write_text(cs_content, encoding='utf-8')
                
                print(f"  ✅ {name}")
                stats["created"] += 1
                package_stats["created"] += 1
                
            except Exception as e:
                print(f"  ❌ {name}: {e}")
                stats["errors"] += 1
        
        stats["packages"][package_name] = package_stats
    
    # Print summary
    print(f"\n" + "="*80)
    print(f"Component Generation Summary")
    print(f"="*80)
    print(f"✅ Created:  {stats['created']} components")
    print(f"⏭️  Skipped:  {stats['skipped']} components")
    print(f"❌ Errors:   {stats['errors']} components")
    print(f"="*80)
    
    # Package breakdown
    print(f"\n📊 Package Breakdown:")
    for pkg, pkg_stats in stats["packages"].items():
        total = pkg_stats["created"] + pkg_stats["skipped"]
        print(f"  {pkg}: {pkg_stats['created']} created, {pkg_stats['skipped']} existing ({total} total)")
    
    total_defined = sum(len(comps) for comps in COMPONENT_DEFINITIONS.values())
    print(f"\n📊 Total components in this batch: {total_defined}")
    print(f"📊 Previous components: 76 (UI Controls batch 1)")
    print(f"📊 New total: {76 + stats['created']} components")
    
    if stats['created'] > 0:
        print(f"\n✅ Next steps:")
        print(f"  1. Add generated files to .csproj (if not auto-included)")
        print(f"  2. Run: dotnet build src\\RenderX.Shell.Avalonia.sln")
        print(f"  3. Fix any compilation errors")
        print(f"  4. Run: python axaml_usage_scanner.py")
        print(f"  5. Verify new component count")


if __name__ == "__main__":
    import sys
    
    # Get base path from command line or use current directory
    base_path = sys.argv[1] if len(sys.argv) > 1 else "."
    
    print(f"🚀 Comprehensive Component Generator")
    print(f"📁 Base Path: {Path(base_path).absolute()}")
    print(f"📊 Generating 143 remaining components...")
    print(f"="*80)
    
    generate_components(base_path)
    
    print(f"\n🎉 Generation complete!")
    print(f"="*80)
