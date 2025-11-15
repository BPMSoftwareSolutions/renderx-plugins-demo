#!/usr/bin/env python3
"""
Drop to Canvas Delay Analyzer
Analyzes the RenderX plugin log file to visualize the ~7 second delay
"""

import re
from datetime import datetime
from typing import List, Tuple, Dict

def parse_timestamp(timestamp_str: str) -> datetime:
    """Parse ISO timestamp with Z suffix to datetime object"""
    return datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))

def parse_log_file(file_path: str) -> List[Tuple[datetime, str]]:
    """Parse the log file and extract timestamp + event pairs"""
    events = []
    timestamp_pattern = r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
                
            # Find timestamp in line
            match = re.search(timestamp_pattern, line)
            if match:
                timestamp_str = match.group(1)
                timestamp = parse_timestamp(timestamp_str)
                
                # Extract meaningful event description
                event_desc = extract_event_description(line)
                if event_desc:
                    events.append((timestamp, event_desc))
    
    return events

def extract_event_description(line: str) -> str:
    """Extract a meaningful description from a log line"""
    # Key patterns to look for
    patterns = [
        (r'\[EventRouter\] Topic \'([^\']+)\' definition', r'📡 Topic: \1'),
        (r'Starting delivery for \'([^\']+)\'', r'🚀 Starting: \1'),
        (r'MusicalConductor\.play: preserved (\d+) callback', r'🎼 Conductor: \1 callbacks'),
        (r'PluginInterfaceFacade\.play\(\): (\w+) -> ([^"]+)', r'🔌 Plugin: \1 -> \2'),
        (r'Enqueued "([^"]+)" with priority', r'📥 Queued: \1'),
        (r'Now executing "([^"]+)"', r'⚡ Executing: \1'),
        (r'SequenceExecutor: Executing movement "([^"]+)"', r'🎵 Movement: \1'),
        (r'MovementExecutor: Starting movement "([^"]+)" with (\d+) beats', r'🥁 Starting: \1 (\2 beats)'),
        (r'Beat (\d+) Started: ([^(]+)', r'🎯 Beat \1: \2'),
        (r'emitAsync CALLED for "([^"]+)"', r'📤 Emit: \1'),
        (r'Subscriber (\d+) for "([^"]+)" returned', r'✅ Sub \1 Done: \2'),
        (r'Beat (\d+) completed in ([\d.]+)ms', r'✅ Beat \1: \2ms'),
        (r'Movement completed in ([\d.]+)ms', r'✅ Movement: \1ms'),
        (r'Sequence "([^"]+)" completed in (\d+)ms', r'🎊 Sequence Complete: \1 (\2ms)'),
        (r'DataBaton: ([^|]+)', r'🎽 Data: \1'),
        (r'Topic \'([^\']+)\' definition: \{routes: (\d+)', r'📋 \1: \2 routes'),
    ]
    
    for pattern, replacement in patterns:
        match = re.search(pattern, line)
        if match:
            try:
                return re.sub(pattern, replacement, line)
            except:
                return f"🔍 {match.group(1) if match.lastindex >= 1 else 'Event'}"
    
    # Fallback for lines with key terms
    key_terms = ['PerformanceTracker', 'ExecutionQueue', 'EventBus', 'BeatExecutor']
    for term in key_terms:
        if term in line:
            return f"⚙️ {term}"
    
    return None

