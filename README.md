# Coffee Timer

Precision-first brewing timer with step cues, presets, and an offline-capable PWA.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build for production

```bash
npm run build
npm run preview
```

## MVP features

- React + Vite app shell
- PWA (service worker via `vite-plugin-pwa`)
- Step-based deterministic timer state machine
- Presets: `V60`, `Origami`, `Chemex`
- Audible cues (sound on by default)
- Screen wake lock during active brew (when supported)

