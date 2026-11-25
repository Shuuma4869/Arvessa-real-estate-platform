"""Download the pinned, licensed source assets; never replace an existing mismatch."""
import hashlib, json, pathlib, urllib.request, zipfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
DEST = ROOT / '.agent-work/photoreal'
LOCK = json.loads(pathlib.Path(__file__).with_name('assets.lock.json').read_text(encoding='utf-8'))
for asset in LOCK['assets']:
    archive = None
    items = ([asset['archive']] if 'archive' in asset else []) + asset['files']
    for item in items:
        path = (DEST / item['path']).resolve()
        assert path.is_relative_to(DEST.resolve()), 'Unsafe asset path'
        path.parent.mkdir(parents=True, exist_ok=True)
        if not path.exists():
            temporary = path.with_name(path.name + '.download')
            if 'archive_member' in item:
                assert archive is not None, 'Archive must be verified first'
                with zipfile.ZipFile(archive) as container:
                    # Extract only the exact pinned file, never arbitrary zip paths.
                    temporary.write_bytes(container.read(item['archive_member']))
            else:
                request = urllib.request.Request(item['url'], headers={'User-Agent': 'ARVESSA/1.0 (Powered by Poly Haven)'})
                with urllib.request.urlopen(request, timeout=120) as src, temporary.open('wb') as dst:
                    while chunk := src.read(1024 * 1024): dst.write(chunk)
            assert temporary.stat().st_size == item['bytes'], str(temporary)
            assert hashlib.sha256(temporary.read_bytes()).hexdigest() == item['sha256'], str(temporary)
            temporary.rename(path)
        assert path.stat().st_size == item['bytes'], str(path)
        assert hashlib.sha256(path.read_bytes()).hexdigest() == item['sha256'], str(path)
        if item is asset.get('archive'): archive = path
    print('Verified:', asset['id'], flush=True)
