import { Canvas } from '@react-three/fiber'
import WeekPicker from './components/ui/WeekPicker'
import Announcements from './components/ui/Announcements'
import LayerPanel from './components/ui/LayerPanel'
import Timeline from './components/ui/Timeline'
import Scene from './components/canvas/Scene'
import { useState } from 'react' // Keep this here temporarily until we move Date to Zustand

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* 2D UI Layers */}
      <WeekPicker />
      <Announcements />
      
      {/* New UI Controls */}
      <LayerPanel />
      <Timeline />
      
      {/* 3D WebGL Layer */}
      <Canvas camera={{ position: [8, 5, 8], fov: 50 }}>
        <Scene selectedDate={selectedDate} />
      </Canvas>
      
    </div>
  )
}