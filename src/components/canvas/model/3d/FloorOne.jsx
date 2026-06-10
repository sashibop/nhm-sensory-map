import * as THREE from 'three'
import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import CrowdLayer from '../../layers/3d/CrowdLayer'
import NoiseLayer from '../../layers/3d/NoiseLayer'
import useAppStore from '../../../../store/useAppStore'

export default function FloorOne({ isActive, focusRef }) {
  const layers = useAppStore((state) => state.layers);
  const { nodes } = useGLTF('/models/museum_1f.glb');

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

    // Only apply the focus fade logic to the base materials, 
    // skipping the highlight material so it stays bright when active
    Object.entries(mats).forEach(([key, mat]) => {
      orig[key] = mat.color.clone()
      dull[key] = mat.color.clone().lerp(new THREE.Color('#475569'), 0.1).multiplyScalar(0.9)
    })

    return { materials: mats, origColors: orig, dullColors: dull }
  }, [])

  useFrame(() => {
    if (!focusRef) return;
    const focus = focusRef.current;
    const targetSolidOpacity = 0.15 + (focus * 0.85);

    if (Math.abs(materials.wallInt.opacity - targetSolidOpacity) > 0.01) {
      Object.entries(materials).forEach(([key, mat]) => {
        let maxOpacity = 1.0;
        if (key === 'accessibility') maxOpacity = 0.6; 
        if (key === 'windows') maxOpacity = 0.5;       

        mat.opacity = 0.15 + (focus * (maxOpacity - 0.15));
        mat.color.lerpColors(dullColors[key], origColors[key], focus);
      })
    }
  })

  return (
    <group scale={[1, 1, 1]}>
      {layers.crowd && <CrowdLayer targetFloor={1} />}
      {layers.noise && <NoiseLayer targetFloor={1} />}

      <mesh 
        geometry={nodes.floor?.geometry} 
        material={materials.floor} 
        position={nodes.floor?.position}
        rotation={nodes.floor?.rotation}
        scale={nodes.floor?.scale}
        renderOrder={1}
        receiveShadow 
      />
      
      <mesh
        geometry={nodes.wall?.geometry}
        material={materials.wallInt} 
        position={nodes.wall?.position}
        rotation={nodes.wall?.rotation}
        scale={nodes.wall?.scale}
        renderOrder={2}
        castShadow
        receiveShadow
      />

      <mesh 
        geometry={nodes['outside-walls']?.geometry} 
        material={materials.outsideWalls} 
        position={nodes['outside-walls']?.position}
        rotation={nodes['outside-walls']?.rotation}
        scale={nodes['outside-walls']?.scale}
        renderOrder={2}
        castShadow 
        receiveShadow 
      />

      <mesh 
        geometry={nodes['stairs-and-platforms']?.geometry} 
        // FIX: Swaps to the blue highlight when Dimensions is toggled on
        material={layers.dimensions ? materials.stairsHighlight : materials.stairs} 
        position={nodes['stairs-and-platforms']?.position}
        rotation={nodes['stairs-and-platforms']?.rotation}
        scale={nodes['stairs-and-platforms']?.scale}
        renderOrder={2}
        receiveShadow 
        castShadow
      />

      <mesh 
        geometry={nodes.exhibits?.geometry} 
        material={materials.exhibits} 
        position={nodes.exhibits?.position}
        rotation={nodes.exhibits?.rotation}
        scale={nodes.exhibits?.scale}
        renderOrder={2}
        castShadow 
        receiveShadow 
      />

      <mesh 
        geometry={nodes.windows?.geometry} 
        material={materials.windows} 
        position={nodes.windows?.position}
        rotation={nodes.windows?.rotation}
        scale={nodes.windows?.scale}
        renderOrder={3} // Always render on top of walls/floors
      />

      {/* --- TOGGLED LAYERS --- */}
      <mesh 
        geometry={nodes.columns?.geometry} 
        material={materials.columns} 
        position={nodes.columns?.position}
        rotation={nodes.columns?.rotation}
        scale={nodes.columns?.scale}
        renderOrder={2}
        castShadow 
        receiveShadow 
        visible={layers.dimensions}
      />

      <mesh 
        geometry={nodes.accessibility?.geometry} 
        material={materials.accessibility} 
        position={nodes.accessibility?.position}
        rotation={nodes.accessibility?.rotation}
        scale={nodes.accessibility?.scale}
        renderOrder={3} // Always render on top of walls/floors
        visible={layers.dimensions}
      />
    </group>
  )
}

useGLTF.preload('/models/museum_1f.glb')