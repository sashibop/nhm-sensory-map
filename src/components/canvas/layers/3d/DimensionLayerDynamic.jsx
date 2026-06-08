// layers/3d/DimensionLayerDynamic.jsx
import * as THREE from 'three'
import { useMemo, useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import useAppStore from '../../../../store/useAppStore'

// ─── Shared constants (mirror FloorTwo geometry) ─────────────────────────────
const floorH = 0.4
const h      = 1.2
const intT   = 0.25
const extT   = 0.6
const dwDbl  = 3.0


const hitDepth = 4.0
// ─── Sub-components ──────────────────────────────────────────────────────────

const DimWall = ({ x, z, w, d, rot = 0, mat }) => (
  <mesh
    position={[x, floorH + h / 2, z]}
    rotation={[0, rot, 0]}
    castShadow
    receiveShadow
  >
    <boxGeometry args={[w, h, d]} />
    <primitive object={mat} attach="material" />
  </mesh>
)

const DimLabel = ({ x, z, text }) => (
  <Html center position={[x, floorH + h + 0.5, z]} zIndexRange={[200, 0]}>
    <div style={{
      background: 'rgba(6, 182, 212, 0.12)',
      border: '1px solid rgba(6, 182, 212, 0.7)',
      color: '#000000',
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

// Invisible plane that acts as a hover hit area.
// `size` = [width, depth] in world units; add a generous padding so the target
// isn't pixel-thin. The mesh is fully transparent but still raycast-able.
const HitPlane = ({ x, z, size, rot = 0, onEnter, onLeave }) => {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  return (
    <mesh
      position={[x, floorH + h / 2, z]}
      rotation={[0, rot, 0]}
      onPointerEnter={(e) => { e.stopPropagation(); onEnter() }}
      onPointerLeave={(e) => { e.stopPropagation(); onLeave() }}
    >
      {/* inflate hit area: wall length × generous depth × full height */}
      <boxGeometry args={[size[0], h, size[1]]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

// ─── Wall definitions for floor 2 ────────────────────────────────────────────
// Edit these to match your actual FloorTwo geometry.
// Each entry drives one HitPlane + one DimWall + one DimLabel.
const FLOOR2_WALLS = [
  {
    id: 'entry-door',
    // Wall visual
    wx: 0,    wz: 17.5, ww: 10,  wd: intT, wRot: 0,
    // Label
    lx: 0,    lz: 17.5, label: `Doorway  ${dwDbl.toFixed(1)} m`,
    // Hit area (generous depth so it's easy to hover)
    hx: 0,    hz: 17.5, hw: 10,  hd: hitDepth,  hRot: 0,
  },
  {
    id: 'left-wing-door-one',
    wx: -10,  wz: 12,   ww: 4,   wd: intT, wRot: 1.55,
    lx: -10,  lz: 12,   label: 'Doorway  1 m',
    hx: -10,  hz: 12,   hw: 4,   hd: hitDepth,  hRot: 1.55,
  },
  {
    id: 'left-wing-door-two',
    wx: -18,  wz: 12,   ww: 4,   wd: intT, wRot: 1.55,
    lx: -18,  lz: 12,   label: 'Doorway  0.9 m',
    hx: -18,  hz: 12,   hw: 4,   hd: hitDepth,  hRot: 1.55,
  },
  {
    id: 'left-wing-door-three',
    wx: -23,  wz: 6,   ww: 4,   wd: intT, wRot: 0,
    lx: -23,  lz: 6,   label: 'Doorway  1.2 m',
    hx: -23,  hz: 6,   hw: 4,   hd: hitDepth,  hRot: 0,
  },
  {
    id: 'exterior-front',
    // No DimWall for this one — label-only entry.
    // Set ww:0 to skip rendering the wall mesh while still showing the label.
    wx: -15,  wz: 17.5, ww: 0,   wd: intT, wRot: 0,
    lx: -15,  lz: 17.5, label: 'WALL  40 m',
    hx: -15,  hz: 17.5, hw: 8,   hd: hitDepth,  hRot: 0,
  },
  {
    id: 'exhibit-gap',
    wx: -27,  wz: 12, ww: 1.5, wd: intT, wRot: 0,
    lx: -27,  lz: 12, label: '0.1 m',
    hx: -27,  hz: 12, hw: 2.5, hd: hitDepth,  hRot: 0,
  },
  // ── Add more floor-2-specific walls below ────────────────────────────────
  // {
  //   id: 'corridor-north',
  //   wx: 5, wz: 8, ww: 12, wd: intT, wRot: 0,
  //   lx: 5, lz: 8, label: 'Corridor  12 m',
  //   hx: 5, hz: 8, hw: 12, hd: 2.0, hRot: 0,
  // },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function DimensionLayerDynamic({ targetFloor = 2 }) {
  const activeFloor = useAppStore((state) => state.activeFloor)

  // Track which wall ids are currently hovered
  const [hoveredWalls, setHoveredWalls] = useState(() => new Set())

  const enter = useCallback((id) => {
    setHoveredWalls((prev) => new Set([...prev, id]))
  }, [])

  const leave = useCallback((id) => {
    setHoveredWalls((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  // Shared cyan wall material — same visual language as the static layer
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

  // Pulse animation — only runs while this floor is active
  useFrame(({ clock }) => {
    if (activeFloor !== targetFloor) return
    wallMat.opacity = 0.30 + Math.sin(clock.elapsedTime * 1.8) * 0.12
    wallMat.needsUpdate = true
  })

  if (activeFloor !== targetFloor) return null

  return (
    <group renderOrder={10}>
      {FLOOR2_WALLS.map((w) => {
        const isHovered = hoveredWalls.has(w.id)
        return (
          <group key={w.id}>
            {/* Always-present hit area */}
            <HitPlane
              x={w.hx} z={w.hz}
              size={[w.hw, w.hd]}
              rot={w.hRot}
              onEnter={() => enter(w.id)}
              onLeave={() => leave(w.id)}
            />

            {/* Wall mesh — only when hovered and has non-zero width */}
            {isHovered && w.ww > 0 && (
              <DimWall
                x={w.wx} z={w.wz}
                w={w.ww} d={w.wd}
                rot={w.wRot}
                mat={wallMat}
              />
            )}

            {/* Label — only when hovered */}
            {isHovered && (
              <DimLabel x={w.lx} z={w.lz} text={w.label} />
            )}
          </group>
        )
      })}

      {/* Optional: floor glow line when any wall is hovered */}
      {hoveredWalls.size > 0 && (
        <mesh
          position={[0, floorH + 0.01, 17.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={11}
        >
          <planeGeometry args={[40, 0.08]} />
          <meshBasicMaterial
            color="#67e8f9"
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}