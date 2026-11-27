"""Render a review view from the saved source without rebuilding assets."""
import bpy, pathlib, sys
directory = pathlib.Path(__file__).resolve().parent
root = directory.parents[1]
args = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
source = root / (args[0] if args else '.agent-work/photoreal/flagships/A0302.blend')
bpy.ops.wm.open_mainfile(filepath=str(source))
sys.path.insert(0, str(directory))
from production import *
import production
production.OUTPUT=source.parent
s=CONTRACT['metresPerLayoutUnit'];W=CONTRACT['layout']['width']*s;D=CONTRACT['layout']['depth']*s
prefs=bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type='HIP';prefs.refresh_devices()
for device in prefs.devices: device.use=device.type=='HIP'
scene.cycles.device='CPU' if '--cpu' in args else ('GPU' if any(d.use for d in prefs.devices) else 'CPU')
if '--cpu' in args: scene.render.threads_mode='FIXED';scene.render.threads=4
for o in scene.objects:
    if o.get('cutaway') or o.get('context_only'):o.hide_render=True
camera('Dollhouse',(W+4,-D-6,22),(W/2,-D/2,.4),48)
area('Cutaway daylight',(W/2,-D/2,8),(W/2,-D/2,0),800,8,(1,.95,.87))
render('A0302-dollhouse',1600,1200)
