# VISION.md — Coffee Timer

## 1. Purpose

Coffee Timer is a **precision brewing companion** designed to:

* Standardize brew routines across methods
* Reduce variability between cups
* Make repeatable coffee workflows fast and simple

The app must communicate:

* Precision without complexity
* Practical utility for daily brewing
* Fast, reliable execution on mobile and desktop

---

## 2. Target Audience

Primary:

* Home brewers who want consistent results
* Coffee enthusiasts tracking ratios and brew timing
* Users following step-based recipes (pour-over, immersion, etc.)

Secondary:

* Baristas for quick ad-hoc timer use
* Beginners who need guided brewing flow

---

## 3. Positioning

**Primary Identity:**
Precision-first brewing timer

**Supporting Angles:**

* Lightweight productivity tool
* Repeatable workflow assistant

---

## 4. Core Message

> “Brew better coffee with repeatable timing, clear steps, and reliable execution.”

---

## 5. Primary Call To Action

**Primary CTA:** Start Timer  
Secondary CTA: Browse Presets

The first interaction should get users timing a brew in seconds.

---

## 6. Content Strategy

### 6.1 Core Timer Experience

* Base brew routine (default preset):
  * Add 60g water and start timer
  * At 0:45 add 60g
  * At 1:30 add 60g
  * Continue 60g pulses every 45 seconds until 3:00 (hard stop at exactly 3:00)
* Total timer + step timer
* Visual progress and current instruction
* Pause, resume, skip step

### 6.2 Precision Controls

* Input dose / water / ratio
* Adjustable step durations
* Optional bloom and pulse stages
* Saved presets (future if not in MVP)

### 6.3 Output and Tracking

* End-of-brew summary (elapsed time, parameters)
* Optional notes field (taste, grind, adjustments)
* Session history (future)

### 6.4 MVP Presets

* Preset 1 (Default): Pulse 60g every 45 seconds, ending exactly at 3:00
* Preset 2 (Origami): 20g coffee / 300g water, bloom 45s, pours at 0:45 to 160g, 1:15 to 230g, 1:45 to 300g
* Preset 3 (Chemex): 30g coffee / 500g water, bloom 45s, pours at 0:45 to 200g, 1:15 to 350g, 1:45 to 500g

---

## 7. App Structure

### Screens

1. Home / Quick Start
2. Presets / Recipes
3. Active Brew Timer
4. Results / Notes
5. Settings

---

## 8. Features

Required:

* Step-based timer with the default 60g / 45s pulse structure up to 3:00
* Audible + visual cues (sound cues enabled by default)
* Responsive layout (mobile-first)
* Offline-safe basic timer behavior while the app remains open
* Keep-screen-on support during active brew sessions
* Installable **PWA** with service worker and offline shell

Optional (future):

* Saved brew history
* Cloud sync
* Share recipe links

---

## 9. Design Principles

* Minimal and distraction-free
* Large, legible typography for timer state
* One clear primary action per screen
* Avoid dense controls during active brew

Goal:

> Keep users focused on brewing, not on the interface.

---

## 10. Technical Strategy

* Frontend-first web app using React + Vite
* Deterministic timer state machine
* Local persistence for settings/presets
* PWA setup (manifest, icons, service worker, offline caching)
* Use the Screen Wake Lock API during active brew to keep the display awake when supported
* Fast load and low runtime overhead

---

## 11. MVP Scope

### Must Have

* Quick-start timer with the default pulse recipe baked in
* At least 3 preset workflows (Default Pulse, Origami, Chemex)
* Step-by-step cues (text + optional sound)
* Mobile responsive UI
* PWA install prompt and offline app shell

### Can Wait

* Auth
* Cloud sync
* Advanced analytics/history dashboard

---

## 12. Success Criteria

The app is successful if:

* A new user starts a brew in under 20 seconds
* A returning user can run a full recipe without confusion
* Timing flow is reliable across typical phone/desktop usage

---

## 13. Anti-Goals

Avoid:

* Overloaded screens during active brewing
* Feature creep before timer reliability is solid
* Complicated setup before first use

---

## 14. Future Extensions

* Recipe marketplace / shared presets
* Smart scale integration
* Brew scoring and trend tracking

---

## Final Note

Coffee Timer should feel like a dependable tool:

* Fast to start
* Easy to trust
* Consistent cup after cup
