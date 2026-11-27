"""Export a separate balanced web derivative; the Cycles source stays intact."""
import bpy, pathlib, sys, json, time
ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / '.agent-work/photoreal/flagships'
args = sys.argv[sys.argv.index('--') + 1:]
name = args[0]
assert name in ['A0302', 'Stillwater']
source = pathlib.Path(args[1]).resolve() if len(args) > 1 else CACHE / (name + '.blend')
OUT = source.parent / 'web-raw'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(source))
start = time.perf_counter()
# Cutaway is only a review/export view of the same interior source.
for obj in list(bpy.context.scene.objects):
    if obj.type in ['LIGHT', 'CAMERA'] or obj.get('cutaway') or obj.get('context_only'):
        bpy.data.objects.remove(obj, do_unlink=True)
    elif obj.name == 'Surrounding ground':
        bpy.data.objects.remove(obj, do_unlink=True)

# Decimate unique source meshes once, then reuse them for all instances.
groups = {}
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH': groups.setdefault(obj.data.name, []).append(obj)
for objects in groups.values():
    obj = objects[0]
    source = obj.get('source_asset')
    count = len(obj.data.polygons)
    ratio = .018 if source == 'jacaranda_tree' and count > 100000 else .12 if source == 'potted_plant_02' and count > 20000 else 1
    # At exterior viewing distance, pots/soil and trunks cost more triangles
    # than their visible contribution. Keep leaves and the interior unchanged.
    if name == 'Stillwater':
        if source == 'potted_plant_02' and 'dirt' in obj.name: ratio = .005
        elif source == 'potted_plant_02' and '_pot.' in obj.name: ratio = .2
        elif source == 'jacaranda_tree' and 'trunk' in obj.name: ratio = .2
    if ratio < 1:
        obj.data = obj.data.copy()
        bpy.ops.object.select_all(action='DESELECT'); obj.select_set(True); bpy.context.view_layer.objects.active = obj
        mod = obj.modifiers.new('Balanced derivative LOD', 'DECIMATE'); mod.ratio = ratio
        bpy.ops.object.modifier_apply(modifier=mod.name)
        for other in objects[1:]: other.data = obj.data

# Convert and batch architecture; imported plants/trees retain shared geometry.
architecture = [o for o in bpy.context.scene.objects if o.type in ['MESH', 'CURVE'] and o.get('source_asset') not in ['jacaranda_tree', 'potted_plant_02']]
bpy.ops.object.select_all(action='DESELECT')
for obj in architecture: obj.select_set(True)
if architecture:
    bpy.context.view_layer.objects.active = architecture[0]
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.join()
    bpy.context.object.name = name + ' / material batches'

# Limit actual embedded image dimensions, preserving aspect and alpha.
for im in bpy.data.images:
    if im.type != 'IMAGE' or not im.size[0] or im.name.endswith('.hdr'): continue
    w, h = im.size
    ratio = min(1, 1024 / max(w, h))
    if ratio < 1: im.scale(round(w * ratio), round(h * ratio))

target = OUT / (name + '.glb')
bpy.ops.export_scene.gltf(filepath=str(target), export_format='GLB', use_selection=False,
    export_apply=True, export_cameras=False, export_lights=False, export_extras=True,
    export_image_format='AUTO', export_image_quality=85, export_yup=True)
triangles = 0
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        obj.data.calc_loop_triangles(); triangles += len(obj.data.loop_triangles)
report = {'file':target.name,'bytes':target.stat().st_size,'scene_triangles':triangles,
    'export_seconds':time.perf_counter()-start,'texture_max_dimension':1024,
    'source_scene':name+'.blend','quality':'balanced derivative; visual approval pending',
    'tree_decimation_ratio':.018,'plant_soil_decimation_ratio':.005 if name == 'Stillwater' else .12,
    'exterior_pot_and_trunk_ratio':.2 if name == 'Stillwater' else None}
(OUT / (name + '.stats.json')).write_text(json.dumps(report, indent=2))
print('EXPORT_REPORT', json.dumps(report), flush=True)
