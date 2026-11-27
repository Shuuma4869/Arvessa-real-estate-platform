"""Produce the second A0302 source from the original saved assembly (Blender 4.5)."""
import math
import pathlib
import sys

import bpy

directory = pathlib.Path(__file__).resolve().parent
root = directory.parents[1]
source = root / '.agent-work/photoreal/flagships/A0302.blend'
target = root / '.agent-work/definitive/interior-v2/A0302.blend'
target.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(source))
sys.path.insert(0, str(directory))
from production import CONTRACT, area, box, curve, cylinder, material, pbr

scene = bpy.context.scene
scale = CONTRACT['metresPerLayoutUnit']
width = CONTRACT['layout']['width'] * scale
plaster = bpy.data.materials['Warm lime plaster']
bronze = bpy.data.materials['Champagne anodised aluminium']
oak = bpy.data.materials['oak_veneer_01']
glass = bpy.data.materials['Low iron architectural glass']
stone = bpy.data.materials['ambientcg_marble014']
ceramic = bpy.data.materials['Glazed ceramic']
linen = bpy.data.materials['Cotton bedding']

# Continuous north facade with real punched clerestories above the two headboards.
# Keep the north wall of the ensuite opaque and preserve every original doorway.
north = bpy.data.objects['North exterior wall']
bpy.data.objects.remove(north, do_unlink=True)
span = 4.4 * scale
def facade_piece(name, start, end, bottom, top):
    return box(name, ((start + end)/2, .06, (bottom+top)/2),
               (end-start, .18, top-bottom), plaster)
for index in range(2):
    start = index * span
    left, right = start + .44, start + span - .44
    facade_piece('Bedroom sill wall',start,start+span,0,1.82)
    facade_piece('Bedroom soffit',start,start+span,2.6,2.9)
    facade_piece('Bedroom reveal left',start,left,1.82,2.6)
    facade_piece('Bedroom reveal right',right,start+span,1.82,2.6)
    for height in (1.84,2.58):
        box('Clerestory bronze rail',((left+right)/2,.055,height),(right-left,.12,.04),bronze,.004)
    for x in (left,(left+right)/2,right):
        box('Clerestory upright',(x,.055,2.21),(.04,.12,.74),bronze,.004)
    box('Clerestory clear glazing',((left+right)/2,.07,2.21),(right-left-.04,.008,.71),glass,.001)
    box('Honed stone interior sill',((left+right)/2,-.025,1.815),(right-left+.1,.25,.035),stone,.008)
facade_piece('Ensuite exterior wall',2*span,width+.125,0,2.9)

# Concave sanitaryware with a glazed rim, open drain and real wall thickness.
def washbasin(x,y):
    sides = 80
    profile = [(0.055,.015),(.38,.024),(.77,.064),(.97,.116),(1,.128),
               (.996,.137),(.958,.138),(.89,.121),(.71,.077),(.38,.043),(.055,.033)]
    vertices = [(x+.31*r*math.cos(i*math.tau/sides),
                 y+.199*r*math.sin(i*math.tau/sides),.933+h)
                for r,h in profile for i in range(sides)]
    faces = [(k*sides+i,k*sides+(i+1)%sides,(k+1)*sides+(i+1)%sides,(k+1)*sides+i)
             for k in range(len(profile)-1) for i in range(sides)]
    mesh = bpy.data.meshes.new('Cast vitreous china')
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    basin = bpy.data.objects.new('Vessel basin with open drain',mesh)
    scene.collection.objects.link(basin)
    mesh.materials.append(ceramic)
    for face in mesh.polygons:
        face.use_smooth=True
    cylinder('Drain rose',(x,y,.956),.015,.009,bronze)
for obj in list(scene.objects):
    if obj.name.startswith('Porcelain basin'):
        x,y,_ = obj.location
        bpy.data.objects.remove(obj,do_unlink=True)
        washbasin(x,y)

