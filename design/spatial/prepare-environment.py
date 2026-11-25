"""A smaller floating-point HDR derivative for real-time PMREM convolution.

The Cycles source keeps its original 2K HDRI. This changes neither lighting
direction nor source scene geometry. Run with Blender, not system Python.
"""
import bpy
import pathlib
import json

root = pathlib.Path(__file__).resolve().parents[2]
source = root / '.agent-work/photoreal/library/kloofendal_48d_partly_cloudy_puresky/environment.hdr'
target = root / '.agent-work/photoreal/flagships/daylight-web.hdr'
image = bpy.data.images.load(str(source), check_existing=False)
original = list(image.size)
image.scale(512, 256)
image.file_format = 'HDR'
image.filepath_raw = str(target)
image.save()
target.with_suffix('.json').write_text(json.dumps({
    'source': str(source.relative_to(root)), 'sourceDimensions': original,
    'webDimensions': [512, 256], 'webBytes': target.stat().st_size,
    'purpose': 'Lower-cost real-time environment convolution; Cycles keeps original HDRI',
}, indent=2), encoding='utf-8')
print('WEB_ENVIRONMENT', target.stat().st_size)