def create_ascii_timeline(events: List[Tuple[datetime, str]]) -> str:
    """Create ASCII timeline visualization"""
    if not events:
        return "No events found"
    
    start_time = events[0][0]
    end_time = events[-1][0]
    total_duration = (end_time - start_time).total_seconds()
    
    # Calculate relative timestamps
    timeline_events = []
    for timestamp, description in events:
        relative_time = (timestamp - start_time).total_seconds()
        timeline_events.append((relative_time, description))
    
    # Create ASCII visualization
    result = []
    result.append("=" * 120)
    result.append(f"🚀 DROP TO CANVAS COMPONENT DELAY ANALYSIS")
    result.append("=" * 120)
    result.append(f"📊 Total Duration: {total_duration:.3f} seconds ({total_duration * 1000:.0f}ms)")
    result.append(f"⏰ Start Time: {start_time.strftime('%H:%M:%S.%f')[:-3]}")
    result.append(f"🏁 End Time: {end_time.strftime('%H:%M:%S.%f')[:-3]}")
    result.append("")
    
    # Create timeline bars
    timeline_width = 100
    result.append("Timeline (each '█' = ~70ms):")
    result.append("0ms" + " " * (timeline_width - 10) + f"{total_duration*1000:.0f}ms")
    
    # Create progress bar
    timeline_bar = ['░'] * timeline_width
    
    # Mark major phases
    phase_markers = []
    for i, (rel_time, desc) in enumerate(timeline_events):
        if any(keyword in desc.lower() for keyword in ['drop', 'create', 'complete']):
            pos = min(int((rel_time / total_duration) * timeline_width), timeline_width - 1)
            timeline_bar[pos] = '█'
            phase_markers.append((pos, rel_time, desc))
    
    result.append(''.join(timeline_bar))
    result.append("")
    
    # Detailed timeline
    result.append("📋 DETAILED TIMELINE:")
    result.append("-" * 120)
    
    # Group events by time ranges for better visualization
    current_second = -1
    for rel_time, description in timeline_events:
        seconds = int(rel_time)
        ms_part = int((rel_time - seconds) * 1000)
        
        if seconds != current_second:
            if current_second >= 0:
                result.append("")  # Add spacing between seconds
            current_second = seconds
            result.append(f"⏱️  Second {seconds}:")
        
        time_marker = f"  +{rel_time:.3f}s"
        result.append(f"{time_marker:>12} │ {description}")
    
    result.append("")
    result.append("=" * 120)
    
    # Analysis summary
    result.append("🔍 PERFORMANCE ANALYSIS:")
    result.append("-" * 50)
    
    # Identify major gaps
    gaps = []
    for i in range(1, len(timeline_events)):
        prev_time, prev_desc = timeline_events[i-1]
        curr_time, curr_desc = timeline_events[i]
        gap = curr_time - prev_time
        
        if gap > 0.5:  # Gaps larger than 500ms
            gaps.append((gap, prev_desc, curr_desc))
    
    if gaps:
        result.append("⚠️  SIGNIFICANT DELAYS (>500ms):")
        for gap_duration, from_event, to_event in sorted(gaps, reverse=True)[:5]:
            result.append(f"   • {gap_duration:.3f}s gap")
            result.append(f"     From: {from_event}")
            result.append(f"     To:   {to_event}")
            result.append("")
    
    # Performance recommendations
    result.append("💡 OPTIMIZATION OPPORTUNITIES:")
    result.append("   • The largest delays appear to be between sequence orchestration")
    result.append("   • Consider async processing for non-blocking operations")
    result.append("   • Investigate plugin loading/rehydration performance")
    result.append("   • Review event bus subscriber execution times")
    
    return "\n".join(result)

def main():
    # Path to the log file
    log_file = r"C:\source\repos\bpm\internal\renderx-plugins-demo\.logs\drop-to-canvas-component-create-delay-localhost-1763224422789.txt"
    
    try:
        print("🔍 Parsing log file...")
        events = parse_log_file(log_file)
        
        print(f"📊 Found {len(events)} events")
        
        if events:
            print("🎨 Creating ASCII timeline...")
            timeline = create_ascii_timeline(events)
            
            # Save to file
            output_file = "drop_delay_analysis.txt"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(timeline)
            
            print(timeline)
            print(f"\n💾 Analysis saved to: {output_file}")
        else:
            print("❌ No events found in log file")
            
    except FileNotFoundError:
        print(f"❌ Log file not found: {log_file}")
        print("📁 Please ensure the file path is correct")
    except Exception as e:
        print(f"❌ Error analyzing log file: {e}")

if __name__ == "__main__":
    main()