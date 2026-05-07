type WakeLockSentinel = any
type WakeLock = { request: (type: 'screen') => Promise<WakeLockSentinel> }

export async function acquireWakeLock() {
  const wakeLock = (navigator as any).wakeLock as WakeLock | undefined
  if (!wakeLock || typeof wakeLock.request !== 'function') return null

  try {
    const sentinel = await wakeLock.request('screen')
    return sentinel as WakeLockSentinel
  } catch {
    return null
  }
}

export async function releaseWakeLock(sentinel: WakeLockSentinel | null) {
  try {
    await sentinel?.release()
  } catch {
    // ignore
  }
}

