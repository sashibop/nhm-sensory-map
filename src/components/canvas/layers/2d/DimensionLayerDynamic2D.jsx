import { useState, useCallback } from "react"
import useAppStore from '../../../../store/useAppStore'

const ANIM_ID = 'dim-pulse-keyframes'

function ensureKeyframes() {
  if (typeof document === 'undefined') return
  if (document.getElementById(ANIM_ID)) return
  const style = document.createElement('style')
  style.id = ANIM_ID
  style.textContent = `
    @keyframes dimPulse {
      0%,100% { opacity: 0.42; }
      50%      { opacity: 0.18; }
    }
    @keyframes fadeInDim {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  `
  document.head.appendChild(style)
}

const DimWallH = ({ x, y, width, thickness = 0.25, visible }) => (
  <rect
    x={x - width / 2}
    y={y - thickness / 2}
    width={width}
    height={thickness}
    fill="#06b6d4"
    style={{
      animation: visible
        ? 'fadeInDim 0.18s ease-out, dimPulse 1.75s ease-in-out 0.18s infinite'
        : 'none',
      opacity: visible ? undefined : 0,
      transition: 'opacity 0.18s ease-out',
      pointerEvents: 'none',
    }}
  />
)

const DimLabel = ({ x, y, text, visible }) => (
  <g
    style={{
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.18s ease-out',
      pointerEvents: 'none',
    }}
  >
    <rect
      x={x}
      y={y}
      width={7.5}
      height={2}
      rx={0.3}
      fill="rgba(6, 182, 212, 0.12)"
      stroke="rgba(6, 182, 212, 0.7)"
      strokeWidth={0.1}
    />
    <text
      x={x + 0.5}
      y={y + 1.5}
      fill="#000"
      fontFamily="monospace"
      fontSize="1"
      fontWeight="bold"
    >
      {text}
    </text>
  </g>
)

// Invisible hover zone — a transparent rect wider/taller than the visible element
// HOVER_PAD controls how many SVG units around the element trigger visibility
const HOVER_PAD = 3

const DimHoverZone = ({ x, y, width, height, onEnter, onLeave }) => (
  <rect
    x={x - HOVER_PAD}
    y={y - HOVER_PAD}
    width={width + HOVER_PAD * 2}
    height={height + HOVER_PAD * 2}
    fill="transparent"
    stroke="none"
    style={{ cursor: 'crosshair' }}
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
  />
)

// ─── dimension item config ────────────────────────────────────────────────────
// Each item defines a wall, a label, and the hover zone that activates both.
const DIMENSION_ITEMS = [
  {
    id: 'door1',
    wall:  { x: -22.5, y: -5,    width: 5 },
    label: { x: -22.5 - 4, y: -5,   text: 'Doorway  1.5 m' },
    // hover zone centred on the wall + label area
    zone:  { x: -22.5 - 4 - 0.5, y: -5 - 1.5, width: 5 + 7.5 + 1, height: 4 },
  },
  {
    id: 'door2',
    wall:  { x: -22.5, y: -22.5, width: 5 },
    label: { x: -22.5 - 4, y: -22.5, text: 'Doorway 1.5 m' },
    zone:  { x: -22.5 - 4 - 0.5, y: -22.5 - 1.5, width: 5 + 7.5 + 1, height: 4 },
  },
]

// ─── Main Layer ───────────────────────────────────────────────────────────────

export default function DimensionLayerDynamic2D({ targetFloor = 2 }) {
  const activeFloor = useAppStore((state) => state.activeFloor)
  const layers      = useAppStore((state) => state.layers)

  const [hovered, setHovered] = useState({})

  const handleEnter = useCallback((id) => {
    setHovered((prev) => ({ ...prev, [id]: true }))
  }, [])

  const handleLeave = useCallback((id) => {
    setHovered((prev) => ({ ...prev, [id]: false }))
  }, [])

  ensureKeyframes()

  if (activeFloor !== targetFloor) return null
  if (!layers?.dimensions) return null

  return (
    <g id="dimension-layer-2d">
      {DIMENSION_ITEMS.map(({ id, wall, label, zone }) => {
        const visible = !!hovered[id]
        return (
          <g key={id}>
            {/* Visible elements (wall + label) — rendered below the hit zone */}
            <DimWallH {...wall} visible={visible} />
            <DimLabel {...label} visible={visible} />

            {/* Invisible hover zone — always on top to receive mouse events */}
            <DimHoverZone
              {...zone}
              onEnter={() => handleEnter(id)}
              onLeave={() => handleLeave(id)}
            />
          </g>
        )
      })}
    </g>
  )
}