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
      floor: new THREE.MeshStandardMaterial({ color: '#d8dbdd', roughness: 0.9, side: THREE.DoubleSide, transparent: true }),
      wallInt: new THREE.MeshStandardMaterial({ color: '#7f8b9c', roughness: 0.9, side: THREE.DoubleSide, transparent: true }), 
      outsideWalls: new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 1.0, transparent: true }),
      stairs: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.9, transparent: true }),
      
      stairsHighlight: new THREE.MeshStandardMaterial({ 
        color: '#7dd3fc', 
        emissive: '#7dd3fc', 
        emissiveIntensity: 0.2, 
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
      if (key === 'stairsHighlight') return // Skips custom structural glow maps
      orig[key] = mat.color.clone()
      dull[key] = mat.color.clone().lerp(new THREE.Color('#475569'), 0.1).multiplyScalar(0.9)
    })

    return { materials: mats, origColors: orig, dullColors: dull }
  }, [])

  useFrame(() => {
    if (!focusRef) return;
    const focus = focusRef.current;
    const targetSolidOpacity = INACTIVE_OPACITY + (focus * (1.0 - INACTIVE_OPACITY));

    if (Math.abs(materials.wallInt.opacity - targetSolidOpacity) > 0.01) {
      Object.entries(materials).forEach(([key, mat]) => {
        if (key === 'stairsHighlight') return // Keeps highlighting values clean
        let maxOpacity = 1.0; 
        if (key === 'accessibility') maxOpacity = 0.6; 
        if (key === 'windows') maxOpacity = 0.5;       

        mat.opacity = INACTIVE_OPACITY + focus * (maxOpacity - INACTIVE_OPACITY);
        mat.color.lerpColors(dullColors[key], origColors[key], focus);
      })
    }
  })

  return (
    <group scale={[1, 1, 1]}>
      {layers.crowd && <CrowdLayer targetFloor={2} />}

      {/* --- NOISE HEATMAP LAYER --- */}
      {layers.noise && nodes.floor2 && (
        <group 
          position={[nodes.floor2.position.x, nodes.floor2.position.y + 0.02, nodes.floor2.position.z]}
          rotation={nodes.floor2.rotation}
          scale={nodes.floor2.scale}
        >
          <NoiseLayer targetFloor={2} geometry={nodes.floor2.geometry} />
        </group>
      )}

      {/* --- EXPLORABLE INNER FLOOR --- */}
      <mesh 
        geometry={nodes.floor2?.geometry} 
        material={materials.floor} 
        position={nodes.floor2?.position}
        rotation={nodes.floor2?.rotation}
        scale={nodes.floor2?.scale}
        renderOrder={1} 
        receiveShadow 
      />

      {/* --- UNEXPLORABLE OUTSIDE FLOOR (ADDED) --- */}
      <mesh 
        geometry={nodes['outside-floor2']?.geometry} 
        material={materials.floor} 
        position={nodes['outside-floor2']?.position}
        rotation={nodes['outside-floor2']?.rotation}
        scale={nodes['outside-floor2']?.scale}
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
      
      {/* --- TOGGLED DIMENSIONS LAYERS --- */}
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