"""Construct the Stillwater terrace, porch and streetscape over the checked v1 file.

Blender -b -P design/spatial/stillwater-atelier.py. Original geometry identified
by unit ID stays in place. Curved eaves, deep reveals and entrance joinery are
modelled at metre scale. No photographed backgrounds are used.
"""
import hashlib
import json
import math
import pathlib
import shutil
import sys

import bpy

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
CACHE = ROOT / ".agent-work"
SOURCE = CACHE / "photoreal/flagships/Stillwater.blend"
BASE = CACHE / "definitive/source-baseline/Stillwater.blend"
OUT = CACHE / "definitive/exterior-v2"
OUT.mkdir(parents=True, exist_ok=True)
if not BASE.exists():
    BASE.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SOURCE, BASE)
with BASE.open("rb") as restored, SOURCE.open("rb") as source:
    if hashlib.file_digest(restored, "sha256").digest() != hashlib.file_digest(source, "sha256").digest():
        raise ValueError("Baseline differs from v1. Resolve before opening.")
bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
# A byte-identical backup lives at a different path. Resolve external dependencies
# relative to the original blend before serializing the restored scene.
for image in bpy.data.images:
    if image.source not in {"FILE","TILED"} or not image.filepath or image.packed_file:
        continue
    rel = image.filepath
    path = (SOURCE.parent / rel[2:]).resolve() if rel.startswith("//") else pathlib.Path(bpy.path.abspath(rel))
    if not path.is_file():
        raise FileNotFoundError(f"Unresolved source image {image.name}: {path}")
    image.filepath = str(path)
sys.path.insert(0, str(HERE))
from production import area, asset, box, camera, cylinder, material, metric_uv

scene = bpy.context.scene
original_mapping = json.loads((SOURCE.parent / "stillwater-interaction.json").read_text())
expected = {f"{tower}{floor:02}{number:02}" for tower in ("A","B") for floor in range(1,7) for number in range(1,5)}
if len(original_mapping)!=48 or {entry["id"] for entry in original_mapping}!=expected:
    raise ValueError("Source does not have the 48 Stillwater inventory IDs")
for entry in original_mapping:
    unit = scene.objects["UNIT_" + entry["id"]]
    assert max(abs(a-b) for a,b in zip(unit.location, entry["blender"])) < .0001

stone = bpy.data.materials["marble_01"]
wood = bpy.data.materials["oak_veneer_01"]
soil = bpy.data.materials["grass_ground"]
bronze = bpy.data.materials["Bronze aluminium"]
glass = bpy.data.materials["Architectural glazing"]
ivory = bpy.data.materials["Warm architectural plaster"]
warm = bpy.data.materials["2700K architectural diffuser"]
copper = material("Brushed weathering bronze", (.265,.15,.067), .34,.73)
asphalt = material("Fine-grain street asphalt", (.11,.115,.108), .91)
curb = material("Honed limestone aggregate", (.53,.49,.394),.81)
lacquer = material("Reception deep olive lacquer",(.047,.089,.071),.31)
light = material("Warm opaline glass",(.92,.74,.47),.29)
light.node_tree.nodes["Principled BSDF"].inputs["Emission Color"].default_value = (1,.68,.34,1)
light.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 2.3

def outline(name, x,y, bottom, points, height, mat):
    """Extrude a horizontal CCW section with real upper and lower surfaces."""
    count = len(points)
    mesh = bpy.data.meshes.new(name)
    verts = [(px,py,z) for z in (0,height) for px,py in points]
    faces = [tuple(reversed(range(count))), tuple(range(count,2*count))]
    faces += [(i,(i+1)%count,count+(i+1)%count,count+i) for i in range(count)]
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    obj = bpy.data.objects.new(name,mesh)
    scene.collection.objects.link(obj)
    obj.location = (x,y,bottom)
    obj.data.materials.append(mat)
    metric_uv(obj)
    bevel = obj.modifiers.new("Eased stone arris","BEVEL")
    bevel.width = .014
    bevel.segments = 2
    obj.modifiers.new("Face normals","WEIGHTED_NORMAL")
    return obj

