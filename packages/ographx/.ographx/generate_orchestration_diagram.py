#!/usr/bin/env python3
"""
Generate Mermaid diagram from OgraphX self-sequences.
Visualizes the orchestration: sequences → movements → beats.
"""
import json
import sys

def generate_diagram(sequences_path: str, output_path: str = None):
    """Generate Mermaid diagram from sequences."""
    with open(sequences_path) as f:
        data = json.load(f)
    
    sequences = data['sequences']
    
    # Start diagram
    lines = [
        "graph TD",
        "    Root[\"🧘 OgraphX Self-Orchestration\"]",
        ""
    ]
    
    # Group sequences by category
    categories = {}
    for seq in sequences:
        cat = seq.get('category', 'other')
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(seq)
    
    # Create category nodes
    cat_nodes = {}
    for i, (cat, seqs) in enumerate(categories.items()):
        cat_id = f"Cat{i}"
        cat_nodes[cat] = cat_id
        lines.append(f"    {cat_id}[\"{cat.upper()}<br/>{len(seqs)} sequences\"]")
        lines.append(f"    Root --> {cat_id}")
    
    lines.append("")
    
    # Add sequences and their movements/beats
    seq_counter = 0
    for cat, seqs in categories.items():
        cat_id = cat_nodes[cat]
        
        for seq in seqs[:5]:  # Limit to first 5 per category for readability
            seq_id = f"Seq{seq_counter}"
            seq_name = seq['name'].replace(' ', '<br/>')
            tempo = seq.get('tempo', 100)
            
            lines.append(f"    {seq_id}[\"{seq_name}<br/>Tempo: {tempo}\"]")
            lines.append(f"    {cat_id} --> {seq_id}")
            
            # Add movements
            for mov_idx, mov in enumerate(seq.get('movements', [])):
                mov_id = f"Mov{seq_counter}_{mov_idx}"
                beat_count = len(mov.get('beats', []))
                lines.append(f"    {mov_id}[\"Movement: {mov['id']}<br/>{beat_count} beats\"]")
                lines.append(f"    {seq_id} --> {mov_id}")
                
                # Add first 3 beats
                for beat_idx, beat in enumerate(mov.get('beats', [])[:3]):
                    beat_id = f"Beat{seq_counter}_{mov_idx}_{beat_idx}"
                    event = beat['event'].replace('call:', '')
                    dynamics = beat.get('dynamics', 'mf')
                    lines.append(f"    {beat_id}[\"Beat {beat['beat']}: {event}<br/>{dynamics}\"]")
                    lines.append(f"    {mov_id} --> {beat_id}")
                
                # If more beats, add ellipsis
                if len(mov.get('beats', [])) > 3:
                    ellipsis_id = f"Ellipsis{seq_counter}_{mov_idx}"
                    remaining = len(mov['beats']) - 3
                    lines.append(f"    {ellipsis_id}[\"... +{remaining} more beats\"]")
                    lines.append(f"    {mov_id} --> {ellipsis_id}")
            
            seq_counter += 1
        
        # If more sequences in category, add note
        if len(seqs) > 5:
            note_id = f"Note{cat_id}"
            remaining = len(seqs) - 5
            lines.append(f"    {note_id}[\"... +{remaining} more sequences\"]")
            lines.append(f"    {cat_id} --> {note_id}")
    
    # Add styling
    lines.extend([
        "",
        "    style Root fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold",
        "    classDef category fill:#2196F3,stroke:#1565C0,color:#fff",
        "    classDef sequence fill:#9C27B0,stroke:#6A1B9A,color:#fff",
        "    classDef movement fill:#FF9800,stroke:#E65100,color:#fff",
        "    classDef beat fill:#F44336,stroke:#C62828,color:#fff",
    ])
    
    diagram = "\n".join(lines)
    
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(diagram)
        print(f"[OK] Diagram written to {output_path}")
    
    return diagram

