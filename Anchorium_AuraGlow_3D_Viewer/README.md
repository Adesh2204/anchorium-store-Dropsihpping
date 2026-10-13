# Anchorium Store — AuraGlow 3D Viewer

An interactive, responsive WebGL viewer for a reconstructed 3D model of the rechargeable ambient lamp in the referenced CJdropshipping listing.

## Included

- `index.html` — responsive product viewer UI and Three.js interaction layer.
- `public/models/auraglow.glb` — interactive viewer model with named components (base, transparent shell, filament, touch button, and Type-C port detail).
- `public/models/variants/` — standalone GLB finish exports for Deep Space Grey, Elegant White, and Yellow.
- `build_model.py` — script used to build the GLB mesh with `trimesh`.
- `open-viewer.bat` — starts a local HTTP server and opens the viewer on Windows if Python is installed.

## View it

The viewer imports Three.js modules from jsDelivr, so internet access is needed when opening the demo. Because browser ES modules and GLB assets are not reliably loaded from a `file://` URL, serve this folder over HTTP instead.

### Windows

Double-click `open-viewer.bat`.

### macOS / Linux / terminal

From this folder run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Controls

- Drag with mouse to rotate; scroll or use device gesture to zoom.
- Pinch/drag with touch on supported mobile browsers.
- Front, side, top, reset and fullscreen viewing controls.
- Finish previews: Deep Space Grey, Elegant White, and Yellow.
- Brightness appearance slider: 6–55 lm, reflecting the supplier listing's stated range.
- Constant and breathing appearance modes. The breathing preview uses an approximately eight-second cycle.
- Straight and curved filament visual presets.

## Accuracy and limitations

This is a **photograph-based reconstruction**, not a manufacturer CAD file or a calibrated photometric simulation. The outer proportions follow the listing's stated 70 × 70 × 145 mm dimensions. The visible construction is modeled from the supplier reference images; small hidden construction details cannot be verified from photographs alone.

The gray and white bases are visible in the supplier listing. Yellow is included as a third **visual finish preview** based on alternate listings for the same SKU family; confirm that it is an available, orderable variant in your current supplier account before advertising it for sale. The slider represents a visual preview of the stated 6–55 lumen range and does not calculate real-world lux or measured luminous flux.

The displayed ₹4,000 / ₹5,000 pricing and 20% discount are visual examples from the requested store design. This viewer demo does not create orders, maintain a shopping cart, or process payment. Connect the CTA to the production product and checkout routes before deployment.

## Supplier reference

https://www.cjdropshipping.com/product/new-led-camping-light-type-c-rechargeable-portable-night-light-with-high-transparency-and-anti-drop-creative-atmosphere-light-p-1681170786222088192.html
