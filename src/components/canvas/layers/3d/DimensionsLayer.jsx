import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import useAppStore from '../../../../store/useAppStore'
import { getDoors } from '../../../../data/mockDimensionsData'

const DOOR_HEIGHT    = 0.5
const DOOR_DEPTH     = 1.15
const DOOR_Y         = 2.03
const DOOR_THICKNESS = 0.15
const DOOR_VISUAL_H  = 1.05   // depth of door slab
const LABEL_LIFT     = 3.0
const DOOR_COLOR     = '#40E0D0' //'#0F1E37'
const LINE_COLOR     = '#000000'

// Hitbox padding around each door (world units)
const HITBOX_W_PAD = 0.4   // extra width on each side
const HITBOX_H_PAD = 0.6   // extra height on each side

// How long (ms) to show everything before switching to hover mode
const INTRO_DURATION_MS = 3000

// Pyramid dimensions (placed on the floor in front of each door)
const PYRAMID_BASE   = 0.65   // width/depth of the pyramid base
const PYRAMID_HEIGHT = 0.85   // height of the pyramid
// How far in front of the door centre the pyramid sits (along the door normal)
const PYRAMID_OFFSET = 0.
// Vertical position: sits on the floor (y = 0), apex points up
const PYRAMID_Y      = 2    // base flush with floor

