import { useEffect, useRef, useState, useCallback } from 'react'
import useAppStore from '../../../../store/useAppStore'
import { getDoors } from '../../../../data/mockDimensionsData'

const DOOR_THICKNESS    = 0.15
const DOOR_COLOR        = '#40E0D0'
const LINE_COLOR        = '#000000'
const LABEL_OFFSET_Z    = 2.5
const REVEAL_DURATION   = 3000
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

  const [revealActive, setRevealActive] = useState(true)
  const [hoveredId,    setHoveredId]    = useState(null)
  const [pinnedIds,    setPinnedIds]    = useState(() => new Set())  // ← NEW
  const revealTimer = useRef(null)

  useEffect(() => {
    revealTimer.current = setTimeout(() => setRevealActive(false), REVEAL_DURATION)
    return () => clearTimeout(revealTimer.current)
  }, [])

  const togglePin = useCallback((id) => {   // ← NEW
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

    const slabVisible  = true
    const labelVisible = revealActive || hoveredId === door.id || pinnedIds.has(door.id)  // ← UPDATED

    const hitW  = len + HIT_BOX_PADDING_W * 2
    const hitH  = DOOR_THICKNESS + HIT_BOX_PADDING_H * 2
    const labelW = 1.6
    const labelH = 0.88

    return { door, mx, mz, len, angleDeg, halfLen, halfT, labelZ, slabVisible, labelVisible, hitW, hitH, labelW, labelH }
  })

  return (
    <g style={{ pointerEvents: 'all' }}>
      {doorGeometry.map(({ door, mx, mz, len, angleDeg, halfLen, halfT, labelZ, labelVisible, hitW, hitH }) => (
        <g key={door.id}>
          <rect
            x={mx - hitW / 2}
            y={mz - hitH / 2}
            width={hitW}
            height={hitH}
            fill="transparent"
            stroke="none"
            transform={`rotate(${angleDeg}, ${mx}, ${mz})`}
            style={{ cursor: pinnedIds.has(door.id) ? 'cell' : 'crosshair' }}  // ← UPDATED cursor
            onMouseEnter={() => setHoveredId(door.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => togglePin(door.id)}  // ← NEW
          />

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

          <line
            x1={mx}  y1={mz}
            x2={mx}  y2={labelZ + 0.15}
            stroke={LINE_COLOR}
            strokeWidth={0.05}
            opacity={labelVisible ? 0.6 : 0}
            style={{ transition: 'opacity 0.25s ease', pointerEvents: 'none' }}
          />
        </g>
      ))}

      {doorGeometry.map(({ door, mx, labelZ, labelVisible, labelW, labelH }) => (
        <g
          key={`label-${door.id}`}
          opacity={labelVisible ? 1 : 0}
          style={{ transition: 'opacity 0.25s ease', pointerEvents: 'none' }}
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