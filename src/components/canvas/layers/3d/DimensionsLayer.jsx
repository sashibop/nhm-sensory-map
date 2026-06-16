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
const DOOR_COLOR     = '#40E0D0'
const LINE_COLOR     = '#000000'

// Hitbox padding around each door (world units)
const HITBOX_W_PAD = 0.4
const HITBOX_H_PAD = 0.6

// How long (ms) to show everything before switching to hover mode
const INTRO_DURATION_MS = 3000

// Lerp speed for per-door label/line fade (higher = faster)
const LABEL_FADE_SPEED = 6.5

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

  // Per-door label/line opacity: Map<doorId, number 0–1>
  // Stored in a ref so useFrame can mutate without re-renders.
  const doorOpacityRef = useRef({})

  // Mirror of doorOpacityRef that triggers re-renders for React elements (Html/Line).
  const [doorOpacities, setDoorOpacities] = useState({})

  const isActive = layers.dimensions && activeFloor === targetFloor

  // Start/reset intro whenever the layer becomes active
  useEffect(() => {
    if (isActive) {
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

  const doors = useMemo(() => getDoors(targetFloor), [targetFloor])

  useFrame((_, delta) => {
    // ── Layer-level opacity (existing logic) ──────────────────────────────
    focusRef.current = THREE.MathUtils.lerp(
      focusRef.current,
      isActive ? 1.0 : 0.0,
      delta * 4
    )
    const op = focusRef.current
    setVisible(op > 0.001)
    setOpacity(op)

    if (groupRef.current) {
      groupRef.current.traverse((obj) => {
        if (obj.material && obj.userData.layerManaged) {
          obj.material.opacity     = op
          obj.material.transparent = true
          obj.material.needsUpdate = true
          obj.visible              = op > 0.001
        }
      })
    }

    // ── Per-door label/line opacity ───────────────────────────────────────
    if (!doors.length) return

    // Read latest React state from refs to avoid stale closures in useFrame.
    // We pass the "should show" decision as a plain object keyed by door id.
    let anyChanged = false
    const prev = doorOpacityRef.current

    doors.forEach((door) => {
      const target = isDoorShownImmediate(
        door.id,
        op > 0.001,           // visible
        introActiveRef.current,
        hoveredIdRef.current,
        pinnedIdsRef.current
      )
        ? 1
        : 0

      const current = prev[door.id] ?? 0
      const next = THREE.MathUtils.lerp(current, target, delta * LABEL_FADE_SPEED)
      const snapped = Math.abs(next - current) < 0.001 ? target : next

      if (Math.abs(snapped - current) > 0.0005) {
        prev[door.id] = snapped
        anyChanged = true
      }
    })

    // Only trigger a re-render when values actually changed
    if (anyChanged) {
      setDoorOpacities({ ...prev })
    }
  })

  // ── Refs that mirror state so useFrame can read without stale closures ──
  const introActiveRef = useRef(introActive)
  const hoveredIdRef   = useRef(hoveredId)
  const pinnedIdsRef   = useRef(pinnedIds)

  useEffect(() => { introActiveRef.current = introActive }, [introActive])
  useEffect(() => { hoveredIdRef.current   = hoveredId   }, [hoveredId])
  useEffect(() => { pinnedIdsRef.current   = pinnedIds   }, [pinnedIds])

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

        const hitW = boxWidth  + HITBOX_W_PAD * 2
        const hitH = boxHeight + HITBOX_H_PAD * 2

        const lineStart = new THREE.Vector3(mx, DOOR_Y + DOOR_HEIGHT, mz)
        const lineKnee  = new THREE.Vector3(mx, DOOR_Y + LABEL_LIFT,  mz)
        const labelPos  = new THREE.Vector3(mx, DOOR_Y + LABEL_LIFT + 0.1, mz)

        const isPinned   = pinnedIds.has(door.id)

        // Per-door label opacity driven by useFrame lerp
        const labelOp = doorOpacities[door.id] ?? 0
        const labelVisible = labelOp > 0.005   // mount/unmount threshold

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
              onClick={(e) => handlePyramidClick(e, door.id)}
            >
              <boxGeometry args={[hitW, hitH, boxDepth + 0.3]} />
              <meshStandardMaterial
                transparent
                opacity={0}
                depthWrite={false}
                emissive={isPinned ? DOOR_COLOR : '#000000'}
                emissiveIntensity={isPinned ? 0.45 : 0}
              />
            </mesh>

            {/* ── Visible door slab ── */}
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

            {/* ── Leader line — fades per-door ── */}
            {labelVisible && (
              <Line
                points={[lineStart, lineKnee]}
                color={LINE_COLOR}
                lineWidth={1}
                transparent
                opacity={labelOp}
              />
            )}

            {/* ── Label — fades per-door ── */}
            {labelVisible && (
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
                    opacity:      labelOp,
                    transition:   'border-color 0.2s ease',
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

// ── Pure helper (no hooks) used inside useFrame ───────────────────────────────
// Mirrors the isDoorShown logic but reads from plain values, not state,
// so it's safe to call every frame without stale-closure issues.
function isDoorShownImmediate(doorId, visible, introActive, hoveredId, pinnedIds) {
  if (!visible) return false
  if (introActive) return true
  if (introActive === null) return false
  return hoveredId === doorId || pinnedIds.has(doorId)
}