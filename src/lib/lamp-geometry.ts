import * as THREE from "three";

/**
 * AuraGlow — parametric reconstruction of the supplier lamp.
 *
 * Framework-free module (three only) so the SAME geometry powers:
 *   1. the interactive viewer (src/components/viewer),
 *   2. the exported GLB in public/models/auraglow.glb (scripts/build-model.mjs).
 *
 * Units are millimetres, Y-up, origin at the bottom centre of the base, so the
 * published 70 × 70 × 145 mm envelope is exact rather than eyeballed.
 *
 * Reference: authentic supplier photograph (public/product/source-01.jpg) —
 *   · clear straight-sided PC tumbler with an open rounded rim
 *   · ivory matte ABS rounded-square base with ONE circular touch control
 *   · a tiny indicator pinhole below the control on the same face
 *   · a flexible LED filament suspended inside, anchored at top centre,
 *     ending in a small brass bead just above the base
 *   · USB-C charge inlet on the opposite (rear) face of the base
 */

export const MM = 0.01; // mm -> viewer world units (1 unit ≈ 1 cm)

export const DIM = {
  baseW: 70,
  baseD: 70,
  baseH: 48,
  baseCorner: 15,
  baseBevel: 3,
  coverBottomY: 47,
  coverTopY: 145,
  coverRBottom: 31.5,
  coverRTop: 33,
  coverWall: 2,
  coverFloorY: 50,
  buttonY: 26,
  buttonR: 9,
  indicatorY: 16.5,
  indicatorR: 1.6,
  portY: 13,
  portW: 9.6,
  portH: 3.4,
  anchorY: 138.5,
  beadY: 60,
} as const;

export type FilamentConfigId = "loop" | "sculpt";

export const FILAMENT_CONFIGS: {
  id: FilamentConfigId;
  label: string;
  note: string;
  points: [number, number, number][];
  closed: boolean;
}[] = [
  {
    id: "loop",
    label: "Single suspended loop",
    note: "The relaxed hang shown in most supplier imagery: one open teardrop.",
    points: [
      [0, DIM.anchorY - 1.5, 0],
      [8.5, 126, 2.5],
      [11.5, 100, -3.5],
      [4, 74, 5],
      [0, DIM.beadY, 2.5],
      [-4, 74, -5],
      [-11.5, 100, 3.5],
      [-8.5, 126, -2.5],
    ],
    closed: true,
  },
  {
    id: "sculpt",
    label: "Styled double bend",
    note: "The listing states the filament is flexible and can be bent — this is the same wire shaped differently.",
    points: [
      [0, DIM.anchorY - 1.5, 0],
      [10, 128, 5],
      [4, 106, 12],
      [12, 86, 0],
      [2, 68, -8],
      [-12, 88, -4],
      [-5, 112, 6],
      [-9, 128, -4],
    ],
    closed: true,
  },
];

export const BASE_FINISHES = {
  "ivory-white": { color: "#EEEAE0", top: "#D4D0C7", roughness: 0.46 },
  "dark-grey": { color: "#343638", top: "#292A2C", roughness: 0.37 },
  yellow: { color: "#D2A52D", top: "#A97E19", roughness: 0.38 },
  green: { color: "#1D5236", top: "#133E23", roughness: 0.38 },
} as const;

export type BuildOptions = {
  variantId?: keyof typeof BASE_FINISHES;
  filament?: FilamentConfigId;
  /** 0 = off, 1 = the listed maximum output (60 lm) */
  glow?: number;
  /** include the emissive light rig (viewer only — not exported to GLB) */
  withLights?: boolean;
};

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* ------------------------------------------------------------------ cover */

