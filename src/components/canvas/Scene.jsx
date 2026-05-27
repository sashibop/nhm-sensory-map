import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import Building from './Building'

export default function Scene() {
  const controlsRef = useRef()

  // 1. DEFINE YOUR PANNING BOUNDARIES
  // Adjust these limits to match the outer walls of your specific 3D model
  const bounds = {
    minX: -35,
    maxX: 35,
    minZ: -25,
    maxZ: 40,
  }

  // 2. THE CLAMPING ENGINE
  useFrame(() => {
    if (controlsRef.current) {
      const target = controlsRef.current.target

      // Clamp the X and Z axes so the user cannot pan outside the building
      target.x = THREE.MathUtils.clamp(target.x, bounds.minX, bounds.maxX)
      target.z = THREE.MathUtils.clamp(target.z, bounds.minZ, bounds.maxZ)
      
      // PRO TIP: Lock the Y-axis target to the floor. 
      // If users pan vertically, the camera swings wildly into the ceiling or underground.
      target.y = 0 
    }
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[20, 40, 20]} intensity={1.2} castShadow />
      <Environment preset="city" />

      <Suspense fallback={null}>
        <Building />
      </Suspense>

      <OrbitControls 
        ref={controlsRef} // Attach the reference here
        makeDefault 
        target={[-5, 0, -5]} 
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevents going below ground
        minDistance={20} 
        maxDistance={100} // Tweak this so they can't zoom out so far the museum becomes a dot
        
        // Optional but recommended for Digital Twins:
        // Adding some damping makes the panning and zooming feel weighty and premium
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  )
}