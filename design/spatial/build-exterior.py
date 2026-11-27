"""Stillwater production scene: 2 towers, 6 floors, 48 existing IDs."""
import sys,pathlib,math,random
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
from production import *
reset();random.seed(4869)
stone=pbr('marble_01');oak=pbr('oak_veneer_01');grass=pbr('grass_ground')
plaster=material('Warm architectural plaster',(.69,.67,.61),.82)
aluminium=material('Bronze aluminium',(.12,.085,.045),.26,.9)
glass=material('Architectural glazing',(.94,.98,1),.045,0,1,1.52)
fabric=material('Outdoor woven cushions',(.63,.6,.52),.87)
dark=material('Entrance shadow gap',(.018,.025,.022),.75)
pooltile=material('Deep teal pool ceramic',(.035,.13,.14),.26)
water=material('Water / IOR 1.333',(.9,.97,1),.045,0,1,1.333)
glow=material('2700K architectural diffuser',(1,.73,.42),.4)
g=glow.node_tree.nodes.get('Principled BSDF');g.inputs['Emission Color'].default_value=(1,.62,.28,1);g.inputs['Emission Strength'].default_value=.15
# The pool is a real void in the podium, not a water plane over a solid slab.
box('Site north plinth',(0,6.3,-.65),(75,48.4,1.1),stone,.12)
box('Site south plinth',(0,-28.1,-.65),(75,4.8,1.1),stone,.12)
for x in [-34.5,34.5]:box('Site pool end plinth',(x,-21.8,-.65),(6,7.8,1.1),stone,.06)
box('Surrounding ground',(0,0,-1.27),(350,350,.15),grass,.01)
# Paving has recessed joints; broad material variation is carried by the UV maps.
for ix in range(-18,19):
    for iy in range(-14,15):
        x=ix*2;y=iy*2
        if abs(x)<32 and -26<y<-17:continue
        box('Limestone paving',(x,y,-.075),(1.985,1.985,.08),stone,.009)
box('Pool basin floor',(0,-21.8,-1.03),(63,7.8,.12),pooltile,.03)
for y in [-25.65,-17.95]:box('Pool basin wall',(0,y,-.56),(63,.12,.9),pooltile,.02)
for x in [-31.45,31.45]:box('Pool basin wall',(x,-21.8,-.56),(.12,7.8,.9),pooltile,.02)
for y in [-25.8,-17.8]:box('Pool coping',(0,y,-.025),(64,.38,.18),stone,.03)
for x in [-32,32]:box('Pool coping',(x,-21.8,-.025),(.38,8.4,.18),stone,.03)
vertices=[];faces=[];nx=128;ny=24
for j in range(ny+1):
    for i in range(nx+1):
        x=(i/nx-.5)*63;y=-21.8+(j/ny-.5)*7.5
        vertices.append((x,y,-.08+.011*math.sin(x*2.8+y*3.1)+.006*math.sin(x*7.4-y*5)))
for j in range(ny):
    for i in range(nx):a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
mesh=bpy.data.meshes.new('Rippled water surface');mesh.from_pydata(vertices,[],faces);mesh.update();o=bpy.data.objects.new('Reflecting pool water',mesh);scene.collection.objects.link(o);o.data.materials.append(water)
for f in mesh.polygons:f.use_smooth=True
metric_uv(o)
# Boardwalk terrace and a shared courtyard remain amenities, never inventory.
for i in range(95):box('Oak pool deck',(0,-17.25+i*.085,-.02),(61,.078,.06),oak,.003)
for x in [-29,29]:
    for y in [-12,-4,4,12,22]:
        box('Planting bed',(x,y,.12),(4.3,5.8,.35),stone,.05)
        box('Planting soil',(x,y,.3),(4,5.5,.08),grass,.015)
        asset('jacaranda_tree',(x,y,.28),random.uniform(0,math.tau),.31+random.random()*.045)
