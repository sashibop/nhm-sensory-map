import { useEffect, useRef, useState, useCallback } from 'react'
import useAppStore from '../../../../store/useAppStore'
import { getDoors } from '../../../../data/mockDimensionsData'

const DOOR_THICKNESS    = 0.15
const DOOR_COLOR        = '#40E0D0'
const LINE_COLOR        = '#000000'
const LABEL_OFFSET_Z    = 2.5
const REVEAL_DURATION   = 3000
const FADE_DURATION     = 250   // ms — must match the CSS transition below
const HIT_BOX_PADDING_W = 0.6
const HIT_BOX_PADDING_H = 0.6

export default function DimensionsLayer2D({
  targetFloor = 1,
  mapScale    = 0.9,
  offsetX     = 0,
  offsetZ     = 0,
}) {
  const layers      = useAppStore((state) => state.layers)
  const activeFloor = useAppStore((state) => state.activeFloor)

  // revealOpacity drives the CSS transition for the auto-reveal animation (0 → 1 → 0)
  const [revealOpacity, setRevealOpacity] = useState(0)
  const [revealActive,  setRevealActive]  = useState(true)
  const [hoveredId,     setHoveredId]     = useState(null)
  const [pinnedIds,     setPinnedIds]     = useState(() => new Set())
  const revealTimer  = useRef(null)
  const fadeOutTimer = useRef(null)
  const rafRef       = useRef(null)

  useEffect(() => {
    // Fade IN: push opacity to 1 on the next frame so the CSS transition fires
    rafRef.current = requestAnimationFrame(() => setRevealOpacity(1))

    // After REVEAL_DURATION, begin fade OUT by dropping opacity back to 0
    revealTimer.current = setTimeout(() => {
      setRevealOpacity(0)

      // Once the fade-out transition completes, mark the reveal as fully done
      // so the hover/pin logic takes over clean with its own transition
      fadeOutTimer.current = setTimeout(
        () => setRevealActive(false),
        FADE_DURATION,
      )
    }, REVEAL_DURATION)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(revealTimer.current)
      clearTimeout(fadeOutTimer.current)
    }
  }, [])

  const togglePin = useCallback((id) => {
    setPinnedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const isActive = layers.dimensions && activeFloor === targetFloor
  if (!isActive) return null

  const doors = getDoors(targetFloor)
  if (!doors.length) return null

  const transformedDoors = doors.map((door) => {
    if (targetFloor === 1) {
      return {
        ...door,
        x1: door.x1 * mapScale + offsetX - 0.2,
        z1: door.z1 * mapScale + offsetZ - 1,
        x2: door.x2 * mapScale + offsetX - 0.2,
        z2: door.z2 * mapScale + offsetZ - 1,
      }
    } else if (targetFloor === 2) {
      return {
        ...door,
        x1: door.x1 * mapScale + offsetX + 0.4,
        z1: door.z1 * mapScale + offsetZ + 0.5,
        x2: door.x2 * mapScale + offsetX + 0.4,
        z2: door.z2 * mapScale + offsetZ + 0.5,
      }
    }
    return door
  })

  const doorGeometry = transformedDoors.map((door) => {
    const mx  = (door.x1 + door.x2) / 2
    const mz  = (door.z1 + door.z2) / 2
    const dx  = door.x2 - door.x1
    const dz  = door.z2 - door.z1
    const len = Math.sqrt(dx * dx + dz * dz)
    const angleDeg = Math.atan2(dx, dz) * (180 / Math.PI)
    const halfLen  = len / 2
    const halfT    = DOOR_THICKNESS / 2
    const labelZ   = mz - LABEL_OFFSET_Z

    const slabVisible = true

    // During the reveal phase the opacity is driven by revealOpacity (0→1→0).
    // After the reveal phase, hover and pin take over via a normal 0/1 opacity.
    const isHoveredOrPinned = hoveredId === door.id || pinnedIds.has(door.id)
    const labelOpacity = revealActive
      ? revealOpacity                          // animated reveal value
      : isHoveredOrPinned ? 1 : 0             // hover / pin value

    const hitW   = len + HIT_BOX_PADDING_W * 2
    const hitH   = DOOR_THICKNESS + HIT_BOX_PADDING_H * 2
    const labelW = 1.6
    const labelH = 0.88

    return {
      door, mx, mz, len, angleDeg, halfLen, halfT, labelZ,
      slabVisible, labelOpacity, hitW, hitH, labelW, labelH,
    }
  })

  // Transition string reused across elements
  const fadeTransition = `opacity ${FADE_DURATION}ms ease`

  return (
    <g style={{ pointerEvents: 'all' }}>
      {doorGeometry.map(({ door, mx, mz, len, angleDeg, halfLen, halfT, labelZ, labelOpacity, hitW, hitH }) => (
        <g key={door.id}>
          {/* Invisible hit area */}
          <rect
            x={mx - hitW / 2}
            y={mz - hitH / 2}
            width={hitW}
            height={hitH}
            fill="transparent"
            stroke="none"
            transform={`rotate(${angleDeg}, ${mx}, ${mz})`}
            style={{ cursor: pinnedIds.has(door.id) ? 'cell' : 'crosshair' }}
            onMouseEnter={() => setHoveredId(door.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => togglePin(door.id)}
          />

          {/* Door slab */}
          <rect
            x={mx - halfLen}
            y={mz - halfT}
            width={len}
            height={DOOR_THICKNESS}
            fill={DOOR_COLOR}
            opacity={0.85}
            transform={`rotate(${angleDeg}, ${mx}, ${mz})`}
            style={{ pointerEvents: 'none' }}
          />

          {/* Leader line */}
          <line
            x1={mx}  y1={mz}
            x2={mx}  y2={labelZ + 0.15}
            stroke={LINE_COLOR}
            strokeWidth={0.05}
            opacity={labelOpacity * 0.6}
            style={{ transition: fadeTransition, pointerEvents: 'none' }}
          />
        </g>
      ))}

      {/* Labels rendered in a second pass so they always sit on top */}
      {doorGeometry.map(({ door, mx, labelZ, labelOpacity, labelW, labelH }) => (
        <g
          key={`label-${door.id}`}
          opacity={labelOpacity}
          style={{ transition: fadeTransition, pointerEvents: 'none' }}
        >
          <rect
            x={mx - (labelW + 2.8) / 2}
            y={labelZ - (labelH + 0.3) / 2}
            width={labelW + 2.8}
            height={labelH + 0.3}
            rx={0.22}
            ry={0.22}
            fill="#0F1E37"
          />
          <text
            x={mx}
            y={labelZ}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={1}
            fontFamily="monospace"
            fontWeight="600"
            fill="#FFFFFF"
          >
            {door.labelLen.toFixed(2)} m
          </text>
        </g>
      ))}
    </g>
  )
}