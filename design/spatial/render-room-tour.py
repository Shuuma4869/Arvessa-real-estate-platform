"""Render registered A0302 viewpoints from the saved scene, with a shared north.

Run Blender with --background --python-exit-code 1 --python <this file>.
Pass room ids after -- to render a subset. The original blend is read-only.
"""
import argparse
import json
import math
import pathlib
import sys
import time

import bpy

directory = pathlib.Path(__file__).resolve().parent
root = directory.parents[1]
output = root / '.agent-work/definitive/interior-v2/tour'
output.mkdir(parents=True, exist_ok=True)
source = root / '.agent-work/definitive/interior-v2/A0302.blend'
bpy.ops.wm.open_mainfile(filepath=str(source))
sys.path.insert(0, str(directory))
from production import camera

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
prefs = bpy.context.preferences.addons['cycles'].preferences
for backend in ('OPTIX', 'HIP', 'METAL', 'ONEAPI', 'CUDA'):
    try:
        prefs.compute_device_type = backend
        prefs.refresh_devices()
    except (TypeError, RuntimeError):
        continue
    devices = [d for d in prefs.devices if d.type == backend]
    if devices:
        for device in prefs.devices:
            device.use = device.type == backend
        scene.cycles.device = 'GPU'
        break
else:
    scene.cycles.device = 'CPU'
    devices = []

stations = json.loads((root / 'apps/web/src/features/spatial/a0302-tour.json').read_text(encoding='utf-8'))
parser = argparse.ArgumentParser()
parser.add_argument('--width', type=int, default=2048)
parser.add_argument('--samples', type=int, default=64)
parser.add_argument('rooms', nargs='*')
options = parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
if options.width % 2 or options.width < 2 or options.samples < 1:
    parser.error('Use an even panorama width and positive sample count')

for room in options.rooms or stations:
    station = stations[room]
    x, y, z = station['blender']
    cam = camera('Tour ' + room, (x, y, z), (x, y+1, z))
    cam.data.type = 'PANO'
    cam.data.panorama_type = 'EQUIRECTANGULAR'
    scene.render.resolution_x = options.width
    scene.render.resolution_y = options.width // 2
    scene.render.resolution_percentage = 100
    scene.cycles.samples = options.samples
    scene.cycles.use_denoising = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = str(output / f'A0302-{room}-360.png')
    start = time.perf_counter()
    bpy.ops.render.render(write_still=True)
    record = dict(room=room, source=source.name, camera=list(cam.location),
                  rotation=list(cam.rotation_euler), width=scene.render.resolution_x,
                  height=scene.render.resolution_y, samples=options.samples,
                  seconds=round(time.perf_counter()-start, 2), engine=scene.render.engine,
                  blender=bpy.app.version_string, device=[d.name for d in devices] or ['CPU'],
                  transform=scene.view_settings.view_transform)
    (output / f'{room}.json').write_text(json.dumps(record, indent=2))
    print('ROOM_FINISHED', room, record['seconds'], flush=True)
