import React, { useContext, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SoundContext } from '../App'
import { getPresetById } from '../lib/presets'
import { formatMsAsClock } from '../lib/format'
import { playFinishCue, playStepCue, ensureAudioUnlocked } from '../lib/sound'
import { acquireWakeLock, releaseWakeLock } from '../lib/wakeLock'
import { useBrewTimer } from '../lib/useBrewTimer'

export default function BrewTimer() {
  const navigate = useNavigate()
  const location = useLocation()
  const sound = useContext(SoundContext)

  const presetId = useMemo(() => {
    const st = location.state as any
    return st?.presetId as string | undefined
  }, [location.state])

  const preset = useMemo(() => getPresetById(presetId), [presetId])
  const timer = useBrewTimer(preset)

  const hasNavigatedToResultsRef = useRef(false)
  const wakeSentinelRef = useRef<any>(null)
  const unlockedRef = useRef(false)

  if (!sound) return null

  const progress = Math.max(0, Math.min(1, timer.elapsedMs / timer.totalDurationMs))
  const nextInMs =
    timer.nextEvent != null ? Math.max(0, timer.nextEvent.atMs - timer.elapsedMs) : null

  useEffect(() => {
    // Wake lock only while active brewing (running).
    if (timer.status === 'running') {
      acquireWakeLock().then((sentinel) => {
        wakeSentinelRef.current = sentinel
      })
    } else {
      releaseWakeLock(wakeSentinelRef.current)
      wakeSentinelRef.current = null
    }

    return () => {
      releaseWakeLock(wakeSentinelRef.current)
      wakeSentinelRef.current = null
    }
  }, [timer.status])

  useEffect(() => {
    // Unlock audio after user interaction (entering this screen comes from a click).
    if (sound.soundEnabled && timer.status === 'running' && !unlockedRef.current) {
      unlockedRef.current = true
      ensureAudioUnlocked()
    }
  }, [sound.soundEnabled, timer.status])

  useEffect(() => {
    if (!sound.soundEnabled) return
    if (timer.cueEventIndex == null) return
    if (timer.status === 'finished') return
    playStepCue()
  }, [sound.soundEnabled, timer.cueEventIndex, timer.status])

  useEffect(() => {
    if (!sound.soundEnabled) return
    if (timer.status !== 'finished') return
    playFinishCue()
  }, [sound.soundEnabled, timer.status])

  useEffect(() => {
    if (timer.status !== 'finished') return
    if (hasNavigatedToResultsRef.current) return
    hasNavigatedToResultsRef.current = true
    navigate('/results', {
      state: {
        presetId: preset.id,
        presetName: preset.name,
        elapsedMs: timer.elapsedMs,
      },
    })
  }, [navigate, preset.id, preset.name, timer.elapsedMs, timer.status])

  const current = timer.currentEvent
  const next = timer.nextEvent
  const isReady = timer.status === 'idle'

  return (
    <div className="container">
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div className="muted" style={{ fontWeight: 700, letterSpacing: 0.2 }}>
              Active Brew
            </div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{preset.name}</div>
          </div>
          <button onClick={() => navigate('/presets')}>Presets</button>
        </div>

        <div style={{ height: 12 }} />

        <div className="bigTime">{formatMsAsClock(timer.elapsedMs)}</div>

        <div style={{ height: 10 }} />
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.10)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.round(progress * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, rgba(96,165,250,0.9), rgba(245,158,11,0.9))',
            }}
          />
        </div>

        <div style={{ height: 14 }} />

        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <div className="muted" style={{ fontWeight: 700 }}>
              Current Step
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 4 }}>
              {isReady ? 'Ready' : current ? current.title : 'Get ready'}
            </div>
            <div className="muted" style={{ lineHeight: 1.5, marginTop: 6 }}>
              {isReady
                ? 'Press “Start” to begin the brew.'
                : current
                  ? current.instruction
                  : 'Press “Start” to begin the brew.'}
            </div>
          </div>

          <div>
            <div className="muted" style={{ fontWeight: 700 }}>
              Next Cue
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>
              {next ? next.title : 'Brew complete'}
            </div>
            <div className="muted" style={{ lineHeight: 1.5, marginTop: 6 }}>
              {next
                ? `${next.instruction} ${
                    nextInMs != null ? `(in ${formatMsAsClock(nextInMs)})` : ''
                  }`
                : 'You can add notes on the results screen.'}
            </div>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {timer.status === 'idle' && (
            <>
              <button
                className="primary"
                onClick={timer.start}
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  padding: '16px 24px',
                  minHeight: 64,
                  flex: '1 1 220px',
                }}
              >
                Start
              </button>
              <button
                className="danger"
                onClick={() => {
                  hasNavigatedToResultsRef.current = false
                  navigate('/presets')
                }}
                style={{ fontSize: 20, fontWeight: 900, padding: '16px 24px', minHeight: 64, flex: '1 1 220px' }}
              >
                Exit
              </button>
            </>
          )}
          {timer.status === 'running' && (
            <button
              className="danger"
              onClick={() => {
                hasNavigatedToResultsRef.current = false
                timer.restart()
              }}
            >
              Reset
            </button>
          )}
          {timer.status === 'finished' && (
            <button
              className="primary"
              onClick={() => {
                hasNavigatedToResultsRef.current = false
                timer.restart()
              }}
            >
              Start Again
            </button>
          )}

          {timer.status !== 'idle' && (
            <button
              className="danger"
              onClick={() => {
                // Abort and return to presets.
                hasNavigatedToResultsRef.current = false
                navigate('/presets')
              }}
            >
              Exit
            </button>
          )}
        </div>

        <div style={{ height: 10 }} />
        <div className="muted" style={{ fontSize: 13, lineHeight: 1.45 }}>
          Tip: Sound cues are on by default. Wake lock keeps the screen awake during active
          brewing when supported.
        </div>
      </div>
    </div>
  )
}