for x in [-17,0,17]:asset('jacaranda_tree',(x,25,.1),random.uniform(0,math.tau),.37)
for x in [-18,-9,0,9,18]:
    for y in [-14,-11]:
        box('Sun lounger frame',(x,y,.28),(1.9,.75,.16),oak,.05)
        box('Sun lounger cushion',(x,y,.4),(1.83,.69,.14),fabric,.06)
    cylinder('Pool side table',(x+1.5,-12.5,.4),.33,.07,stone)
    cylinder('Pool table pedestal',(x+1.5,-12.5,.2),.06,.4,aluminium)
for x in [-5,5]:
    for y in [15,22]:box('Pergola column',(x,y,1.6),(.12,.12,3.2),aluminium)
for x in [i*.48-5.5 for i in range(24)]:box('Pergola oak blade',(x,18.5,3.25),(.085,8,.22),oak)
for x in [-4,0,4]:box('Courtyard bench',(x,19,.4),(2.8,.8,.55),stone,.1)

units=CONTRACT['units'];unit_positions=[]
for ti,tower in enumerate(['A','B']):
    tx=(ti-.5)*33;ty=ti*1.5
    box('Tower '+tower+' podium',(tx,ty,.05),(26,24,.35),stone,.12)
    for step in range(3):box('Entrance step',(tx,ty-12.6-step*.35,-.08+step*.09),(4.4,.7,.1),stone,.02)
    # A central service core and side returns provide enclosed depth behind glazing.
    box('Tower '+tower+' core',(tx,ty,9.8),(3.1,21,19.2),plaster,.035)
    for floor in range(1,7):
        z=.35+(floor-1)*3.2
        slab=box(f'{tower} floor {floor} slab',(tx,ty,z),(25.8,23.3,.27),stone,.045)
        slab['tower']=tower;slab['floor']=floor
        box('Recessed soffit',(tx,ty,z+2.96),(25.2,22.6,.14),plaster,.02)
        for side in [-1,1]:
            yy=ty+side*11.35
            box('Glass balcony guard',(tx,yy,z+.78),(25.15,.016,.95),glass,.002)
            box('Continuous handrail',(tx,yy,z+1.27),(25.3,.05,.045),aluminium,.005)
            for k in range(13):box('Balustrade shoe',(tx-12+k*2,yy,z+.3),(.045,.07,.075),aluminium,.004)
        for side in [-1,1]:
            xx=tx+side*12.5
            box('Return guard glass',(xx,ty,z+.78),(.016,22.3,.95),glass,.002)
            box('Return handrail',(xx,ty,z+1.27),(.05,22.4,.045),aluminium,.005)
            for yy in [-9,-4.5,0,4.5,9]:box('Facade pier',(tx+side*11.9,ty+yy,z+1.65),(.36,.25,2.95),stone,.02)
            box('Side glazing',(tx+side*11.7,ty,z+1.58),(.012,19.8,2.65),glass,.002)
            for yy in range(-9,10,2):box('Side mullion',(tx+side*11.72,ty+yy,z+1.6),(.07,.045,2.72),aluminium,.004)
        for number in range(1,5):
            p=next(p for p in units if p['tower']==tower and p['floor']==floor and p['number']==number)
            side=-1 if number<=2 else 1
            ux=tx+(-6.75 if number%2 else 6.75);uy=ty+side*9.8
            box('Apartment timber floor',(ux,ty+side*5.9,z+.19),(10.25,7.8,.055),oak,.004)
            box('Apartment return wall',(ux,ty+side*2,z+1.62),(10.3,.14,2.8),plaster,.015)
            unit=box('UNIT_'+p['id'],(ux,uy,z+1.6),(10.3,.012,2.65),glass,.002)
            unit['unitId']=p['id'];unit['tower']=tower;unit['floor']=floor
            unit_positions.append({'id':p['id'],'tower':tower,'floor':floor,'blender':[ux,uy,z+1.6],'size':[10.3,.012,2.65]})
            for k in range(6):box('Glazing mullion',(ux-5.15+k*2.06,uy+side*.02,z+1.6),(.045,.08,2.72),aluminium,.004)
            for zz in [z+.26,z+2.96]:box('Glazing transom',(ux,uy,zz),(10.4,.09,.045),aluminium,.004)
            for edge in [-1,1]:
                box('Deep stone jamb',(ux+edge*5.3,uy,z+1.6),(.24,1.75,2.9),stone,.02)
                for fin in range(3):box('Oak privacy fin',(ux+edge*(4.5+fin*.23),uy+side*.8,z+1.62),(.07,.42,2.8),oak,.009)
            # Original licensed sofa visible behind each unit's actual glazing.
            asset('GlamVelvetSofa',(ux-2,uy-side*1.7,z+.23),0 if side<0 else math.pi,.9)
            cylinder('Balcony round table',(ux+2.2,uy+side*.8,z+.69),.38,.055,stone)
            cylinder('Balcony table pedestal',(ux+2.2,uy+side*.8,z+.46),.055,.46,aluminium)
            box('Balcony seat',(ux+.8,uy+side*.8,z+.5),(.85,.6,.48),fabric,.1)
            if floor%2==0:asset('potted_plant_02',(ux+4.1,uy+side*.8,z+.25),scale=1.15)
            box('Warm linear light',(ux,uy-side*.3,z+2.91),(3,.06,.025),glow,.003)
            lamp=area('UNIT_LIGHT_'+p['id'],(ux,uy-side*2,z+2.72),(ux,uy,z+.6),9,2,(1,.72,.43))
    roof=19.65
    box('Tower '+tower+' roof cornice',(tx,ty,roof),(26.5,24,.35),stone,.06)
    for side in [-1,1]:
        box('Roof edge',(tx,ty+side*11.65,roof+.28),(26,.2,.4),stone,.025)
        box('Roof edge',(tx+side*12.9,ty,roof+.28),(.2,23,.4),stone,.025)
    box('Roof garden',(tx,ty,roof+.23),(23,20,.12),grass,.02)
    for x in [-5,5]:
        for y in [-4,4]:box('Roof pergola post',(tx+x,ty+y,roof+1.55),(.1,.1,2.6),aluminium)
    for i in range(25):box('Roof timber blade',(tx-5.6+i*.47,ty,roof+2.9),(.075,9.3,.18),oak,.006)
    for side in [-1,1]:
        box('Integrated roof planter',(tx,ty+side*9,roof+.48),(22,1.2,.5),stone,.04)
        box('Roof planter soil',(tx,ty+side*9,roof+.74),(21.7,.95,.05),grass,.02)
        for i in range(12):
            planted=asset('potted_plant_02',(tx-10+i*1.8,ty+side*9,roof+.48),scale=1.4)
            # Pots sit below the parapet of the continuous planter.

