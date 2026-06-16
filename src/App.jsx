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

export default function App() {
  // 1. Pull BOTH activeView and activeFloor from the store
  const activeView = useAppStore((state) => state.activeView) 
  const activeFloor = useAppStore((state) => state.activeFloor)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* 2. THE VIEWPORT ROUTER */}
      {activeView === '3D' ? (
        // The WebGL Engine
        <Canvas gl={{ alpha: true, preserveDrawingBuffer: true }} camera={{ position: [0, 80, 80], fov: 50 }}>
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
      <Timeline />

      <LayerPanel />
      <FloorSelector />
      
      <ViewToggle />
      <GlobalSettings />

      <LayerLegend />
      <Disclaimer />
    </div>
  )
}