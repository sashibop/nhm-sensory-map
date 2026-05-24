import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useAppStore from '../../../store/useAppStore'
import { visitors } from '../../../data/mockVisitorData'

export default function CrowdLayer() {
  const timeOfDay = useAppStore((state) => state.timeOfDay)
  const selectedDate = useAppStore((state) => state.selectedDate)
  
  // 1. Filter visitors: Who is actually in the museum on this specific day of the week?
  const visitorsToday = useMemo(() => {
    const dayOfWeek = selectedDate.getDay()
    return visitors.filter(v => v.daysVisiting.includes(dayOfWeek))
  }, [selectedDate])

  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // 2. The Render Loop: Complex Waypoint Interpolation
  useFrame(() => {
    if (!meshRef.current) return

    visitorsToday.forEach((visitor, i) => {
      const path = visitor.path
      const enterTime = path[0].time
      const exitTime = path[path.length - 1].time

      // If they haven't arrived yet, or have already left, hide them completely
      if (timeOfDay < enterTime || timeOfDay > exitTime) {
        dummy.scale.set(0, 0, 0)
      } else {
        // They are currently in the museum. Let's make them visible.
        dummy.scale.set(1, 1, 1)
        
        // Find exactly which segment of the path they are currently on
        let startIndex = 0
        for (let j = 0; j < path.length - 1; j++) {
          if (timeOfDay >= path[j].time && timeOfDay <= path[j+1].time) {
            startIndex = j
            break
          }
        }

        const startNode = path[startIndex]
        const endNode = path[startIndex + 1]

        // Calculate progress percentage strictly within this current segment
        const segmentDuration = endNode.time - startNode.time
        const progressInSegment = (timeOfDay - startNode.time) / segmentDuration

        // Lerp between the start and end of this specific segment
        dummy.position.x = THREE.MathUtils.lerp(startNode.x, endNode.x, progressInSegment)
        dummy.position.z = THREE.MathUtils.lerp(startNode.z, endNode.z, progressInSegment)
        
        // Spheres look best when resting exactly on the floor (radius = 0.2)
        dummy.position.y = 0.2 
      }

      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    
    // Crucial: Clear unused instances if the count drops (e.g. Wednesday has fewer visitors than Tuesday)
    // and tell Three.js to redraw the active ones.
    meshRef.current.count = visitorsToday.length
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, visitors.length]}>
      {/* Updated from cylinder to sphere */}
      <sphereGeometry args={[0.2, 16, 16]} />
      {/* Giving them a nice vibrant blue color that matches the timeline */}
      <meshStandardMaterial color="#3b82f6" roughness={0.4} />
    </instancedMesh>
  )
}