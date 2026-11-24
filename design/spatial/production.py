"""Shared Blender/Cycles asset assembly, metric UVs and measured rendering.

Run inside Blender 4.5 LTS. Sources remain separate from the existing demo.
External models are imported with their artist-authored UVs and PBR materials.
"""
import bpy, json, math, pathlib, time
from mathutils import Vector

ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / '.agent-work/photoreal'
LIBRARY = CACHE / 'library'
OUTPUT = CACHE / 'flagships'
OUTPUT.mkdir(exist_ok=True)
CONTRACT = json.loads((pathlib.Path(__file__).parent / 'scene-contract.json').read_text(encoding='utf-8'))
scene = bpy.context.scene
materials = {}
templates = {}

def reset():
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 128
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 10
    scene.cycles.transmission_bounces = 8
    scene.cycles.transparent_max_bounces = 12
    scene.render.threads_mode = 'FIXED'; scene.render.threads = 8
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Medium High Contrast'
    scene.render.film_transparent = False
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'HIP'; prefs.refresh_devices()
    devices = [d for d in prefs.devices if d.type == 'HIP']
    for d in prefs.devices: d.use = d.type == 'HIP'
    scene.cycles.device = 'GPU' if devices else 'CPU'
    scene.unit_settings.system = 'METRIC'

def material(name, color, rough=.5, metal=0, transmission=0, ior=1.5):
    if name in materials: return materials[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    for key, value in [('Base Color', (*color,1)), ('Roughness',rough), ('Metallic',metal), ('Transmission Weight',transmission), ('IOR',ior)]: p.inputs[key].default_value = value
    materials[name] = m
    return m

def pbr(asset_id):
    if asset_id in materials: return materials[asset_id]
    m = material(asset_id, (.5,.5,.5)); n = m.node_tree.nodes; l = m.node_tree.links; p = n.get('Principled BSDF')
    for channel, socket in [('Diffuse','Base Color'), ('Rough','Roughness'), ('nor_gl','Normal')]:
        file = next((LIBRARY/asset_id).glob(channel+'.*'))
        im = bpy.data.images.load(str(file), check_existing=True)
        if channel != 'Diffuse': im.colorspace_settings.name = 'Non-Color'
        tex = n.new('ShaderNodeTexImage'); tex.image = im; tex.label = channel
        if channel == 'nor_gl':
            normal = n.new('ShaderNodeNormalMap'); l.new(tex.outputs['Color'],normal.inputs['Color']); l.new(normal.outputs['Normal'],p.inputs[socket])
        else: l.new(tex.outputs['Color'],p.inputs[socket])
    return m

def metric_uv(obj, repeat=1.83):
    uv = obj.data.uv_layers.active or obj.data.uv_layers.new()
    for face in obj.data.polygons:
        axis = max(range(3), key=lambda i:abs(face.normal[i])); axes = [i for i in range(3) if i != axis]
        for li in face.loop_indices:
            v = obj.data.vertices[obj.data.loops[li].vertex_index].co
            uv.data[li].uv = (v[axes[0]]/repeat, v[axes[1]]/repeat)

def box(name, pos, size, mat, bevel=.008):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata([(x*size[0]/2,y*size[1]/2,z*size[2]/2) for x,y,z in [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]],[],[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)])
    mesh.update();o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);o.location=pos
    o.data.materials.append(mat); metric_uv(o)
    if bevel:
        b = o.modifiers.new('Manufactured edge radius','BEVEL'); b.width = bevel; b.segments = 3
        o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o

