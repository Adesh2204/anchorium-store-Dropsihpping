# AuraGlow — 3D source & reconstruction notes

**No .blend is shipped in this repository snapshot.** Blender is not available in this build
environment, so the model was produced parametrically instead — from the same numbers a
modeller would type into Blender. This folder documents the workflow and keeps it reproducible.

## What exists today

| Artefact | Path | Notes |
| --- | --- | --- |
| Parametric source of truth | `src/lib/lamp-geometry.ts` | Millimetre-accurate, three.js, no scene code. Defines every dimension, profile point, material and the two filament curves. |
| Exporter | `scripts/build-model.mts` | `npx tsx scripts/build-model.mts` → writes the GLBs + manifest using `GLTFExporter`. |
| Exported models | `public/models/auraglow.glb`, `public/models/auraglow-sculpt.glb` | Real indexed meshes with `KHR_materials_transmission`, `_volume`, `_ior`, `_clearcoat`, `_emissive_strength`. |
| Manifest | `public/models/auraglow.manifest.json` | Provenance, dimensions, part list. |
| Fidelity reference | `public/product/source-01.jpg` | The authentic supplier photograph every asset is checked against. |
| Blender bootstrap | `assets/source/build_auraglow.py` | Run inside Blender to regenerate an editable `.blend` from the identical parameters. |

## Reconstruction procedure (what the script does)

1. Read the listed envelope: **70 × 70 × 145 mm**. Everything is authored in millimetres with
   the origin at the bottom centre of the base, so the bounding box is exact rather than eyeballed.
2. **Base** — rounded-square profile (corner radius 15 mm) extruded to 48 mm with a 3 mm soft
   bevel: this is the matte ABS block from the photograph, including its pillow-like edges.
3. **Cover** — a lathed shell. The profile traces the *inside* wall, over a rolled rim, back down
   the *outside* and closes under the base top, so the cover has real 2 mm wall thickness and a
   visible rim lip instead of a fake single-sided cylinder.
4. **Details** — an engraved touch ring plus recessed disc on the front face (`z+`), the indicator
   pinhole directly below it, and a rounded-rect USB-C recess on the rear face. The inlet *position*
   is the one unverified detail: the listing confirms the Type-C interface, not where the cut-out sits.
   It is labelled as unconfirmed in the UI and in `PortDiagram`.
5. **Filament** — a `CatmullRomCurve3` swept as a tube (Ø1.9 mm) with brass anchor, seat and bead,
   in two configurations because the listing states the filament is flexible and can be bent.
6. **Materials** — `MeshPhysicalMaterial` for the PC cover (transmission 1, IOR 1.52, thickness,
   clearcoat) and matte `MeshStandardMaterial` for ABS; emissive warm filament, no bloom.

## Blender handoff

```bash
blender --background --python assets/source/build_auraglow.py -- save
# then, inside Blender, inspect, join, apply bevels, and export:
#   File → Export → glTF 2.0 (.glb), format glTF Binary, +Y up
```
After a manual pass, replace the generated GLBs and keep this document updated.

## Fidelity checklist used for every render

- [ ] Cover is a straight, open, clear cylinder with a rolled rim — not a jar, not a cone, not a cage.
- [ ] Base is a rounded *square* block, ivory (or the selected finish), matte.
- [ ] Exactly one circular touch control on the front face + one indicator pinhole below it.
- [ ] One suspended filament with a brass bead; nothing glowing inside the base itself.
- [ ] No display, no dial, no handle, no rope, no bulb, no RGB, no screws.
- [ ] Silhouette ratio ≈ 145 : 70 (height : width), cover ≈ 2/3 of total height.

Anything that fails this list is rejected, regardless of how good it looks.
