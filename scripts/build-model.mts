/**
 * Generates public/models/auraglow.glb from the parametric reconstruction in
 * src/lib/lamp-geometry.ts, so the downloadable/exported GLB and the live viewer
 * can never drift apart.
 *
 * Run:  npx tsx scripts/build-model.mts
 */
import { writeFileSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";

// minimal browser surface the GLTFExporter expects
const g = globalThis as unknown as Record<string, unknown>;
if (!g.self) g.self = globalThis;
if (!g.document) {
  g.document = {
    createElementNS: () => ({ style: {}, setAttribute() {}, appendChild() {} }),
    createElement: () => ({ style: {}, getContext: () => null, setAttribute() {} }),
  };
}
// GLTFExporter reads the finished buffer through a FileReader; Node has Blob.arrayBuffer().
if (!g.FileReader) {
  g.FileReader = class FileReaderPolyfill {
    result: ArrayBuffer | null = null;
    onloadend: ((e: { target: unknown }) => void) | null = null;
    readAsArrayBuffer(blob: Blob) {
      void blob.arrayBuffer().then((buf) => {
        this.result = buf;
        this.onloadend?.({ target: this });
      });
    }
  };
}

const THREE = await import("three");
const { buildLamp, lampBounds, FILAMENT_CONFIGS } = await import("../src/lib/lamp-geometry.ts");
const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");

const outDir = path.join(process.cwd(), "public", "models");
mkdirSync(outDir, { recursive: true });

function exportVariant(filament: "loop" | "sculpt", file: string) {
  const root = buildLamp({ variantId: "ivory-white", filament, glow: 0.85, withLights: false });
  const holder = new THREE.Group();
  holder.name = `AuraGlow_${filament}`;
  holder.add(root);

  return new Promise<void>((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      holder,
      (result) => {
        const buf = result as ArrayBuffer;
        const outPath = path.join(outDir, file);
        writeFileSync(outPath, Buffer.from(buf));
        const bytes = statSync(outPath).size;
        console.log(`wrote ${file}  ${(bytes / 1024).toFixed(1)} KB`);
        resolve();
      },
      (err) => reject(err),
      { binary: true, onlyVisible: true, includeCustomExtensions: true },
    );
  });
}

const bounds = lampBounds();
console.log("framing bounds (mm)", bounds);

await exportVariant("loop", "auraglow.glb");
await exportVariant("sculpt", "auraglow-sculpt.glb");

writeFileSync(
  path.join(outDir, "auraglow.manifest.json"),
  JSON.stringify(
    {
      product: "AuraGlow (CJdropshipping SKU CJJT180225501AZ)",
      kind: "Photographic parametric reconstruction — not a 3D scan",
      generatedBy: "scripts/build-model.mts",
      units: "node scale 0.01 => 1 unit ≈ 10 mm",
      dimensionsMm: { w: bounds.width, d: bounds.depth, h: bounds.height },
      filamentConfigurations: FILAMENT_CONFIGS.map((c) => ({ id: c.id, label: c.label })),
      parts: [
        "cover (transparent PC, lathed shell with rolled rim)",
        "base (ABS rounded square, soft bevel)",
        "touch_control_groove + touch_control_face (front)",
        "indicator_pinhole (front, below control)",
        "usbc_inlet (rear face)",
        "filament (tube along CatmullRom curve) + brass anchor/seat/bead",
        "underside_pad",
      ],
    },
    null,
    2,
  ),
);

console.log("done");
