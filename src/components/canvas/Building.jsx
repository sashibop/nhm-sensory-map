import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useAppStore from '../../store/useAppStore'
import Floor from './model/3d/Floor' 

export default function Building() {
  const activeFloor = useAppStore((state) => state.activeFloor)
  
  // Capture the starting floor exactly ONCE when the app loads
  const [initialFloor] = useState(activeFloor) 
  
  const groupRef = useRef()
  const floor1Ref = useRef()
  const floor2Ref = useRef()

  const f1Focus = useRef(activeFloor === 1 ? 1 : 0)
  const f2Focus = useRef(activeFloor === 2 ? 1 : 0)

  const [spinVelocity, setSpinVelocity] = useState(2.5) 

  useFrame((state, delta) => {
    // Initial entrance spin
    if (spinVelocity > 0.001) {
      setSpinVelocity((prev) => THREE.MathUtils.lerp(prev, 0, delta * 3.5))
      groupRef.current.rotation.y += spinVelocity * delta
    }

    // Floor sliding and fading animation
    if (floor1Ref.current && floor2Ref.current) {
      const t1Y = activeFloor === 1 ? 0 : -110
      const t2Y = activeFloor === 2 ? 0 : 110
      const t1F = activeFloor === 1 ? 1 : 0
      const t2F = activeFloor === 2 ? 1 : 0

      // Slightly slower speed so the sliding looks cinematic
      const speed = delta * 4 

      // Slide
      floor1Ref.current.position.y = THREE.MathUtils.lerp(floor1Ref.current.position.y, t1Y, speed)
      floor2Ref.current.position.y = THREE.MathUtils.lerp(floor2Ref.current.position.y, t2Y, speed)

      // Fade
      f1Focus.current = THREE.MathUtils.lerp(f1Focus.current, t1F, speed)
      f2Focus.current = THREE.MathUtils.lerp(f2Focus.current, t2F, speed)
    }
  })

  return (
    <group ref={groupRef}>
      
      {/* FLOOR 1 */}
      <group ref={floor1Ref} position={[0, initialFloor === 1 ? 0 : -80, 0]}>
        <Floor 
          level={1} 
          isActive={activeFloor === 1} 
          focusRef={f1Focus} 
        />
      </group>

      {/* FLOOR 2 */}
      <group ref={floor2Ref} position={[0, initialFloor === 2 ? 0 : 80, 0]}>
        <Floor 
          level={2} 
          isActive={activeFloor === 2} 
          focusRef={f2Focus} 
        />
      </group>

    </group>
  )
}