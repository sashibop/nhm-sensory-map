import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useAppStore from '../../../store/useAppStore'
import { visitors } from '../../../data/mockVisitorData'

export default function CrowdLayer({ targetFloor = 1 }) {
  const timeOfDay = useAppStore((state) => state.timeOfDay)
  const selectedDate = useAppStore((state) => state.selectedDate)
  const activeFloor = useAppStore((state) => state.activeFloor)
  
  const activeVisitors = useMemo(() => {
    const dayOfWeek = selectedDate.getDay()
    return visitors.filter(v => v.daysVisiting.includes(dayOfWeek) && v.floor === targetFloor)
  }, [selectedDate, targetFloor])

  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    if (!meshRef.current) return
    if (activeFloor !== targetFloor) {
      meshRef.current.count = 0
      return
    }

    activeVisitors.forEach((visitor, i) => {
      const path = visitor.path
      const enterTime = path[0].time
      const exitTime = path[path.length - 1].time

      if (timeOfDay < enterTime || timeOfDay > exitTime) {
        dummy.scale.set(0, 0, 0)
      } else {
        dummy.scale.set(1, 1, 1)
        
        let startIndex = 0
        for (let j = 0; j < path.length - 1; j++) {
          if (timeOfDay >= path[j].time && timeOfDay <= path[j+1].time) {
            startIndex = j
            break
          }
        }

        const startNode = path[startIndex]
        const endNode = path[startIndex + 1]

        const segmentDuration = endNode.time - startNode.time
        const progress = segmentDuration === 0 ? 1 : (timeOfDay - startNode.time) / segmentDuration

        // Add a subtle easing so they slow down slightly as they approach exhibits
        const easedProgress = THREE.MathUtils.smootherstep(progress, 0, 1)

        dummy.position.x = THREE.MathUtils.lerp(startNode.x, endNode.x, easedProgress)
        dummy.position.z = THREE.MathUtils.lerp(startNode.z, endNode.z, easedProgress)
        
        // Floor height is 0.4. Capsule total height is ~0.8. 
        // Placing Y at 0.8 rests them perfectly flat on the ground.
        dummy.position.y = 0.7
      }

      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    
    meshRef.current.count = activeVisitors.length
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, visitors.length]} castShadow receiveShadow>
      <sphereGeometry args={[0.2, 24, 24]} />
  
      <meshStandardMaterial 
        color="#f97316" 
        roughness={0.4} 
        metalness={0.1}
        emissive="#f97316"
        emissiveIntensity={0.2} /* Slight inner glow */
      />
    </instancedMesh>
  )
}