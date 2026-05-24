import { Suspense } from 'react'
import { OrbitControls, Environment } from '@react-three/drei'
import Building from './Building'

export default function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[20, 40, 20]} intensity={1.2} castShadow />
      <Environment preset="city" />

      <Suspense fallback={null}>
        {/* Removed <Center> so the architectural X=0 stays perfectly aligned */}
        <Building />
      </Suspense>

      <OrbitControls 
        makeDefault 
        // Focus the camera perfectly down the X-axis, slightly pushed back on the Z-axis
        target={[-5, 0, -5]} 
        maxPolarAngle={Math.PI / 2 - 0.05} 
        minDistance={5} 
        maxDistance={100} 
      />
    </>
  )
}