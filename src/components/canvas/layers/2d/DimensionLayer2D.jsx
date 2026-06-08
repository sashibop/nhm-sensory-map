import useAppStore from '../../../../store/useAppStore'

/*
  Coordinate mapping: 3D world → 2D SVG viewBox="-35 -45 70 80"
  The 2D floor uses a top-down orthographic projection where:
    3D X → SVG x  (roughly 1:1 scale, centered at 0)
    3D Z → SVG y  (3D z=20 ≈ SVG y=20, but the floor spans z≈-35..20)
  
  Reference anchors confirmed from FloorOne2D geometry:
    3D (  0, _, 17.5) → SVG (  0,  17.5)   front wall
    3D (-10, _,  12 ) → SVG (-10,  12  )   first left-wing door
    3D (-23, _,   6 ) → SVG (-23,   6  )   second left-wing door
    3D (-25, _, 16.5) → SVG (-25,  16.5)   exhibit-to-wall gap
    3D (  0, _, -35 ) → SVG (  0, -35  )   back wall (viewBox top)

  Wall thickness: intT=0.25 in 3D → ~0.25 in SVG units (rendered as strokeWidth)
  Gap widths are preserved as-is.
*/

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
    @keyframes dimGlowPulse {
      0%,100% { opacity: 0.55; }
      50%      { opacity: 0.25; }
    }
  `
  document.head.appendChild(style)
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// Horizontal wall segment (rot=0 in 3D → horizontal line in 2D)
const DimWallH = ({ x, y, width, thickness = 0.25 }) => (
  <rect
    x={x - width / 2}
    y={y - thickness / 2}
    width={width}
    height={thickness}
    fill="#06b6d4"
    style={{ animation: 'dimPulse 1.75s ease-in-out infinite' }}
  />
)

// Vertical wall segment (rot≈π/2 in 3D → vertical line in 2D)
const DimWallV = ({ x, y, height, thickness = 0.25 }) => (
  <rect
    x={x - thickness / 2}
    y={y - height / 2}
    width={thickness}
    height={height}
    fill="#06b6d4"
    style={{ animation: 'dimPulse 1.75s ease-in-out infinite' }}
  />
)

// Dimension label — rendered as an SVG foreignObject for crisp text + backdrop
const DimLabel = ({ x, y, text }) => (
  <g>
    {/* label background */}
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

    {/* label text */}
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

// ─── Main Layer ───────────────────────────────────────────────────────────────

export default function DimensionLayer2D({ targetFloor = 1 }) {
  const activeFloor  = useAppStore((state) => state.activeFloor)
  const layers       = useAppStore((state) => state.layers)

  ensureKeyframes()

  if (activeFloor !== targetFloor) return null
  if (!layers?.dimensions) return null

  const dwDbl = 3.0 // major artery / entry doorway width — mirrors 3D constant

  return (
    <g id="dimension-layer-2d">

      {/* ── Doorway overlays ─────────────────────────────────────────────── */}
      {/*
        First door to left wing — 3D: DimWall x=-10 z=12 w=4 d=intT rot=1.55
        rot≈π/2 → vertical wall, length=4, centred on (-10, 12)
      */}
      <DimWallH x={-22.5} y={-5} width={5} />

      {/*
        Second door to left wing — 3D: DimWall x=-23 z=6 w=3 d=intT rot=0
        Horizontal wall, length=3, centred on (-23, 6)
      */}
      <DimWallH x={-22.5} y={-22.5} width={5} />


      {/* ── Dimension labels ─────────────────────────────────────────────── */}

      {/* First door left wing */}
      <DimLabel x={-22.5-4} y={-5}   text={`Doorway  1.5 m`} />

      {/* Front wall total span label — offset above/below the glow line */}
      <DimLabel x={-22.5-4} y={-22.5} text={`Doorway 1.5 m`} />
    </g>
  )
}