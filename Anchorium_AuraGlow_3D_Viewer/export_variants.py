from pathlib import Path
import trimesh
from trimesh.visual.material import PBRMaterial
OUT_DIR = Path(__file__).parent / 'public' / 'models' / 'variants'
OUT_DIR.mkdir(parents=True, exist_ok=True)
SOURCE = Path(__file__).parent / 'public' / 'models' / 'auraglow.glb'
variants = {
  'deep-space-grey': ((52,54,56,255),(41,42,44,255)),
  'elegant-white': ((238,234,224,255),(212,208,199,255)),
  'yellow': ((210,165,45,255),(169,126,25,255)),
}
def make_mat(name, color, metallic=.05, roughness=.38):
    return PBRMaterial(name=name, baseColorFactor=list(color), metallicFactor=metallic, roughnessFactor=roughness, doubleSided=True)
for slug,(body,top) in variants.items():
    scene=trimesh.load(SOURCE, force='scene')
    for geom_name, color in [('BASE_BODY',body),('BASE_TOP_PLATE',top)]:
        geom=scene.geometry.get(geom_name)
        if geom is not None:
            geom.visual=trimesh.visual.TextureVisuals(material=make_mat(f'{geom_name}_{slug}', color, .05, .38 if geom_name=='BASE_BODY' else .43))
    dest=OUT_DIR/f'auraglow-{slug}.glb'
    scene.export(dest, file_type='glb')
    print(dest, dest.stat().st_size)
