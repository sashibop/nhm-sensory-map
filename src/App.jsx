import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei' 
import useAppStore from './store/useAppStore' 

import WeekPicker from './components/ui/WeekPicker'
import LayerPanel from './components/ui/LayerPanel'
import Timeline from './components/ui/Timeline'
import Scene from './components/canvas/Scene'
import ExploreScene from './components/canvas/ExploreScene' 
import FloorSelector from './components/ui/FloorSelector'

import ViewToggle from './components/ui/ViewToggle'
import GlobalSettings from './components/ui/GlobalSettings'
import Disclaimer from './components/ui/Disclaimer'
import LayerLegend from './components/ui/LayerLegend'
import FloorOne2D from './components/canvas/model/2d/FloorOne2D'
import FloorTwo2D from './components/canvas/model/2d/FloorTwo2D'

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['Shift'] },
]

export default function App() {
  const activeView = useAppStore((state) => state.activeView) 
  const activeFloor = useAppStore((state) => state.activeFloor)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* THE VIEWPORT ROUTER */}
      {activeView === '3D' && (
        <Canvas gl={{ alpha: true }} camera={{ position: [0, 80, 80], fov: 50 }}>
          <Scene />
        </Canvas>
      )}

      {/* NEW EXPLORE MODE */}
      {activeView === 'EXPLORE' && (
        <KeyboardControls map={keyboardMap}>
          <Canvas shadows gl={{ alpha: true }}>
            <ExploreScene />
          </Canvas>
        </KeyboardControls>
      )}

      {activeView === '2D' && (
        <>
          {activeFloor === 1 && <FloorOne2D />}
          {activeFloor === 2 && <FloorTwo2D />}
        </>
      )}
      
      <div className="vignette-overlay" />
      
      <WeekPicker />
      <FloorSelector />
      <LayerPanel />
      <Timeline />
      
      <ViewToggle />
      <GlobalSettings />
      <LayerLegend />
      <Disclaimer />
    </div>
  )
}