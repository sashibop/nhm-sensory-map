import { useMemo } from 'react'
import useAppStore from '../../../../store/useAppStore'
import { visitors } from '../../../../data/mockVisitorData'

const smootherstep = (x, min, max) => {
  if (x <= min) return 0
  if (x >= max) return 1
  x = (x - min) / (max - min)
  return x * x * x * (x * (x * 6 - 15) + 10)
}

const lerp = (x, y, t) => (1 - t) * x + t * y

// ⚠️ UPDATED: Added mapScale, offsetX, and offsetZ as props
export default function CrowdLayer2D({ targetFloor = 1, mapScale = 0.9, offsetX = 0, offsetZ = 0 }) {
  const timeOfDay = useAppStore((state) => state.timeOfDay)
  const selectedDate = useAppStore((state) => state.selectedDate)
  const activeFloor = useAppStore((state) => state.activeFloor)

  const activeVisitors = useMemo(() => {
    const dayOfWeek = selectedDate.getDay()
    return visitors.filter(v => v.daysVisiting.includes(dayOfWeek) && v.floor === targetFloor)
  }, [selectedDate, targetFloor])

  // Process and project real-time updates directly into the SVG DOM elements
  const dotsRef = (el, i) => {
    if (!el) return
    const currentTime = useAppStore.getState().timeOfDay
    const path = activeVisitors[i]?.path

    if (!path) return
    const enterTime = path[0].time
    const exitTime = path[path.length - 1].time

    if (currentTime < enterTime || currentTime > exitTime) {
      el.style.display = 'none'
      return
    }

    el.style.display = 'block'

    let startIndex = 0
    for (let j = 0; j < path.length - 1; j++) {
      if (currentTime >= path[j].time && currentTime <= path[j+1].time) {
        startIndex = j
        break
      }
    }

    const startNode = path[startIndex]
    const endNode = path[startIndex + 1]
    
    const segmentDuration = endNode.time - startNode.time
    const progress = segmentDuration === 0 ? 1 : (currentTime - startNode.time) / segmentDuration
    const easedProgress = smootherstep(progress, 0, 1)

    const rawX = lerp(startNode.x, endNode.x, easedProgress)
    const rawZ = lerp(startNode.z, endNode.z, easedProgress)

    // ⚠️ UPDATED: Uses the dynamic props passed from the parent floor
    el.setAttribute('cx', (rawX * mapScale) + offsetX)
    el.setAttribute('cy', (rawZ * mapScale) + offsetZ)
  }

  if (activeFloor !== targetFloor) return null

  return (
    <g id="data-crowd-layer-2d">
      {activeVisitors.map((visitor, index) => {
        // ⚠️ UPDATED: Uses the dynamic props for initial positioning
        const initX = (visitor.path[0].x * mapScale) + offsetX
        const initZ = (visitor.path[0].z * mapScale) + offsetZ
        
        return (
          <circle
            key={visitor.id}
            ref={(el) => dotsRef(el, index)}
            cx={initX}
            cy={initZ}
            r="0.30" 
            style={{ 
              fill: '#f97316', 
              stroke: '#ffffff',   
              strokeWidth: '0.15'
            }}
          />
        )
      })}
    </g>
  )
}