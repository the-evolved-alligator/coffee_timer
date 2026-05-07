import React, { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { formatMsAsClock } from '../lib/format'
import { getPresetById } from '../lib/presets'

export default function Results() {
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as any
  const presetId = state?.presetId as string | undefined
  const preset = useMemo(() => getPresetById(presetId), [presetId])
  const elapsedMs = typeof state?.elapsedMs === 'number' ? (state.elapsedMs as number) : null

  useEffect(() => {
    if (elapsedMs == null) {
      navigate('/', { replace: true })
      return
    }
  }, [elapsedMs, navigate])

  if (elapsedMs == null) return null

  return (
    <div className="container">
      <div className="panel">
        <div className="muted" style={{ fontWeight: 800, letterSpacing: 0.2 }}>
          Results
        </div>
        <div style={{ fontSize: 24, fontWeight: 950, marginTop: 6 }}>
          {state?.presetName ?? preset.name}
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <div className="muted" style={{ fontWeight: 700 }}>
              Total time
            </div>
            <div style={{ fontSize: 42, fontWeight: 950 }}>{formatMsAsClock(elapsedMs)}</div>
          </div>

          <div className="muted" style={{ lineHeight: 1.5 }}>
            {preset.coffeeG != null && preset.waterG != null ? (
              <>
                {preset.coffeeG}g coffee / {preset.waterG}g water ({preset.ratioText})
              </>
            ) : (
              <>Default pulse workflow</>
            )}
          </div>
        </div>

        <div style={{ height: 20 }} />

        <div style={{ height: 14 }} />
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <button className="primary" onClick={() => navigate('/')}>
            Brew another
          </button>
          <button onClick={() => navigate('/presets')}>Browse presets</button>
        </div>
      </div>
    </div>
  )
}

