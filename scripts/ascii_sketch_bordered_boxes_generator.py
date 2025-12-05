#!/usr/bin/env python3
"""
ASCII Sketch Generator - Data-driven bordered ASCII boxes with auto-alignment
"""

def generate_sketch(title: str, metrics: dict, style: str = "box", icon: str = "") -> str:
    """
    Generate a clean ASCII sketch with proper alignment.
    
    Args:
        title: Header title for the sketch
        metrics: Dict of metric_name: metric_value pairs
        style: "box" (bordered) or "line" (simple line)
        icon: Optional emoji or icon to prepend to title
    
    Returns:
        Formatted ASCII sketch string
    """
    
    # Format metrics into a single line
    metric_pairs = [f"{name}: {value}" for name, value in metrics.items()]
    content_line = "  │  ".join(metric_pairs)
    content = f"│ {content_line} │"
    
    # Build title section with optional icon
    title_with_icon = f"{icon} {title}".lstrip() if icon else title
    title_section = f"─ {title_with_icon} "
    content_width = len(content)
    
    if style == "box":
        # Calculate visual width (emojis can be 2 chars wide)
        import unicodedata
        def visual_width(s):
            return sum(2 if unicodedata.east_asian_width(c) in 'FW' else 1 for c in s)
        
        title_visual_width = visual_width(title_section)
        # Top border: ┌─ ICON TITLE ─────...─┐
        remaining_width = content_width - title_visual_width - 2  # -2 for ┌ and ┐
        top_border = f"┌{title_section}{'─' * remaining_width}┐"
        
        # Bottom border matches top border visual width exactly
        bottom_dashes = content_width - 2  # -2 for └ and ┘
        bottom_border = f"└{'─' * bottom_dashes}┘"
        
        return f"{top_border}\n{content}\n{bottom_border}"
    
    elif style == "line":
        # Simple line style: just title and content
        separator = "─" * content_width
        return f"{title_with_icon}\n{separator}\n{content}"


def generate_sketch_from_dict(title: str, data: dict, style: str = "box", icon: str = "") -> str:
    """
    Convenience wrapper that accepts data in various formats.
    
    Args:
        title: Header title
        data: Dict of metrics
        style: "box" or "line"
        icon: Optional emoji or icon
    
    Returns:
        Formatted ASCII sketch
    """
    return generate_sketch(title, data, style, icon)


def parse_sketch(sketch_string: str) -> dict:
    """
    Parse an existing ASCII sketch to extract title and metrics.
    
    Args:
        sketch_string: Multi-line ASCII sketch
    
    Returns:
        Dict with 'title' and 'metrics' keys
    """
    lines = sketch_string.strip().split('\n')
    
    # Extract title from first line (between ┌─ and first space before ─)
    title_line = lines[0]
    title = ""
    if '┌─' in title_line:
        start_idx = title_line.find('┌─') + 2
        # Find the last sequence of dashes before ┐
        end_idx = title_line.rfind('─')
        if end_idx > start_idx:
            title = title_line[start_idx:end_idx].strip()
    
    if not title:
        title = "UNKNOWN"
    
    # Extract metrics from content line
    content_line = lines[1] if len(lines) > 1 else ""
    content_line = content_line.strip('│ ')
    
    metrics = {}
    for pair in content_line.split('│'):
        pair = pair.strip()
        if ':' in pair:
            name, value = pair.split(':', 1)
            metrics[name.strip()] = value.strip()
    
    return {'title': title, 'metrics': metrics}


# Example usage
if __name__ == "__main__":
    # Example 1: Generate from scratch
    metrics = {
        "Files": "791",
        "LOC": "5168",
        "Handlers": "285",
        "Avg": "18.13",
        "Coverage": "80.38%"
    }
    
    sketch = generate_sketch("CODEBASE METRICS", metrics, style="box", icon="📊")
    print("Generated Sketch with Icon:")
    print(sketch)
    print()
    
    # Example 2: Without icon
    sketch_no_icon = generate_sketch("CODEBASE METRICS", metrics, style="box")
    print("Generated Sketch without Icon:")
    print(sketch_no_icon)
    print()
    
    # Example 3: Line style with icon
    line_style = generate_sketch("CODEBASE METRICS", metrics, style="line", icon="📊")
    print("Line Style with Icon:")
    print(line_style)
