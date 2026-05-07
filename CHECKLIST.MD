# CHECKLIST.md — Coffee Timer MVP

This is the step-by-step checklist to ship the MVP described in `VISION.MD`.

---

## 0. Project baseline

- [ ] **Initialize project**: Create a React + Vite app in this repo.
- [ ] **Dev ergonomics**: Add linting/formatting (ESLint + Prettier) and basic scripts.
- [ ] **Repo docs**: Add/update `README.md` with run/build instructions and “what is this app”.

Done when:
- `npm install` + `npm run dev` works locally.

---

## 1. UX flow + navigation (screens)

- [ ] **Define routes/screens** (even if minimal):
  - [ ] Home / Quick Start
  - [ ] Presets / Recipes
  - [ ] Active Brew Timer
  - [ ] Results / Notes
  - [ ] Settings
- [ ] **Mobile-first layout**: Responsive baseline, large timer typography.
- [ ] **Primary CTA**: “Start Timer” is reachable in seconds from first load.

Done when:
- You can navigate to every screen on mobile + desktop widths.

---

## 2. Preset data model (MVP)

- [ ] **Create preset schema** (name, dose, water, ratio, steps).
- [ ] **Add 3 presets**:
  - [ ] **Default Pulse**: 60g pulses every 45s, **hard stop at 3:00**
  - [ ] **Origami**: 20g / 300g, bloom 45s, pours to 160g @0:45, 230g @1:15, 300g @1:45
  - [ ] **Chemex**: 30g / 500g, bloom 45s, pours to 200g @0:45, 350g @1:15, 500g @1:45
- [ ] **Preset browser**: List presets and let user select one to start.

Done when:
- Selecting a preset reliably starts the correct step sequence.

---

## 3. Deterministic timer state machine (core)

- [ ] **Implement timer engine** (deterministic state machine):
  - [ ] States: idle, running, paused, finished
  - [ ] Controls: start, pause, resume, skip-step, restart/end
  - [ ] Step scheduling: current step, next step, remaining time, total elapsed
  - [ ] Accuracy strategy: compute time from timestamps (not “setInterval drift”)
- [ ] **Hard-stop behavior**: Default preset ends exactly at `3:00`.
- [ ] **Offline-safe while open**: Timer continues accurately if network drops.

Done when:
- Timer remains accurate across tab focus changes and typical phone/desktop use while the app stays open.

---

## 4. Active Brew Timer UI (high priority UX)

- [ ] **Big timer display**: Total time + per-step countdown.
- [ ] **Instruction display**: Current instruction + upcoming step preview.
- [ ] **Progress indicator**: Visual progress through steps / time.
- [ ] **Controls**: Pause, Resume, Skip Step (avoid dense controls).

Done when:
- A user can complete a full recipe without confusion.

---

## 5. Cues (sound + visual)

- [ ] **Visual cue** on step change (animation/color/state change).
- [ ] **Sound cue** on step change:
  - [ ] Enabled by default
  - [ ] Toggle in Settings
  - [ ] Graceful behavior if audio is blocked until user interaction

Done when:
- Step transitions always provide an obvious cue; sound works after user interaction and can be disabled.

---

## 6. Keep screen on (Wake Lock)

- [ ] **Wake Lock integration** on Active Brew Timer screen:
  - [ ] Request wake lock when brew starts / screen is active
  - [ ] Release wake lock when paused/finished/leaving the screen
  - [ ] Fallback UX if unsupported (do nothing quietly or show subtle note)

Done when:
- Supported browsers keep the display awake during an active brew session.

---

## 7. Results + Notes (MVP output)

- [ ] **Results screen** at end-of-brew:
  - [ ] Elapsed time
  - [ ] Preset name + parameters (dose/water/ratio if present)
- [ ] **Notes field**: Optional text input (taste/grind/adjustments).
- [ ] **Persistence (lightweight)**: Store last session’s notes/results locally (optional but recommended for MVP).

Done when:
- Finishing a brew shows a summary and allows adding notes.

---

## 8. Settings (MVP)

- [ ] **Sound toggle** (default ON).
- [ ] **(Optional) basic units/preferences** if needed later.
- [ ] **Local persistence** of settings.

Done when:
- Toggling sound persists and affects cues immediately.

---

## 9. PWA + offline shell

- [ ] **Web app manifest**: name, icons, theme colors.
- [ ] **Service worker**: cache app shell for offline launch.
- [ ] **Install experience**:
  - [ ] Provide install guidance / prompt handling as appropriate
  - [ ] App works when launched from home screen

Done when:
- The app is installable and opens to a usable shell offline.

---

## 10. Polish + reliability pass

- [ ] **Edge cases**:
  - [ ] Pause/resume multiple times
  - [ ] Skip step near boundary
  - [ ] Backgrounding/focus changes (while still open)
  - [ ] Audio permission constraints
  - [ ] Wake lock release on navigation/unload
- [ ] **Performance**: Fast load, low overhead.
- [ ] **Accessibility basics**: readable contrast, button sizes, keyboard focus.

Done when:
- You trust it as a daily-use timer without surprises.

---

## 11. Ship

- [ ] **Production build**: `npm run build` succeeds.
- [ ] **Deploy**: Choose hosting (e.g., static hosting) and publish.
- [ ] **Smoke test** on phone + desktop, installed PWA mode.

Done when:
- A new user can start a brew in under 20 seconds and complete a full recipe reliably.

