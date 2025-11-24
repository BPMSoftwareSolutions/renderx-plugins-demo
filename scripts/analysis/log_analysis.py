import re
import json
import argparse

def load_logging_data(json_file_path):
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def parse_performance_data(lines, sequence_filter=None):
    sequences = {}
    current_sequence = None
    current_movement = None
    timestamps = {}  # Store timestamps for events

    for line in lines:
        # Extract timestamp if present
        timestamp_match = re.match(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)', line)
        timestamp = timestamp_match.group(1) if timestamp_match else None

        # Now executing sequence
        match = re.search(r'ExecutionQueue: Now executing "(.+)"', line)
        if match:
            sequence_name = match.group(1)
            if sequence_filter and sequence_filter not in sequence_name:
                continue
            current_sequence = sequence_name
            if current_sequence not in sequences:
                sequences[current_sequence] = {'movements': {}, 'total_time': None, 'start_timestamp': timestamp}
            continue

        # Started timing movement
        match = re.search(r'PerformanceTracker: Started timing movement (.+) for (.+)', line)
        if match:
            movement_name = match.group(1)
            sequence_name = match.group(2)
            if sequence_filter and sequence_filter not in sequence_name:
                continue
            if sequence_name in sequences:
                current_movement = movement_name
                if current_movement not in sequences[sequence_name]['movements']:
                    sequences[sequence_name]['movements'][current_movement] = {'beats': {}, 'total_time': None, 'start_timestamp': timestamp}
            continue

        # Beat completed
        match = re.search(r'PerformanceTracker: Beat (\d+) completed in (\d+(?:\.\d+)?)ms', line)
        if match:
            beat_num = int(match.group(1))
            time_val = float(match.group(2))
            if current_sequence and current_movement and current_sequence in sequences and current_movement in sequences[current_sequence]['movements']:
                sequences[current_sequence]['movements'][current_movement]['beats'][beat_num] = {'time': time_val, 'timestamp': timestamp}
            continue

        # Movement completed
        match = re.search(r'PerformanceTracker: Movement (.+) completed in (\d+(?:\.\d+)?)ms', line)
        if match:
            movement_name = match.group(1)
            time_val = float(match.group(2))
            if current_sequence and movement_name in sequences[current_sequence]['movements']:
                sequences[current_sequence]['movements'][movement_name]['total_time'] = time_val
                sequences[current_sequence]['movements'][movement_name]['end_timestamp'] = timestamp
            continue

        # Sequence completed
        match = re.search(r'SequenceExecutor: Sequence "(.+)" completed in (\d+)ms', line)
        if match:
            sequence_name = match.group(1)
            time_val = float(match.group(2))
            if sequence_name in sequences:
                sequences[sequence_name]['total_time'] = time_val
                sequences[sequence_name]['end_timestamp'] = timestamp
            continue

    return sequences

def print_performance_data(sequences):
    print("Performance Data:")
    for seq_name, seq_data in sequences.items():
        print(f"  Sequence: {seq_name}")
        if seq_data.get('start_timestamp'):
            print(f"    Start: {seq_data['start_timestamp']}")
        if seq_data.get('end_timestamp'):
            print(f"    End: {seq_data['end_timestamp']}")
        if seq_data['total_time']:
            print(f"    Total Time: {seq_data['total_time']} ms")
        for mov_name, mov_data in seq_data['movements'].items():
            print(f"    Movement: {mov_name}")
            if mov_data.get('start_timestamp'):
                print(f"      Start: {mov_data['start_timestamp']}")
            if mov_data.get('end_timestamp'):
                print(f"      End: {mov_data['end_timestamp']}")
            if mov_data['total_time']:
                print(f"      Total Time: {mov_data['total_time']} ms")
            for beat_num, beat_data in sorted(mov_data['beats'].items()):
                if 'time' in beat_data and beat_data['time']:
                    print(f"      Beat {beat_num}: {beat_data['time']} ms")
                    if beat_data.get('timestamp'):
                        print(f"        Timestamp: {beat_data['timestamp']}")
        print()

