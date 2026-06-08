import useAppStore from '../../../../store/useAppStore'
import CrowdLayer2D from '../../layers/2d/CrowdLayer2D'
import NoiseLayer2D from '../../layers/2d/NoiseLayer2D'
import BrightnessLayer2D from '../../layers/2d/BrightnessLayer2D'
import DimensionLayerDynamic2D from '../../layers/2d/DimensionLayerDynamic2D'

export default function FloorTwo2D() {
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
            {/* Exact matching mask from Floor 1 */}
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
        
        <g id="floor-two-geometry">
          {/* Exact matching outline from Floor 1 */}
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
          
          {/* Exact matching internal structural lines & lifts */}
          <line x1="-20" y1="-22.5" x2="-16" y2="-22.5" stroke="#1a1a1a" strokeWidth="0.3" />
          <line x1="-29" y1="-22.5" x2="-25" y2="-22.5" stroke="#1a1a1a" strokeWidth="0.3" />
          <line x1="-20" y1="-5" x2="-16" y2="-5" stroke="#1a1a1a" strokeWidth="0.3" />
          <line x1="-29" y1="-5" x2="-25" y2="-5" stroke="#1a1a1a" strokeWidth="0.3" />
          <rect x="-8.6" y="4" width="4" height="4" fill="none" stroke="#1a1a1a" strokeWidth="0.2" />
          <rect x="5" y="4" width="4" height="4" fill="none" stroke="#1a1a1a" strokeWidth="0.2" />

          {/* ========================================== */}
          {/* FLOOR 2 EXHIBITS                           */}
          {/* ========================================== */}
          <g fill="none" stroke="#1a1a1a" strokeWidth="0.5">
            {/* Video Wall (Bottom Right Corridor) */}
            <line x1="26" y1="9" x2="26" y2="15" strokeWidth="1.2" />
          </g>

          {/* ========================================== */}
          {/* FLOOR 2 LABELS                             */}
          {/* ========================================== */}
          <g fill="#1a1a1a" fontSize="1.5" fontFamily="sans-serif">
             <text x="-6.5" y="6.5" textAnchor="middle" fontSize="1.2">Lift</text>
            <text x="7" y="6.5" textAnchor="middle" fontSize="1.2">Lift</text>
            
            <text x="24.5" y="12.5" textAnchor="end" fontSize="1.2">Video Wall</text>
            <text x="0.5" y="17" textAnchor="middle" fontSize="1.2">Cafeteria</text>
            <text x="0.2" y="-7" textAnchor="middle" fontSize="1.2">Atrium Below</text>
          </g>
        </g>

        {/* ========================================== */}
        {/* DATA LAYERS (Fetching Floor 2 Data)        */}
        {/* ========================================== */}
        {layers.brightness && (
          <BrightnessLayer2D targetFloor={2} />
        )}

        {layers.noise && (
          <NoiseLayer2D targetFloor={2} />
        )}
        
        {layers.crowd && (
          <CrowdLayer2D targetFloor={2} />
        )}
        {layers.dimensions && (
          <DimensionLayerDynamic2D targetFloor={2} />
        )}
        
      </svg>
    </div>
  )
}