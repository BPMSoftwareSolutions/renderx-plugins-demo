#!/usr/bin/env python3
"""
Generate detailed sequence flow diagrams from OgraphX self-sequences.
Shows the complete beat-by-beat orchestration for key sequences.
"""
import json

def generate_sequence_flow_diagram(sequences_path: str, output_path: str = None):
    """Generate detailed flow diagram for sequences with actual beats."""
    with open(sequences_path) as f:
        data = json.load(f)
    
    sequences = data['sequences']
    
    # Find sequences with interesting beats (not just noop)
    interesting_seqs = []
    for seq in sequences:
        for mov in seq.get('movements', []):
            beats = mov.get('beats', [])
            if len(beats) > 1 or (len(beats) == 1 and beats[0]['event'] != 'noop'):
                interesting_seqs.append(seq)
                break
    
    # Take first 3 interesting sequences
    interesting_seqs = interesting_seqs[:3]
    
    lines = [
        "graph TD",
        "    Root[\"🎼 OgraphX Sequence Flows\"]",
        ""
    ]
    
    for seq_idx, seq in enumerate(interesting_seqs):
        seq_id = f"Seq{seq_idx}"
        seq_name = seq['name']
        
        lines.append(f"    {seq_id}[\"{seq_name}<br/>Key: {seq.get('key', 'C Major')}<br/>Tempo: {seq.get('tempo', 100)}\"]")
        lines.append(f"    Root --> {seq_id}")
        
        for mov_idx, mov in enumerate(seq.get('movements', [])):
            mov_id = f"Mov{seq_idx}_{mov_idx}"
            mov_name = mov['id']
            beat_count = len(mov.get('beats', []))
            
            lines.append(f"    {mov_id}[\"Movement: {mov_name}<br/>{beat_count} beats\"]")
            lines.append(f"    {seq_id} --> {mov_id}")
            
            # Add all beats
            beats = mov.get('beats', [])
            for beat_idx, beat in enumerate(beats):
                beat_id = f"Beat{seq_idx}_{mov_idx}_{beat_idx}"
                event = beat['event'].replace('call:', '')
                timing = beat.get('timing', 'immediate')
                dynamics = beat.get('dynamics', 'mf')
                
                lines.append(f"    {beat_id}[\"Beat {beat['beat']}: {event}<br/>{timing} | {dynamics}\"]")
                lines.append(f"    {mov_id} --> {beat_id}")
    
    lines.extend([
        "",
        "    style Root fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold",
        "    classDef sequence fill:#9C27B0,stroke:#6A1B9A,color:#fff",
        "    classDef movement fill:#FF9800,stroke:#E65100,color:#fff",
        "    classDef beat fill:#F44336,stroke:#C62828,color:#fff",
    ])
    
    diagram = "\n".join(lines)
    
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(diagram)
        print(f"[OK] Sequence flow diagram written to {output_path}")
    
    return diagram

def generate_beat_timeline(sequences_path: str, output_path: str = None):
    """Generate a timeline showing all beats for a sequence."""
    with open(sequences_path) as f:
        data = json.load(f)
    
    sequences = data['sequences']
    
    # Find a sequence with many beats
    target_seq = None
    for seq in sequences:
        for mov in seq.get('movements', []):
            if len(mov.get('beats', [])) > 5:
                target_seq = seq
                break
        if target_seq:
            break
    
    if not target_seq:
        target_seq = sequences[0]
    
    lines = [
        "graph LR",
        f"    Start[\"🎵 {target_seq['name']}\"]",
    ]
    
    prev_id = "Start"
    for mov_idx, mov in enumerate(target_seq.get('movements', [])):
        for beat_idx, beat in enumerate(mov.get('beats', [])):
            beat_id = f"B{beat_idx}"
            event = beat['event'].replace('call:', '')
            dynamics = beat.get('dynamics', 'mf')
            
            lines.append(f"    {beat_id}[\"{event}<br/>{dynamics}\"]")
            lines.append(f"    {prev_id} --> {beat_id}")
            prev_id = beat_id
    
    lines.append(f"    {prev_id} --> End[\"✓ Complete\"]")
    
    lines.extend([
        "",
        "    style Start fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold",
        "    style End fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold",
        "    classDef beat fill:#F44336,stroke:#C62828,color:#fff",
    ])
    
    diagram = "\n".join(lines)
    
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(diagram)
        print(f"[OK] Beat timeline written to {output_path}")
    
    return diagram

if __name__ == '__main__':
    import os

    # Paths relative to packages/ographx/
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    seq_path = os.path.join(base_dir, '.ographx', 'sequences', 'self_sequences.json')
    diag_dir = os.path.join(base_dir, '.ographx', 'visualization', 'diagrams')

    # Ensure output directory exists
    os.makedirs(diag_dir, exist_ok=True)

    print("=== Generating Detailed Sequence Flow Diagrams ===")
    print()

    flow_diagram = generate_sequence_flow_diagram(seq_path, os.path.join(diag_dir, 'sequence_flow_diagram.md'))
    print()

    timeline = generate_beat_timeline(seq_path, os.path.join(diag_dir, 'beat_timeline.md'))
    print()

    print("All flow diagrams generated!")