export function coverGeometry(): THREE.LatheGeometry {
  const {
    coverBottomY,
    coverTopY,
    coverRBottom,
    coverRTop,
    coverWall,
    coverFloorY,
  } = DIM;

  const rInTop = coverRTop - coverWall;
  const rInBot = coverRBottom - coverWall;
  const rimY = coverTopY - 2.6;
  const rimMid = (rInTop + coverRTop) / 2;
  const rimR = (coverRTop - rInTop) / 2;

  const pts: THREE.Vector2[] = [];
  // interior: floor centre → floor edge → up the inner wall
  pts.push(new THREE.Vector2(0.001, coverFloorY));
  pts.push(new THREE.Vector2(rInBot - 1.5, coverFloorY));
  pts.push(new THREE.Vector2(rInBot, coverFloorY + 3));
  pts.push(new THREE.Vector2(rInTop - 0.8, rimY - 8));
  pts.push(new THREE.Vector2(rInTop, rimY));
  // rolled rim (half circle over the top)
  for (let i = 0; i <= 12; i += 1) {
    const a = Math.PI - (Math.PI * i) / 12;
    pts.push(new THREE.Vector2(rimMid + rimR * Math.cos(a), rimY + rimR * Math.sin(a)));
  }
  // exterior wall down to the foot that disappears into the base
  pts.push(new THREE.Vector2(coverRTop - 0.4, rimY - 4));
  pts.push(new THREE.Vector2(coverRBottom + 0.5, coverBottomY + 12));
  pts.push(new THREE.Vector2(coverRBottom, coverBottomY));
  pts.push(new THREE.Vector2(coverRBottom - 1.6, coverBottomY - 3));
  pts.push(new THREE.Vector2(0.001, coverBottomY - 3));

  const geo = new THREE.LatheGeometry(pts, 72);
  geo.computeVertexNormals();
  return geo;
}

export function coverMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#ffffff"),
    metalness: 0,
    roughness: 0.06,
    transmission: 1,
    thickness: 2.4,
    ior: 1.52,
    attenuationColor: new THREE.Color("#f6ecd8"),
    attenuationDistance: 90,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
    envMapIntensity: 1.15,
    name: "PC_cover_transparent",
  });
}

/* ------------------------------------------------------------------- base */

export function baseGeometry() {
  const shape = roundedRectShape(DIM.baseW, DIM.baseD, DIM.baseCorner);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: DIM.baseH - DIM.baseBevel * 2,
    bevelEnabled: true,
    bevelThickness: DIM.baseBevel,
    bevelSize: DIM.baseBevel,
    bevelSegments: 4,
    curveSegments: 10,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, DIM.baseBevel, 0);
  geo.computeVertexNormals();
  return geo;
}

export function baseMaterial(variantId: keyof typeof BASE_FINISHES) {
  const finish = BASE_FINISHES[variantId] ?? BASE_FINISHES.yellow;
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(finish.color),
    roughness: finish.roughness,
    metalness: 0.02,
    name: "ABS_base_matte",
  });
}

/* ------------------------------------------------------- filament + brass */

export function filamentGeometry(configId: FilamentConfigId) {
  const cfg = FILAMENT_CONFIGS.find((c) => c.id === configId) ?? FILAMENT_CONFIGS[0];
  const curve = new THREE.CatmullRomCurve3(
    cfg.points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    cfg.closed,
    "catmullrom",
    0.5,
  );
  return new THREE.TubeGeometry(curve, 150, 0.95, 8, cfg.closed);
}

export function filamentMaterial(glow = 1) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color("#3a2a16"),
    emissive: new THREE.Color("#ffb257"),
    emissiveIntensity: 0.35 + glow * 3.1,
    roughness: 0.42,
    metalness: 0,
    name: "LED_filament",
  });
}

export function brassMaterial() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color("#c9a05a"),
    metalness: 0.92,
    roughness: 0.26,
    name: "brass_contacts",
  });
}

export function darkInsetMaterial() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color("#241f18"),
    roughness: 0.68,
    metalness: 0.05,
    name: "recessed_details",
  });
}

/* -------------------------------------------------------------- assembly */

