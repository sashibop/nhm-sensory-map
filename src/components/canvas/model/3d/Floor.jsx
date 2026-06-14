import * as THREE from 'three'
import { useMemo, useState, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Html } from '@react-three/drei'
import CrowdLayer from '../../layers/3d/CrowdLayer'
import NoiseLayer from '../../layers/3d/NoiseLayer'
import ExhibitionsLayer from '../../layers/3d/ExhibitionsLayer'
import useAppStore from '../../../../store/useAppStore'
import { N } from '../../../../data/mockVisitorData'

export default function Floor({ level = 1, isActive, focusRef }) {
  const layers = useAppStore((state) => state.layers)

  // Dynamically load the model based on the level prop
  const { nodes } = useGLTF(`/models/museum_${level}f.glb`)

  // ==========================================
  // 🛠️ LEVEL DESIGNER STATE & LOGIC
  // ==========================================
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [showNodes, setShowNodes] = useState(true)
  const [enableMapping, setEnableMapping] = useState(false)
  const [routeSequence, setRouteSequence] = useState([])
  const [debugMarkers, setDebugMarkers] = useState([])

  const [panelPos, setPanelPos] = useState({ x: 50, y: -200 })
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  const clickCountRef = useRef(0)
  const clickTimerRef = useRef(null)
  const rootGroupRef = useRef()

  useEffect(() => {
    if (!isActive) return
    const handleGlobalClick = () => {
      if (isDebugMode) return
      clickCountRef.current += 1
      clearTimeout(clickTimerRef.current)
      if (clickCountRef.current >= 8) { setIsDebugMode(true); clickCountRef.current = 0 }
      else { clickTimerRef.current = setTimeout(() => clickCountRef.current = 0, 400) }
    }
    window.addEventListener('click', handleGlobalClick)
    return () => window.removeEventListener('click', handleGlobalClick)
  }, [isDebugMode, isActive])

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return
      setPanelPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y })
    }
    const handlePointerUp = () => setIsDragging(false)
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    }
    return () => { window.removeEventListener('pointermove', handlePointerMove); window.removeEventListener('pointerup', handlePointerUp) }
  }, [isDragging])

  const handleDragStart = (e) => {
    setIsDragging(true)
    dragOffset.current = { x: e.clientX - panelPos.x, y: e.clientY - panelPos.y }
  }

  const handleFloorClick = (e) => {
    if (!isDebugMode || !enableMapping || !isActive) return
    e.stopPropagation()
    const localHit = rootGroupRef.current.worldToLocal(e.point.clone())
    const niceX = parseFloat(localHit.x.toFixed(2))
    const niceY = parseFloat(localHit.y.toFixed(2))
    const niceZ = parseFloat(localHit.z.toFixed(2))
    console.log(`Node mapped (F${level}): { x: ${niceX}, y: ${niceY}, z: ${niceZ} }`)
    setDebugMarkers(prev => [...prev, { id: Date.now(), x: niceX, y: niceY + 0.5, z: niceZ }])
  }

  const handleMarkerClick = (markerId, e) => {
    if (!isDebugMode || !enableMapping || !isActive) return
    e.stopPropagation()
    setDebugMarkers(prev => prev.filter(marker => marker.id !== markerId))
  }

  const handleExistingNodeClick = (name, e) => {
    if (!isDebugMode || !showNodes || !isActive) return
    e.stopPropagation()
    setRouteSequence(prev => {
      const newSeq = [...prev, name]
      console.log(`Route Sequence (F${level}): [ ${newSeq.map(n => `N.${n}`).join(', ')} ]`)
      return newSeq
    })
  }

  // ==========================================
  // MATERIALS & ANIMATIONS
  // ==========================================
  const { materials, origColors, dullColors } = useMemo(() => {

    const mats = {
      floor: new THREE.MeshStandardMaterial({ color: '#d8dbdd', roughness: 0.9, side: THREE.DoubleSide, transparent: true }),
      wallInt: new THREE.MeshStandardMaterial({ color: '#7f8b9c', roughness: 0.9, side: THREE.DoubleSide, transparent: true }),
      outsideWalls: new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 1.0, transparent: true }),
      stairs: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.9, transparent: true }),
      stairsHighlight: new THREE.MeshStandardMaterial({ color: '#7dd3fc', emissive: '#7dd3fc', emissiveIntensity: 0.2, roughness: 0.7, transparent: true }),
      columns: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.8, transparent: true }),
      exhibits: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.5, transparent: true }),
      windows: new THREE.MeshStandardMaterial({ color: '#e0f2fe', roughness: 0.1, side: THREE.DoubleSide, transparent: true, depthWrite: false, opacity: 0.45 }),
      accessibility: new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.2, side: THREE.DoubleSide, transparent: true, depthWrite: false, opacity: 0.6 }),
      labels: new THREE.MeshBasicMaterial({ color: '#495566', transparent: true }),
    }
    const orig = {}; const dull = {};
    Object.entries(mats).forEach(([key, mat]) => {
      if (key === 'stairsHighlight') return
      orig[key] = mat.color.clone()
      dull[key] = mat.color.clone().lerp(new THREE.Color('#475569'), 0.1).multiplyScalar(0.9)
    })
    return { materials: mats, origColors: orig, dullColors: dull }
  }, [level])

  useFrame(() => {
    if (!focusRef) return;
    const focus = focusRef.current;
    const targetSolidOpacity = 0.15 + (focus * 0.85);

    if (Math.abs(materials.wallInt.opacity - targetSolidOpacity) > 0.01) {
      Object.entries(materials).forEach(([key, mat]) => {
        if (key === 'stairsHighlight') return
        let maxOpacity = key === 'accessibility' ? 0.6 : (key === 'windows' ? 0.5 : 1.0);
        mat.opacity = 0.15 + (focus * (maxOpacity - 0.15));
        mat.color.lerpColors(dullColors[key], origColors[key], focus);
      })
    }
  })


  return (
    <group ref={rootGroupRef} scale={[1, 1, 1]}>

      {isDebugMode && isActive && (
        <Html portal={{ current: document.body }}>
          <div style={{ position: 'fixed', left: `${panelPos.x}px`, top: `${panelPos.y}px`, background: 'rgba(15, 23, 42, 0.95)', color: '#fff', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', zIndex: 999999, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)', border: '1px solid #334155', width: '280px' }}>
            <div onPointerDown={handleDragStart} style={{ padding: '12px 16px', cursor: isDragging ? 'grabbing' : 'grab', background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>🛠 LEVEL DESIGNER (F{level})</span>
              <button onClick={() => setIsDebugMode(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label><input type="checkbox" checked={showNodes} onChange={() => setShowNodes(!showNodes)} /> Show Existing Nodes</label>
              <label><input type="checkbox" checked={enableMapping} onChange={() => setEnableMapping(!enableMapping)} /> Enable Mapping (Red Dots)</label>
              {routeSequence.length > 0 && (
                <div style={{ background: '#0f172a', padding: '8px', borderRadius: '4px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}><span>Route ({routeSequence.length})</span><span style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => setRouteSequence([])}>Clear</span></div>
                  <div style={{ wordBreak: 'break-all', maxHeight: '100px', overflowY: 'auto' }}>[ {routeSequence.map(n => `N.${n}`).join(', ')} ]</div>
                </div>
              )}
            </div>
          </div>
        </Html>
      )}

      {layers.crowd && <CrowdLayer targetFloor={level} />}
      {layers.noise && nodes.floor && (
        <group position={[nodes.floor.position.x, nodes.floor.position.y + 0.02, nodes.floor.position.z]} rotation={nodes.floor.rotation} scale={nodes.floor.scale}>
          <NoiseLayer targetFloor={level} geometry={nodes.floor.geometry} />
        </group>
      )}

      <ExhibitionsLayer targetFloor={level} />


      {/* --- STANDARDIZED BLENDER MESHES --- */}
      {nodes.floor && <mesh geometry={nodes.floor.geometry} material={materials.floor} position={nodes.floor.position} rotation={nodes.floor.rotation} scale={nodes.floor.scale} renderOrder={1} receiveShadow onClick={handleFloorClick} />}
      {nodes['outside-floor'] && <mesh geometry={nodes['outside-floor'].geometry} material={materials.floor} position={nodes['outside-floor'].position} rotation={nodes['outside-floor'].rotation} scale={nodes['outside-floor'].scale} renderOrder={1} receiveShadow onClick={handleFloorClick} />}
      {nodes.wall && <mesh geometry={nodes.wall.geometry} material={materials.wallInt} position={nodes.wall.position} rotation={nodes.wall.rotation} scale={nodes.wall.scale} renderOrder={2} castShadow receiveShadow />}
      {nodes['outside-walls'] && <mesh geometry={nodes['outside-walls'].geometry} material={materials.outsideWalls} position={nodes['outside-walls'].position} rotation={nodes['outside-walls'].rotation} scale={nodes['outside-walls'].scale} renderOrder={2} castShadow receiveShadow />}
      {nodes['stairs-and-platforms'] && <mesh geometry={nodes['stairs-and-platforms'].geometry} material={layers.dimensions ? materials.stairsHighlight : materials.stairs} position={nodes['stairs-and-platforms'].position} rotation={nodes['stairs-and-platforms'].rotation} scale={nodes['stairs-and-platforms'].scale} renderOrder={2} receiveShadow castShadow onClick={handleFloorClick} />}
      {nodes.exhibits && <mesh geometry={nodes.exhibits.geometry} material={materials.exhibits} position={nodes.exhibits.position} rotation={nodes.exhibits.rotation} scale={nodes.exhibits.scale} renderOrder={2} castShadow receiveShadow />}
      {nodes.windows && <mesh geometry={nodes.windows.geometry} material={materials.windows} position={nodes.windows.position} rotation={nodes.windows.rotation} scale={nodes.windows.scale} renderOrder={3} />}



      {/* Node Mapping Overlay */}
      {isDebugMode && showNodes && isActive && Object.entries(N).map(([name, coord]) => {
        const isSelected = routeSequence.includes(name)
        return (
          <group key={name} position={[coord.x, coord.y, coord.z]}>
            <mesh renderOrder={9999} onClick={(e) => handleExistingNodeClick(name, e)}>
              <sphereGeometry args={[isSelected ? 0.45 : 0.3]} />
              <meshBasicMaterial color={isSelected ? '#f97316' : '#10b981'} depthTest={false} transparent={true} />
            </mesh>
            <Html position={[0, 0.6, 0]} center zIndexRange={[100, 0]}>
              <div onClick={(e) => handleExistingNodeClick(name, e)} style={{ background: isSelected ? '#f97316' : '#0f172a', color: '#fff', padding: '4px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>{name}</div>
            </Html>
          </group>
        )
      })}

      {isDebugMode && enableMapping && isActive && debugMarkers.map((marker) => (
        <mesh key={marker.id} position={[marker.x, marker.y, marker.z]} renderOrder={9999} onClick={(e) => handleMarkerClick(marker.id, e)} >
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#ef4444" depthTest={false} depthWrite={false} transparent={true} />
        </mesh>
      ))}

      {nodes.columns && <mesh geometry={nodes.columns.geometry} material={materials.columns} position={nodes.columns.position} rotation={nodes.columns.rotation} scale={nodes.columns.scale} renderOrder={2} castShadow receiveShadow visible={layers.dimensions} />}
      {nodes.labels && <mesh geometry={nodes.labels.geometry} material={materials.labels} position={nodes.labels.position} rotation={nodes.labels.rotation} scale={nodes.labels.scale} renderOrder={2} castShadow receiveShadow visible={layers.dimensions} />}
      {nodes.accessibility && <mesh geometry={nodes.accessibility.geometry} material={materials.accessibility} position={nodes.accessibility.position} rotation={nodes.accessibility.rotation} scale={nodes.accessibility.scale} renderOrder={3} visible={layers.dimensions} />}
    </group>
  )
}

useGLTF.preload('/models/museum_1f.glb')
useGLTF.preload('/models/museum_2f.glb')