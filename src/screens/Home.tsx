import React from 'react'
import { useNavigate } from 'react-router-dom'

const DEFAULT_PRESET_ID = 'v60'

export default function Home() {
  const navigate = useNavigate()

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

        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <button
            className="primary"
            onClick={() => navigate('/brew', { state: { presetId: DEFAULT_PRESET_ID } })}
          >
            Start Timer
          </button>
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

