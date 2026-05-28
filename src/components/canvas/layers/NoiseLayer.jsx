import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useAppStore from '../../../store/useAppStore'
import { getNoiseSources } from '../../../data/mockVisitorData'

const MAX_SOURCES = 150 

export default function NoiseLayer({ targetFloor = 1 }) {
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
        uFocus: { value: targetFloor === 1 ? 1.0 : 0.0 } 
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
            float dist = distance(vLocalPos.xy, source.xy);
            float heatContribution = source.z / (1.0 + pow(dist * source.w, 2.0));
            totalHeat += heatContribution;
          }

          float normalizedHeat = clamp(map(totalHeat, 15.0, 65.0, 0.0, 1.0), 0.0, 1.0);
          
          vec3 c1 = vec3(0.05, 0.40, 0.45); vec3 c2 = vec3(0.12, 0.70, 0.40);  
          vec3 c3 = vec3(0.60, 0.80, 0.15); vec3 c4 = vec3(0.98, 0.75, 0.05);  
          vec3 c5 = vec3(0.95, 0.40, 0.10); vec3 c6 = vec3(0.90, 0.15, 0.20);  
          vec3 c7 = vec3(0.50, 0.00, 0.20);  
          
          vec3 finalColor = c1;
          finalColor = mix(finalColor, c2, smoothstep(0.05, 0.20, normalizedHeat));
          finalColor = mix(finalColor, c3, smoothstep(0.20, 0.35, normalizedHeat));
          finalColor = mix(finalColor, c4, smoothstep(0.35, 0.50, normalizedHeat));
          finalColor = mix(finalColor, c5, smoothstep(0.50, 0.65, normalizedHeat));
          finalColor = mix(finalColor, c6, smoothstep(0.65, 0.85, normalizedHeat));
          finalColor = mix(finalColor, c7, smoothstep(0.85, 1.00, normalizedHeat));

          float contourSteps = totalHeat * 0.7; 
          float lineGlow = smoothstep(0.85, 0.95, fract(contourSteps + (uTime * 0.03)));
          vec3 contourColor = vec3(1.0, 1.0, 1.0) * lineGlow * 0.25;

          vec3 vibrantColor = finalColor + contourColor;
          float lum = dot(vibrantColor, vec3(0.299, 0.587, 0.114));
          vec3 dullColor = vec3(lum) * 0.5 + vec3(0.28, 0.33, 0.41); 
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
    const activeNoiseData = getNoiseSources(timeOfDay, targetFloor, dayOfWeek)

    // 2. Map directly to shader uniform array
    const uniforms = heatmapMaterial.uniforms.uSources.value
    let count = 0

    activeNoiseData.forEach((source) => {
      if (count < MAX_SOURCES) {
        // Shader expects flipped coordinates due to WebGL plane matrices
        uniforms[count].set(source.x, -source.z, source.volume, source.spread)
        count++
      }
    })

    heatmapMaterial.uniforms.uSourceCount.value = count
    heatmapMaterial.uniforms.uSources.needsUpdate = true
  })

  const floorShapeGeo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-28, -18); shape.lineTo(28, -18); shape.lineTo(28, 33);
    shape.lineTo(18, 33); shape.lineTo(18, -6); shape.lineTo(9, -6);
    shape.lineTo(9, 14); shape.lineTo(8.7, 14);
    shape.absarc(0, 14, 8.7, 0, Math.PI, false);
    shape.lineTo(-9, 14); shape.lineTo(-9, -6); shape.lineTo(-18, -6);
    shape.lineTo(-18, 33); shape.lineTo(-28, 33);
    shape.closePath()
    return new THREE.ShapeGeometry(shape)
  }, [])

  return (
    <group>
      <mesh 
        geometry={floorShapeGeo} 
        material={heatmapMaterial}
        position={[0, 0.45, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        renderOrder={1} 
      />
    </group>
  )
}