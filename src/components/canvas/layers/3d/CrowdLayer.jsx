import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useAppStore from '../../../../store/useAppStore'
import { visitors } from '../../../../data/mockVisitorData'

export default function CrowdLayer({ targetFloor = 1 }) {

  const timeOfDay = useAppStore((state) => state.timeOfDay)
  const selectedDate = useAppStore((state) => state.selectedDate)
  const activeFloor = useAppStore((state) => state.activeFloor)

  const activeVisitors = useMemo(() => {
    const dayOfWeek = selectedDate.getDay()
    return visitors.filter(v => v.daysVisiting.includes(dayOfWeek) && v.floor === targetFloor)
  }, [selectedDate, targetFloor])

  const meshRef = useRef()
  const shadowRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    if (!meshRef.current || !shadowRef.current) return

    if (activeFloor !== targetFloor) {
      meshRef.current.count = 0
      shadowRef.current.count = 0
      return
    }

    const elapsedTime = state.clock.elapsedTime

    activeVisitors.forEach((visitor, i) => {
      const path = visitor.path
      const enterTime = path[0].time
      const exitTime = path[path.length - 1].time

      // 1. ORGANIC VARIATION: Deterministic random base size per visitor
      const rand = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1
      const baseScale = 0.85 + (rand * 0.3) // Range: 0.85x to 1.15x

      if (timeOfDay < enterTime || timeOfDay > exitTime) {
        dummy.scale.set(0, 0, 0)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
        shadowRef.current.setMatrixAt(i, dummy.matrix)
      } else {
        let startIndex = 0
        for (let j = 0; j < path.length - 1; j++) {
          if (timeOfDay >= path[j].time && timeOfDay <= path[j + 1].time) {
            startIndex = j
            break
          }
        }

        const startNode = path[startIndex]
        const endNode = path[startIndex + 1]

        const segmentDuration = endNode.time - startNode.time
        const progress = segmentDuration === 0 ? 1 : (timeOfDay - startNode.time) / segmentDuration
        const easedProgress = THREE.MathUtils.smootherstep(progress, 0, 1)

        const currentX = THREE.MathUtils.lerp(startNode.x, endNode.x, easedProgress)
        // ⚠️ NEW: Calculate exact elevation!
        const currentY = THREE.MathUtils.lerp(startNode.y || 0, endNode.y || 0, easedProgress)
        const currentZ = THREE.MathUtils.lerp(startNode.z, endNode.z, easedProgress)

        // 2. ARRIVAL OVERSHOOT: Springy pop-in when they first spawn
        const timeSinceSpawn = timeOfDay - enterTime
        let currentScale = baseScale
        if (timeSinceSpawn < 0.1) {
          const popProgress = timeSinceSpawn / 0.1
          currentScale = baseScale * (1 + Math.sin(popProgress * Math.PI) * 0.3)
        }

        // 3. THE BREATH: Gentle, randomized bobbing
        const breath = Math.sin(elapsedTime * 2.5 + (rand * 10)) * 0.04

        // --- UPDATE THE SOLID ORANGE SPHERE ---
        // ⚠️ NEW: Anchor 1 unit above their current exact floor height
        dummy.position.set(currentX, currentY + 0.7 + breath, currentZ)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.set(currentScale, currentScale, currentScale)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)

        // --- UPDATE THE CONTACT SHADOW ---
        // ⚠️ NEW: Hug the floor exactly 0.02 units above currentY to prevent clipping
        dummy.position.set(currentX, currentY + 0.02, currentZ)
        dummy.rotation.set(-Math.PI / 2, 0, 0)

        // Shadow dynamically scales with the visitor's size, and shrinks slightly as they bob up
        const shadowScale = (currentScale * 1.2) - (breath * 1.5)
        dummy.scale.set(shadowScale, shadowScale, shadowScale)

        dummy.updateMatrix()
        shadowRef.current.setMatrixAt(i, dummy.matrix)
      }
    })

    meshRef.current.count = activeVisitors.length
    meshRef.current.instanceMatrix.needsUpdate = true

    shadowRef.current.count = activeVisitors.length
    shadowRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {/* 1. THE DATA ORBS (Original Physical Texture) */}
      <instancedMesh ref={meshRef} args={[null, null, visitors.length]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial
          color="#f97316"
          roughness={0.4}
          metalness={0.1}
          emissive="#f97316"
          emissiveIntensity={0.2}
        />
      </instancedMesh>

      {/* 2. THE GHOST UI CONTACT SHADOWS */}
      <instancedMesh ref={shadowRef} args={[null, null, visitors.length]}>
        <circleGeometry args={[0.2, 24]} />
        <meshBasicMaterial
          color="#09090b"
          transparent={true}
          opacity={0.15}
          depthWrite={false}
          polygonOffset={true}
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </instancedMesh>
    </group>
  )
}