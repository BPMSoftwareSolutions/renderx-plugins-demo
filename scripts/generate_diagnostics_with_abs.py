import json, pathlib, re
from datetime import datetime, timezone

def parse_iso_ms(s: str):
    try:
        return int(datetime.fromisoformat(s.replace('Z','+00:00')).timestamp()*1000)
    except Exception:
        return None

def main(raw_log_path, base_diagnostics_path, out_path):
    raw_p = pathlib.Path(raw_log_path)
    base_p = pathlib.Path(base_diagnostics_path)
    out_p = pathlib.Path(out_path)

    raw = raw_p.read_text(encoding='utf-8').splitlines()
    base = json.loads(base_p.read_text(encoding='utf-8'))

    # Build quick map of names to first absolute time from raw log
    iso_rx = re.compile(r'^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)')
    name_rx = re.compile(r'Sequence\s*:\s*(.+)$|interaction\s*::\s*(.+)$', re.IGNORECASE)

    absolute_by_key = []
    for line in raw:
        m = iso_rx.search(line)
        if not m:
            continue
        iso = m.group(1)
        ms = parse_iso_ms(iso)
        # Roughly extract a name for known interactions (drag/drop/container)
        if 'Library Component Drag' in line:
            absolute_by_key.append(('Library Component Drag', ms))
        if 'Library Component Drop' in line:
            absolute_by_key.append(('Library Component Drop', ms))
        if 'Library Container Drop' in line:
            absolute_by_key.append(('Library Container Drop', ms))
        if 'Control Panel' in line:
            # not exact but helpful
            absolute_by_key.append(('Control Panel', ms))
        if 'Header UI Theme' in line or 'Theme Manager' in line:
            absolute_by_key.append(('Header', ms))

    # Attach sourceTimestamp to stage3 events by approximate name match
    stage3 = base.get('stage3_timelineData') or {}
    events = stage3.get('events') or []
    for e in events:
        nm = e.get('name','')
        for key, ms in absolute_by_key:
            if key in nm and 'sourceTimestamp' not in e:
                e['sourceTimestamp'] = ms
                break

    out_p.parent.mkdir(parents=True, exist_ok=True)
    out_p.write_text(json.dumps(base, indent=2), encoding='utf-8')
    print('Wrote', out_p)

if __name__=='__main__':
    import sys
    if len(sys.argv)<4:
        print('Usage: python scripts/generate_diagnostics_with_abs.py <raw.log> <base-diagnostics.json> <out.json>')
        raise SystemExit(1)
    main(sys.argv[1], sys.argv[2], sys.argv[3])
