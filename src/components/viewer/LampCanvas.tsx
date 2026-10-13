"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { BASE_FINISHES } from "@/lib/lamp-geometry";

/**
 * AuraGlow studio viewer — real GLB geometry (public/models/auraglow.glb),
 * PBR materials, transmission cover, contact shadows, constrained orbit.
 */

export type ViewName = "three-quarter" | "front" | "side" | "top";
export type ViewCommand = { name: ViewName; token: number };

const MODEL_HEIGHT = 1.45; // 145 mm * 0.01
const TARGET = new THREE.Vector3(0, MODEL_HEIGHT * 0.5, 0);
const MIN_DIST = 1.7;
const MAX_DIST = 4.6;

const cache = new Map<string, Promise<THREE.Group>>();

function loadGlb(url: string) {
  if (!cache.has(url)) {
    cache.set(
      url,
      new Promise<THREE.Group>((resolve, reject) => {
        new GLTFLoader().load(
          url,
          (gltf) => resolve(gltf.scene),
          undefined,
          (err) => reject(err instanceof Error ? err : new Error(String(err))),
        );
      }),
    );
  }
  return cache.get(url)!;
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function createCurvedFilament() {
  const pts = [
    [0, 29, 0], [0, 39, 0], [5, 48, 0], [13, 50, 0], [18, 44, 0], [17, 38, 0], [11, 36, 0],
    [8, 41, 0], [11, 46, 0], [17, 46, 0], [20, 41, 0], [17, 35, 0], [9, 33, 0], [0, 35, 0],
    [-8, 38, 0], [-14, 44, 0], [-12, 50, 0], [-6, 50, 0], [-2, 46, 0], [-4, 40, 0], [0, 29, 0],
  ].map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  const geo = new THREE.TubeGeometry(curve, 240, 0.68, 10, false);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#ffd28a"),
    emissive: new THREE.Color("#ffa32c"),
    emissiveIntensity: 3.5,
    roughness: 0.25,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = "FILAMENT_CURVED_PREVIEW";
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}

/* ------------------------------------------------------------------ model */

function LampModel({
  modelUrl,
  variantId,
  glow,
  filament = "loop",
  onLoaded,
}: {
  modelUrl: string;
  variantId: string;
  glow: number;
  filament?: "loop" | "sculpt";
  onLoaded?: () => void;
}) {
  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let alive = true;
    loadGlb(modelUrl)
      .then((root) => {
        if (!alive) return;
        // Clone per mount so material tweaks never leak between configurations.
        const clone = root.clone(true);

        // Normalize units: if model vertices are in millimeters (height ~145), scale by 0.01 to match 1.45 Three.js meter units
        const bbox = new THREE.Box3().setFromObject(clone);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        if (size.y > 10) {
          clone.scale.setScalar(0.01);
        }

        // Attach curved filament preview if not already present
        if (!clone.getObjectByName("FILAMENT_CURVED_PREVIEW")) {
          const curved = createCurvedFilament();
          clone.add(curved);
        }

        clone.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = mesh.name === "BASE_BODY" || mesh.name === "base";
          mesh.receiveShadow = false;

          // Transparent PC shell
          if (mesh.name === "SHELL_TRANSPARENT" || mesh.name === "cover") {
            mesh.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color("#e5eff5"),
              transparent: true,
              opacity: 0.22,
              roughness: 0.12,
              metalness: 0.015,
              transmission: 0.32,
              thickness: 1.15,
              ior: 1.49,
              clearcoat: 0.52,
              clearcoatRoughness: 0.12,
              side: THREE.DoubleSide,
              depthWrite: false,
            });
            mesh.renderOrder = 3;
          }

          // Touch button details
          if (mesh.name === "FRONT_BUTTON_RING") {
            mesh.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color("#18191b"),
              roughness: 0.4,
              metalness: 0.08,
            });
          }
          if (mesh.name === "FRONT_BUTTON_FACE" || mesh.name === "touch_control_face") {
            mesh.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color("#3f4041"),
              roughness: 0.45,
              metalness: 0.02,
            });
          }

          // Type-C port details
          if (mesh.name === "USB_C_PORT" || mesh.name === "usbc_inlet") {
            mesh.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color("#0b0c0d"),
              roughness: 0.4,
              metalness: 0.05,
            });
          }
          if (mesh.name === "USB_C_PORT_INNER") {
            mesh.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color("#27282a"),
              roughness: 0.44,
              metalness: 0.04,
            });
          }

          // Brass beads / anchors
          if (
            mesh.name === "FILAMENT_TOP_BEAD" ||
            mesh.name === "FILAMENT_BOTTOM_BEAD" ||
            mesh.name === "filament_bead"
          ) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color("#d4a455"),
              emissive: new THREE.Color("#5c2b06"),
              emissiveIntensity: 0.6,
              metalness: 0.38,
              roughness: 0.24,
            });
          }

          // Filament emissive setup
          if (
            mesh.name === "FILAMENT_STRAIGHT" ||
            mesh.name === "filament" ||
            mesh.name === "FILAMENT_CURVED_PREVIEW"
          ) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color("#ffd28a"),
              emissive: new THREE.Color("#ffa32c"),
              emissiveIntensity: 0.3 + glow * 4.2,
              roughness: 0.22,
              metalness: 0,
            });
          }
        });

        onLoaded?.();
        setScene(clone);
      })
      .catch(() => onLoaded?.());
    return () => {
      alive = false;
    };
  }, [modelUrl, onLoaded]);

  // Look development: finish colour, filament glow & mode toggles
  useEffect(() => {
    if (!scene) return;
    const finish = BASE_FINISHES[variantId as keyof typeof BASE_FINISHES] ?? BASE_FINISHES.yellow;
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;

      // Base body
      if (mesh.name === "BASE_BODY" || mesh.name === "base") {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.color = new THREE.Color(finish.color);
          mat.roughness = finish.roughness;
          mat.needsUpdate = true;
        }
      }

      // Base top plate
      if (mesh.name === "BASE_TOP_PLATE") {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.color = new THREE.Color(finish.top);
          mat.roughness = 0.43;
          mat.needsUpdate = true;
        }
      }

      // Filament glow
      if (
        mesh.name === "FILAMENT_STRAIGHT" ||
        mesh.name === "filament" ||
        mesh.name === "FILAMENT_CURVED_PREVIEW"
      ) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.emissive = new THREE.Color("#ffa32c");
          mat.emissiveIntensity = 0.3 + glow * 4.2;
          mat.needsUpdate = true;
        }
      }

      // Filament visibility by mode
      if (mesh.name === "FILAMENT_STRAIGHT") {
        mesh.visible = filament === "sculpt";
      }
      if (mesh.name === "FILAMENT_TOP_BEAD" || mesh.name === "FILAMENT_BOTTOM_BEAD") {
        mesh.visible = filament === "sculpt";
      }
      if (mesh.name === "FILAMENT_CURVED_PREVIEW") {
        mesh.visible = filament === "loop";
      }

      // Pinhole status indicator
      if (mesh.name === "indicator_pinhole") {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.emissive = new THREE.Color(glow > 0.15 ? "#ff8f2e" : "#000000");
          mat.emissiveIntensity = glow > 0.15 ? 0.9 : 0;
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene, variantId, glow, filament]);

  if (!scene) return null;
  return <primitive object={scene} position={[0, 0, 0]} />;
}

