"""A0302 only: asset-led interior, shared source for cutaway and panoramas."""
import sys, pathlib, math, json
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
from production import *
reset()
s=CONTRACT['metresPerLayoutUnit'];layout=CONTRACT['layout'];W=layout['width']*s;D=layout['depth']*s
oak=pbr('oak_veneer_01');stone=pbr('marble_01')
plaster=material('Warm lime plaster',(.77,.74,.67),.85)
bronze=material('Champagne anodised aluminium',(.32,.23,.12),.29,.9)
ink=material('Deep forest joinery',(.035,.065,.052),.4)
ceramic=material('Glazed ceramic',(.82,.81,.76),.19)
glass=material('Low iron architectural glass',(.97,.99,1),.035,transmission=1,ior=1.52)
fabric=pbr('fabric_pattern_05');bsdf=fabric.node_tree.nodes.get('Principled BSDF')
for link in list(fabric.node_tree.links):
    if link.to_socket==bsdf.inputs['Base Color']:fabric.node_tree.links.remove(link)
bsdf.inputs['Base Color'].default_value=(.66,.6,.49,1);bsdf.inputs['Sheen Weight'].default_value=.25
cloth=material('Cotton bedding',(.8,.77,.69),.9)
# Reuse the actual fabric micro-normal and roughness maps, with plain dyed albedo.
for channel,socket in [('Rough','Roughness'),('nor_gl','Normal')]:
    im=bpy.data.images.load(str(next((LIBRARY/'fabric_pattern_05').glob(channel+'.*'))),check_existing=True)
    tex=cloth.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im
    if socket=='Normal':
        nm=cloth.node_tree.nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.25;cloth.node_tree.links.new(tex.outputs['Color'],nm.inputs['Color']);cloth.node_tree.links.new(nm.outputs['Normal'],cloth.node_tree.nodes.get('Principled BSDF').inputs['Normal'])
    else:cloth.node_tree.links.new(tex.outputs['Color'],cloth.node_tree.nodes.get('Principled BSDF').inputs[socket])
shell=[];ceilings=[]
def wall(name,pos,size,cut=False):
    o=box(name,pos,size,plaster,.012)
    if cut:o['cutaway']=True;shell.append(o)
    return o
box('Structural floor',(W/2,-D/2,-.14),(W+.25,D+.25,.28),stone)
# Individual boards with metric UVs and deliberately staggered end joints.
for row in range(math.ceil(9.6*s/.18)):
    y=-row*.18-.09
    for col in range(math.ceil(W/1.8)+1):
        start=max(0,col*1.8-(row%3)*.6);end=min(W,(col+1)*1.8-(row%3)*.6)
        if end-start>.03:box('Oak floorboard',((start+end)/2,y,.012),(end-start-.003,.177,.024),oak,.0015)
box('Loggia deck',(W/2,-10.5*s,.01),(W,1.8*s,.04),oak,.002)
back=wall('North exterior wall',(W/2,.06,1.45),(W+.25,.18,2.9))
wall('West bedroom cutaway wall',(-.06,-2*s,1.45),(.18,4*s,2.9),True)
wall('West living cutaway wall',(-.06,-7.4*s,1.45),(.18,4.4*s,2.9),True)
wall('Entry lintel',(-.06,-4.6*s,2.55),(.18,1.2*s,.7),True)
entrance=box('Apartment entrance open door',(-.48,-4*s,1.08),(.96,.055,2.16),oak,.008)
entrance['cutaway']=True;shell.append(entrance)
wall('East cutaway wall',(W+.06,-4.8*s,1.45),(.18,9.6*s,2.9),True)
ceiling=box('Ceiling / reveal cutaway',(W/2,-4.8*s,2.95),(W+.25,9.6*s+.2,.12),plaster);ceiling['cutaway']=True;ceilings.append(ceiling)
for x in [0,W]:box('Oak skirting',(x,-4.8*s,.06),(.035,9.6*s,.12),oak,.003)

