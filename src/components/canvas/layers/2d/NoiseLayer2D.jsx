import { useEffect, useRef } from 'react'
import useAppStore from '../../../../store/useAppStore'
import { getNoiseSources } from '../../../../data/mockVisitorData'

export default function NoiseLayer2D({ targetFloor = 1 }) {
  const selectedDate = useAppStore((state) => state.selectedDate)
  const activeFloor = useAppStore((state) => state.activeFloor)
  
  const canvasRef = useRef()
  const requestRef = useRef()

  useEffect(() => {
    if (activeFloor !== targetFloor) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // High performance matching dimension grid matrix
    const w = canvas.width
    const h = canvas.height

    const renderLoop = () => {
      const state = useAppStore.getState()
      const dayOfWeek = selectedDate.getDay()
      const sources = getNoiseSources(state.timeOfDay, targetFloor, dayOfWeek)
      const uTime = window.performance.now() / 1000

      // Reset backing array buffer
      const imgData = ctx.createImageData(w, h)
      const data = imgData.data

      // Evaluate density function per point inside the local system mapping window
      for (let y = 0; y < h; y++) {
        // Map canvas coordinate space to exact math Z boundaries (-45 to 35)
        const currentZ = -45 + (y / h) * 80

        for (let x = 0; x < w; x++) {
          // Map canvas coordinate space to exact math X boundaries (-35 to 35)
          const currentX = -35 + (x / w) * 70

          let totalHeat = 0.0

          for (let i = 0; i < sources.length; i++) {
            const src = sources[i]
            const dx = currentX - src.x
            const dz = currentZ - src.z // Matches shifted 2D coordinate track
            const dist = Math.sqrt(dx * dx + dz * dz)

            const contribution = src.volume / (1.0 + Math.pow(dist * src.spread, 2.0))
            totalHeat += contribution
          }

          // Complete 7-Stage Color Field Mixing Array Mapping
          const c1 = [0.05, 0.40, 0.45]; const c2 = [0.12, 0.70, 0.40]
          const c3 = [0.60, 0.80, 0.15]; const c4 = [0.98, 0.75, 0.05]
          const c5 = [0.95, 0.40, 0.10]; const c6 = [0.90, 0.15, 0.20]
          const c7 = [0.50, 0.00, 0.20]

          // THE FIX: If silent, paint the base greyish-greenish floor fog!
          if (totalHeat < 15.0) {
            const pixelIndex = (x + y * w) * 4
            data[pixelIndex] = Math.floor(c1[0] * 255)
            data[pixelIndex + 1] = Math.floor(c1[1] * 255)
            data[pixelIndex + 2] = Math.floor(c1[2] * 255)
            data[pixelIndex + 3] = Math.floor(0.13 * 255) // Base 15% opacity fog
            continue // Skip the intense heat math for this pixel
          }

          // Map values directly matching the WebGL shader limits (15.0 - 65.0 dB)
          let norm = (totalHeat - 15.0) / (65.0 - 15.0)
          norm = Math.max(0.0, Math.min(1.0, norm))

          let r = c1[0], g = c1[1], b = c1[2]

          const mix = (from, to, weight) => (1 - weight) * from + weight * to

          if (norm < 0.20) {
            const t = Math.max(0, Math.min(1, (norm - 0.05) / 0.15))
            r = mix(c1[0], c2[0], t); g = mix(c1[1], c2[1], t); b = mix(c1[2], c2[2], t)
          } else if (norm < 0.35) {
            const t = (norm - 0.20) / 0.15
            r = mix(c2[0], c3[0], t); g = mix(c2[1], c3[1], t); b = mix(c2[2], c3[2], t)
          } else if (norm < 0.50) {
            const t = (norm - 0.35) / 0.15
            r = mix(c3[0], c4[0], t); g = mix(c3[1], c4[1], t); b = mix(c3[2], c4[2], t)
          } else if (norm < 0.65) {
            const t = (norm - 0.50) / 0.15
            r = mix(c4[0], c5[0], t); g = mix(c4[1], c5[1], t); b = mix(c4[2], c5[2], t)
          } else if (norm < 0.85) {
            const t = (norm - 0.65) / 0.20
            r = mix(c5[0], c6[0], t); g = mix(c5[1], c6[1], t); b = mix(c5[2], c6[2], t)
          } else {
            const t = (norm - 0.85) / 0.15
            r = mix(c6[0], c7[0], t); g = mix(c6[1], c7[1], t); b = mix(c6[2], c7[2], t)
          }

          // Dynamic alpha attenuation mapping matching the 3D focus transparency
          const alpha = 0.15 + (norm * 0.75)

          const pixelIndex = (x + y * w) * 4
          data[pixelIndex] = Math.floor(r * 255)
          data[pixelIndex + 1] = Math.floor(g * 255)
          data[pixelIndex + 2] = Math.floor(b * 255)
          data[pixelIndex + 3] = Math.floor(alpha * 255)
        }
      }

      ctx.putImageData(imgData, 0, 0)
      requestRef.current = requestAnimationFrame(renderLoop)
    }

    requestRef.current = requestAnimationFrame(renderLoop)
    return () => cancelAnimationFrame(requestRef.current)
  }, [selectedDate, activeFloor, targetFloor])

  if (activeFloor !== targetFloor) return null

  return (
    <foreignObject 
      x="-35" 
      y="-45" 
      width="70" 
      height="80" 
      style={{ 
        pointerEvents: 'none', 
        clipPath: 'url(#museum-floor-mask)' 
      }}
    >
      <canvas 
        ref={canvasRef} 
        width="140" 
        height="160" 
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'block', 
          filter: 'blur(0.2px)' 
        }} 
      />
    </foreignObject>
  )
}