/* ------------------------------------------------------------- camera rig */

function CameraRig({ view, distance }: { view: ViewCommand; distance: number }) {
  const { camera } = useThree();
  const anim = useRef({
    active: false,
    t: 0,
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
  });

  useEffect(() => {
    const d = THREE.MathUtils.clamp(distance, MIN_DIST, MAX_DIST);
    const positions: Record<ViewName, [number, number, number]> = {
      "three-quarter": [d * 0.66, MODEL_HEIGHT * 0.62, d * 0.78],
      front: [0, MODEL_HEIGHT * 0.54, d],
      side: [d, MODEL_HEIGHT * 0.54, 0.0001],
      top: [0, d * 1.02, 0.0001],
    };
    const target = view.name === "top" ? new THREE.Vector3(0, MODEL_HEIGHT * 0.4, 0) : TARGET.clone();
    anim.current = {
      active: true,
      t: 0,
      from: camera.position.clone(),
      to: new THREE.Vector3(...positions[view.name]),
      fromTarget: (camera as unknown as { userData: { target?: THREE.Vector3 } }).userData.target?.clone?.() ??
        TARGET.clone(),
      toTarget: target,
    };
  }, [view, distance, camera]);

  useFrame((state, delta) => {
    const a = anim.current;
    if (!a.active) return;
    a.t = Math.min(1, a.t + delta / 0.72);
    const e = easeInOut(a.t);
    camera.position.lerpVectors(a.from, a.to, e);
    const controls = state.controls as unknown as { target: THREE.Vector3; update: () => void } | null;
    if (controls?.target) {
      controls.target.lerpVectors(a.fromTarget, a.toTarget, e);
      controls.update();
    }
    if (a.t >= 1) a.active = false;
  });

  return null;
}

