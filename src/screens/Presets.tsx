import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteCustomPresetById, getAllPresets, isBuiltInPreset } from '../lib/presets'

export default function Presets() {
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

  return (
    <div className="container">
      <div className="panel">
        <h2 className="title">Presets / Recipes</h2>
        <p className="muted" style={{ marginTop: -6 }}>
          Pick a workflow. The timer will guide each step with cues.
        </p>

        <div style={{ height: 14 }} />

        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <button className="primary" onClick={() => navigate('/presets/new')}>
            Create preset
          </button>
          <button onClick={() => navigate('/')}>Back</button>
        </div>

        <div style={{ height: 14 }} />

        <div style={{ display: 'grid', gap: 12 }}>
          {presets.map((p) => (
            <div
              key={p.id}
              style={{
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 16,
                padding: 14,
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
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
                <div className="row" style={{ flexWrap: 'wrap' }}>
                  {!isBuiltInPreset(p.id) && (
                    <button onClick={() => navigate(`/presets/edit/${p.id}`)}>Edit</button>
                  )}
                  {!isBuiltInPreset(p.id) && (
                    <button
                      className="danger"
                      onClick={() => {
                        const ok = window.confirm(`Delete preset "${p.name}"?`)
                        if (!ok) return
                        deleteCustomPresetById(p.id)
                        setRefreshToken((x) => x + 1)
                      }}
                    >
                      Delete
                    </button>
                  )}
                  <button
                    className="primary"
                    onClick={() => navigate('/brew', { state: { presetId: p.id } })}
                  >
                    Start
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

