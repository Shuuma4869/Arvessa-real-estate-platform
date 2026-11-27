"""Install a hash-pinned portable Blender into the ignored production cache."""
import pathlib, hashlib, urllib.request, zipfile
ROOT = pathlib.Path(__file__).resolve().parents[2] / '.agent-work/photoreal'
ROOT.mkdir(parents=True, exist_ok=True)
NAME = 'blender-4.5.9-windows-x64'
SHA256 = '41da973b9bf95bb312cbeff4d1982feb13259b43c821686b9bafea4dfe5477cf'
archive = ROOT / (NAME + '.zip')
if not archive.exists():
    with urllib.request.urlopen('https://download.blender.org/release/Blender4.5/' + archive.name, timeout=120) as src, archive.open('xb') as dst:
        while chunk := src.read(1024 * 1024): dst.write(chunk)
assert hashlib.sha256(archive.read_bytes()).hexdigest() == SHA256
destination = ROOT / 'tools'
executable = destination / NAME / 'blender.exe'
if not executable.exists():
    with zipfile.ZipFile(archive) as bundle:
        for item in bundle.infolist():
            path = (destination / item.filename).resolve()
            assert path.is_relative_to(destination.resolve())
            assert not path.exists() or item.is_dir(), 'Existing partial installation needs review'
        bundle.extractall(destination)
print(executable)
