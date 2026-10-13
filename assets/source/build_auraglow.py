"""
Anchorium Store — AuraGlow Blender bootstrap.

Regenerates an editable .blend from the same millimetre parameters used by
src/lib/lamp-geometry.ts, so a Blender pass starts from geometry that already matches
the supplier listing (70 x 70 x 145 mm) instead of a blank scene.

Usage:
    blender --background --python assets/source/build_auraglow.py -- save
    blender --background --python assets/source/build_auraglow.py -- export /tmp/auraglow.blend

Reference image: public/product/source-01.jpg (authentic supplier photograph).
"""

import sys

import bpy
import math
from mathutils import Vector

MM = 0.001  # metres per millimetre (Blender unit scale for a 145 mm object)

DIMS = dict(
    base_w=70.0, base_d=70.0, base_h=48.0, base_corner=15.0, base_bevel=3.0,
    cover_bottom_y=47.0, cover_top_y=145.0, cover_r_bottom=31.5, cover_r_top=33.0,
    cover_wall=2.0, cover_floor_y=50.0, button_y=26.0, button_r=9.0,
    indicator_y=16.5, indicator_r=1.6, port_y=13.0, port_w=9.6, port_h=3.4,
    anchor_y=138.5, bead_y=60.0,
)


def clear():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)


def link(obj):
    bpy.context.collection.objects.link(obj)
    return obj


def rounded_base():
    """Rounded-square ABS base with a soft bevel."""
    d = DIMS
    mesh = bpy.data.meshes.new("base")
    obj = bpy.data.objects.new("base", mesh)
    link(obj)

    bpy.context.view_layer.objects.active = obj
    obj.location = (0, 0, (d["base_h"] * 0.5) * MM)
    bpy.ops.mesh.primitive_cube_add(size=1, location=obj.location)
    cube = bpy.context.active_object
    cube.name = "base"
    cube.scale = (d["base_w"] * 0.5 * MM, d["base_d"] * 0.5 * MM, d["base_h"] * 0.5 * MM)
    bpy.ops.object.transform_apply(scale=True)
    bev = cube.modifiers.new("soft", "BEVEL")
    bev.width = d["base_bevel"] * MM
    bev.segments = 6
    bev.limit_method = "ANGLE"
    bpy.ops.object.modifier_apply(modifier="soft")

    # corner rounding via a second bevel on the vertical edges
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="DESELECT")
    bpy.ops.object.mode_set(mode="OBJECT")
    return cube


def cover():
    """Lathed transparent PC shell: inner wall, rolled rim, outer wall, closed floor."""
    d = DIMS
    r_in_top = d["cover_r_top"] - d["cover_wall"]
    r_in_bot = d["cover_r_bottom"] - d["cover_wall"]
    rim_y = d["cover_top_y"] - 2.6

    pts = [
        Vector((0.001, 0, d["cover_floor_y"])),
        Vector((r_in_bot - 1.5, 0, d["cover_floor_y"])),
        Vector((r_in_bot, 0, d["cover_floor_y"] + 3)),
        Vector((r_in_top - 0.8, 0, rim_y - 8)),
        Vector((r_in_top, 0, rim_y)),
    ]
    rim_mid = (r_in_top + d["cover_r_top"]) / 2
    rim_r = (d["cover_r_top"] - r_in_top) / 2
    for i in range(13):
        a = math.pi - (math.pi * i) / 12
        pts.append(Vector((rim_mid + rim_r * math.cos(a), 0, rim_y + rim_r * math.sin(a))))
    pts += [
        Vector((d["cover_r_top"] - 0.4, 0, rim_y - 4)),
        Vector((d["cover_r_bottom"] + 0.5, 0, d["cover_bottom_y"] + 12)),
        Vector((d["cover_r_bottom"], 0, d["cover_bottom_y"])),
        Vector((d["cover_r_bottom"] - 1.6, 0, d["cover_bottom_y"] - 3)),
        Vector((0.001, 0, d["cover_bottom_y"] - 3)),
    ]
    pts = [Vector((p.x * MM, p.y * MM, p.z * MM)) for p in pts]

    mesh = bpy.data.meshes.new("cover")
    obj = bpy.data.objects.new("cover", mesh)
    link(obj)
    for i, p in enumerate(pts):
        mesh.vertices.add(1)
        mesh.vertices[i].co = p
    mesh.edges.add(len(pts) - 1)
    for i in range(len(pts) - 1):
        mesh.edges[i].vertices = (i, i + 1)
    mesh.validate()

    screw = obj.modifiers.new("lathe", "SCREW")
    screw.axis = "Z"
    screw.steps = 48
    screw.render_steps = 64
    screw.use_merge_vertices = True
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier="lathe")
    bpy.ops.object.shade_smooth()
    return obj


