import React, { useContext, useMemo } from 'react'
import { SoundContext } from '../App'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const sound = useContext(SoundContext)
  const navigate = useNavigate()

  const wakeLockSupported = useMemo(() => {
    return typeof (navigator as any).wakeLock?.request === 'function'
  }, [])

  if (!sound) return null

  return (
    <div className="container">
      <div className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="muted" style={{ fontWeight: 800 }}>
              Settings
            </div>
            <div style={{ fontSize: 22, fontWeight: 950, marginTop: 6 }}>
              Brew preferences
            </div>
          </div>
          <button onClick={() => navigate('/')}>Home</button>
        </div>

        <div style={{ height: 16 }} />

        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 900 }}>Sound cues</div>
              <div className="muted" style={{ marginTop: 4, lineHeight: 1.4 }}>
                Enabled by default for step transitions.
              </div>
            </div>
            <input
              type="checkbox"
              checked={sound.soundEnabled}
              onChange={(e) => sound.setSoundEnabled(e.target.checked)}
              style={{ width: 22, height: 22 }}
            />
          </label>

          <div className="muted" style={{ lineHeight: 1.5 }}>
            Screen wake lock: {wakeLockSupported ? 'supported' : 'not supported on this browser'}.
          </div>
        </div>
      </div>
    </div>
  )
}