def door_wall(x,y,width,name):
    gap=.86;left=(width-gap)/2;h=2.9
    wall(name+' left',(x+left/2,y,h/2),(left,.14,h))
    wall(name+' right',(x+left+gap+left/2,y,h/2),(left,.14,h))
    wall(name+' lintel',(x+width/2,y,2.55),(gap,.14,.7))
    for dx in [-gap/2,gap/2]:box(name+' frame',(x+width/2+dx,y,1.1),(.05,.2,2.2),oak,.004)
    box(name+' header',(x+width/2,y,2.2),(gap+.1,.2,.05),oak,.004)
    leaf=box(name+' open leaf',(x+width/2-gap/2+.08,y-.37,1.08),(.04,.78,2.15),oak,.006)
    cylinder(name+' handle',(x+width/2-gap/2+.12,y-.65,1.03),.025,.13,bronze)

def soft(name,pos,size,mat,radius=.12):
    o=box(name,pos,size,mat,radius)
    # Rounded upholstery with continuous smooth normals; detail is in cloth cover below.
    for p in o.data.polygons:p.use_smooth=True
    return o

def duvet(cx,cy,z,width=1.95,length=2.15):
    verts=[];faces=[];nx=70;ny=82
    for j in range(ny+1):
        v=j/ny;yy=(v-.5)*(length+.3)
        for i in range(nx+1):
            u=i/nx;xx=(u-.5)*(width+.24)
            edge=max(0,abs(xx)-width/2)*2.4+max(0,abs(yy)-length/2)*2
            wrinkle=.012*math.sin(u*55+v*18)+.016*math.sin(v*43-u*7)*(abs(u-.5)*1.5+.12)
            verts.append((cx+xx,cy+yy,z-edge+wrinkle))
    for j in range(ny):
        for i in range(nx):
            a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
    mesh=bpy.data.meshes.new('Draped duvet mesh');mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new('Draped cotton duvet',mesh);scene.collection.objects.link(o);o.data.materials.append(cloth)
    uv=mesh.uv_layers.new()
    for face in mesh.polygons:
        face.use_smooth=True
        for li in face.loop_indices:
            vi=mesh.loops[li].vertex_index;uv.data[li].uv=((vi%(nx+1))/nx*8,(vi//(nx+1))/ny*8)
    solid=o.modifiers.new('Cloth hem thickness','SOLIDIFY');solid.thickness=.012
    return o

for r in layout['rooms']:
    x=r['x']*s;y=-r['z']*s;w=r['w']*s;d=r['d']*s;cx=x+w/2;cy=y-d/2
    if r['kind']=='bedroom':
        if r['x']>0:wall(r['id']+' partition',(x,y-d/2,1.45),(.14,d,2.9))
        door_wall(x,-4*s,w,r['id']+' doorway')
        box(r['id']+' rug',(cx,-2*s,.045),(2.6,2.9,.025),fabric,.015)
        soft('Upholstered bed base',(cx,-1.9,.29),(1.97,2.16,.43),fabric,.12)
        soft('Mattress',(cx,-1.9,.58),(1.9,2.1,.22),cloth,.1)
        soft('Headboard',(cx,-.65,.85),(2.15,.16,1.45),fabric,.1)
        duvet(cx,-1.95,.72)
        for dx in [-.46,.46]:
            pillow=soft('Cotton pillow',(cx+dx,-1.16,.83),(.76,.5,.19),cloth,.12);pillow.rotation_euler.z=dx*.06
            # Visible sewn piping is modeled independently from the cushion surface.
            curve('Pillow piping',[(cx+dx+.32*math.cos(a),-1.16+.20*math.sin(a),.83)for a in [i*math.tau/64 for i in range(64)]],.003,cloth,True)
        for dx in [-1.33,1.33]:
            cylinder('Bedside pedestal',(cx+dx,-.95,.27),.26,.5,oak)
            cylinder('Lamp stem',(cx+dx,-.95,.68),.014,.3,bronze)
            cylinder('Linen lampshade',(cx+dx,-.95,.92),.15,.26,fabric)
            area('Warm bedside',(cx+dx,-.95,.85),(cx+dx,-.95,.2),7,.18,(1,.7,.43))
        box('Built in wardrobe',(x+.32,-2.75,1.23),(.55,1.25,2.46),oak)
        for yy in [-2.43,-3.05]:box('Wardrobe reveal',(x+.61,yy,1.23),(.015,.015,2.3),bronze,.002)
    elif r['kind']=='bath':
        box('Porcelain bathroom floor',(cx,cy,.035),(w,d,.05),stone)
        if r['z']==0:
            # Ensuite entrance from bedroom 2; keep the opening in the shared plan.
            gap=.78;segment=(d-gap)/2
            for yy in [y-segment/2,y-d+segment/2]:wall('Ensuite jamb',(x,yy,1.45),(.14,segment,2.9))
            wall('Ensuite lintel',(x,cy,2.55),(.14,gap,.7))
        else:wall('Bathroom divider',(x,cy,1.45),(.14,d,2.9))
        if r['z']==0:wall('Bathroom middle',(cx,y-d,1.45),(w,.14,2.9))
        else:door_wall(x,y-d,w,'Bathroom entry')
        box('Vanity',(x+.48,y-.35,.67),(.8,.48,.4),oak)
        box('Vanity stone',(x+.48,y-.35,.91),(.84,.52,.06),stone)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,location=(x+.48,y-.35,.97));basin=bpy.context.object;basin.name='Porcelain basin';basin.scale=(.3,.19,.09);basin.data.materials.append(ceramic)
        curve('Basin mixer',[(x+.48,y-.12,.94),(x+.48,y-.12,1.2),(x+.48,y-.3,1.2)],.012,bronze)
        box('Shower glazing',(x+w-.7,cy,1.08),(.008,d-.18,2.1),glass,.002)
        curve('Shower riser',[(x+w-.24,y-.16,.9),(x+w-.24,y-.16,2.25),(x+w-.24,y-.45,2.25)],.015,bronze)
        cylinder('Shower rose',(x+w-.24,y-.45,2.23),.13,.02,bronze)
        soft('WC ceramic',(x+.48,y-d+.47,.25),(.38,.58,.45),ceramic,.16)
        mirror=material('Mirror silver',(.92,.92,.92),.025,1)
        box('Vanity mirror',(x+.48,y-.075,1.58),(.78,.015,.83),mirror,.005)

# Living: licensed furniture retains its original upholstery topology and UV maps.
box('Handwoven living rug',(2.8,-6.85,.035),(4.5,2.95,.03),fabric,.018)
asset('GlamVelvetSofa',(2.3,-5.65,.03),scale=1.25)
asset('modern_arm_chair_01',(4.95,-7.65,.03),math.radians(145))
asset('modern_coffee_table_01',(2.4,-7.08,.06),math.radians(6),1.35)
asset('potted_plant_02',(5.65,-5.45,.05),scale=1.7)
asset('potted_plant_02',(.65,-8.25,.05),scale=1.15)
box('Low media cabinet',(.28,-7.2,.29),(.42,2.15,.48),oak,.025)
box('Media panel',(.045,-7.2,1.32),(.025,1.6,.91),ink,.012)
# Small original ceramics, paper and stone retain a quiet residential composition.
for i in range(3):box('Art book',(2.6,-7.15,.61+i*.035),(.35,.24,.03),plaster,.001)
cylinder('Ceramic vase',(2,-7,.73),.095,.27,ceramic)
curve('Branch in vase',[(2,-7,.86),(2.02,-7,1.05),(2.13,-6.96,1.21)],.003,bronze)

# Kitchen: cabinet construction, inset doors, reveals, toe-kick and hardware.
kx=6.72*s;kw=W-kx
box('Kitchen back panel',(kx+kw/2,-4.81,1.45),(kw,.07,2.9),plaster)
for i in range(6):
    xx=kx+(i+.5)*(kw/6)
    box('Oak cabinet carcass',(xx,-5.2,.43),(kw/6-.008,.62,.78),oak)
    box('Inset cabinet front',(xx,-5.525,.45),(kw/6-.035,.025,.72),oak,.004)
    box('Recessed pull',(xx,-5.545,.76),(kw/6-.08,.012,.023),bronze,.002)
    box('Upper joinery',(xx,-4.99,2.12),(kw/6-.015,.33,.85),ink,.012)
box('Stone worktop',(kx+kw/2,-5.2,.86),(kw+.02,.69,.045),stone,.012)
box('Stone backsplash',(kx+kw/2,-4.875,1.25),(kw,.03,.73),stone,.004)
box('Toe kick',(kx+kw/2,-5.37,.07),(kw-.12,.1,.12),ink,.003)
blackglass=material('Induction ceramic glass',(.012,.015,.014),.08)
box('Induction hob',(kx+.8,-5.2,.89),(.6,.5,.012),blackglass,.012)
for dx in [-.15,.15]:
    for dy in [-.13,.13]:curve('Induction ring',[(kx+.8+dx+.09*math.cos(a),-5.2+dy+.09*math.sin(a),.899)for a in [j*math.tau/48 for j in range(48)]],.0015,bronze,True)
box('Sink recess',(W-.65,-5.22,.89),(.55,.38,.025),ink,.04)
curve('Kitchen mixer',[(W-.65,-4.99,.9),(W-.65,-4.99,1.25),(W-.65,-5.2,1.32),(W-.65,-5.3,1.15)],.015,bronze)
box('Integrated appliance cabinet',(W-.4,-6.1,1.23),(.75,.73,2.46),oak,.015)
box('Oven',(W-.4,-6.48,1.2),(.62,.025,.55),blackglass,.02)
box('Oven handle',(W-.4,-6.53,1.4),(.48,.03,.025),bronze,.005)
table_x=kx+kw/2;table_y=-7.35
box('Dining stone top',(table_x,table_y,.78),(1.85,.94,.09),stone,.09)
for dx in [-.6,.6]:box('Dining oak leg',(table_x+dx,table_y,.38),(.17,.65,.75),oak,.035)
for dx in [-.56,.56]:
    asset('dining_chair_02',(table_x+dx,table_y-.82,.03),math.pi)
    asset('dining_chair_02',(table_x+dx,table_y+.82,.03))
for dx in [-.45,.45]:
    curve('Pendant wire',[(table_x+dx,table_y,2.9),(table_x+dx,table_y,1.85)],.003,bronze)
    cylinder('Pendant shade',(table_x+dx,table_y,1.85),.18,.12,bronze)
    area('Pendant illumination',(table_x+dx,table_y,1.76),(table_x+dx,table_y,.7),12,.25)

# Same windows and openings in dollhouse, room photographs and panorama.
for i in range(9):
    x=i*W/8
    box('Sliding window mullion',(x,-9.6*s,1.45),(.035,.08,2.9),bronze,.003)
    if i<8:box('Low iron glass pane',(x+W/16,-9.6*s,1.45),(W/8-.035,.008,2.77),glass,.001)
for z in [.06,2.86]:box('Window frame',(W/2,-9.6*s,z),(W,.09,.05),bronze,.003)
# Woven curtains are draped surfaces, not cylinders; folds taper at the heading.
for side in [0,1]:
    vertices=[];faces=[];nx=100;ny=32
    for j in range(ny+1):
        t=j/ny
        for i in range(nx+1):
            u=i/nx;x=(.12+u*.9) if side==0 else W-.12-u*.9
            vertices.append((x,-9.6*s+.11+.045*math.sin(u*math.tau*8)*(1-.22*t),.08+t*2.72))
    for j in range(ny):
        for i in range(nx):a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
    mesh=bpy.data.meshes.new('Linen curtain folds');mesh.from_pydata(vertices,[],faces);mesh.update();o=bpy.data.objects.new('Linen curtain',mesh);scene.collection.objects.link(o);o.data.materials.append(cloth);metric_uv(o,.35)
    for f in mesh.polygons:f.use_smooth=True
for x in [i*W/8 for i in range(9)]:box('Loggia baluster',(x,-D, .56),(.025,.035,1.1),bronze,.003)
box('Loggia guard glass',(W/2,-D,.56),(W,.01,1),glass,.001)
box('Loggia top rail',(W/2,-D,1.1),(W,.05,.035),bronze,.003)
asset('potted_plant_02',(W-1,-D+.7,.03),scale=1.6)
asset('modern_arm_chair_01',(1.1,-D+.8,.03),math.radians(-80),.8)
asset('modern_arm_chair_01',(2.9,-D+.8,.03),math.radians(80),.8)
cylinder('Loggia table',(2,-D+.8,.45),.32,.04,stone)
cylinder('Loggia pedestal',(2,-D+.8,.22),.055,.44,bronze)
environment('kloofendal_48d_partly_cloudy_puresky',.7,math.radians(130))
sun_data=bpy.data.lights.new('Stillwater daylight sun','SUN');sun=bpy.data.objects.new('Stillwater daylight sun',sun_data);scene.collection.objects.link(sun)
sun.data.energy=1.35;sun.data.angle=.06;sun.rotation_euler=(math.radians(28),math.radians(-25),math.radians(-30))
fill=area('Window daylight',(W/2,-D-1,2.2),(W/2,-4,1.1),450,8,(.9,.95,1))
fill.visible_glossy=False;fill.visible_transmission=False
area('Living bounced daylight',(4,-6.8,2.75),(2,-5.7,.6),40,3,(1,.91,.76))
# A small original wall relief, built as a physical object rather than a borrowed image.
box('Relief oak frame',(3.25,-4*s-.095,1.55),(1.13,.055,1.35),oak,.012)
box('Relief linen ground',(3.25,-4*s-.132,1.55),(1.03,.015,1.25),cloth,.003)
for k in range(4):
    curve('Bronze contour relief',[(3.25+.34*math.cos(a),-4*s-.16,1.55+.43*math.sin(a)) for a in [j*math.pi/50+k*.12 for j in range(66)]],.006,bronze)
# Garden context is translated from A0302's third-floor position in Stillwater.
# It is excluded from the isolated web cutaway, but shared by all room renders.
before_context=set(scene.objects)
garden=pbr('grass_ground')
box('Garden below A0302',(15,-25,-6.6),(100,45,.15),garden,.01)
pool=material('Garden pool water',(.065,.24,.25),.1,transmission=.8,ior=1.333)
box('Courtyard pool below',(14.9,-20.8,-6.48),(63,7.5,.08),pool,.02)
for x,y in [(-14,-16),(-8,-23),(19,-15),(28,-22)]:asset('jacaranda_tree',(x,y,-6.5),x*.11,.32)
for o in set(scene.objects)-before_context:o['context_only']=True
camera('Living photograph',(5.65,-8.4,1.6),(2.1,-5.8,1.1),26)
scene['propertyId']='A0302';scene['layout_source']='residence-layout.ts';scene['area_m2']=107
save_source('A0302')
mode=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else ['living']
if 'preview' in mode:render('A0302-lighting-preview',720,500,32)
if 'living' in mode:render('A0302-living')
if 'kitchen' in mode:
    camera('Kitchen photograph',(5.6,-8.25,1.6),(8.35,-5.2,1.2),24);render('A0302-kitchen')
if 'dollhouse' in mode:
    for o in shell+ceilings:o.hide_render=True
    for o in scene.objects:
        if o.get('context_only'):o.hide_render=True
    camera('Dollhouse',(W+4,-D-6,22),(W/2,-D/2,.4),48)
    cutaway_light=area('Cutaway daylight',(W/2,-D/2,8),(W/2,-D/2,0),800,8,(1,.95,.87))
    render('A0302-dollhouse',1600,1200)
    bpy.data.objects.remove(cutaway_light,do_unlink=True)
if 'panorama' in mode:
    for o in shell+ceilings:o.hide_render=False
    for o in scene.objects:
        if o.get('context_only'):o.hide_render=False
    c=camera('Living 360',(3.8,-6.8,1.55),(3.8,-7.8,1.55));c.data.type='PANO';c.data.panorama_type='EQUIRECTANGULAR'
    render('A0302-living-360',4096,2048,128)
