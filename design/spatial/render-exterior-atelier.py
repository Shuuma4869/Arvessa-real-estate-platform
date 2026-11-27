"""Shoot the eight exterior plates from the same restored Blender source.

Blender -b -P design/spatial/render-exterior-atelier.py -- draft [shot ...]
Blender -b -P design/spatial/render-exterior-atelier.py -- final [shot ...]
Progressive drafts and delivery plates have separate output directories.
"""
import bpy
import hashlib
import json
import math
import pathlib
import sys
import time

HERE=pathlib.Path(__file__).resolve().parent
OUT=HERE.parents[1]/".agent-work/definitive/exterior-v2"
sys.path.insert(0,str(HERE))
from production import camera, environment, box, material, area
import production

shots={
    "day": ((50,-89,25),(0,-2.5,8.2),46),
    "golden": ((-46,-81,18),(-2,-3,7.5),41),
    "night": ((33,-67,9),(0,-2,8.4),34),
    "aerial": ((70,-78,92),(0,0,0),46),
    "entrance": ((-9.8,-24.8,2.20),(-16.4,-11.5,2.0),35),
    "landscape": ((-31,-26.1,1.8),(3,-16.9,1.85),35),
    "facade": ((32,-34,9.5),(20,-6,12),47),
    "showroom": ((62,-98,53),(0,0,6),44),
}
args=sys.argv[sys.argv.index("--")+1:]
quality=args[0]
if quality not in {"draft","final"}: raise ValueError(quality)
directory=OUT/quality
directory.mkdir(exist_ok=True)
with (OUT/"Stillwater.blend").open("rb") as blend:
    source_hash=hashlib.file_digest(blend,"sha256").hexdigest()
for shot in args[1:] or shots:
    filepath=directory/f"Stillwater-{shot}.png"
    report=filepath.with_suffix(".render.json")
    if filepath.is_file() and report.is_file() and json.loads(report.read_text()).get("sourceSHA256")==source_hash:
        print("EXISTS",filepath,flush=True)
        continue
    bpy.ops.wm.open_mainfile(filepath=str(OUT/"Stillwater.blend"))
    scene=bpy.context.scene
    production.scene=scene
    production.materials.clear()

    pref=bpy.context.preferences.addons["cycles"].preferences
    try:
        pref.compute_device_type="HIP"
        pref.refresh_devices()
    except TypeError:
        pass
    hip=[d for d in pref.devices if d.type=="HIP"]
    for d in pref.devices: d.use=d.type=="HIP"
    scene.cycles.device="GPU" if hip else "CPU"
    sun=scene.objects["Architectural sunlight"]
    if shot in {"golden","night","entrance","landscape"}:
        evening=shot=="night"
        angle={"night":107,"golden":78,"entrance":65,"landscape":71}[shot]
        environment("kloofendal_48d_partly_cloudy_puresky" if evening else "belfast_sunset_puresky",.073 if evening else .55,math.radians(123))
        sun.data.energy=0 if evening else 1.9
        sun.data.color=(1,.725,.48)
        sun.rotation_euler=(math.radians(angle),0,math.radians(-57))
        scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value=.073 if evening else .55
        mat=bpy.data.materials["2700K architectural diffuser"]
        mat.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value=4.0 if evening else 1.55
        for obj in scene.objects:
            if obj.type=="LIGHT" and obj.name.startswith("UNIT_LIGHT_"):
                suffix=obj.name[-2:]
                varied=[145,85,210,30][(int(suffix)-1)%4] if suffix.isdigit() else 120
                obj.data.energy=varied if evening else 36
        if evening:
            for lamp_x in [-29,-16,0,16,29]:
                area("Garden reflected light",(lamp_x,-14.1,.55),(lamp_x,-6,6),470,1.8,(1,.67,.34))
            for lamp_x in [-24,-8,8,24]:
                area("Pool light",(lamp_x,-22,-.20),(lamp_x+2,-22,-.7),165,1,(.30,.75,.81))
    if shot=="showroom":
        # Only the model's objects sit on the plinth. The exhibition lighting
        # and seamless paper belong to this shot, not to the sale inventory.
        for obj in scene.objects:
            if obj.get("context_only") or obj.name.startswith(("Surrounding ground","East arrival","Stone kerbstone")):
                obj.hide_render=True
        graphite=material("Exhibition charcoal",(.035,.042,.041),.65)
        champagne=material("Exhibition metal trim",(.27,.19,.105),.36,.7)
        box("Gallery tabletop",(0,0,-2.65),(1400,1400,.3),graphite,.02)
        box("Gallery plinth",(0,0,-1.72),(76,62,1.45),graphite,.17)
        box("Gallery plinth brass seam",(0,0,-1.13),(76.05,62.05,.09),champagne,.02)
        sun.data.energy=.33
        area("Gallery key",(-35,-47,55),(0,0,9),72000,31,(1,.85,.69))
        area("Gallery fill",(39,15,32),(0,0,12),45000,21,(.75,.86,1))
        scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value=.32
    for obj in scene.objects:
        if obj.type=="LIGHT" and obj.data.type=="AREA":
            obj.visible_camera=False
            obj.visible_glossy=False
            obj.visible_transmission=False
            obj.data.specular_factor=0
    if shot=="entrance":
        # The eye is at deck height; focus follows the stone portal.
        scene.view_settings.exposure=.22
    pos,target,lens=shots[shot]
    c=camera("Atelier / "+shot,pos,target,lens)
    c.data.clip_end=2000
    scene.render.engine="CYCLES"
    scene.cycles.samples=12 if quality=="draft" else (112 if shot in {"night","entrance"} else 80)
    scene.cycles.use_denoising=True
    scene.cycles.use_adaptive_sampling=True
    scene.cycles.adaptive_threshold=.078 if quality=="draft" else .035
    scene.render.resolution_x,scene.render.resolution_y=(744,496) if quality=="draft" else (1600,1068)
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format="PNG"
    scene.render.filepath=str(filepath)
    missing=[im.name for im in bpy.data.images if im.source=="FILE" and im.filepath and not im.packed_file and not pathlib.Path(bpy.path.abspath(im.filepath)).is_file()]
    if missing: raise ValueError(f"Missing source images: {missing}")
    start=time.perf_counter()
    bpy.ops.render.render(write_still=True)
    record=dict(file=filepath.name,sourceSHA256=source_hash,source="Stillwater.blend",renderer="Cycles",blender=bpy.app.version_string,
        backend=scene.cycles.device,devices=[d.name for d in hip] if hip else ["CPU"],samples=scene.cycles.samples,
        denoise=True,adaptiveThreshold=scene.cycles.adaptive_threshold,width=scene.render.resolution_x,height=scene.render.resolution_y,
        maxBounces=scene.cycles.max_bounces,view=scene.view_settings.view_transform,look=scene.view_settings.look,
        camera=dict(position=pos,target=target,lens=lens),seconds=round(time.perf_counter()-start,2),visualApproval="PENDING")
    report.write_text(json.dumps(record,indent=2))
    print("RENDERED",shot,record["seconds"],flush=True)
