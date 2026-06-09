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
      floor: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9, side: THREE.DoubleSide }),
      
      wallInt: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.9, side: THREE.DoubleSide }), 
      
      outsideWalls: new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 1.0 }), // Very light gray
      stairs: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.9 }),
      columns: new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.8 }),
      exhibits: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.3, metalness: 0.6 }),
      
      windows: new THREE.MeshPhysicalMaterial({
        color: '#fdecba',
        metalness: 0,
        roughness: 0.1,
        side: THREE.DoubleSide
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

    if (Math.abs(materials.wallInt.opacity - (0.2 + focus * 0.8)) > 0.01) {
      Object.entries(materials).forEach(([key, mat]) => {
        if (key === 'windows') return;
        mat.color.lerpColors(dullColors[key], origColors[key], focus)
        mat.transparent = true;
        mat.opacity = 0.15 + (focus * 0.85);
        mat.needsUpdate = true;
      })
    }
  })

  return (
    <group scale={[1, 1, 1]}>
      {layers.crowd && <CrowdLayer targetFloor={1} />}
      {layers.noise && <NoiseLayer targetFloor={1} />}

      <mesh geometry={nodes.floor?.geometry} material={materials.floor} receiveShadow />
      
      {/* ⚠️ MAPPING BLENDER SLOTS TO REACT ARRAY */}
      {/* Index 0 should be your main Wall material, Index 1 should be Wall_Tops */}
      <mesh
        geometry={nodes.wall?.geometry}
        material={materials.wallInt} 
        castShadow
        receiveShadow
      />

      <mesh 
        geometry={nodes['outside-walls']?.geometry} 
        material={materials.outsideWalls} 
        castShadow 
        receiveShadow 
      />

      <mesh 
        geometry={nodes['stairs-and-plantforms']?.geometry} 
        material={materials.stairs} 
        receiveShadow 
        castShadow
      />

      <mesh 
        geometry={nodes.columns?.geometry} 
        material={materials.columns} 
        castShadow 
        receiveShadow 
      />

      <mesh 
        geometry={nodes.exhibits?.geometry} 
        material={materials.exhibits} 
        castShadow 
        receiveShadow 
      />

      <mesh 
        geometry={nodes.windows?.geometry} 
        material={materials.windows} 
      />
    </group>
  )
}

useGLTF.preload('/models/museum_floor_one.glb')