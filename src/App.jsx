import { useEffect, useState } from 'react'
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
import IconAnalytics from './components/ui/IconAnalytics'

export default function App() {
  // 1. Pull BOTH activeView and activeFloor from the store
  const activeView = useAppStore((state) => state.activeView)
  const activeFloor = useAppStore((state) => state.activeFloor)
  const textSize = useAppStore((state) => state.settings.textSize)
  const highContrast = useAppStore((state) => state.settings.highContrast)


  /*const cursorSize = useAppStore((state) => state.settings.cursorSize)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })


    useEffect(() => {
      document.documentElement.style.setProperty(
        "--cursor-size",
        cursorSize / 100
      )
    }, [cursorSize])

    useEffect(() => {
    const move = (e) => {
      setMouse({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", move)

    return () => window.removeEventListener("mousemove", move)
  }, [])
*/
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--text-size',
      textSize / 100
    )
  }, [textSize])

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-contrast",
      highContrast ? "high" : "normal"
    )
  }, [highContrast])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* <div
        className="custom-cursor"
        style={{
          transform: `translate(${mouse.x}px, ${mouse.y}px)`
        }}
      />

      {/* 2. THE VIEWPORT ROUTER */}
      {activeView === '3D' ? (
        // The WebGL Engine
        <Canvas gl={{ alpha: true }} camera={{ position: [0, 80, 80], fov: 45 }}>
          <Scene />
        </Canvas>
      ) : (
        // The 2D Engine: Switch based on activeFloor
        <>
          {activeFloor === 1 && <FloorOne2D />}
          {activeFloor === 2 && <FloorTwo2D />}
        </>
      )}

      {/* 3. The Vignette Layer */}
      <div className="vignette-overlay" />

      {/* 4. The Ghost UI Layer */}
      <WeekPicker />
      <FloorSelector />
      <LayerPanel />
      <Timeline />

      <ViewToggle />
      <GlobalSettings />
      <Disclaimer />
      
      <IconAnalytics/>
      
    </div>
  )
}