function IdleSpin({ enabled }: { enabled: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!enabled || !group.current) return;
    group.current.rotation.y += delta * 0.16;
  });
  return <group ref={group} />;
}

/* ----------------------------------------------------------------- canvas */

export default function LampCanvas({
  modelUrl,
  variantId,
  glow,
  filament = "loop",
  view,
  distance,
  autoRotate,
  reducedMotion,
  onReady,
  onFirstInteract,
}: {
  modelUrl: string;
  variantId: string;
  glow: number;
  filament?: "loop" | "sculpt";
  view: ViewCommand;
  distance: number;
  autoRotate: boolean;
  reducedMotion: boolean;
  onReady: () => void;
  onFirstInteract: () => void;
}) {
  const lightIntensity = useMemo(() => 0.35 + glow * 1.55, [glow]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.06,
      }}
      camera={{ position: [2.1, 0.95, 2.5], fov: 30, near: 0.05, far: 60 }}
      onPointerDown={onFirstInteract}
      onWheel={onFirstInteract}
    >
      <color attach="background" args={["#141210"]} />
      <fog attach="fog" args={["#141210", 7.5, 16]} />

      <hemisphereLight args={["#f7e8cd", "#191510", 0.5]} />
      <directionalLight
        position={[2.6, 4.2, 3]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={14}
      />
      <directionalLight position={[-3.4, 2.2, -2.4]} intensity={0.5} color="#ffcf95" />
      <pointLight position={[0, MODEL_HEIGHT * 0.66, 0]} intensity={lightIntensity} color="#ffa63c" distance={6} decay={2} />
      <pointLight position={[0, 0.1, 2.6]} intensity={0.35} color="#fff3da" distance={7} />

      <LampModel
        modelUrl={modelUrl}
        variantId={variantId}
        glow={glow}
        filament={filament}
        onLoaded={onReady}
      />
      {autoRotate && !reducedMotion ? <IdleSpin enabled={false} /> : null}

      <ContactShadows position={[0, 0.002, 0]} opacity={0.52} scale={5} blur={2.6} far={2.2} resolution={512} color="#0b0a08" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <circleGeometry args={[3.4, 64]} />
        <meshStandardMaterial color="#1d1a15" roughness={0.86} metalness={0.04} />
      </mesh>

      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 3, -3]} scale={[7, 3, 1]} color="#fff4e0" />
        <Lightformer form="rect" intensity={1.5} position={[-3.4, 1.2, 1.4]} rotation={[0, Math.PI / 2, 0]} scale={[5, 2.4, 1]} color="#ffd9a4" />
        <Lightformer form="rect" intensity={1.1} position={[3.4, 1.4, 1.2]} rotation={[0, -Math.PI / 2, 0]} scale={[5, 2.2, 1]} color="#f6e9d2" />
        <Lightformer form="ring" intensity={0.9} position={[0, -2, 0]} scale={4} color="#2a241c" />
      </Environment>

      <CameraRig view={view} distance={distance} />

      <OrbitControls
        makeDefault
        target={[TARGET.x, TARGET.y, TARGET.z]}
        enablePan={false}
        enableDamping
        dampingFactor={0.075}
        rotateSpeed={0.85}
        zoomSpeed={0.75}
        minDistance={MIN_DIST}
        maxDistance={MAX_DIST}
        minPolarAngle={0.22}
        maxPolarAngle={Math.PI / 2 + 0.14}
        autoRotate={autoRotate && !reducedMotion}
        autoRotateSpeed={0.55}
        onStart={onFirstInteract}
      />
    </Canvas>
  );
}
