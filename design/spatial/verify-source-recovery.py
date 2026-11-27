"""Pack an immutable local source copy and reopen it with all file textures embedded."""
import hashlib
import json
import pathlib
import sys

import bpy

root = pathlib.Path(__file__).resolve().parents[2]
scene_id = sys.argv[sys.argv.index('--')+1]
folders = {'A0302': 'interior-v2', 'Stillwater': 'exterior-v2'}
edition = root / '.agent-work/definitive'
source = edition / folders[scene_id] / (scene_id+'.blend')
def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()
source_hash = digest(source)
archive = edition / 'portable-sources' / (scene_id+'-'+source_hash[:12]+'.blend')
archive.parent.mkdir(exist_ok=True)
if not archive.exists():
    bpy.ops.wm.open_mainfile(filepath=str(source))
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(archive), compress=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.open_mainfile(filepath=str(archive))
images = [im for im in bpy.data.images if im.source == 'FILE' and im.filepath]
unpacked = [im.name for im in images if not im.packed_file or im.packed_file.size < 1]
assert not unpacked, ('Missing embedded textures', unpacked)
assert not list(bpy.data.libraries), 'Unexpected external linked library'
assert len(images) > 0
record = dict(scene=scene_id, sourceSha256=source_hash, archiveSha256=digest(archive),
              archive=str(archive.relative_to(root)).replace(chr(92),'/'), bytes=archive.stat().st_size,
              blender=bpy.app.version_string, reopened=True, embeddedImages=len(images),
              externalLibraries=len(bpy.data.libraries), objects=len(bpy.context.scene.objects))
(root/'docs/frontend-definitive/evidence'/('restore-'+scene_id+'.json')).write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record), flush=True)