def tablet(name,x,y,z,w,d,r,h,mat):
    points = []
    for cx,cy,start in [(w/2-r,d/2-r,0),(-w/2+r,d/2-r,90),(-w/2+r,-d/2+r,180),(w/2-r,-d/2+r,270)]:
        for index in range(9):
            angle=math.radians(start + index*90/8)
            points.append((cx+r*math.cos(angle),cy+r*math.sin(angle)))
    return outline(name,x,y,z,points,h,mat)

def inscription(name,body,pos,size):
    data=bpy.data.curves.new(name,"FONT")
    data.body=body
    data.size=size
    data.align_x="CENTER"
    data.space_character=1.24
    data.extrude=.006
    data.bevel_depth=.001
    obj=bpy.data.objects.new(name,data)
    scene.collection.objects.link(obj)
    obj.location=pos
    obj.rotation_euler.x=math.pi/2
    obj.data.materials.append(copper)

def entrance(tower,tx,ty):
    # Shorten the solid service core only on the lobby level. A ground visitor
    # now walks from the deck, through an opening, all the way to the desk.
    core=scene.objects["Tower "+tower+" core"]
    core.scale.z = (19.2-3.2)/19.2
    core.location.z += 1.6
    box("Ground service core "+tower,(tx,ty+1.95,1.8),(3.1,17.1,3.2),ivory)
    for obj in list(scene.objects):
        dx,dy,dz=obj.location
        if obj.name.startswith("Entrance step") and abs(dx-tx)<.01: bpy.data.objects.remove(obj,do_unlink=True)
        elif abs(dy-(ty-11.35))<.02 and abs(dx-tx)<.01 and obj.name.startswith(("Glass balcony guard","Continuous handrail")) and dz<2:
            typ=obj.name.split(".")[0]
            height=obj.dimensions.z
            thick=obj.dimensions.y
            mat=obj.data.materials[0]
            bpy.data.objects.remove(obj,do_unlink=True)
            for side in [-1,1]:
                box(typ+" lobby return",(tx+side*7.35,dy,dz),(10.4,thick,height),mat,.002)
        elif obj.name.startswith("Balustrade shoe") and abs(dy-(ty-11.35))<.02 and abs(dx-tx)<1.99 and dz<1:
            bpy.data.objects.remove(obj,do_unlink=True)
    for i in range(4):
        top=.097+i*.127
        box("Porch landing tread",(tx,ty-13.72+i*.57,(top-.03)/2),(5.2,.62,top+.03),stone,.022)
    box("Recessed lobby floor",(tx,ty-9.42,.47),(3.3,5,.07),stone)
    for side in (-1,1):
        box("Fumed oak portal reveal",(tx+side*1.59,ty-9.12,1.83),(.14,5.2,2.72),wood)
        for i in range(17):
            box("Vertical lobby joinery",(tx+side*1.50,ty-11.36+i*.235,1.85),(.08,.058,2.65),wood,.009)
        box("Porch door sidelight",(tx+side*1.15,ty-11.82,1.83),(.72,.016,2.62),glass,.002)
        box("Bronze recessed jamb",(tx+side*1.53,ty-11.83,1.84),(.09,.15,2.73),bronze)
        # Opening width 1.56 m, no centre mullion.
        if side == 1:
            box("Door head",(tx,ty-11.84,3.16),(3.15,.14,.085),bronze)
        tablet("Bullnose porch pier",tx+side*3.08,ty-14.08,.01,.44,.74,.21,2.98,stone)
    box("Lobby ceiling",(tx,ty-9,3.20),(3.25,5.8,.11),wood)
    tablet("Lacquered reception millwork",tx+.1,ty-7.28,.51,2.12,.66,.23,.9,lacquer)
    tablet("Reception stone top",tx+.1,ty-7.28,1.41,2.21,.73,.26,.07,stone)
    tablet("Curved arrival soffit",tx,ty-12.37,3.00,7.9,5.05,.91,.10,wood)
    tablet("Cantilevered limestone arrival canopy",tx,ty-12.37,3.10,8.14,5.24,.95,.24,stone)
    tablet("Folded bronze fascia",tx,ty-12.37,3.32,8.16,5.26,.95,.055,bronze)
    for dx in (-2.55,-1.3,1.3,2.55):
        cylinder("Recessed porch downlight",(tx+dx,ty-13.79,2.99),.068,.02,light,24)
    area("Entry wallwash "+tower,(tx,ty-12.2,2.88),(tx,ty-7.3,1.25),132,2.6)
    area("Reception soft light "+tower,(tx,ty-7.65,2.9),(tx,ty-8.5,.9),115,2.1)
    tablet("Garden wayfinding stele",tx+4.85,ty-13.62,-.01,2.5,.45,.14,1.42,stone)
    inscription("Building title "+tower,"STILLWATER",(tx+4.85,ty-13.851,.87),.20)
    inscription("Building letter "+tower,"RESIDENCE "+tower,(tx+4.85,ty-13.852,.58),.105)