/** Builds the complete lamp as a THREE.Group (mm, Y-up). */
export function buildLamp({
  variantId = "yellow",
  filament = "loop",
  glow = 1,
  withLights = false,
}: BuildOptions = {}) {
  const group = new THREE.Group();
  group.name = "AuraGlow_lamp";
  group.scale.setScalar(MM);

  const brass = brassMaterial();
  const inset = darkInsetMaterial();

  /* transparent cover */
  const cover = new THREE.Mesh(coverGeometry(), coverMaterial());
  cover.name = "cover";
  cover.castShadow = false;
  cover.receiveShadow = false;
  cover.renderOrder = 2;
  group.add(cover);

  /* base */
  const base = new THREE.Mesh(baseGeometry(), baseMaterial(variantId));
  base.name = "base";
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  /* underside lip (visible in the supplier photograph) */
  const foot = new THREE.Mesh(
    new THREE.CylinderGeometry(24, 23, 1.6, 48),
    new THREE.MeshStandardMaterial({ color: new THREE.Color("#2a2621"), roughness: 0.85 }),
  );
  foot.position.set(0, 0.8, 0);
  foot.name = "underside_pad";
  group.add(foot);

  /* front touch control: engraved ring + slightly recessed disc */
  const ring = new THREE.Mesh(new THREE.TorusGeometry(DIM.buttonR, 0.5, 10, 64), inset);
  ring.position.set(0, DIM.buttonY, DIM.baseD / 2 - DIM.baseBevel * 0.15);
  ring.name = "touch_control_groove";
  group.add(ring);

  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(DIM.buttonR - 0.6, DIM.buttonR - 0.6, 0.7, 48),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(BASE_FINISHES[variantId]?.color ?? "#EFE8D9"),
      roughness: 0.44,
      metalness: 0.03,
      name: "ABS_base_face",
    }),
  );
  disc.rotation.x = Math.PI / 2;
  disc.position.set(0, DIM.buttonY, DIM.baseD / 2 - 0.75);
  disc.name = "touch_control_face";
  group.add(disc);

  /* indicator pinhole below the control */
  const indicator = new THREE.Mesh(new THREE.CircleGeometry(DIM.indicatorR, 24), inset);
  indicator.position.set(0, DIM.indicatorY, DIM.baseD / 2 + 0.06);
  indicator.name = "indicator_pinhole";
  group.add(indicator);

  /* USB-C inlet on the rear face — rounded-rect recess */
  const portShape = roundedRectShape(DIM.portW, DIM.portH, 1.6);
  const portGeo = new THREE.ExtrudeGeometry(portShape, {
    depth: 2.4,
    bevelEnabled: true,
    bevelThickness: 0.35,
    bevelSize: 0.35,
    bevelSegments: 2,
    curveSegments: 10,
  });
  const port = new THREE.Mesh(portGeo, inset);
  port.rotation.y = Math.PI;
  port.position.set(0, DIM.portY, -DIM.baseD / 2 + 0.4);
  port.name = "usbc_inlet";
  group.add(port);

  /* top anchor clip + filament bead */
  const anchor = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.6, 7.5, 28), brass);
  anchor.position.set(0, DIM.anchorY + 2.4, 0);
  anchor.name = "filament_anchor";
  group.add(anchor);

  const anchorSeat = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 6.4, 1.8, 32), brass);
  anchorSeat.position.set(0, DIM.coverFloorY + 1.1, 0);
  anchorSeat.name = "filament_seat";
  group.add(anchorSeat);

  const bead = new THREE.Mesh(new THREE.SphereGeometry(2.9, 26, 20), brass);
  const cfg = FILAMENT_CONFIGS.find((c) => c.id === filament) ?? FILAMENT_CONFIGS[0];
  const lowest = cfg.points.reduce((a, b) => (b[1] < a[1] ? b : a), cfg.points[0]);
  bead.position.set(lowest[0] * 0.4, lowest[1] - 1.6, lowest[2] * 0.4);
  bead.name = "filament_bead";
  group.add(bead);

  /* the filament itself */
  const filamentMesh = new THREE.Mesh(filamentGeometry(filament), filamentMaterial(glow));
  filamentMesh.name = "filament";
  group.add(filamentMesh);

  if (withLights) {
    const warm = new THREE.PointLight(0xffb066, 0.9 + glow * 2.4, 420, 1.6);
    warm.position.set(0, 96, 0);
    warm.name = "filament_light";
    group.add(warm);

    const spill = new THREE.PointLight(0xffd9a0, 0.28 + glow * 0.7, 620, 1.9);
    spill.position.set(0, 132, 30);
    spill.name = "rim_spill";
    group.add(spill);
  }

  return group;
}

/** Bounding info used for camera framing + the dimensions diagram. */
export function lampBounds() {
  return {
    width: DIM.baseW,
    depth: DIM.baseD,
    height: DIM.coverTopY,
    baseHeight: DIM.baseH,
    coverDiameter: DIM.coverRTop * 2,
    coverHeight: DIM.coverTopY - DIM.coverBottomY,
  };
}
