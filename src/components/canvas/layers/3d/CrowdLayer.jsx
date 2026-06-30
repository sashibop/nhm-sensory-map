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
  const outlineRef = useRef() // ⚠️ NEW: Ref for the outlines
  const shadowRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    if (!meshRef.current || !shadowRef.current || !outlineRef.current) return

    if (activeFloor !== targetFloor) {
      meshRef.current.count = 0
      outlineRef.current.count = 0
      shadowRef.current.count = 0
      return
    }

    const elapsedTime = state.clock.elapsedTime

    activeVisitors.forEach((visitor, i) => {
      const path = visitor.path
      const enterTime = path[0].time
      const exitTime = path[path.length - 1].time

      const rand = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1
      const baseScale = 0.85 + (rand * 0.3)

      if (timeOfDay < enterTime || timeOfDay > exitTime) {
        dummy.scale.set(0, 0, 0)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
        outlineRef.current.setMatrixAt(i, dummy.matrix)
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
        const currentY = THREE.MathUtils.lerp(startNode.y || 0, endNode.y || 0, easedProgress)
        const currentZ = THREE.MathUtils.lerp(startNode.z, endNode.z, easedProgress)

        const timeSinceSpawn = timeOfDay - enterTime
        let currentScale = baseScale
        if (timeSinceSpawn < 0.1) {
          const popProgress = timeSinceSpawn / 0.1
          currentScale = baseScale * (1 + Math.sin(popProgress * Math.PI) * 0.3)
        }

        const breath = Math.sin(elapsedTime * 2.5 + (rand * 10)) * 0.04

        // --- 1. UPDATE THE CORE SPHERE ---
        dummy.position.set(currentX, currentY + 0.7 + breath, currentZ)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.set(currentScale, currentScale, currentScale)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)

        // --- 2. UPDATE THE CRISP OUTLINE ---
        // ⚠️ NEW: Scale it up slightly to create a ring effect
        const outlineScale = currentScale * 1.15 
        dummy.scale.set(outlineScale, outlineScale, outlineScale)
        dummy.updateMatrix()
        outlineRef.current.setMatrixAt(i, dummy.matrix)

        // --- 3. UPDATE THE CONTACT SHADOW ---
        // ⚠️ NEW: Raised to 0.04 to prevent clipping with heatmaps at 0.02
        dummy.position.set(currentX, currentY + 0.04, currentZ)
        dummy.rotation.set(-Math.PI / 2, 0, 0)

        const shadowScale = (currentScale * 1.2) - (breath * 1.5)
        dummy.scale.set(shadowScale, shadowScale, shadowScale)

        dummy.updateMatrix()
        shadowRef.current.setMatrixAt(i, dummy.matrix)
      }
    })

    meshRef.current.count = activeVisitors.length
    meshRef.current.instanceMatrix.needsUpdate = true

    outlineRef.current.count = activeVisitors.length
    outlineRef.current.instanceMatrix.needsUpdate = true

    shadowRef.current.count = activeVisitors.length
    shadowRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {/* 1. THE DATA ORBS (Solid Core) */}
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

      {/* 1.5. THE CRISP OUTLINE RING */}
      <instancedMesh ref={outlineRef} args={[null, null, visitors.length]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        {/* THREE.BackSide means it only renders the inside of the sphere, 
            creating a perfect, cheap outline around the core */}
        <meshBasicMaterial
          color="#ffffff" 
          side={THREE.BackSide} 
        />
      </instancedMesh>

      {/* 2. THE GHOST UI CONTACT SHADOWS */}
      {/* ⚠️ NEW: renderOrder={5} ensures shadows draw on top of Noise (4) and Brightness (3) */}
      <instancedMesh ref={shadowRef} args={[null, null, visitors.length]} renderOrder={5}>
        <circleGeometry args={[0.2, 24]} />
        <meshBasicMaterial
          color="#000000" // Made strictly black
          transparent={true}
          opacity={0.3}   // Bumped up from 0.15 so it shows against bright heatmaps
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  )
}