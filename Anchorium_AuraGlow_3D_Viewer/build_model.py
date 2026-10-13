from pathlib import Path
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

OUT = Path(__file__).parent / 'public' / 'models' / 'auraglow.glb'
N = 96

def mat(name, color, metallic=0.0, roughness=0.5, alpha=255, emissive=None, alpha_mode=None):
    return PBRMaterial(
        name=name,
        baseColorFactor=[int(color[0]), int(color[1]), int(color[2]), int(alpha)],
        metallicFactor=float(metallic),
        roughnessFactor=float(roughness),
        emissiveFactor=emissive or [0,0,0],
        doubleSided=True,
        alphaMode=alpha_mode or ('BLEND' if alpha < 255 else 'OPAQUE'),
    )

def lathe(profile, name, material, n=N):
    # Profile entries are (radius, y) and describe a closed cross section.
    verts=[]; faces=[]
    for r,y in profile:
        for i in range(n):
            a=2*np.pi*i/n
            verts.append([r*np.cos(a), y, r*np.sin(a)])
    rows=len(profile)
    for j in range(rows-1):
        for i in range(n):
            a=j*n+i; b=j*n+(i+1)%n
            c=(j+1)*n+(i+1)%n; d=(j+1)*n+i
            faces.append([a,b,d]); faces.append([b,c,d])
    mesh=trimesh.Trimesh(vertices=np.asarray(verts), faces=np.asarray(faces), process=False)
    mesh.fix_normals()
    mesh.visual = trimesh.visual.TextureVisuals(material=material)
    mesh.metadata['name']=name
    return mesh

def sphere(name, center, radius, material, subdivisions=2):
    m=trimesh.creation.icosphere(subdivisions=subdivisions, radius=radius)
    m.apply_translation(center)
    m.visual = trimesh.visual.TextureVisuals(material=material)
    m.metadata['name']=name
    return m

def cyl_z(name, center, radius, height, material, sections=48):
    m=trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    # cylinder defaults along Z. center already specifies position.
    m.apply_translation(center)
    m.visual = trimesh.visual.TextureVisuals(material=material)
    m.metadata['name']=name
    return m

def box(name, center, extents, material):
    m=trimesh.creation.box(extents=extents)
    m.apply_translation(center)
    m.visual = trimesh.visual.TextureVisuals(material=material)
    m.metadata['name']=name
    return m

# Materials are set to an actual plausible default variant; the interactive viewer
# will switch the base material among supplier-listed finish previews.
base_mat = mat('Base_ABS_DarkGrey', (49,50,52), metallic=0.06, roughness=0.36)
base_top_mat = mat('Base_Top_DarkGrey', (39,40,42), metallic=0.04, roughness=0.44)
shell_mat = mat('Transparent_PC_Shell', (224,236,241), metallic=0.0, roughness=0.10, alpha=48, alpha_mode='BLEND')
filament_mat = mat('Warm_LED_Filament_2700K', (255,181,66), metallic=0.0, roughness=0.24, emissive=[1.0,0.36,0.06])
metal_mat = mat('Filament_Anchor_Brass', (198,151,66), metallic=0.55, roughness=0.24, emissive=[0.15,0.055,0.004])
button_ring_mat = mat('Touch_Button_Ring', (24,25,27), metallic=0.08, roughness=0.4)
button_face_mat = mat('Touch_Button_Face', (63,64,65), metallic=0.02, roughness=0.45)
port_mat = mat('USB_C_Port', (11,12,13), metallic=0.05, roughness=0.4)

scene = trimesh.Scene(base_frame='Anchorium_AuraGlow')
def add(mesh, name):
    scene.add_geometry(mesh, geom_name=name, node_name=name)

# Rounded ABS base: full rotational cross section, 26.5 mm high.
base_profile = [
    (0.0, 0.6),(25.0,0.6),(30.4,0.8),(33.2,1.8),(34.5,3.8),
    (35.0,6.2),(35.0,20.8),(34.6,23.2),(33.3,25.4),(30.8,26.5),(0.0,26.5)
]
add(lathe(base_profile,'BASE_BODY',base_mat),'BASE_BODY')

# Top platform is dark and nearly flush with the cover, as shown in the listing.
top_profile=[(0,25.8),(25.0,25.8),(28.4,26.0),(29.0,26.4),(28.5,27.0),(0,27.0)]
add(lathe(top_profile,'BASE_TOP_PLATE',base_top_mat),'BASE_TOP_PLATE')

# Clear polycarbonate cylinder with rounded shoulder and a closed transparent top.
shell_profile=[
    (28.5,27.0),(29.3,28.0),(30.0,30.0),(30.0,137.0),
    (29.7,140.0),(28.9,142.5),(27.2,144.2),(24.0,145.1),(0.0,145.1),
    (0.0,143.1),(23.7,143.1),(26.8,142.2),(28.0,139.8),(28.2,137.0),
    (28.2,30.0),(27.8,28.0),(28.5,27.0)
]
add(lathe(shell_profile,'SHELL_TRANSPARENT',shell_mat),'SHELL_TRANSPARENT')

# Long, thin, warm filament. It is a true 3D cylinder with spherical end fittings.
# Align the default cylinder (Z axis) with Y axis.
rod = trimesh.creation.cylinder(radius=0.62, height=107.8, sections=24)
rot = trimesh.transformations.rotation_matrix(np.pi/2, [1,0,0])
rod.apply_transform(rot)
rod.apply_translation([0, 80.0, 0]) # 29.5 .. 130.5
rod.visual = trimesh.visual.TextureVisuals(material=filament_mat)
rod.metadata['name']='FILAMENT_STRAIGHT'
add(rod,'FILAMENT_STRAIGHT')
add(sphere('FILAMENT_TOP_BEAD',(0,137.8,0),1.25,metal_mat,2),'FILAMENT_TOP_BEAD')
add(sphere('FILAMENT_BOTTOM_BEAD',(0,28.3,0),1.65,metal_mat,2),'FILAMENT_BOTTOM_BEAD')

# Front touch control: mounted on positive Z side; small ring and inset face.
add(cyl_z('FRONT_BUTTON_RING',(0,10.0,35.1),4.55,1.25,button_ring_mat),'FRONT_BUTTON_RING')
add(cyl_z('FRONT_BUTTON_FACE',(0,10.0,35.82),3.25,0.42,button_face_mat),'FRONT_BUTTON_FACE')

# USB-C port on the back of the base (negative Z). It is a recessed dark rounded-ish slot.
add(box('USB_C_PORT',(0,8.0,-34.85),(7.8,2.6,0.8),port_mat),'USB_C_PORT')
# Inner port glint, subtle and shallow.
add(box('USB_C_PORT_INNER',(0,8.0,-35.28),(4.7,0.7,0.18),base_top_mat),'USB_C_PORT_INNER')

OUT.parent.mkdir(parents=True, exist_ok=True)
scene.export(OUT, file_type='glb')
print(f'Wrote {OUT} ({OUT.stat().st_size:,} bytes)')
print('Geometry nodes:')
for node in scene.graph.nodes_geometry:
    print(' -', node)
