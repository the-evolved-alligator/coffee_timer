export type BrewEvent = {
  atMs: number
  title: string
  instruction: string
  waterToAddG: number
}

export type BrewPreset = {
  id: string
  name: string
  coffeeG?: number
  waterG?: number
  ratioText?: string
  totalDurationMs: number
  events: BrewEvent[] // sorted ascending by atMs
}

const S = (sec: number) => sec * 1000

export const BUILTIN_PRESETS: BrewPreset[] = [
  {
    id: 'v60',
    name: 'V60',
    coffeeG: 20,
    waterG: 300,
    ratioText: '1:15',
    totalDurationMs: S(180),
    events: [
      {
        atMs: 0,
        title: 'Start',
        instruction: 'Add 60g water and start timer.',
        waterToAddG: 60,
      },
      ...[45, 90, 135, 180].map((sec) => ({
        atMs: S(sec),
        title: sec === 180 ? 'Final Pulse' : 'Pulse',
        instruction: 'Add 60g water.',
        waterToAddG: 60,
      })),
    ],
  },
  {
    id: 'origami',
    name: 'Origami',
    coffeeG: 20,
    waterG: 300,
    ratioText: '1:15',
    totalDurationMs: S(150),
    events: [
      {
        atMs: 0,
        title: 'Bloom',
        instruction: 'Pour 60g water. Bloom for ~45s.',
        waterToAddG: 60,
      },
      {
        atMs: S(45),
        title: 'Pour 1',
        instruction: 'Pour 100g (to reach 160g total).',
        waterToAddG: 100,
      },
      {
        atMs: S(75),
        title: 'Pour 2',
        instruction: 'Pour 70g (to reach 230g total).',
        waterToAddG: 70,
      },
      {
        atMs: S(105),
        title: 'Pour 3',
        instruction: 'Pour 70g (to reach 300g total).',
        waterToAddG: 70,
      },
    ],
  },
  {
    id: 'chemex',
    name: 'Chemex',
    coffeeG: 30,
    waterG: 500,
    ratioText: '1:16.7',
    totalDurationMs: S(240),
    events: [
      {
        atMs: 0,
        title: 'Bloom',
        instruction: 'Pour 60g water. Bloom for ~45s.',
        waterToAddG: 60,
      },
      {
        atMs: S(45),
        title: 'Pour 1',
        instruction: 'Pour 140g (to reach 200g total).',
        waterToAddG: 140,
      },
      {
        atMs: S(75),
        title: 'Pour 2',
        instruction: 'Pour 150g (to reach 350g total).',
        waterToAddG: 150,
      },
      {
        atMs: S(105),
        title: 'Pour 3',
        instruction: 'Pour 150g (to reach 500g total).',
        waterToAddG: 150,
      },
    ],
  },
]

const CUSTOM_PRESETS_KEY = 'ct_customPresets_v1'
const BUILTIN_IDS = new Set(BUILTIN_PRESETS.map((p) => p.id))

function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n)
}

function sanitizePreset(p: any): BrewPreset | null {
  if (!p || typeof p !== 'object') return null
  if (typeof p.id !== 'string' || typeof p.name !== 'string') return null
  if (!isFiniteNumber(p.totalDurationMs)) return null
  if (!Array.isArray(p.events)) return null

  const events: BrewEvent[] = []
  for (const e of p.events) {
    if (!e || typeof e !== 'object') return null
    if (!isFiniteNumber(e.atMs)) return null
    if (typeof e.title !== 'string') return null
    if (typeof e.instruction !== 'string') return null
    if (!isFiniteNumber(e.waterToAddG)) return null
    events.push({
      atMs: Math.max(0, Math.floor(e.atMs)),
      title: e.title,
      instruction: e.instruction,
      waterToAddG: Math.max(0, Math.floor(e.waterToAddG)),
    })
  }
  events.sort((a, b) => a.atMs - b.atMs)

  const preset: BrewPreset = {
    id: p.id,
    name: p.name,
    coffeeG: isFiniteNumber(p.coffeeG) ? p.coffeeG : undefined,
    waterG: isFiniteNumber(p.waterG) ? p.waterG : undefined,
    ratioText: typeof p.ratioText === 'string' ? p.ratioText : undefined,
    totalDurationMs: Math.max(0, Math.floor(p.totalDurationMs)),
    events,
  }

  return preset
}

export function loadCustomPresets(): BrewPreset[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PRESETS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const out: BrewPreset[] = []
    for (const p of parsed) {
      const s = sanitizePreset(p)
      if (s) out.push(s)
    }
    return out
  } catch {
    return []
  }
}

export function saveCustomPresets(presets: BrewPreset[]) {
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets))
  // Notify other tabs + same-tab listeners.
  window.dispatchEvent(new Event('ct_customPresets_changed'))
}

export function getAllPresets(): BrewPreset[] {
  const custom = loadCustomPresets()
  return [...BUILTIN_PRESETS, ...custom]
}

export function isBuiltInPreset(id: string) {
  return BUILTIN_IDS.has(id)
}

export function getCustomPresetById(id: string) {
  return loadCustomPresets().find((p) => p.id === id) ?? null
}

export function upsertCustomPreset(preset: BrewPreset) {
  const existing = loadCustomPresets()
  const idx = existing.findIndex((p) => p.id === preset.id)
  if (idx === -1) {
    saveCustomPresets([...existing, preset])
    return
  }
  const next = [...existing]
  next[idx] = preset
  saveCustomPresets(next)
}

export function deleteCustomPresetById(id: string) {
  const next = loadCustomPresets().filter((p) => p.id !== id)
  saveCustomPresets(next)
}

export function getPresetById(id: string | undefined | null) {
  const presets = getAllPresets()
  if (!id) return presets[0]
  return presets.find((p) => p.id === id) ?? presets[0]
}

