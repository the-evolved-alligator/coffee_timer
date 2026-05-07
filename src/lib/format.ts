export function formatMsAsClock(totalMs: number) {
  const ms = Math.max(0, Math.floor(totalMs))
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

