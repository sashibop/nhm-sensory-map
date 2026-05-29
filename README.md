# todo:
- Better model, IRL based
   - 3D
   - 2D
- Make more data
   - Better fit the IRL model
   - Unique daily data (define scope, e.g. 1 Week)
- Language switch
- Accessibility settings
   - Plain Language (?)
   - High Contrast
   - Text-Size
   - Cursor-Size
- Brightness
   - Data
   - 3D
   - 2D
- Dimensions
   - Data
   - 3D
   - 2D
- Layer Legend
- Charts (?)

---

# NHM Sensory Map — Quick Start

Prerequisites
- Node.js (LTS, e.g. 18.x)
- npm (comes with Node) or Yarn
- Git

---

macOS / Linux
1. Clone and enter project

```
   git clone <repo-url>
```
```
   cd nhm-sensory-map
```

2. Use a stable Node (optional but recommended):

    with nvm:
```
   nvm install 18
   nvm use 18
```

3. Install dependencies

```
   npm install
```

4. Start dev server

```
   npm run dev
```

5. Open:

   http://localhost:5173

---

Windows (PowerShell)
1. Clone and enter project

```
   git clone <repo-url>
```
```
   cd nhm-sensory-map
```

2. Install Node (use nvm-windows or installer).

3. Install dependencies and run

```
   npm install
   npm run dev
```

4. Open:

   http://localhost:5173

Core dependencies (already used by this project)
- react, react-dom (UI)
- three.js (3D)
- @react-three/fiber (R3F)
- @react-three/drei (helpers)
- zustand (state)

To add/update these locally:

```
   npm install three @react-three/fiber @react-three/drei zustand
```

Useful commands
- Dev: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`
- Lint (if configured): `npm run lint`
- Format (if configured): `npm run format`

Developer notes
- 3D code lives under `src/components/canvas` (R3F Canvas + scenes).
- UI components under `src/components/ui`.
- Mock data and noise engine in `src/data/mockVisitorData.js`.
- Global state in `src/store/useAppStore.js`.

Troubleshooting
- If `npm run dev` fails: check `node -v` and reinstall deps.
- Port conflict: set `PORT` env var, e.g. `PORT=5174 npm run dev`.

Commit message style
- Keep subject short; use `|` to separate major parts.
  Example: `add 2D ViewToggle & Settings | refactor NoiseLayer | add staff routes 1F`


