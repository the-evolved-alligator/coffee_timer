import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PRESETS } from '../lib/presets'

export default function Presets() {
  const navigate = useNavigate()

  return (
    <div className="container">
      <div className="panel">
        <h2 className="title">Presets / Recipes</h2>
        <p className="muted" style={{ marginTop: -6 }}>
          Pick a workflow. The timer will guide each step with cues.
        </p>

        <div style={{ height: 14 }} />

        <div style={{ display: 'grid', gap: 12 }}>
          {PRESETS.map((p) => (
            <div
              key={p.id}
              style={{
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 16,
                padding: 14,
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{p.name}</div>
                  <div className="muted" style={{ marginTop: 4 }}>
                    {p.coffeeG != null && p.waterG != null ? (
                      <>
                        {p.coffeeG}g coffee / {p.waterG}g water ({p.ratioText})
                      </>
                    ) : (
                      <>Step-based pulses</>
                    )}
                  </div>
                </div>
                <button
                  className="primary"
                  onClick={() => navigate('/brew', { state: { presetId: p.id } })}
                >
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 14 }} />
        <button onClick={() => navigate('/')}>Back</button>
      </div>
    </div>
  )
}

