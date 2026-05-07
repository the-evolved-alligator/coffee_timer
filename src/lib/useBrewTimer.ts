import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BrewPreset } from './presets'

type BrewTimerStatus = 'idle' | 'running' | 'paused' | 'finished'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function getEventIndexAtElapsedMs(events: BrewPreset['events'], elapsedMs: number) {
  // Returns the last event with atMs <= elapsedMs, or -1 if elapsed is before first event.
  let idx = -1
  for (let i = 0; i < events.length; i++) {
    if (events[i].atMs <= elapsedMs) idx = i
    else break
  }
  return idx
}

export function useBrewTimer(preset: BrewPreset) {
  const totalDurationMs = preset.totalDurationMs
  const events = preset.events

  const [status, setStatus] = useState<BrewTimerStatus>('idle')
  const statusRef = useRef<BrewTimerStatus>('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [cueEventIndex, setCueEventIndex] = useState<number | null>(null)

  const rafRef = useRef<number | null>(null)
  const startPerfRef = useRef<number | null>(null) // performance.now() when running
  const accumulatedMsRef = useRef<number>(0) // elapsed before the current running period
  const lastCuedEventIndexRef = useRef<number>(-1)

  const eventIndex = useMemo(() => getEventIndexAtElapsedMs(events, elapsedMs), [events, elapsedMs])
  const nextEventIndex = eventIndex + 1 < events.length ? eventIndex + 1 : null

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const computeElapsedMs = useCallback(() => {
    if (startPerfRef.current == null) return accumulatedMsRef.current
    const now = performance.now()
    return accumulatedMsRef.current + (now - startPerfRef.current)
  }, [])

  const tick = useCallback(() => {
    const elapsed = computeElapsedMs()
    const clamped = clamp(elapsed, 0, totalDurationMs)
    setElapsedMs(clamped)

    const idx = getEventIndexAtElapsedMs(events, clamped)

    if (statusRef.current === 'running' && idx !== lastCuedEventIndexRef.current) {
      lastCuedEventIndexRef.current = idx
      setCueEventIndex(idx)
    }

    if (clamped >= totalDurationMs) {
      stopRaf()
      setStatus('finished')
      // Ensure we end at exactly totalDurationMs (hard stop).
      setElapsedMs(totalDurationMs)
      return
    }

    // If we're not running anymore (paused/finished), stop scheduling.
    if (statusRef.current !== 'running') {
      stopRaf()
      return
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [computeElapsedMs, events, stopRaf, totalDurationMs])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    return () => stopRaf()
  }, [stopRaf])

  const start = useCallback(() => {
    stopRaf()
    accumulatedMsRef.current = 0
    startPerfRef.current = performance.now()
    lastCuedEventIndexRef.current = -1

    setCueEventIndex(null)
    setElapsedMs(0)
    setStatus('running')
    statusRef.current = 'running'

    // Cue immediately at t=0 if there's an event at 0.
    const idx0 = getEventIndexAtElapsedMs(events, 0)
    if (idx0 !== -1) {
      lastCuedEventIndexRef.current = idx0
      setCueEventIndex(idx0)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [events, stopRaf, tick])

  const pause = useCallback(() => {
    if (status !== 'running') return
    const elapsed = computeElapsedMs()
    accumulatedMsRef.current = clamp(elapsed, 0, totalDurationMs)
    startPerfRef.current = null
    stopRaf()
    setElapsedMs(accumulatedMsRef.current)
    setStatus('paused')
    statusRef.current = 'paused'
    setCueEventIndex(null)
  }, [computeElapsedMs, status, stopRaf, totalDurationMs])

  const resume = useCallback(() => {
    if (status !== 'paused') return
    startPerfRef.current = performance.now()
    lastCuedEventIndexRef.current = getEventIndexAtElapsedMs(events, elapsedMs)
    setStatus('running')
    statusRef.current = 'running'
    setCueEventIndex(null)
    rafRef.current = requestAnimationFrame(tick)
  }, [elapsedMs, events, status, tick])

  const restart = useCallback(() => {
    stopRaf()
    startPerfRef.current = null
    accumulatedMsRef.current = 0
    lastCuedEventIndexRef.current = -1
    setCueEventIndex(null)
    setElapsedMs(0)
    setStatus('idle')
    statusRef.current = 'idle'
  }, [elapsedMs, stopRaf])

  const skipStep = useCallback(() => {
    if (status === 'idle') return

    const currentIdx = getEventIndexAtElapsedMs(events, elapsedMs)
    const nextIdx = currentIdx + 1 < events.length ? currentIdx + 1 : null

    const targetElapsed = nextIdx != null ? events[nextIdx].atMs : totalDurationMs

    if (targetElapsed >= totalDurationMs) {
      stopRaf()
      startPerfRef.current = null
      accumulatedMsRef.current = totalDurationMs
      lastCuedEventIndexRef.current = events.length - 1
      setCueEventIndex(null)
      setElapsedMs(totalDurationMs)
      setStatus('finished')
      statusRef.current = 'finished'
      return
    }

    stopRaf()
    accumulatedMsRef.current = targetElapsed
    setElapsedMs(targetElapsed)

    if (nextIdx != null) {
      lastCuedEventIndexRef.current = nextIdx
      setCueEventIndex(nextIdx)
    } else {
      setCueEventIndex(null)
    }

    if (status === 'running') {
      startPerfRef.current = performance.now()
      statusRef.current = 'running'
      rafRef.current = requestAnimationFrame(tick)
    } else {
      startPerfRef.current = null
      // remain paused
    }
  }, [elapsedMs, events, status, stopRaf, tick, totalDurationMs])

  const clearCue = useCallback(() => setCueEventIndex(null), [])

  useEffect(() => {
    if (status !== 'running') return
    // Clear cue quickly after it's been consumed by the UI.
    if (cueEventIndex == null) return
    const id = window.setTimeout(() => setCueEventIndex(null), 300)
    return () => window.clearTimeout(id)
  }, [cueEventIndex, status])

  return {
    status,
    elapsedMs,
    totalDurationMs,
    eventIndex,
    nextEventIndex,
    currentEvent: eventIndex >= 0 ? events[eventIndex] : null,
    nextEvent: nextEventIndex != null ? events[nextEventIndex] : null,
    cueEventIndex,
    start,
    pause,
    resume,
    restart,
    skipStep,
    clearCue,
  }
}

