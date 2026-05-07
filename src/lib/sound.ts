let audioCtx: AudioContext | null = null

function getAudioContext() {
  if (audioCtx) return audioCtx
  const Ctx = window.AudioContext || (window as any).webkitAudioContext
  audioCtx = new Ctx()
  return audioCtx
}

export async function ensureAudioUnlocked() {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
}

export async function beep({
  frequency = 880,
  durationMs = 80,
  volume = 0.08,
}: {
  frequency?: number
  durationMs?: number
  volume?: number
}) {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    // If the user hasn't interacted yet, the browser may still block sound.
    // We let the call succeed; the first real cue should happen after user action.
    try {
      await ctx.resume()
    } catch {
      return
    }
  }

  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency

  const now = ctx.currentTime
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start()
  oscillator.stop(now + durationMs / 1000)
}

export async function playStepCue() {
  // More noticeable cue: slightly louder + longer + two-tone.
  // Needs to be ~"couple seconds" total so it’s noticeable on phones.
  const gapMs = 250
  await beep({ frequency: 1174, durationMs: 320, volume: 0.14 }) // ~D6
  await new Promise((r) => setTimeout(r, gapMs))
  await beep({ frequency: 988, durationMs: 320, volume: 0.12 }) // ~B5
  await new Promise((r) => setTimeout(r, gapMs))
  await beep({ frequency: 1174, durationMs: 320, volume: 0.14 }) // ~D6
  await new Promise((r) => setTimeout(r, gapMs))
  await beep({ frequency: 988, durationMs: 320, volume: 0.12 }) // ~B5
}

export async function playFinishCue() {
  // Slightly longer finish sequence (still not excessive).
  const gapMs = 260
  await beep({ frequency: 784, durationMs: 360, volume: 0.14 }) // ~G5
  await new Promise((r) => setTimeout(r, gapMs))
  await beep({ frequency: 988, durationMs: 360, volume: 0.13 }) // ~B5
  await new Promise((r) => setTimeout(r, gapMs))
  await beep({ frequency: 1318, durationMs: 420, volume: 0.12 }) // ~E6
}