# Garden bollards and furniture are explicitly excluded from inventory.
for x in [-34,-23,-8,8,23,34]:
    for y in [-16,14]:
        box('Bronze path light',(x,y,.3),(.09,.09,.65),aluminium,.012)
        box('Path diffuser',(x,y,.59),(.085,.085,.04),glow,.004)
environment('kloofendal_48d_partly_cloudy_puresky',.6,math.radians(95))
bpy.ops.object.light_add(type='SUN',location=(0,0,40));sun=bpy.context.object;sun.name='Architectural sunlight';sun.data.energy=1.35;sun.data.angle=.06;sun.rotation_euler=(math.radians(28),math.radians(-25),math.radians(-30))
camera('Stillwater day',(62,-80,31),(0,0,8),49)
scene['projectId']='stillwater';scene['unitCount']=48;scene['floorCount']=6
(OUTPUT/'stillwater-interaction.json').write_text(json.dumps(unit_positions,indent=2))
save_source('Stillwater')
modes=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else ['day']
if 'day' in modes:render('Stillwater-day',1600,1100)
if 'aerial' in modes:
    camera('Stillwater aerial',(60,-67,76),(0,0,0),50);render('Stillwater-aerial',1600,1100)
if 'golden' in modes:
    environment('belfast_sunset_puresky',.45,math.radians(120));sun.data.energy=1.6;sun.data.color=(1,.69,.38);sun.rotation_euler=(math.radians(77),0,math.radians(-65))
    g.inputs['Emission Strength'].default_value=3
    for light in bpy.data.objects:
        if light.type=='LIGHT' and light.name.startswith('UNIT_LIGHT_'):light.data.energy=65
    camera('Stillwater golden hour',(62,-80,31),(0,0,8),49);render('Stillwater-golden',1600,1100)
