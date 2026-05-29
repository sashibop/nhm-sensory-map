import useAppStore from '../../../../store/useAppStore'
import CrowdLayer2D from '../../layers/2d/CrowdLayer2D'
import NoiseLayer2D from '../../layers/2d/NoiseLayer2D'

export default function FloorOne2D() {
  const layers = useAppStore((state) => state.layers)

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#f4f4f5' 
    }}>
      <svg 
        viewBox="-35 -45 70 80" 
        style={{ width: '100%', maxWidth: '850px', height: 'auto', overflow: 'visible' }}
      >

        <defs>
          <clipPath id="museum-floor-mask">
            <path d="
            M -29 -35 
            L -16 -35 
            L -16 5 
            L -9.1 5 
            L -9.1 -10 
            A 5 5 0 0 1 9.5 -10
            L 9.5 -10
            L 9.5 5 
            L 16 5 
            L 16 -35 
            L 30 -35 
            L 30 20 
            L -29 20 
            " />
          </clipPath>
        </defs>
        
        <g id="ground-floor-geometry">
          <path d="
          M -29 -35 
          L -16 -35 
          L -16 5 
          L -9.1 5 
          L -9.1 -10 
          A 5 5 0 0 1 9.5 -10
          L 9.5 -10
          L 9.5 5 
          L 16 5 
          L 16 -35 
          L 30 -35 
          L 30 20 
          L -29 20 
          Z" fill="#d5d5dd3f" stroke="#1a1a1a" strokeWidth="0.3" />
          <line x1="-20" y1="-22.5" x2="-16" y2="-22.5" stroke="#1a1a1a" strokeWidth="0.3" />
          <line x1="-29" y1="-22.5" x2="-25" y2="-22.5" stroke="#1a1a1a" strokeWidth="0.3" />
          <line x1="-20" y1="-5" x2="-16" y2="-5" stroke="#1a1a1a" strokeWidth="0.3" />
          <line x1="-29" y1="-5" x2="-25" y2="-5" stroke="#1a1a1a" strokeWidth="0.3" />
          <line x1="16" y1="-10" x2="20" y2="-10" stroke="#1a1a1a" strokeWidth="0.3" />
          <line x1="26" y1="-10" x2="30" y2="-10" stroke="#1a1a1a" strokeWidth="0.3" />
          <rect x="-8.6" y="4" width="4" height="4" fill="none" stroke="#1a1a1a" strokeWidth="0.2" />
          <rect x="5" y="4" width="4" height="4" fill="none" stroke="#1a1a1a" strokeWidth="0.2" />

          <g fill="none" stroke="#1a1a1a" >
            <circle cx="25.35" cy="-26.6" r="0.2" />
            <circle cx="-24.8" cy="15.25" r="0.2" />
            <rect x="-22.9" y="-18.2" width="0.5" height="0.5" />

          </g>

          <g fill="#1a1a1a" fontSize="1.5" fontFamily="sans-serif">
            <path d="M 0,22 L 0,26 M -1.5,23.5 L 0,22 L 1.5,23.5" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
            <text x="0" y="28" textAnchor="middle" fontSize="1.2">Entrance</text>
            <text x="-6.5" y="6.5" textAnchor="middle" fontSize="1.2">Lift</text>
            <text x="7" y="6.5" textAnchor="middle" fontSize="1.2">Lift</text>
            <text x="15" y="18" fontSize="1.2" textAnchor="middle">Lockers</text>
          </g>
        </g>

        {layers.noise && (
          <NoiseLayer2D targetFloor={1} />
        )}
        
        {layers.crowd && (
          <CrowdLayer2D targetFloor={1} />
        )}
      </svg>
    </div>
  )
}