export default function DimensionsLayer({ targetFloor = 1, geometry }) {
  const layers      = useAppStore((state) => state.layers)
  const activeFloor = useAppStore((state) => state.activeFloor)
  const groupRef    = useRef()
  const focusRef    = useRef(0)

  const [visible, setVisible]   = useState(false)
  const [opacity, setOpacity]   = useState(0)

  // intro phase: null = not started, true = in intro, false = hover mode
  const [introActive, setIntroActive] = useState(null)
  const introTimerRef = useRef(null)

  // which door is currently hovered (by id), null = none
  const [hoveredId, setHoveredId] = useState(null)

  // set of door ids that are "pinned" (clicked to stay visible)
  const [pinnedIds, setPinnedIds] = useState(new Set())

  const isActive = layers.dimensions && activeFloor === targetFloor

  // Start/reset intro whenever the layer becomes active
  useEffect(() => {
    if (isActive) {
      // Clear any running timer
      if (introTimerRef.current) clearTimeout(introTimerRef.current)
      setIntroActive(true)
      setHoveredId(null)
      setPinnedIds(new Set())
      introTimerRef.current = setTimeout(() => {
        setIntroActive(false)
      }, INTRO_DURATION_MS)
    } else {
      if (introTimerRef.current) clearTimeout(introTimerRef.current)
      setIntroActive(null)
      setHoveredId(null)
      setPinnedIds(new Set())
    }
    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current)
    }
  }, [isActive])

  useFrame((_, delta) => {
    focusRef.current = THREE.MathUtils.lerp(
      focusRef.current,
      isActive ? 1.0 : 0.0,
      delta * 4
    )
    const op = focusRef.current
    setVisible(op > 0.001)
    setOpacity(op)

    if (!groupRef.current) return
    groupRef.current.traverse((obj) => {
      if (obj.material && obj.userData.layerManaged) {
        obj.material.opacity     = op
        obj.material.transparent = true
        obj.material.needsUpdate = true
        obj.visible              = op > 0.001
      }
    })
  })

  const doors = useMemo(() => getDoors(targetFloor), [targetFloor])
  if (!doors.length) return null

  // Toggle pin state for a door
  const handlePyramidClick = useCallback((e, doorId) => {
    e.stopPropagation()
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(doorId)) {
        next.delete(doorId)
      } else {
        next.add(doorId)
      }
      return next
    })
  }, [])

  // Determines whether a specific door's decoration (line + label) is visible
  const isDoorShown = useCallback(
    (doorId) => {
      if (!visible) return false
      if (introActive) return true          // show all during intro
      if (introActive === null) return false // layer not active yet
      // hover mode: show if hovered OR pinned
      return hoveredId === doorId || pinnedIds.has(doorId)
    },
    [visible, introActive, hoveredId, pinnedIds]
  )

  return (
    <group ref={groupRef}>
      {doors.map((door) => {
        const mx    = (door.x1 + door.x2) / 2
        const mz    = (door.z1 + door.z2) / 2
        const dx    = door.x2 - door.x1
        const dz    = door.z2 - door.z1
        const len   = Math.sqrt(dx * dx + dz * dz)
        const angle = Math.atan2(dx, dz)

        const boxWidth  = len
        const boxHeight = DOOR_VISUAL_H
        const boxDepth  = DOOR_THICKNESS
        const boxY      = door.y ?? (DOOR_Y - boxHeight / 2)

        // Hitbox is larger than the door so it's easy to hover
        const hitW = boxWidth  + HITBOX_W_PAD * 2
        const hitH = boxHeight + HITBOX_H_PAD * 2

        const lineStart = new THREE.Vector3(mx, DOOR_Y + DOOR_HEIGHT, mz)
        const lineKnee  = new THREE.Vector3(mx, DOOR_Y + LABEL_LIFT,  mz)
        const labelPos  = new THREE.Vector3(mx, DOOR_Y + LABEL_LIFT + 0.1, mz)

        const shown   = isDoorShown(door.id)
        const isPinned = pinnedIds.has(door.id)

        // Pyramid sits on the floor, offset in front of the door along its normal.
        // The door normal (outward face) is perpendicular to (dx, dz), i.e. (-dz, dx) normalised.
        const nx = -dz / len 
        const nz =  dx / len
        const pyramidX = mx + nx * PYRAMID_OFFSET
        const pyramidZ = mz + nz * PYRAMID_OFFSET
        // Apex sits at PYRAMID_HEIGHT, base at 0 – the cone helper points up by default.
        const pyramidY = PYRAMID_Y + PYRAMID_HEIGHT / 2

        return (
          <group key={door.id}>
            {/* ── Invisible hitbox for hover detection ── */}
            <mesh
              position={[mx, boxY, mz]}
              rotation={[0, angle, 0]}
              onPointerEnter={(e) => {
                e.stopPropagation()
                setHoveredId(door.id)
              }}
              onPointerLeave={(e) => {
                e.stopPropagation()
                setHoveredId((prev) => (prev === door.id ? null : prev))
              }}
            >
              <boxGeometry args={[hitW, hitH, boxDepth + 0.3]} />
              <meshStandardMaterial
                transparent
                opacity={0}
                depthWrite={false}
              />
            </mesh>

            {/* ── Visible door slab — always shown when layer is visible ── */}
            {visible && (
              <mesh
                position={[mx, boxY, mz]}
                rotation={[0, angle, 0]}
                onClick={(e) => handlePyramidClick(e, door.id)}
                onPointerEnter={(e) => {
                  e.stopPropagation()
                  document.body.style.cursor = 'pointer'
                }}
                onPointerLeave={(e) => {
                  e.stopPropagation()
                  document.body.style.cursor = 'auto'
                }}
              >
                <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
                <meshStandardMaterial
                  color={DOOR_COLOR}
                  transparent
                  opacity={opacity}
                  emissive={isPinned ? DOOR_COLOR : '#000000'}
                  emissiveIntensity={isPinned ? 0.45 : 0}
                />
              </mesh>
            )}

            {/* ── Floor pyramid ── */}
            {/* {visible && (
              <mesh
                position={[pyramidX, pyramidY, pyramidZ]}
                rotation={[0, angle, 0]}
                onClick={(e) => handlePyramidClick(e, door.id)}
                onPointerEnter={(e) => {
                  e.stopPropagation()
                  document.body.style.cursor = 'pointer'
                }}
                onPointerLeave={(e) => {
                  e.stopPropagation()
                  document.body.style.cursor = 'auto'
                }}
              >
                <coneGeometry args={[PYRAMID_BASE, PYRAMID_HEIGHT, 4, 1]} />
                <meshStandardMaterial
                  color={DOOR_COLOR}
                  transparent
                  opacity={opacity}
                  emissive={isPinned ? DOOR_COLOR : '#000000'}
                  emissiveIntensity={isPinned ? 0.45 : 0}
                />
              </mesh>
            )}  */}

            {/* ── Leader line ── */}
            {shown && (
              <Line
                points={[lineStart, lineKnee]}
                color={LINE_COLOR}
                lineWidth={1}
                transparent
                opacity={opacity}
              />
            )}

            {/* ── Label ── */}
            {shown && (
              <Html
                position={labelPos.toArray()}
                center
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                <div
                  style={{
                    background:   'rgba(15, 30, 55, 0.82)',
                    color:        '#E3F2FD',
                    fontSize:     '11px',
                    fontFamily:   'monospace',
                    padding:      '2px 6px',
                    borderRadius: '4px',
                    border:       isPinned ? '1px solid #40E0D0' : '1px solid #4FC3F7',
                    whiteSpace:   'nowrap',
                    opacity,
                    transition:   'opacity 0.25s ease',
                  }}
                >
                  {isPinned ? ' ' : ''}{door.labelLen.toFixed(2)} m
                </div>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}
