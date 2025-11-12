import json, pathlib, datetime
from collections import Counter

def main(path):
    p=pathlib.Path(path)
    raw=json.loads(p.read_text(encoding='utf-8'))
    stage3=raw.get('stage3_timelineData',{})
    evts=stage3.get('events',[])
    min_time=min((e.get('time',0) for e in evts), default=0)
    source_times=[e.get('sourceTimestamp') or e.get('timestamp') for e in evts if e.get('sourceTimestamp') or e.get('timestamp')]
    source_times_valid=[t for t in source_times if isinstance(t,(int,float))]
    base_source=min(source_times_valid) if source_times_valid else None
    subset=[e for e in evts if e.get('type') in ('ui','interaction')]
    subset_sorted=sorted(subset, key=lambda e:e.get('time',0))
    print('Base relative start (ms):', min_time)
    if base_source is not None:
        base_dt=datetime.datetime.fromtimestamp(base_source/1000.0)
        print('Earliest source timestamp (epoch ms):', base_source,'->',base_dt.isoformat())
    else:
        print('No sourceTimestamp/timestamp field with numeric epoch ms present; only relative times available.')
    print('\nInteractions/UI events (chronological):')
    for e in subset_sorted:
        t=e.get('time',0); dur=e.get('duration',0); name=e.get('name',''); typ=e.get('type')
        if base_source is not None:
            abs_ms=base_source + t
            abs_dt=datetime.datetime.fromtimestamp(abs_ms/1000.0).isoformat()
            print(f"t={t:>5}ms dur={dur:>3}ms abs={abs_ms} ({abs_dt}) type={typ} name={name}")
        else:
            print(f"t={t:>5}ms dur={dur:>3}ms type={typ} name={name}")
    bucket=lambda t: '0-300ms' if t<300 else ('300-500ms' if t<500 else '500ms+')
    c=Counter(bucket(e.get('time',0)) for e in subset_sorted)
    print('\nBucket counts:', dict(c))
    if subset_sorted:
        last=subset_sorted[-1]['time']
        print(f'Last interaction/ui event at {last}ms (≈{last/1000:.3f}s)')

if __name__=='__main__':
    import sys
    if len(sys.argv)<2:
        print('Usage: python scripts/tmp_extract_interactions.py <diagnostics.json>')
        raise SystemExit(1)
    main(sys.argv[1])
