import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllPresets } from '../lib/presets'

const MAX_HOME_PRESETS = 15

export default function Home() {
  const navigate = useNavigate()
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    const onChange = () => setRefreshToken((x) => x + 1)
    window.addEventListener('storage', onChange)
    window.addEventListener('ct_customPresets_changed', onChange as any)
    return () => {
      window.removeEventListener('storage', onChange)
      window.removeEventListener('ct_customPresets_changed', onChange as any)
    }
  }, [])

  const presets = useMemo(() => {
    void refreshToken
    return getAllPresets()
  }, [refreshToken])

  const homePresets = useMemo(() => presets.slice(0, MAX_HOME_PRESETS), [presets])

  return (
    <div className="container">
      <div className="panel">
        <h1 className="title" style={{ fontSize: 28, marginBottom: 6 }}>
          Coffee Timer
        </h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Precision-first brewing: clear steps, reliable timing.
        </p>

        <div style={{ height: 14 }} />

        <div className="muted" style={{ fontWeight: 800 }}>
          Preset
        </div>
        <div style={{ height: 10 }} />
        <div style={{ display: 'grid', gap: 10 }}>
          {homePresets.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate('/brew', { state: { presetId: p.id } })}
              style={{
                textAlign: 'left',
                padding: 14,
                borderRadius: 16,
                borderColor: 'rgba(96,165,250,0.35)',
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ fontWeight: 950, fontSize: 18 }}>{p.name}</div>
                <div className="muted" style={{ fontWeight: 900 }}>
                  Tap to start
                </div>
              </div>
              <div className="muted" style={{ marginTop: 6, lineHeight: 1.45 }}>
                {p.coffeeG != null && p.waterG != null ? (
                  <>
                    {p.coffeeG}g coffee / {p.waterG}g water ({p.ratioText})
                  </>
                ) : (
                  <>Step-based workflow</>
                )}
              </div>
            </button>
          ))}
        </div>

        {presets.length > MAX_HOME_PRESETS && (
          <>
            <div style={{ height: 10 }} />
            <div className="muted" style={{ fontSize: 13 }}>
              Showing first {MAX_HOME_PRESETS} recipes. Use “Browse Presets” to see all.
            </div>
          </>
        )}

        <div style={{ height: 14 }} />

        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/presets')}>Browse Presets</button>
          <button onClick={() => navigate('/settings')}>Settings</button>
        </div>

        <div style={{ height: 16 }} />
        <div className="muted" style={{ lineHeight: 1.5 }}>
          Quick start: V60 pulses every 45s, hard stop at 3:00.
        </div>
      </div>
    </div>
  )
}

