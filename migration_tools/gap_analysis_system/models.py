"""
Domain Models for Gap Analysis System

Core data structures representing the entities in the gap analysis domain.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Set, Optional, Any


@dataclass
class ComponentFeature:
    """Represents a feature/capability of a component."""
    name: str
    description: str
    implementation_type: str  # 'ui', 'logic', 'style', 'interaction'
    code_snippet: Optional[str] = None
    file_path: Optional[str] = None
    line_number: Optional[int] = None


@dataclass
class WebComponent:
    """Represents a web UI component (React/TypeScript)."""
    name: str
    file_path: str
    component_type: str  # 'function', 'class', 'const'
    line_count: int
    props: List[str] = field(default_factory=list)
    hooks: List[str] = field(default_factory=list)
    events: List[str] = field(default_factory=list)
    css_file: Optional[str] = None
    css_classes: Set[str] = field(default_factory=set)
    features: List[ComponentFeature] = field(default_factory=list)
    imports: List[str] = field(default_factory=list)
    jsx_elements: List[str] = field(default_factory=list)  # Actual JSX elements rendered
    rendered_text: List[str] = field(default_factory=list)  # Text content/labels
    # Heuristics for layout and conditional UI
    layout_hints: Dict[str, Any] = field(default_factory=dict)
    ui_hints: Dict[str, Any] = field(default_factory=dict)


@dataclass
class DesktopComponent:
    """Represents a desktop UI component (Avalonia/C#)."""
    name: str
    file_path: str
    axaml_file: Optional[str] = None
    cs_file: Optional[str] = None
    line_count: int = 0
    properties: List[str] = field(default_factory=list)
    events: List[str] = field(default_factory=list)
    styles: Set[str] = field(default_factory=set)
    controls_used: List[str] = field(default_factory=list)
    features: List[ComponentFeature] = field(default_factory=list)
    axaml_elements: List[str] = field(default_factory=list)  # Actual AXAML elements rendered
    rendered_text: List[str] = field(default_factory=list)  # Text content/labels
    # Heuristics for layout and conditional UI
    layout_hints: Dict[str, Any] = field(default_factory=dict)
    ui_hints: Dict[str, Any] = field(default_factory=dict)


@dataclass
class CSSAnalysis:
    """CSS styling analysis results."""
    class_name: str
    properties: Dict[str, str]
    file_path: str
    has_hover: bool = False
    has_animation: bool = False
    has_transition: bool = False
    has_transform: bool = False
    has_gradient: bool = False
    has_shadow: bool = False
    complexity_score: int = 0


@dataclass
class Gap:
    """Represents a gap between web and desktop implementations."""
    gap_type: str  # 'component', 'feature', 'style', 'interaction'
    severity: str  # 'critical', 'high', 'medium', 'low'
    title: str
    description: str
    web_implementation: Optional[str] = None
    desktop_implementation: Optional[str] = None
    web_code_sample: Optional[str] = None
    desktop_code_sample: Optional[str] = None
    impact: Optional[str] = None
    effort_estimate: Optional[str] = None  # 'quick', 'medium', 'large'
    recommendations: List[str] = field(default_factory=list)
    is_quick_win: bool = False
    web_source_path: Optional[str] = None  # Direct link/path to web component file


@dataclass
class PluginAnalysis:
    """Complete analysis for a plugin."""
    plugin_name: str
    web_components: List[WebComponent] = field(default_factory=list)
    desktop_components: List[DesktopComponent] = field(default_factory=list)
    gaps: List[Gap] = field(default_factory=list)
    css_analysis: List[CSSAnalysis] = field(default_factory=list)
    summary: Dict[str, Any] = field(default_factory=dict)
    feature_audit: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
    manifest_audit: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
