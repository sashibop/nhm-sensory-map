import { useEffect, useRef, useMemo } from 'react'
import useAppStore from '../../../../store/useAppStore'
import { visitors } from '../../../../data/mockVisitorData'

// Helper function to smooth out movement (mirrors THREE.MathUtils.smootherstep)
const smootherstep = (x, min, max) => {
  if (x <= min) return 0
  if (x >= max) return 1
  x = (x - min) / (max - min)
  return x * x * x * (x * (x * 6 - 15) + 10)
}

// Helper for linear interpolation (mirrors THREE.MathUtils.lerp)
const lerp = (x, y, t) => (1 - t) * x + t * y

export default function CrowdLayer2D({ targetFloor = 1 }) {
  const timeOfDay = useAppStore((state) => state.timeOfDay)
  const selectedDate = useAppStore((state) => state.selectedDate)
  const activeFloor = useAppStore((state) => state.activeFloor)
  
  // Create a ref array to hold references to every SVG circle DOM node
  const dotsRef = useRef([])
  const requestRef = useRef()

  // 1. Filter the visitors exactly like the 3D view
  const activeVisitors = useMemo(() => {
    const dayOfWeek = selectedDate.getDay()
    return visitors.filter(v => v.daysVisiting.includes(dayOfWeek) && v.floor === targetFloor)
  }, [selectedDate, targetFloor])

  // 2. The High-Performance SVG Render Loop
  useEffect(() => {
    // If we aren't on the right floor, don't run the math
    if (activeFloor !== targetFloor) return

    const updateDots = () => {
      // timeOfDay is a live ref from Zustand, we need its current value
      const currentTime = useAppStore.getState().timeOfDay

      activeVisitors.forEach((visitor, i) => {
        const dot = dotsRef.current[i]
        if (!dot) return

        const path = visitor.path
        const enterTime = path[0].time
        const exitTime = path[path.length - 1].time

        // A. Is the visitor currently in the building?
        if (currentTime < enterTime || currentTime > exitTime) {
          // Hide them
          dot.style.display = 'none'
          return
        }

        // B. They are in the building. Make sure they are visible.
        dot.style.display = 'block'

        // C. Find which path segment they are currently on
        let startIndex = 0
        for (let j = 0; j < path.length - 1; j++) {
          if (currentTime >= path[j].time && currentTime <= path[j+1].time) {
            startIndex = j
            break
          }
        }

        const startNode = path[startIndex]
        const endNode = path[startIndex + 1]
        
        // D. Calculate progress along the segment
        const segmentDuration = endNode.time - startNode.time
        const progress = segmentDuration === 0 ? 1 : (currentTime - startNode.time) / segmentDuration
        const easedProgress = smootherstep(progress, 0, 1)

        // E. Interpolate their exact X and Z coordinates
        const currentX = lerp(startNode.x, endNode.x, easedProgress)
        const currentZ = lerp(startNode.z, endNode.z, easedProgress)

        // F. Directly mutate the SVG DOM node (Bypasses React Render = 60fps)
        dot.setAttribute('cx', currentX)
        dot.setAttribute('cy', currentZ)
      })

      // Loop forever
      requestRef.current = requestAnimationFrame(updateDots)
    }

    // Start the high-performance loop
    requestRef.current = requestAnimationFrame(updateDots)

    // Cleanup
    return () => cancelAnimationFrame(requestRef.current)
  }, [activeVisitors, activeFloor, targetFloor])

  // If wrong floor, render nothing
  if (activeFloor !== targetFloor) return null

  // 3. Render the base SVG circles once. 
  // The useEffect loop above will handle moving them.
  return (
    <g id="data-crowd-layer-2d">
      {activeVisitors.map((visitor, index) => (
        <circle
          key={visitor.id}
          ref={(el) => (dotsRef.current[index] = el)}
          cx={visitor.path[0].x}
          cy={visitor.path[0].z}
          
          r="0.30" 
          
          style={{ 
            display: 'none',
            fill: '#f97316', 
            
            // 2. THE EDGE: A crisp white border to separate overlapping dots
            stroke: '#eeb287',   
            strokeWidth: '0.15', 
            
            transition: 'opacity 0.2s ease', 
            willChange: 'cx, cy, r'
          }}
        />
      ))}
    </g>
  )
}