def generate_call_graph_diagram(graph_path: str, output_path: str = None):
    """Generate call graph diagram from IR."""
    with open(graph_path) as f:
        data = json.load(f)
    
    symbols = data['symbols']
    calls = data['calls']
    
    lines = [
        "graph LR",
        "    Root[\"🧘 OgraphX Call Graph\"]",
        ""
    ]
    
    # Add symbols as nodes
    for sym in symbols[:20]:  # Limit to first 20
        sym_id = sym['id'].replace('::', '_').replace('.', '_')
        sym_name = sym['name']
        sym_kind = sym['kind']
        icon = '📦' if sym_kind == 'class' else '⚙️'
        lines.append(f"    {sym_id}[\"{icon} {sym_name}\"]")
    
    lines.append("")
    
    # Add call edges
    edge_count = 0
    for call in calls[:30]:  # Limit to first 30 calls
        frm_id = call['frm'].replace('::', '_').replace('.', '_')
        to_id = call['to'].replace('::', '_').replace('.', '_') if call['to'] else None
        
        if to_id and frm_id != to_id:
            lines.append(f"    {frm_id} -->|{call['name']}| {to_id}")
            edge_count += 1
    
    lines.extend([
        "",
        "    style Root fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold",
    ])
    
    diagram = "\n".join(lines)
    
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(diagram)
        print(f"[OK] Call graph diagram written to {output_path}")
    
    return diagram

def generate_summary_diagram(sequences_path: str, output_path: str = None):
    """Generate high-level summary diagram."""
    with open(sequences_path) as f:
        data = json.load(f)
    
    sequences = data['sequences']
    total_beats = sum(len(b) for s in sequences for m in s.get('movements', []) for b in m.get('beats', []))
    total_movements = sum(len(s.get('movements', [])) for s in sequences)
    
    lines = [
        "graph TB",
        "    A[\"🧘 OgraphX Self-Observation\"]",
        "    ",
        f"    B[\"📊 IR Layer<br/>31 Symbols<br/>283 Calls<br/>19 Contracts\"]",
        f"    C[\"🎼 Sequence Layer<br/>{len(sequences)} Sequences<br/>{total_movements} Movements<br/>{total_beats} Beats\"]",
        "    ",
        "    D[\"🎵 Musical Notation\"]",
        "    E[\"Key: C Major\"]",
        "    F[\"Tempo: 100 BPM\"]",
        "    G[\"Dynamics: pp to mf\"]",
        "    ",
        "    A --> B",
        "    A --> C",
        "    C --> D",
        "    D --> E",
        "    D --> F",
        "    D --> G",
        "    ",
        "    style A fill:#4CAF50,stroke:#2E7D32,color:#fff,font-weight:bold,font-size:16px",
        "    style B fill:#2196F3,stroke:#1565C0,color:#fff",
        "    style C fill:#9C27B0,stroke:#6A1B9A,color:#fff",
        "    style D fill:#FF9800,stroke:#E65100,color:#fff",
        "    style E fill:#F44336,stroke:#C62828,color:#fff",
        "    style F fill:#F44336,stroke:#C62828,color:#fff",
        "    style G fill:#F44336,stroke:#C62828,color:#fff",
    ]
    
    diagram = "\n".join(lines)
    
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(diagram)
        print(f"[OK] Summary diagram written to {output_path}")
    
    return diagram

if __name__ == '__main__':
    print("=== Generating OgraphX Orchestration Diagrams ===")
    print()
    
    # Generate all diagrams
    seq_diagram = generate_diagram('self_sequences.json', 'orchestration_diagram.md')
    print()
    
    call_diagram = generate_call_graph_diagram('self_graph.json', 'call_graph_diagram.md')
    print()
    
    summary_diagram = generate_summary_diagram('self_sequences.json', 'summary_diagram.md')
    print()
    
    print("All diagrams generated!")

