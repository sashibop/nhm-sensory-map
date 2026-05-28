import { Canvas } from '@react-three/fiber'
import WeekPicker from './components/ui/WeekPicker'
import LayerPanel from './components/ui/LayerPanel'
import Timeline from './components/ui/Timeline'
import Scene from './components/canvas/Scene'
import FloorSelector from './components/ui/FloorSelector'

import ViewToggle from './components/ui/ViewToggle'
import GlobalSettings from './components/ui/GlobalSettings'
import Disclaimer from './components/ui/Disclaimer'
import LayerLegend from './components/ui/LayerLegend'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* 1. 3D WebGL Layer (The Foundation) */}
      <Canvas gl={{ alpha: true }} camera={{ position: [0, 80, 80], fov: 45 }}>
          <Scene />
      </Canvas>
      
      {/* 2. The Vignette Layer (The "Tabletop" Frame) */}
      <div className="vignette-overlay" />
      
      {/* 3. The Ghost UI Layer (Floating above everything) */}
      <WeekPicker />
      <FloorSelector />
      <LayerPanel />
      <Timeline />
      
      <ViewToggle />
      <GlobalSettings />
      <Disclaimer />
    </div>
  )
}