def filament(points, radius_mm=0.95):
    d = DIMS
    curve = bpy.data.curves.new("filament_curve", "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius_mm * MM
    curve.bevel_resolution = 4
    spline = curve.splines.new("NURBS")
    pts = [Vector((p[0], p[1], p[2])) for p in points]
    spline.points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        spline.points[i].co = (p.x * MM, p.y * MM, p.z * MM, 1)
    spline.use_cyclic_u = True
    obj = bpy.data.objects.new("filament", curve)
    link(obj)
    return obj


LOOP = [
    (0, 0, DIMS["anchor_y"] - 1.5), (8.5, 2.5, 126), (11.5, -3.5, 100), (4, 5, 74),
    (0, 2.5, DIMS["bead_y"]), (-4, -5, 74), (-11.5, 3.5, 100), (-8.5, -2.5, 126),
]


def details():
    d = DIMS
    bpy.ops.mesh.primitive_torus_add(
        major_radius=d["button_r"] * MM, minor_radius=0.5 * MM,
        location=(0, d["base_d"] * 0.5 * MM, d["button_y"] * MM),
        rotation=(math.radians(90), 0, 0),
    )
    bpy.context.active_object.name = "touch_control_groove"

    bpy.ops.mesh.primitive_cylinder_add(
        radius=3.2 * MM, depth=7.5 * MM, location=(0, 0, (d["anchor_y"] + 2.4) * MM)
    )
    bpy.context.active_object.name = "filament_anchor"

    bpy.ops.mesh.primitive_uv_sphere_add(radius=2.9 * MM, location=(0, 0, (d["bead_y"] - 1.6) * MM))
    bpy.context.active_object.name = "filament_bead"

    # USB-C recess on the rear face — position still to be confirmed on the physical unit
    bpy.ops.mesh.primitive_cylinder_add(
        radius=d["port_h"] * 0.5 * MM, depth=2.4 * MM,
        location=(0, -d["base_d"] * 0.5 * MM, d["port_y"] * MM),
        rotation=(math.radians(90), 0, 0), vertices=24,
    )
    port = bpy.context.active_object
    port.name = "usbc_inlet"
    port.scale = (d["port_w"] / d["port_h"], 1, 1)


def materials():
    d = DIMS
    cover_mat = bpy.data.materials.new("PC_cover_transparent")
    cover_mat.use_nodes = True
    bsdf = cover_mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (1, 1, 1, 1)
    bsdf.inputs["Roughness"].default_value = 0.06
    bsdf.inputs["Transmission Weight"].default_value = 1.0
    bsdf.inputs["IOR"].default_value = 1.52

    abs_mat = bpy.data.materials.new("ABS_base_matte")
    abs_mat.use_nodes = True
    b = abs_mat.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.90, 0.87, 0.80, 1)
    b.inputs["Roughness"].default_value = 0.58

    fila = bpy.data.materials.new("LED_filament")
    fila.use_nodes = True
    f = fila.node_tree.nodes["Principled BSDF"]
    f.inputs["Emission Color"].default_value = (1.0, 0.66, 0.30, 1)
    f.inputs["Emission Strength"].default_value = 3.4

    brass = bpy.data.materials.new("brass_contacts")
    brass.use_nodes = True
    br = brass.node_tree.nodes["Principled BSDF"]
    br.inputs["Base Color"].default_value = (0.78, 0.60, 0.32, 1)
    br.inputs["Metallic"].default_value = 1.0
    br.inputs["Roughness"].default_value = 0.26

    by_name = {
        "cover": cover_mat, "base": abs_mat, "touch_control_groove": abs_mat,
        "filament": fila, "filament_anchor": brass, "filament_bead": brass,
        "usbc_inlet": None,
    }
    for name, mat in by_name.items():
        obj = bpy.data.objects.get(name)
        if obj and mat:
            obj.data.materials.clear()
            obj.data.materials.append(mat)


def build():
    clear()
    bpy.context.scene.unit_settings.system = "METRIC"
    rounded_base()
    cover()
    filament(LOOP)
    details()
    materials()
    print(f"built AuraGlow from mm params — total height {DIMS['cover_top_y']} mm")


if __name__ == "__main__":
    build()
    if len(sys.argv) > 3 and sys.argv[3] == "export":
        bpy.ops.wm.save_as_mainfile(filepath=sys.argv[4])
    else:
        bpy.ops.wm.save_as_mainfile(filepath="/tmp/auraglow.blend")