def calculate_summary_metrics(sequences):
    total_sequences = len(sequences)
    total_movements = sum(len(seq_data['movements']) for seq_data in sequences.values())
    total_beats = sum(len(mov_data['beats']) for seq_data in sequences.values() for mov_data in seq_data['movements'].values())
    
    sequence_times = [seq_data['total_time'] for seq_data in sequences.values() if seq_data['total_time']]
    total_time_all_sequences = sum(sequence_times) if sequence_times else 0
    avg_sequence_time = total_time_all_sequences / len(sequence_times) if sequence_times else 0
    
    movement_times = [mov_data['total_time'] for seq_data in sequences.values() for mov_data in seq_data['movements'].values() if mov_data['total_time']]
    total_time_all_movements = sum(movement_times) if movement_times else 0
    avg_movement_time = total_time_all_movements / len(movement_times) if movement_times else 0
    
    beat_times = [beat_data['time'] for seq_data in sequences.values() for mov_data in seq_data['movements'].values() for beat_data in mov_data['beats'].values() if beat_data['time']]
    total_time_all_beats = sum(beat_times) if beat_times else 0
    avg_beat_time = total_time_all_beats / len(beat_times) if beat_times else 0
    
    return {
        'total_sequences': total_sequences,
        'total_movements': total_movements,
        'total_beats': total_beats,
        'total_time_all_sequences': total_time_all_sequences,
        'avg_sequence_time': avg_sequence_time,
        'total_time_all_movements': total_time_all_movements,
        'avg_movement_time': avg_movement_time,
        'total_time_all_beats': total_time_all_beats,
        'avg_beat_time': avg_beat_time
    }

def print_summary_metrics(metrics):
    print("\nSummary Metrics:")
    print(f"  Total Sequences: {metrics['total_sequences']}")
    print(f"  Total Movements: {metrics['total_movements']}")
    print(f"  Total Beats: {metrics['total_beats']}")
    print(f"  Total Time (Sequences): {metrics['total_time_all_sequences']} ms")
    print(f"  Average Sequence Time: {metrics['avg_sequence_time']:.2f} ms")
    print(f"  Total Time (Movements): {metrics['total_time_all_movements']} ms")
    print(f"  Average Movement Time: {metrics['avg_movement_time']:.2f} ms")
    print(f"  Total Time (Beats): {metrics['total_time_all_beats']} ms")
    print(f"  Average Beat Time: {metrics['avg_beat_time']:.2f} ms")

def analyze_log(log_file_path, json_file_path=None, sequence_filter=None):
    with open(log_file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    if json_file_path:
        logging_data = load_logging_data(json_file_path)
        print(f"Loaded logging data with {len(logging_data['log_entries'])} entries from {logging_data['metadata']['scanned_directory']}")
        # Could use for categorization

    sequences = parse_performance_data(lines, sequence_filter)
    print_performance_data(sequences)

    if sequences:
        metrics = calculate_summary_metrics(sequences)
        print_summary_metrics(metrics)

    # Removed hardcoded specific metrics to make it data-driven

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze log file for performance metrics")
    parser.add_argument('--log', default=r"C:\source\repos\bpm\internal\renderx-plugins-demo\src\RenderX.Shell.Avalonia\bin\Debug\net8.0\win-x64\.logs\library-drag-drop-web-variant-localhost-1762780374776.log", help="Path to log file")
    parser.add_argument('--json', default=r"C:\source\repos\bpm\internal\renderx-plugins-demo\migration_tools\output\musical_conductor_logging_data.json", help="Path to logging data JSON")
    parser.add_argument('--sequence', help="Filter by sequence name (partial match)")

    args = parser.parse_args()
    analyze_log(args.log, args.json, args.sequence)