import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import useAppStore from '../../../../store/useAppStore'

// Wall geometry helpers — mirrors the constants from FloorOne exactly
const floorH = 0.4
const h = 1.2
const intT = 0.25 // thickness of interior wall 
const extT = 0.6 // thickness of exterior wall 
const dwDbl = 3.0  // Major artery width, matches FloorOne

// ─── Sub-components ──────────────────────────────────────────────────────────

const DimWall = ({ x, z, w, d, rot = 0, mat }) => (
  <mesh position={[x, floorH + (h / 2), z]} rotation={[0, rot, 0]} castShadow receiveShadow>
    <boxGeometry args={[w, h, d]} />
    <primitive object={mat} attach="material" />
  </mesh>
)

const DimWallWithGap = ({ x, z, length, gapPos, gapWidth, rot = 0, mat }) => {
  const t = intT
  const w1Len = Math.max(0, gapPos - gapWidth / 2)
  const w2Len = Math.max(0, length - gapPos - gapWidth / 2)
  const w1Pos = -length / 2 + w1Len / 2
  const w2Pos = length / 2 - w2Len / 2

  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {w1Len > 0 && <DimWall x={w1Pos} z={0} w={w1Len} d={t} mat={mat} />}
      {w2Len > 0 && <DimWall x={w2Pos} z={0} w={w2Len} d={t} mat={mat} />}
    </group>
  )
}

// Floating dimension label rendered in world-space via R3F Html
const DimLabel = ({ x, z, text }) => (
  <Html center position={[x, floorH + h + 0.5, z]} zIndexRange={[200, 0]}>
    <div style={{
      background: 'rgba(6, 182, 212, 0.12)',
      border: '1px solid rgba(6, 182, 212, 0.7)',
      color: "#000000", //text color '#67e8f9',
      padding: '3px 8px',
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: '10px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      backdropFilter: 'blur(4px)',
      letterSpacing: '0.05em',
    }}>
      {text}
    </div>
  </Html>
)

// ─── Main Layer ───────────────────────────────────────────────────────────────

export default function DimensionLayerStatic({ targetFloor = 1 }) {
  const activeFloor = useAppStore((state) => state.activeFloor)

  // Material for the dimension-overlay wall — cyan/teal, transparent, emissive
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#06b6d4',
    emissive: '#0e7490',
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.45,
    roughness: 0.2,
    metalness: 0.4,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  }), [])

  // Gentle pulse: opacity oscillates so the wall reads as a data overlay, not real geometry
  useFrame(({ clock }) => {
    if (activeFloor !== targetFloor) return
    const t = clock.elapsedTime
    wallMat.opacity = 0.30 + Math.sin(t * 1.8) * 0.12
    wallMat.needsUpdate = true
  })

  // Don't render anything when this floor isn't active
  if (activeFloor !== targetFloor) return null

  return (
    <group renderOrder={10}>

      {/*
        The wall that only exists in the Dimension layer.
        Mirrors: <WallWithGap x={0} z={17.5} length={40} gapPos={5} gapWidth={dwDbl} rot={0} />
        from FloorOne, rendered as a semi-transparent overlay.
      */}

      {/* entry door*/ }
      <DimWall
        x={0}
        z={17.5}
        w={10}
        d={intT}
        rot = {0}
        mat={wallMat}
      />
      {/*first door to left wing */ }
      <DimWall
        x={-10}
        z={12}
        w={4}
        d={intT}
        rot = {1.55}
        mat={wallMat}
      />
      {/*second door to left wing */ }
      <DimWall
        x={-23}
        z={6}
        w={3}
        d={intT}
        rot = {0}
        mat={wallMat}
      />
  

      {/*exhibit to wall left wing */ }
      <DimWall
        x={-25}
        z={16.5}
        w={1.5}
        d={intT}
        rot = {1.55}
        mat={wallMat}
      />
     
      {/* Define all dimension labels for floor 1: */}
      {/* for entry door */}
      <DimLabel x={0}   z={17.5} text={`Doorway  ${dwDbl.toFixed(1)} m`} />
      <DimLabel x={-10}   z={12} text={`Doorway  ${1.5} m`} />{/* label first door left wing */}
      
      <DimLabel x={-15} z={17.5} text={`WALL  40 m`} /> {/* exterior wall front left wing */}

      <DimLabel x={-25} z={16.5} text={`0.5 m`} /> {/* exhibit to wall distance left wing */}

      {/* Subtle floor-level glow line tracing the entire wall span */}
      <mesh position={[0, floorH + 0.01, 17.5]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={11}>
        <planeGeometry args={[40, 0.08]} />
        <meshBasicMaterial
          color="#67e8f9"
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>

    </group>
  )
}