opal = material('Satin opal diffuser',(.94,.89,.79),.37)
bsdf = opal.node_tree.nodes.get('Principled BSDF')
bsdf.inputs['Emission Color'].default_value = (1,.80,.56,1)
bsdf.inputs['Emission Strength'].default_value = 3.2
for idx, room in enumerate(CONTRACT['layout']['rooms']):
    x,y,w,d = room['x']*scale,-room['z']*scale,room['w']*scale,room['d']*scale
    if room['kind'] == 'bath':
        # Fluted joinery, natural stone shelf, vertical opal light beside mirror.
        for i in range(16):
            box('Vanity oak flute',(x+.12+i*.047,y-.6,.68),(.024,.027,.34),oak,.008)
        box('Mirror side sconce',(x+.93,y-.11,1.59),(.041,.052,.60),opal,.014)
        area('Mirror face light',(x+.93,y-.16,1.59),(x+.7,y-.9,1.34),18,.46,(1,.86,.69))
        box('Shower stone shelf',(x+w-.26,y-.19,1.12),(.45,.24,.033),stone)
        for k in range(2):
            cylinder('Stoneware dispenser',(x+w-.38+k*.12,y-.17,1.23),.038,.18,ceramic)
            cylinder('Dispenser bronze pump',(x+w-.38+k*.12,y-.17,1.336),.013,.034,bronze)
        cylinder('Wet room downlight',(x+w*.56,y-d*.53,2.88),.083,.024,opal)
        area('Wet room ceiling wash',(x+w*.56,y-d*.53,2.84),(x+w*.55,y-d*.46,0),35,.30,(1,.9,.8))
    elif room['kind'] == 'bedroom':
        # Baffled wall-wash concealed above a timber headboard. Daylight is
        # admitted through the modeled clerestory with a broad window source.
        cx=x+w/2
        for j in range(36):
            box('Solid oak headboard reeding',(cx-1.41+j*.08,-.09,.88),(.055,.09,1.56),oak,.009)
        box('Headboard light trough',(cx,-.13,1.66),(2.95,.14,.06),bronze,.009)
        box('Headboard opal strip',(cx,-.14,1.70),(2.87,.065,.012),opal,.002)
        wash=area('Headboard indirect',(cx,-.15,1.72),(cx,-.35,2.8),55,2.83,(1,.82,.62))
        wash.data.shape='RECTANGLE'
        wash.data.size_y=.08
        window=area('North clerestory daylight',(cx,-.035,2.24),(cx,-2.6,1.0),160,3.1,(.86,.93,1))
        window.data.shape='RECTANGLE'
        window.data.size_y=.66
        window.visible_glossy=False
        window.visible_transmission=False
        for offset in [-1.33,1.33]:
            cylinder('Opal reading lamp throat',(cx+offset,-.95,.78),.117,.018,opal)
            area('Opal lamp room bounce',(cx+offset,-.97,.965),(cx+offset,-1.5,2.1),13,.20,(1,.78,.52))
        # Tapered woven runner laid across the duvet follows its scalloped edge.
        cx=x+w/2
        vertices=[]
        faces=[]
        for j in range(17):
            for i in range(85):
                u=i/84
                v=j/16
                edge=max(0,abs(2*u-1)-.87)
                vertices.append((cx+(u-.5)*2.17,-2.69+v*.49,.763-edge*2.6+.012*math.cos(u*38+v*4)))
                if i and j:
                    a=j*85+i
                    faces.append((a-86,a-85,a,a-1))
        mesh=bpy.data.meshes.new('Woven bed runner')
        mesh.from_pydata(vertices,[],faces)
        mesh.update()
        runner=bpy.data.objects.new('Flax runner',mesh)
        scene.collection.objects.link(runner)
        mesh.materials.append(bpy.data.materials['fabric_pattern_05'])
        from production import metric_uv
        metric_uv(runner,.28)
        for face in mesh.polygons: face.use_smooth=True
        runner.modifiers.new('Bound edge','SOLIDIFY').thickness=.007
for x in (1.1,4.7,8.4):
    cylinder('Hall recessed light trim',(x,-4.17,2.87),.059,.018,bronze)
    cylinder('Hall recessed diffuser',(x,-4.17,2.857),.044,.005,opal)
    area('Hall pool of light',(x,-4.17,2.82),(x,-4.17,0),24,.12,(1,.84,.65))
scene['revision'] = 'A0302 interior 2'
bpy.ops.wm.save_as_mainfile(filepath=str(target),compress=True,relative_remap=True)
print('SAVED',target,flush=True)
