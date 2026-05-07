import React, { createContext, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './screens/Home'
import Presets from './screens/Presets'
import BrewTimer from './screens/BrewTimer'
import Results from './screens/Results'
import Settings from './screens/Settings'
import CreatePreset from './screens/CreatePreset'

export type SoundContextValue = {
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
}

export const SoundContext = createContext<SoundContextValue | null>(null)

export default function App() {
  const [soundEnabled, setSoundEnabledState] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem('ct_soundEnabled')
    if (raw === 'true') setSoundEnabledState(true)
    if (raw === 'false') setSoundEnabledState(false)
  }, [])

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled)
    localStorage.setItem('ct_soundEnabled', String(enabled))
  }

  const soundContext = useMemo<SoundContextValue>(
    () => ({ soundEnabled, setSoundEnabled }),
    [soundEnabled],
  )

  return (
    <SoundContext.Provider value={soundContext}>
      <div className="appRoot">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/presets" element={<Presets />} />
          <Route path="/presets/new" element={<CreatePreset />} />
          <Route path="/presets/edit/:presetId" element={<CreatePreset />} />
          <Route path="/brew" element={<BrewTimer />} />
          <Route path="/results" element={<Results />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </SoundContext.Provider>
  )
}