def cylinder(name, pos, radius, depth, mat, vertices=48):
    coords=[(radius*math.cos(i*math.tau/vertices),radius*math.sin(i*math.tau/vertices),z) for z in [-depth/2,depth/2] for i in range(vertices)]
    faces=[tuple(reversed(range(vertices))),tuple(range(vertices,vertices*2))]+[(i,(i+1)%vertices,(i+1)%vertices+vertices,i+vertices) for i in range(vertices)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(coords,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);o.location=pos;o.data.materials.append(mat);metric_uv(o)
    b=o.modifiers.new('Edge bevel','BEVEL');b.width=.006;b.segments=3
    for p in o.data.polygons:p.use_smooth=True
    o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o

def curve(name, points, radius, mat, cyclic=False):
    data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.bevel_depth=radius;data.bevel_resolution=3
    s=data.splines.new('POLY');s.points.add(len(points)-1)
    for p,co in zip(s.points,points):p.co=(*co,1)
    s.use_cyclic_u=cyclic
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.data.materials.append(mat);return o

def asset(asset_id, pos, angle=0, scale=1):
    if asset_id not in templates:
        if asset_id == 'GlamVelvetSofa':
            old=set(bpy.data.objects)
            bpy.ops.import_scene.gltf(filepath=str(LIBRARY/asset_id/(asset_id+'.glb')))
            objs=[o for o in bpy.data.objects if o not in old and o.type=='MESH']
            for o in list(set(bpy.data.objects)-old):
                if o.type!='MESH':bpy.data.objects.remove(o,do_unlink=True)
        else:
            with bpy.data.libraries.load(str(LIBRARY/asset_id/(asset_id+'.blend')), link=False) as (src,dst):
                names=src.objects
                if asset_id=='jacaranda_tree': names=[n for n in names if n in ['jacaranda_tree_LOD1','jacaranda_tree_trunk_LOD1']]
                dst.objects=names
            objs=[o for o in dst.objects if o is not None and o.type=='MESH']
            for o in objs:scene.collection.objects.link(o)
        for o in objs:
            # Store a template outside all scene collections; instances share mesh data.
            for collection in list(o.users_collection):collection.objects.unlink(o)
        templates[asset_id]=objs
    anchor=bpy.data.objects.new(asset_id+' assembly',None);scene.collection.objects.link(anchor)
    for original in templates[asset_id]:
        o=original.copy();o.data=original.data;scene.collection.objects.link(o);o.parent=anchor
        o.hide_render=False;o.hide_viewport=False;o.hide_set(False)
        o['source_asset']=asset_id
    anchor.location=pos;anchor.rotation_euler.z=angle;anchor.scale=(scale,)*3
    return anchor

def environment(asset_id, strength=.6, rotation=0):
    world=bpy.data.worlds.new('HDRI / '+asset_id);world.use_nodes=True;scene.world=world
    n=world.node_tree.nodes;l=world.node_tree.links
    tex=n.new('ShaderNodeTexEnvironment');tex.image=bpy.data.images.load(str(LIBRARY/asset_id/'environment.hdr'),check_existing=True)
    coords=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeMapping');mapping.inputs['Rotation'].default_value.z=rotation
    l.new(coords.outputs['Generated'],mapping.inputs['Vector']);l.new(mapping.outputs['Vector'],tex.inputs['Vector'])
    l.new(tex.outputs['Color'],n.get('Background').inputs['Color']);n.get('Background').inputs['Strength'].default_value=strength

def area(name, pos, target, power, size, color=(1,.86,.7)):
    data=bpy.data.lights.new(name,'AREA');o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=pos;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o

def camera(name,pos,target,lens=40):
    data=bpy.data.cameras.new(name);c=bpy.data.objects.new(name,data);scene.collection.objects.link(c);c.location=pos;c.rotation_euler=(Vector(target)-c.location).to_track_quat('-Z','Y').to_euler();c.data.lens=lens;scene.camera=c;return c

def save_source(name):
    bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT/(name+'.blend')),compress=True)

def render(name,width=1440,height=1000,samples=128):
    scene.render.resolution_x=width;scene.render.resolution_y=height;scene.cycles.samples=samples
    scene.render.filepath=str(OUTPUT/(name+'.png'))
    start=time.perf_counter();bpy.ops.render.render(write_still=True);elapsed=time.perf_counter()-start
    record={'file':name+'.png','renderer':'Cycles','blender':bpy.app.version_string,'backend':scene.cycles.device,'compute_device':'HIP / AMD Radeon(TM) Graphics' if scene.cycles.device=='GPU' else 'CPU','samples':samples,'width':width,'height':height,'seconds':elapsed,'denoise':True,'view_transform':scene.view_settings.view_transform,'look':scene.view_settings.look,'max_bounces':scene.cycles.max_bounces,'camera':{'position':list(scene.camera.location),'rotation':list(scene.camera.rotation_euler),'lens':scene.camera.data.lens,'type':scene.camera.data.type},'visual_approval':'PENDING'}
    (OUTPUT/(name+'.render.json')).write_text(json.dumps(record,indent=2))
    print('RENDER_REPORT',json.dumps(record),flush=True)
