import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { BrewEvent, BrewPreset } from '../lib/presets'
import { getCustomPresetById, upsertCustomPreset } from '../lib/presets'

function parseClockToMs(clock: string) {
  const trimmed = clock.trim()
  const m = /^(\d+):(\d{2})$/.exec(trimmed)
  if (!m) return null
  const minutes = Number(m[1])
  const seconds = Number(m[2])
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null
  if (seconds < 0 || seconds > 59) return null
  return (minutes * 60 + seconds) * 1000
}

function formatMsAsClock(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

type DraftStep = {
  at: string
  title: string
  instruction: string
  waterToAddG: string
}

export default function CreatePreset() {
  const navigate = useNavigate()
  const { presetId } = useParams()
  const isEditMode = Boolean(presetId)

  const [name, setName] = useState('My Preset')
  const [coffeeG, setCoffeeG] = useState('20')
  const [waterG, setWaterG] = useState('300')
  const [totalDuration, setTotalDuration] = useState('3:00')
  const [loadError, setLoadError] = useState<string | null>(null)

  const [steps, setSteps] = useState<DraftStep[]>([
    {
      at: '0:00',
      title: 'Start',
      instruction: 'Start the timer.',
      waterToAddG: '0',
    },
    {
      at: '0:45',
      title: 'Step',
      instruction: 'Add water.',
      waterToAddG: '60',
    },
  ])

  useEffect(() => {
    if (!isEditMode || !presetId) return
    const preset = getCustomPresetById(presetId)
    if (!preset) {
      setLoadError('Preset not found.')
      return
    }

    setName(preset.name)
    setCoffeeG(preset.coffeeG != null ? String(preset.coffeeG) : '')
    setWaterG(preset.waterG != null ? String(preset.waterG) : '')
    setTotalDuration(formatMsAsClock(preset.totalDurationMs))
    setSteps(
      preset.events.map((e) => ({
        at: formatMsAsClock(e.atMs),
        title: e.title,
        instruction: e.instruction,
        waterToAddG: String(e.waterToAddG),
      })),
    )
  }, [isEditMode, presetId])

  const computedRatioText = useMemo(() => {
    const coffee = Number(coffeeG)
    const water = Number(waterG)
    if (!Number.isFinite(coffee) || !Number.isFinite(water) || coffee <= 0 || water <= 0) {
      return '--'
    }
    const ratio = water / coffee
    const formatted = Number.isInteger(ratio) ? String(ratio) : ratio.toFixed(1)
    return `1:${formatted}`
  }, [coffeeG, waterG])

  const validation = useMemo(() => {
    const issues: string[] = []
    if (!name.trim()) issues.push('Name is required.')
    const totalMs = parseClockToMs(totalDuration)
    if (totalMs == null) issues.push('Total duration must be in M:SS format.')

    const events: BrewEvent[] = []
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i]
      const atMs = parseClockToMs(s.at)
      if (atMs == null) issues.push(`Step ${i + 1}: time must be in M:SS format.`)
      if (!s.title.trim()) issues.push(`Step ${i + 1}: title is required.`)
      if (!s.instruction.trim()) issues.push(`Step ${i + 1}: instruction is required.`)
      const water = Number(s.waterToAddG)
      if (!Number.isFinite(water) || water < 0) issues.push(`Step ${i + 1}: water must be ≥ 0.`)
      if (atMs != null && Number.isFinite(water)) {
        events.push({
          atMs,
          title: s.title.trim(),
          instruction: s.instruction.trim(),
          waterToAddG: Math.floor(water),
        })
      }
    }

    events.sort((a, b) => a.atMs - b.atMs)
    if (events.length > 0 && events[0].atMs !== 0) {
      issues.push('First step should start at 0:00.')
    }

    const coffee = Number(coffeeG)
    const water = Number(waterG)
    if (!Number.isFinite(coffee) || coffee <= 0) issues.push('Coffee grams must be > 0.')
    if (!Number.isFinite(water) || water <= 0) issues.push('Water grams must be > 0.')

    return {
      issues,
      totalMs: totalMs ?? 0,
      coffee: Number.isFinite(coffee) ? coffee : undefined,
      water: Number.isFinite(water) ? water : undefined,
      events,
    }
  }, [coffeeG, name, steps, totalDuration, waterG])

  const canSave = validation.issues.length === 0 && validation.events.length > 0

  const onSave = () => {
    if (!canSave) return
    const id = isEditMode && presetId ? presetId : `custom-${Date.now()}`
    const preset: BrewPreset = {
      id,
      name: name.trim(),
      coffeeG: validation.coffee,
      waterG: validation.water,
      ratioText: computedRatioText !== '--' ? computedRatioText : undefined,
      totalDurationMs: validation.totalMs,
      events: validation.events,
    }

    upsertCustomPreset(preset)
    navigate('/presets')
  }

  return (
    <div className="container">
      <div className="panel">
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <div className="muted" style={{ fontWeight: 800 }}>
              {isEditMode ? 'Edit preset' : 'Create preset'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 950, marginTop: 6 }}>
              {isEditMode ? 'Update custom recipe' : 'Custom recipe'}
            </div>
          </div>
          <button onClick={() => navigate('/presets')}>Back</button>
        </div>

        <div style={{ height: 16 }} />

        {loadError && (
          <>
            <div className="muted" style={{ color: '#fca5a5' }}>
              {loadError}
            </div>
            <div style={{ height: 10 }} />
          </>
        )}

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div className="muted" style={{ fontWeight: 800 }}>
              Name
            </div>
            <div style={{ height: 8 }} />
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid3">
            <div>
              <div className="muted" style={{ fontWeight: 800 }}>
                Coffee (g)
              </div>
              <div style={{ height: 8 }} />
              <input
                inputMode="numeric"
                value={coffeeG}
                onChange={(e) => setCoffeeG(e.target.value)}
              />
            </div>
            <div>
              <div className="muted" style={{ fontWeight: 800 }}>
                Water (g)
              </div>
              <div style={{ height: 8 }} />
              <input inputMode="numeric" value={waterG} onChange={(e) => setWaterG(e.target.value)} />
            </div>
            <div>
              <div className="muted" style={{ fontWeight: 800 }}>
                Ratio
              </div>
              <div style={{ height: 8 }} />
              <input value={computedRatioText} readOnly />
            </div>
          </div>

          <div>
            <div className="muted" style={{ fontWeight: 800 }}>
              Total duration (M:SS)
            </div>
            <div style={{ height: 8 }} />
            <input value={totalDuration} onChange={(e) => setTotalDuration(e.target.value)} />
          </div>
        </div>

        <div style={{ height: 16 }} />

        <div className="muted" style={{ fontWeight: 900 }}>
          Steps
        </div>
        <div style={{ height: 10 }} />

        <div style={{ display: 'grid', gap: 12 }}>
          {steps.map((s, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 16,
                padding: 12,
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div>
                <div className="stepGridTop">
                  <div>
                    <div className="muted" style={{ fontWeight: 800 }}>
                      Time
                    </div>
                    <div style={{ height: 6 }} />
                    <input
                      value={s.at}
                      onChange={(e) => {
                        const v = e.target.value
                        setSteps((prev) => prev.map((p, i) => (i === idx ? { ...p, at: v } : p)))
                      }}
                    />
                  </div>
                  <div>
                    <div className="muted" style={{ fontWeight: 800 }}>
                      Title
                    </div>
                    <div style={{ height: 6 }} />
                    <input
                      value={s.title}
                      onChange={(e) => {
                        const v = e.target.value
                        setSteps((prev) => prev.map((p, i) => (i === idx ? { ...p, title: v } : p)))
                      }}
                    />
                  </div>
                  <div>
                    <div className="muted" style={{ fontWeight: 800 }}>
                      Water (g)
                    </div>
                    <div style={{ height: 6 }} />
                    <input
                      inputMode="numeric"
                      value={s.waterToAddG}
                      onChange={(e) => {
                        const v = e.target.value
                        setSteps((prev) =>
                          prev.map((p, i) => (i === idx ? { ...p, waterToAddG: v } : p)),
                        )
                      }}
                    />
                  </div>
                </div>

                <div style={{ height: 10 }} />
                <div className="muted" style={{ fontWeight: 800 }}>
                  Instruction
                </div>
                <div style={{ height: 6 }} />
                <input
                  value={s.instruction}
                  onChange={(e) => {
                    const v = e.target.value
                    setSteps((prev) => prev.map((p, i) => (i === idx ? { ...p, instruction: v } : p)))
                  }}
                />

                <div style={{ height: 10 }} />
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <button
                    className="danger"
                    onClick={() => setSteps((prev) => prev.filter((_, i) => i !== idx))}
                    disabled={steps.length <= 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 12 }} />
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <button
            onClick={() =>
              setSteps((prev) => [
                ...prev,
                {
                  at: formatMsAsClock((prev.length ? parseClockToMs(prev[prev.length - 1].at) ?? 0 : 0) + 45000),
                  title: 'Step',
                  instruction: 'Add water.',
                  waterToAddG: '60',
                },
              ])
            }
          >
            Add step
          </button>

          <button className="primary" onClick={onSave} disabled={!canSave || !!loadError}>
            {isEditMode ? 'Update preset' : 'Save preset'}
          </button>
        </div>

        {validation.issues.length > 0 && (
          <>
            <div style={{ height: 12 }} />
            <div className="muted" style={{ lineHeight: 1.6 }}>
              {validation.issues.map((x, i) => (
                <div key={i}>- {x}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