def tower(tx,ty,letter):
    entrance(letter,tx,ty)
    # Alternate two-storey stone frames and operable bronze balcony screens.
    # Frames sit beyond the guard; preserve the 48 original pick surfaces.
    for level in range(3):
        z=.42+level*6.4
        offset=1 if (level+(letter=="B"))%2 else -1
        xx=tx+offset*6.55
        for edge in [-1,1]:
            tablet("Two-storey limestone blade",xx+edge*4.65,ty-11.75,z,.38,.84,.12,6.15,stone)
        tablet("Double bay architrave",xx,ty-11.73,z+6.05,9.64,.90,.16,.20,stone)
        for side in [-1,1]:
            sx=tx+side*12.55
            for k in range(8):
                sy=ty+(3.35 if level%2 else -6.65)+k*.36
                fin=tablet("Rotated bronze shutter",sx,sy,z,.67,.075,.036,6.12,copper)
                fin.rotation_euler.z=math.radians(side*(27 if letter=="A" else 48))
    # Offset upper pavilion toward the enclosed core and away from the roof garden.
    dx = tx+(-3.8 if letter=="A" else 3.8)
    yy=ty+4
    tablet("Sky room timber platform",dx,yy,19.90,10,6.30,.43,.13,wood)
    for edge in (-1,1):
        box("Pavilion screen glass",(dx,yy+edge*2.46,21.12),(8.7,.025,2.18),glass)
        for j in range(6):
            box("Pavilion bronze mullion",(dx-4.31+j*1.72,yy+edge*2.47,21.12),(.055,.08,2.18),bronze,.005)
        box("Pavilion stone end",(dx+edge*4.43,yy,21.12),(.2,5,2.18),stone,.016)
    tablet("Floating pavilion eave",dx,yy,22.15,10.65,6.54,.73,.25,stone)

for letter,tx,ty in (("A",-16.5,0),("B",16.5,1.5)):
    # Original roof pergola overlaps new sky room. Preserve the outdoor lounge
    # pergola by relocating it to the opposite end of each terrace.
    for obj in scene.objects:
        if obj.name.startswith(("Roof pergola post","Roof timber blade")) and abs(obj.location.x-tx)<7:
            obj.location.y -= 4.6
    tower(tx,ty,letter)

# Slender bent timber pool shelters interrupt the repetitive rows of day beds.
for px in [-26,1.8,26.5]:
    py=-14.75
    for side in [-1,1]:
        tablet("Cabana bronze pilaster",px+side*1.57,py+.78,.03,.105,.18,.05,2.42,bronze)
    tablet("Cabana cedar roof",px,py,2.43,3.55,2.18,.38,.12,wood)
    for rung in range(9):
        box("Cabana shade louvers",(px,py+1.01,.85+rung*.14),(3.21,.08,.06),wood)
    tablet("Poolside settee",px,py+.32,.28,2.85,.74,.24,.28,bpy.data.materials["Outdoor woven cushions"])
