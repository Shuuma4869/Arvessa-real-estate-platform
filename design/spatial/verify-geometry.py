"""Regression check for the architectural solid used by both source scenes.

Run inside Blender. A valid glTF alone cannot detect inverted solid normals.
"""
import pathlib, sys, json, bpy, bmesh
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
from production import box, material

results=[]
for bevel in [0, .001, .02]:
    obj=box('Glass normal regression',(0,0,0),(2,3,4),material('Test glass',(1,1,1),transmission=1),bevel)
    evaluated=obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh=evaluated.to_mesh();bm=bmesh.new();bm.from_mesh(mesh)
    volume=bm.calc_volume(signed=True)
    assert volume>23.9, f'Expected positive outward solid volume, got {volume}'
    assert all(edge.is_manifold for edge in bm.edges), 'Solid has an open edge'
    results.append({'bevel':bevel,'signedVolume':volume,'outward':True,'manifold':True})
    bm.free();evaluated.to_mesh_clear();bpy.data.objects.remove(obj,do_unlink=True)
print('GEOMETRY_CHECK',json.dumps(results))
