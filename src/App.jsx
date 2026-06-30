import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'

import useAppStore from './store/useAppStore'

import WeekPicker from './components/ui/WeekPicker'
import LayerPanel from './components/ui/LayerPanel'
import Timeline from './components/ui/Timeline'
import Scene from './components/canvas/Scene'
import FloorSelector from './components/ui/FloorSelector'
import ViewToggle from './components/ui/ViewToggle'
import GlobalSettings from './components/ui/GlobalSettings'
import Disclaimer from './components/ui/Disclaimer'
import LayerLegend from './components/ui/LayerLegend'
import FloorOne2D from './components/canvas/model/2d/FloorOne2D'
import FloorTwo2D from './components/canvas/model/2d/FloorTwo2D'
import AnalyticsSidePanel from './components/ui/AnalyticsSidePanel'

const PANEL_WIDTH = 340

export default function App() {
  const activeView = useAppStore((s) => s.activeView)
  const activeFloor = useAppStore((s) => s.activeFloor)
  const textSize = useAppStore((s) => s.settings.textSize)
  const highContrast = useAppStore((s) => s.settings.highContrast)
  const isPanelOpen = useAppStore((s) => s.isPanelOpen)

  useEffect(() => {
    document.documentElement.style.setProperty('--text-size', textSize / 100)
  }, [textSize])

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-contrast',
      highContrast ? 'high' : 'normal'
    )
  }, [highContrast])

  return (
  <div style={{
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    position: 'relative',
  }}>

    {/* LEFT: APP AREA */}
    <main style={{
      flex: 1,
      minWidth: 0,
      height: '100vh',
      position: 'relative',
      transition: 'flex-basis 0.35s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {activeView === '3D' ? (
        <Canvas gl={{ alpha: true, preserveDrawingBuffer: true }} camera={{ position: [0, 80, 80], fov: 50 }}>
          <Scene />
        </Canvas>
      ) : (
        <>
          {activeFloor === 1 && <FloorOne2D />}
          {activeFloor === 2 && <FloorTwo2D />}
        </>
      )}

      <div className="vignette-overlay" />

      <WeekPicker />
      <Timeline />
      <LayerPanel />
      <FloorSelector />
      <ViewToggle />
      <GlobalSettings />
      <LayerLegend />
      <Disclaimer />
    </main>

    {/* RIGHT: PANEL */}
    <div style={{
      width: isPanelOpen ? PANEL_WIDTH : 0,
      flexShrink: 0,
      overflow: 'hidden',
      height: '100vh',
      transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <AnalyticsSidePanel />
    </div>

  </div>
)
}