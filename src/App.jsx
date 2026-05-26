import { Canvas } from '@react-three/fiber'
import WeekPicker from './components/ui/WeekPicker'
import Announcements from './components/ui/Announcements'
import LayerPanel from './components/ui/LayerPanel'
import Timeline from './components/ui/Timeline'
import Scene from './components/canvas/Scene'
import FloorSelector from './components/ui/FloorSelector'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* 2D UI Layers */}
      <WeekPicker />
      
      {/* New UI Controls */}
      <FloorSelector />
      <LayerPanel />
      <Timeline />
      
      {/* 3D WebGL Layer - Adjusted for massive scale */}
      <Canvas camera={{ position: [0, 80, 80], fov: 45 }}>
        <Scene />
      </Canvas>
      
    </div>
  )
}