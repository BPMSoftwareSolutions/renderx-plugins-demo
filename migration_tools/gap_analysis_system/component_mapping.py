"""
Component Equivalence Mapping

Maps web component names to their desktop equivalents.
Used to handle cases where web and desktop use different naming conventions
but implement the same functionality.
"""

# Component name equivalence map: web_name -> list of desktop equivalent names
# Used when web and desktop use different component naming
COMPONENT_EQUIVALENCE = {
    'LibraryPanel': ['LibraryPanel', 'LibraryPlugin'],  # LibraryPlugin is the parent container with grid layout
}
