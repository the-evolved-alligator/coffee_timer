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

export const PRESETS: BrewPreset[] = [
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

export function getPresetById(id: string | undefined | null) {
  if (!id) return PRESETS[0]
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0]
}