# South promenade, garden edging, paved arrival loop and illustrative off-site context.
for x in [-26,-13,0,13,26]:
    tablet("Garden seat wall",x,-28.33,-.04,9.1,2.15,.78,.50,stone)
    tablet("Garden planting top",x,-28.33,.46,8.81,1.86,.64,.045,soil)
    for j in range(3):
        shrub=asset("potted_plant_02",(x-2.9+j*2.78,-28.33,.06),j*1.39,1.9)
box("East arrival pavement",(39,0,-.32),(4,60,.55),curb,.04)
box("East arrival road",(45,0,-.52),(8,112,.65),asphalt,.04)
for side in (-1,1):
    for i in range(24):
        box("Stone kerbstone",(45+side*4.02,-46+i*4,-.21),(.16,3.97,.31),curb,.016)
# These off-site objects are not selectable or marketed inventory.
for side in (-1,1):
    for i in range(9):
        x=side*(36.5 if side<0 else 52)
        y=-38+i*9
        tree=asset("jacaranda_tree",(x,y,-.68),i*2.13,(.37,.47,.42)[i%3])
        tree["context_only"]=True
        for child in tree.children:
            child["context_only"]=True
for i in range(5):
    x=-59+i*27
    y=47+(i%2)*9
    w=(12,16,14)[i%3]
    h=(4.2,5.9,7.4)[i%3]
    for obj in (
        tablet("Context courtyard wing",x,y,-1.1,w,8,.5,h,ivory),
        tablet("Context eave",x,y,-1.1+h,w+.75,8.75,.55,.26,curb),
        box("Context shaded loggia",(x,y-4.02,h*.47),(w*.79,.12,.95),bronze)
    ):
        obj["context_only"]=True
    for j in range(3):
        tree=asset("jacaranda_tree",(x-7+j*7,y-6.2,-1.05),i+j,.47)
        tree["context_only"]=True
        for child in tree.children:
            child["context_only"]=True
# First-pass review exposed deck furniture in the line of arrival and disc
# reflections from the unshaded photographic fill lights behind glazing.
for obj in scene.objects:
    if obj.name.startswith(("Sun lounger", "Pool side table", "Pool table pedestal")):
        for tx in (-16.5,16.5):
            if abs(obj.location.x-tx)<3.0:
                obj.location.x += -4.35 if tx<0 else 4.35
                break
    if obj.type=="LIGHT" and obj.data.type=="AREA":
        obj.visible_camera=False
        obj.visible_glossy=False
        obj.visible_transmission=False
        obj.data.specular_factor=0
        if obj.name.startswith("UNIT_LIGHT_"):
            from mathutils import Vector
            number=int(obj.name[-2:])
            inward=1 if number<=2 else -1
            obj.rotation_euler=Vector((0,inward*3.2,-1.05)).to_track_quat("-Z","Y").to_euler()
scene["context_description"]="Conceptual street and neighboring pavilion massing; outside sale inventory."
scene["art_direction"]="Deep two-storey limestone reveals, bronze screens, rounded floating eaves and a water garden."
scene.camera=camera("Revised terrace daylight",(50,-89,25),(0,-2.5,8.2),46)
# Preserve linked assets when saving the backup in its new directory.
scene.render.threads_mode="FIXED"
scene.render.threads=3
# Only this versioned .blend is written; v1 stays recoverable.
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/"Stillwater.blend"),compress=True,relative_remap=True)
(OUT/"stillwater-interaction.json").write_text(json.dumps(original_mapping,indent=2))
print("STILLWATER_V2",len(original_mapping),len(scene.objects),str(OUT),flush=True)
