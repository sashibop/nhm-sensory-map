import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useAppStore from '../../../../store/useAppStore'
import { getBrightnessSources } from '../../../../data/mockBrightnessData'

const MAX_SOURCES = 150 

// export default function NoiseLayer({ targetFloor = 1 }) {
export default function BrightnessLayer({ targetFloor = 1, geometry}) {
  const timeOfDay = useAppStore((state) => state.timeOfDay)
  const selectedDate = useAppStore((state) => state.selectedDate)
  const activeFloor = useAppStore((state) => state.activeFloor)
  
  // Custom heatmap shader configuration
  const heatmapMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uSources: { value: Array.from({ length: MAX_SOURCES }, () => new THREE.Vector4(0, 0, 0, 0)) },
        uSourceCount: { value: 0 },
        uTime: { value: 0 },
        uFocus: { value: targetFloor === activeFloor ? 1.0 : 0.0 } 
      },
      vertexShader: `
        varying vec3 vLocalPos;
        void main() {
          vLocalPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec4 uSources[${MAX_SOURCES}];
        uniform int uSourceCount;
        uniform float uTime;
        uniform float uFocus; 
        varying vec3 vLocalPos;

        float map(float value, float min1, float max1, float min2, float max2) {
          return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
        }

        void main() {
          float totalHeat = 0.0;
          for(int i = 0; i < ${MAX_SOURCES}; i++) {
            if (i >= uSourceCount) break;
            vec4 source = uSources[i];
            float dist = distance(vLocalPos.xz, source.xy);
            float heatContribution = source.z / (1.0 + pow(dist * source.w, 2.0));
            totalHeat += heatContribution;
          }

          float normalizedHeat = clamp(map(totalHeat, 15.0, 65.0, 0.0, 1.0), 0.0, 1.0);
          
 
          // New gradient: white -> yellow -> purple -> blue
          vec3 c1 = vec3(0.0, 0.0, 0.3);    // dark blue (low heat)
          vec3 c2 = vec3(0.0, 0.1, 0.5);   // medium blue
          vec3 c3 = vec3(0.0, 0.3, 0.7); // brighter blue
          vec3 c4 = vec3(0.6, 0.3, 0.8);    // light purple (lavender)
          vec3 c5 = vec3(0.9, 0.7, 0.2);    // yellow
          vec3 c6 = vec3(0.95, 0.85, 0.3);  // brighter yellow
          vec3 c7 = vec3(1.0, 1.0, 1.0);    // white (high heat)
          
          vec3 finalColor = c1;
          finalColor = mix(finalColor, c2, smoothstep(0.05, 0.20, normalizedHeat));
          finalColor = mix(finalColor, c3, smoothstep(0.20, 0.35, normalizedHeat));
          finalColor = mix(finalColor, c4, smoothstep(0.35, 0.50, normalizedHeat));
          finalColor = mix(finalColor, c5, smoothstep(0.50, 0.65, normalizedHeat));
          finalColor = mix(finalColor, c6, smoothstep(0.65, 0.85, normalizedHeat));
          finalColor = mix(finalColor, c7, smoothstep(0.85, 1.00, normalizedHeat));

          float contourSteps = totalHeat * 0.7; 
          float lineGlow = smoothstep(0.85, 0.95, fract(contourSteps + (uTime * 0.03)));
          vec3 contourColor = vec3(1.0, 1.0, 0.0) * lineGlow * 0.25; 
          

          vec3 vibrantColor = finalColor + contourColor;
          float lum = dot(vibrantColor, vec3(0.299, 0.587, 0.114));
          vec3 dullColor = vec3(lum) * 0.5 + vec3(0.05, 0.1, 0.2); 
          vec3 outColor = mix(dullColor, vibrantColor, uFocus);

          float activeAlpha = mix(0.15, 0.90, smoothstep(0.1, 0.8, normalizedHeat)); 
          float ghostedAlpha = mix(0.02, 0.15, smoothstep(0.1, 0.8, normalizedHeat)); 
          float alpha = mix(ghostedAlpha, activeAlpha, uFocus);

          gl_FragColor = vec4(outColor, alpha);
        }
      `
    })
  }, [targetFloor])

  useFrame((_, delta) => {
    const isTargetFloor = activeFloor === targetFloor
    
    heatmapMaterial.uniforms.uFocus.value = THREE.MathUtils.lerp(
      heatmapMaterial.uniforms.uFocus.value,
      isTargetFloor ? 1.0 : 0.0,
      delta * 4 
    )

    heatmapMaterial.uniforms.uTime.value = window.performance.now() / 1000

    if (!isTargetFloor) return

    // 1. Query the Unified Data Function
    const dayOfWeek = selectedDate.getDay()
    const activeNoiseData = getBrightnessSources(timeOfDay, targetFloor, dayOfWeek)

    // 2. Map directly to shader uniform array
    const uniforms = heatmapMaterial.uniforms.uSources.value
    let count = 0

    activeNoiseData.forEach((source) => {
      if (count < MAX_SOURCES) {
        uniforms[count].set(source.x, source.z, source.volume, source.spread)
        count++
      }
    })

    heatmapMaterial.uniforms.uSourceCount.value = count
    heatmapMaterial.uniforms.uSources.needsUpdate = true
  })
  if (!geometry) return null


  return (
    <group>
      <mesh 
        geometry={geometry} 
        material={heatmapMaterial}
        renderOrder={3} 
      />
    </group>
  )
}