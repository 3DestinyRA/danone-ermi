# Visor 3D de Seguridad Industrial — `safety-viewer`

Interactive 3D viewer for an industrial plant `.glb` with **29 hotspots**, each
opening a side panel with title, description, image gallery, EPP requirements,
and category badge. Category filtering, prev/next navigation, smooth camera
transitions, responsive UI.

**Stack:** React + Vite, React Three Fiber + drei, Zustand, Tailwind v4, motion.

## First-time setup

```bash
npm install
# Drop the client's plant model — NOT committed to git (binary, replaced often):
cp /path/to/arcil.glb public/models/plant.glb
npm run dev            # http://localhost:5173
```

If `public/models/plant.glb` is missing, the app falls back to a placeholder
cube so UI work can continue without the model.

## Develop

```bash
npm run dev            # http://localhost:5173
npm run dev -- --open  # opens browser
```

Visit `?pick=1` to enable the hotspot position-picker tool (see below).

## Build

```bash
npm run build          # → dist/
npm run preview        # local preview of dist
```

## Project layout

- `src/config/hotspots.js` — single source of truth: 29 hotspots, 8 categories, EPP catalog.
- `src/store/useAppStore.js` — Zustand store (selection, filters, navigation).
- `src/components/Scene/` — R3F scene: Canvas, model, hotspots, camera controller, picker.
- `src/components/UI/` — overlay: sidebar, gallery, filter bar, navigation, loading screen, header.
- `public/models/plant.glb` — drop the client's `.glb` here. App auto-detects via HEAD probe and falls back to a placeholder cube if missing.
- `public/images/hotspots/hotspot-XX/` — per-hotspot gallery images.
- `public/images/epp/` — EPP icons (SVG).

## Updating content

Edit `src/config/hotspots.js`. Each hotspot has:
```js
{
  id: 1,
  title: "...",
  description: "...",
  category: "corte",                // see CATEGORIES
  epp: ["casco", "guantes"],        // see EPP_ITEMS
  images: ["/images/hotspots/hotspot-01/img1.jpg"],
  position: [x, y, z],              // surface point on the model
  cameraPosition: [x, y, z],        // pose when this hotspot is selected
  cameraTarget: [x, y, z],          // usually = position
}
```

## Re-positioning hotspots after model swap

1. Replace `public/models/plant.glb` with the new file.
2. Visit `http://localhost:5173/?pick=1`.
3. Click on the model surface for each hotspot, in order.
4. Open DevTools console — `ALL PICKS` JSON updates after each click.
5. Copy the array and merge `position`, `cameraPosition`, `cameraTarget` into `hotspots.js`.

## GLB optimization

```bash
npm install -g @gltf-transform/cli
gltf-transform optimize public/models/plant.glb public/models/plant.glb \
  --texture-compress webp --texture-size 1024 --compress meshopt --simplify false
```

For finer control over KTX2 (color vs normal), use `etc1s` and `uastc` —
there is no `gltf-transform ktx2` verb.

## Deploy (Vercel)

```bash
npm install -g vercel
vercel               # preview
vercel --prod        # production
```

`vercel.json` sets `Content-Type: model/gltf-binary` and long-cache headers
for `/models/*.glb`.
