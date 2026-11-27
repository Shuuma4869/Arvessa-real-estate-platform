"""Publish calibrated WebP panoramas and rectilinear views sampled from them.

Run with Python, Pillow and NumPy after render-room-tour.py. Coordinates use
the same yaw convention as panorama-canvas.tsx. No model is synthesized here.
"""
import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[2]
input_dir = root / '.agent-work/definitive/interior-v2/tour'
public = root / 'apps/web/public/spatial-flagships/tour'
public.mkdir(exist_ok=True)
stations = json.loads((root / 'apps/web/src/features/spatial/a0302-tour.json').read_text())
views = {
    'living': ('living', -1.03, -.14, 83),
    'kitchen': ('kitchen', .61, -.12, 86),
    'dining': ('kitchen', 2.49, -.23, 100),
    'bedroom-1': ('bedroom-1', -.74, -.14, 83),
    'bedroom-2': ('bedroom-2', -.76, -.15, 83),
    'bath-1': ('bath-1', -.54, -.19, 89),
    'bath-2': ('bath-2', -.63, -.19, 89),
    'hall': ('hall', -1.51, -.04, 86),
    'balcony': ('balcony', -1.83, -.12, 83),
    'joinery': ('kitchen', .73, -.33, 51),
}

def perspective(panorama, yaw, pitch, field_of_view):
    w, h = 1000, 690
    image = np.asarray(panorama.convert('RGB'))
    ih, iw = image.shape[:2]
    # Pixel centers on a rectilinear camera sensor, rotated about X then Y.
    sy, sx = np.mgrid[:h, :w]
    factor = 2 * math.tan(math.radians(field_of_view) / 2) / w
    x = (sx + .5 - w/2) * factor
    y = (h/2 - sy - .5) * factor
    forward = math.cos(pitch) - y * math.sin(pitch)
    elevation = y * math.cos(pitch) + math.sin(pitch)
    lon = np.arctan2(x, forward) + yaw
    lat = np.arctan2(elevation, np.sqrt(x*x + forward*forward))
    u = ((lon / (2*math.pi) + .5) * iw - .5) % iw
    v = np.clip((.5 - lat / math.pi) * ih - .5, 0, ih-1)
    ix, iy = np.floor(u).astype(int), np.floor(v).astype(int)
    nx, ny = (ix + 1) % iw, np.minimum(iy+1, ih-1)
    fx, fy = (u-ix)[...,None], (v-iy)[...,None]
    colors = (1-fy)*((1-fx)*image[iy,ix]+fx*image[iy,nx])+fy*((1-fx)*image[ny,ix]+fx*image[ny,nx])
    return Image.fromarray(np.uint8(np.round(colors)))

report = []
for room in stations:
    name = f'A0302-{room}-360'
    png = input_dir / (name+'.png')
    record = json.loads((input_dir / (room+'.json')).read_text())
    panorama = Image.open(png)
    assert panorama.size == (record['width'], record['height']) and panorama.width == 2*panorama.height
    result = public / (name+'.webp')
    panorama.save(result, quality=92, method=6)
    record.update(panorama=result.name, bytes=result.stat().st_size,
                  sha256=hashlib.sha256(result.read_bytes()).hexdigest(), views=[])
    for label, (station, yaw, pitch, hfov) in views.items():
        if station != room:
            continue
        view = public / f'A0302-{label}.webp'
        perspective(panorama,yaw,pitch,hfov).save(view, quality=91, method=6)
        record['views'].append(dict(file=view.name,yaw=yaw,pitch=pitch,horizontalFov=hfov))
    report.append(record)
evidence = root / 'docs/frontend-definitive/evidence'
(evidence / 'room-tour.json').write_text(json.dumps(report,indent=2)+'\n')

# Publish the cutaway from the same saved assembly as the room cameras.
source_dir = input_dir.parent
cutaway = Image.open(source_dir / 'A0302-dollhouse.png').convert('RGB')
web_file = public.parent / 'A0302-dollhouse.webp'
cutaway.save(web_file, quality=92, method=6)
capture = json.loads((source_dir / 'A0302-dollhouse.render.json').read_text())
capture.update(webFile=web_file.name, webBytes=web_file.stat().st_size)
manifest = public.parent / 'production-report.json'
production = json.loads(manifest.read_text())
photos = production['photographs']
index = next((i for i, photo in enumerate(photos) if photo['file'] == capture['file']), len(photos))
if index == len(photos) or photos[index] != capture:
    photos[index:index + 1] = [capture]
    manifest.write_text(json.dumps(production, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
