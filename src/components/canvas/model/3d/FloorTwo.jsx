import * as THREE from 'three'
import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import CrowdLayer from '../../layers/3d/CrowdLayer'
import NoiseLayer from '../../layers/3d/NoiseLayer'
import useAppStore from '../../../../store/useAppStore'

export default function FloorTwo({ isActive, focusRef }) {
  const layers = useAppStore((state) => state.layers);
  const { nodes } = useGLTF('/models/museum_2f.glb');

  const INACTIVE_OPACITY = 0.3; 

  const { materials, origColors, dullColors } = useMemo(() => {
    const mats = {
          // FIX: Shifted from #f8fafc to #eaeff4 (a subtle, cool paper-white) 
          // to separate it from the background void without causing screen glare.
          floor: new THREE.MeshStandardMaterial({ color: '#d8dbdd', roughness: 0.9, side: THREE.DoubleSide, transparent: true }),
          
          wallInt: new THREE.MeshStandardMaterial({ color: '#7f8b9c', roughness: 0.9, side: THREE.DoubleSide, transparent: true }), 
          outsideWalls: new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 1.0, transparent: true }),
          
          // Default Stairs: Slightly darker than the floor so they read as structure
          stairs: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.9, transparent: true }),
          
          // NEW: Highlight material for stairs when Dimensions toggle is ON.
          // Uses a soft, calming sky blue that is distinct but not visually aggressive.
          stairsHighlight: new THREE.MeshStandardMaterial({ 
            color: '#7dd3fc', 
            emissive: '#7dd3fc', 
            emissiveIntensity: 0.2, // A very gentle glow
            roughness: 0.7, 
            transparent: true 
          }),
    
          columns: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.8, transparent: true }),
          exhibits: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.5, transparent: true }),
          
          windows: new THREE.MeshStandardMaterial({
            color: '#e0f2fe',
            roughness: 0.1,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false, 
            opacity: 0.45 
          }),
    
          accessibility: new THREE.MeshStandardMaterial({
            color: '#fbbf24', 
            roughness: 0.2,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false, 
            opacity: 0.6 
          }),
        }

    const orig = {}
    const dull = {}

    Object.entries(mats).forEach(([key, mat]) => {
      orig[key] = mat.color.clone()
      dull[key] = mat.color.clone().lerp(new THREE.Color('#475569'), 0.1).multiplyScalar(0.9)
    })

    return { materials: mats, origColors: orig, dullColors: dull }
  }, [])

  useFrame(() => {
    if (!focusRef) return;
    const focus = focusRef.current;
    
    // ADDED: The same math barrier from FloorOne to protect performance
    const targetSolidOpacity = INACTIVE_OPACITY + (focus * (1.0 - INACTIVE_OPACITY));

    if (Math.abs(materials.wallInt.opacity - targetSolidOpacity) > 0.01) {
      Object.entries(materials).forEach(([key, mat]) => {
        let maxOpacity = 1.0; 
        if (key === 'accessibility') maxOpacity = 0.6; 

        mat.opacity = INACTIVE_OPACITY + focus * (maxOpacity - INACTIVE_OPACITY);
        mat.color.lerpColors(dullColors[key], origColors[key], focus);
        
        // REMOVED: mat.needsUpdate = true
      })
    }
  })

  return (
    <group scale={[1, 1, 1]}>
      {layers.crowd && <CrowdLayer targetFloor={2} />}
      {layers.noise && <NoiseLayer targetFloor={2} />}

      <mesh 
        geometry={nodes.floor2?.geometry} 
        material={materials.floor} 
        position={nodes.floor2?.position}
        rotation={nodes.floor2?.rotation}
        scale={nodes.floor2?.scale}
        renderOrder={1} 
        receiveShadow 
      />

      <mesh 
        geometry={nodes.wall2?.geometry} 
        material={materials.wallInt} 
        position={nodes.wall2?.position}
        rotation={nodes.wall2?.rotation}
        scale={nodes.wall2?.scale}
        renderOrder={2} 
        castShadow 
        receiveShadow 
      />

      <mesh 
        geometry={nodes['outside-walls2']?.geometry} 
        material={materials.outsideWalls} 
        position={nodes['outside-walls2']?.position}
        rotation={nodes['outside-walls2']?.rotation}
        scale={nodes['outside-walls2']?.scale}
        renderOrder={2} 
        castShadow 
        receiveShadow 
      />

      <mesh 
        geometry={nodes['stairs-and-platforms2']?.geometry} 
        // FIX: Swaps to the blue highlight when Dimensions is toggled on
        material={layers.dimensions ? materials.stairsHighlight : materials.stairs} 
        position={nodes['stairs-and-platforms2']?.position}
        rotation={nodes['stairs-and-platforms2']?.rotation}
        scale={nodes['stairs-and-platforms2']?.scale}
        renderOrder={2} 
        receiveShadow 
        castShadow 
      />

      <mesh 
        geometry={nodes.windows2?.geometry} 
        material={materials.windows} 
        position={nodes.windows2?.position}
        rotation={nodes.windows2?.rotation}
        scale={nodes.windows2?.scale}
        renderOrder={3} 
      />
      
      <mesh 
        geometry={nodes.columns2?.geometry} 
        material={materials.columns} 
        position={nodes.columns2?.position}
        rotation={nodes.columns2?.rotation}
        scale={nodes.columns2?.scale}
        renderOrder={2} 
        castShadow 
        receiveShadow 
        visible={layers.dimensions}
      />

      <mesh 
        geometry={nodes.accessibility2?.geometry} 
        material={materials.accessibility} 
        position={nodes.accessibility2?.position}
        rotation={nodes.accessibility2?.rotation}
        scale={nodes.accessibility2?.scale}
        renderOrder={3} 
        visible={layers.dimensions}
      />
    </group>
  )
}

useGLTF.preload('/models/museum_2f.glb')