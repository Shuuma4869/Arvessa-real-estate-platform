"""Download the pinned, licensed source assets; never replace an existing mismatch."""
import hashlib, json, pathlib, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
DEST = ROOT / '.agent-work/photoreal'
LOCK = json.loads(pathlib.Path(__file__).with_name('assets.lock.json').read_text(encoding='utf-8'))
for asset in LOCK['assets']:
    for item in asset['files']:
        path = (DEST / item['path']).resolve()
        assert path.is_relative_to(DEST.resolve()), 'Unsafe asset path'
        path.parent.mkdir(parents=True, exist_ok=True)
        if not path.exists():
            request = urllib.request.Request(item['url'], headers={'User-Agent': 'ARVESSA/1.0 (Powered by Poly Haven)'})
            temporary = path.with_name(path.name + '.download')
            with urllib.request.urlopen(request, timeout=120) as src, temporary.open('wb') as dst:
                while chunk := src.read(1024 * 1024): dst.write(chunk)
            assert temporary.stat().st_size == item['bytes'], str(temporary)
            assert hashlib.sha256(temporary.read_bytes()).hexdigest() == item['sha256'], str(temporary)
            temporary.rename(path)
        assert path.stat().st_size == item['bytes'], str(path)
        assert hashlib.sha256(path.read_bytes()).hexdigest() == item['sha256'], str(path)
    print('Verified:', asset['id'], flush=True)
