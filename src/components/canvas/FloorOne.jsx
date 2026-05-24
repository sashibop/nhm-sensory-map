import * as THREE from 'three'
import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber' // <--- ADD THIS

export default function FloorOne({ isActive, focusRef }) { // <--- ADD PROPS
  
  // --- PRE-CALCULATE COLORS FOR HIGH PERFORMANCE ---
  const { materials, origColors, dullColors } = useMemo(() => {
    const mats = {
      floorBase: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9 }),
      floorCorridor: new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.8 }),
      floorRoom: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1.0 }),
      floorStair: new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.9 }),
      wallExt: new THREE.MeshStandardMaterial({ color: '#334155', roughness: 1.0 }), 
      wallInt: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.9 }),
      stair: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.7 }),
      elevatorCar: new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.4, roughness: 0.2 }),
      column: new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.8 }),
      ramp: new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.9 }),
      tactileWarning: new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 1.0, bumpScale: 0.05 }), 
      handrail: new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.6, roughness: 0.4 }),
      benchWood: new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.8 }),
      benchMetal: new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8 }),
    }

    const orig = {}
    const dull = {}

    // Generate a "Dull" version of every color (blended with slate gray and darkened)
    Object.entries(mats).forEach(([key, mat]) => {
      orig[key] = mat.color.clone()
      dull[key] = mat.color.clone().lerp(new THREE.Color('#475569'), 0.1).multiplyScalar(0.9)
    })

    return { materials: mats, origColors: orig, dullColors: dull }
  }, [])

  // --- THE COLOR BLENDING ENGINE ---
  useFrame(() => {
    if (!focusRef) return;
    
    const focus = focusRef.current; // Ranges from 0.0 (dull) to 1.0 (vibrant)
    
    // Only update materials if the transition is actively happening
    if (Math.abs(materials.wallInt.opacity - (0.2 + focus * 0.8)) > 0.01) {
      Object.entries(materials).forEach(([key, mat]) => {
        
        // 1. Blend the color smoothly between dull and original
        mat.color.lerpColors(dullColors[key], origColors[key], focus)
        
        // 2. Make the inactive floor slightly ghosted/transparent
        mat.transparent = true;
        mat.opacity = 0.15 + (focus * 0.85); // 15% opacity when dull, 100% when active
        
        mat.needsUpdate = true;
      })
    }
  })

  const h = 1.2;
  const extT = 0.6;
  const intT = 0.25;
  const floorH = 0.4;
  const dwStd = 1.8; // Expanded width for comfortable double-wheelchair passing
  const dwDbl = 3.0; // Expanded major arteries

  const Floor = ({ x, z, w, d, mat = materials.floorRoom }) => (
    <mesh position={[x, floorH / 2, z]} receiveShadow>
      <boxGeometry args={[w, floorH, d]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )

  const Wall = ({ x, z, w, d, rot = 0, ext = false }) => (
    <mesh position={[x, floorH + (h / 2), z]} rotation={[0, rot, 0]} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <primitive object={ext ? materials.wallExt : materials.wallInt} attach="material" />
    </mesh>
  )

  // Replaces WallWithDoor. Leaves a pure geometric gap without threshold meshes or frames.
  const WallWithGap = ({ x, z, length, gapPos, gapWidth, rot = 0, ext = false }) => {
    const t = ext ? extT : intT;
    const w1Len = Math.max(0, gapPos - (gapWidth / 2));
    const w2Len = Math.max(0, length - gapPos - (gapWidth / 2));
    const w1Pos = -length / 2 + w1Len / 2;
    const w2Pos = length / 2 - w2Len / 2;

    return (
      <group position={[x, 0, z]} rotation={[0, rot, 0]}>
        {w1Len > 0 && <Wall x={w1Pos} z={0} w={w1Len} d={t} ext={ext} />}
        {w2Len > 0 && <Wall x={w2Pos} z={0} w={w2Len} d={t} ext={ext} />}
      </group>
    )
  }

  const TactileStrip = ({ width, depth = 0.6, yOffset = 0.005, zOffset = 0 }) => (
    <mesh position={[0, yOffset, zOffset]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <primitive object={materials.tactileWarning} attach="material" />
    </mesh>
  )

  const Handrail = ({ length, angle, xOffset, yBase }) => (
    <group position={[xOffset, yBase + 0.9, 0]} rotation={[angle, 0, 0]}>
      {/* Handrail Bar */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.04, length, 8]} />
        <primitive object={materials.handrail} attach="material" />
      </mesh>
      {/* Supports */}
      <mesh position={[0, -0.45, -length * 0.4]} rotation={[-angle, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
        <primitive object={materials.handrail} attach="material" />
      </mesh>
      <mesh position={[0, -0.45, length * 0.4]} rotation={[-angle, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
        <primitive object={materials.handrail} attach="material" />
      </mesh>
    </group>
  )

  const Stairs = ({ x, z, width, steps = 6, stepDepth = 0.35, totalHeight = floorH, rot = 0 }) => {
    const stepH = totalHeight / steps;
    const totalDepth = steps * stepDepth;
    const angle = Math.atan(totalHeight / totalDepth);
    const hyp = Math.hypot(totalDepth, totalHeight);

    return (
      <group position={[x, 0, z]} rotation={[0, rot, 0]}>
        {/* Steps */}
        {Array.from({ length: steps }).map((_, i) => (
          <mesh key={i} position={[0, (i * stepH) + (stepH / 2), (i * stepDepth) - (totalDepth/2)]} receiveShadow castShadow>
            <boxGeometry args={[width, stepH * (i + 1), stepDepth]} />
            <primitive object={materials.stair} attach="material" />
          </mesh>
        ))}
      </group>
    )
  }

  const AccessibleRamp = ({ x, z, width = 2.5, length = 4, totalHeight = floorH+0.2, rot = 0 }) => {
    const angle = Math.atan(totalHeight / length);
    const hyp = Math.hypot(length, totalHeight);
    return (
      <group position={[x, 0, z]} rotation={[0, rot, 0]}>
        <mesh position={[0, totalHeight / 2, 0]} rotation={[angle, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[width, 0.1, hyp]} />
          <primitive object={materials.ramp} attach="material" />
        </mesh>

         <mesh position={[0, 0, 2.5]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[1.5, 1.0]} />
        <primitive object={materials.tactileWarning} attach="material" />
      </mesh>s
      </group>
    )
  }

  const ElevatorCore = ({ x, z, rot = 0 }) => (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <Wall x={0} z={-1.5} w={3} d={intT} />
      <Wall x={-1.5} z={0} w={intT} d={3} />
      <Wall x={1.5} z={0} w={intT} d={3} />
      <WallWithGap x={0} z={1.5} length={3} gapPos={1.5} gapWidth={dwStd} />
      
      {/* Elevator Cabin Indicator */}
      <mesh position={[0, floorH, 0.2]} castShadow>
        <boxGeometry args={[2.4, 0.1, 2.4]} />
        <primitive object={materials.elevatorCar} attach="material" />
      </mesh>
      
      {/* Tactile indicator for elevator controls / boarding area */}
      <mesh position={[0, floorH+0.1, 2.2]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[1.5, 1.0]} />
        <primitive object={materials.tactileWarning} attach="material" />
      </mesh>
    </group>
  )

  const RestAreaBench = ({ x, z, rot = 0 }) => (
    <group position={[x, floorH, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.8, 0.05, 0.5]} />
        <primitive object={materials.benchWood} attach="material" />
      </mesh>
      <mesh position={[-0.7, 0.125, 0]} castShadow>
        <boxGeometry args={[0.05, 0.25, 0.4]} />
        <primitive object={materials.benchMetal} attach="material" />
      </mesh>
      <mesh position={[0.7, 0.125, 0]} castShadow>
        <boxGeometry args={[0.05, 0.25, 0.4]} />
        <primitive object={materials.benchMetal} attach="material" />
      </mesh>
      {/* Dedicated resting/companion wheelchair space indicator */}
      <mesh position={[1.65, 0.005, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
      </mesh>
    </group>
  )

  const ColumnGrid2x2 = ({ centerX, centerZ, spacingX, spacingZ, radius = 0.3 }) => (
    <group>
      {[
        [-1, -1], [1, -1],
        [-1, 1], [1, 1]
      ].map(([dx, dz], i) => (
        <mesh key={i} position={[centerX + (dx * spacingX / 2), floorH + (h/2), centerZ + (dz * spacingZ / 2)]} castShadow>
          <cylinderGeometry args={[radius, radius, h, 16]} />
          <primitive object={materials.column} attach="material" />
        </mesh>
      ))}
    </group>
  )

  return (
    <group>
      {/* ========================================================= */}
      {/* 1. WALKABLE SURFACES & FOUNDATION                           */}
      {/* ========================================================= */}
      
      <Floor x={0} z={12} w={56} d={12} mat={materials.floorCorridor} /> 
      <Floor x={0} z={-4} w={18} d={20} mat={materials.floorCorridor} /> 
      <Floor x={-23} z={-8} w={10} d={50} /> 
      <Floor x={23} z={-8} w={10} d={50} /> 
      
      <mesh position={[0, floorH/2, -14]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 32, 0, Math.PI]} />
        <primitive object={materials.floorBase} attach="material" />
      </mesh>

      {/* ========================================================= */}
      {/* 2. ACCESSIBILITY ENTRANCE, CIRCULATION, & REST AREAS        */}
      {/* ========================================================= */}
      
      {/* Main Entrance Integration */}
      <Stairs x={0} z={18.2} width={8} steps={6} stepDepth={0.35} rot={Math.PI} />
      <AccessibleRamp x={-3.7} z={19} width={2.5} length={9 * 0.35} />
      
      {/* Rear Wing Exits */}
      <Stairs x={-9.5} z={-9} width={10} steps={6} stepDepth={0.3} rot={Math.PI/2} />
      <Stairs x={9.5} z={-9} width={10} steps={6} stepDepth={0.3} rot={-Math.PI/2} />

      <Stairs x={3.5} z={5} width={3} steps={15} stepDepth={0.3} totalHeight={1.5} rot={Math.PI} />
      <Stairs x={-3.5} z={5} width={3} steps={15} stepDepth={0.3} totalHeight={1.5} rot={Math.PI} />

      <Stairs x={-23} z={-26} width={3} steps={15} stepDepth={0.3} totalHeight={1.5} rot={Math.PI} />

      {/* Rest / Relief Areas spaced appropriately in long corridors */}
      <RestAreaBench x={-8} z={16} rot={0} />
      <RestAreaBench x={12} z={16} rot={Math.PI/2} />
      <RestAreaBench x={19.5} z={3} rot={Math.PI/2} />
      <RestAreaBench x={19.5} z={-2} rot={Math.PI/2} />
      <RestAreaBench x={19.5} z={-10} rot={Math.PI/2} />
      <RestAreaBench x={19.5} z={-18} rot={Math.PI/2} />
      <RestAreaBench x={19.5} z={-26} rot={Math.PI/2} />
      <RestAreaBench x={0.5} z={-7} rot={Math.PI} />
      <RestAreaBench x={-22} z={-29} rot={Math.PI} />
      <RestAreaBench x={-26.3} z={12} rot={Math.PI/2} />


      {/* ========================================================= */}
      {/* 3. EXTERIOR SHELL                                           */}
      {/* ========================================================= */}

      <WallWithGap x={-16.5} z={17.7} length={23} gapPos={12.5} gapWidth={0} ext rot={0} />
      <WallWithGap x={16} z={17.7} length={24} gapPos={12.5} gapWidth={0} ext rot={0} />
      
      <Wall x={-27.7} z={-7.5} w={extT} d={50.3} ext />
      <Wall x={27.7} z={-7.5} w={extT} d={50.3} ext />
      <Wall x={-23} z={-32.7} w={10} d={extT} ext />
      <Wall x={23} z={-32.7} w={10} d={extT} ext />

      <Wall x={-18.3} z={-13.5} w={extT} d={39} ext />
      <Wall x={-9} z={1.3} w={0.01} d={10} ext />
      <Wall x={18.3} z={-13.5} w={extT} d={39} ext />
      <Wall x={9} z={1.3} w={0.01} d={10} ext />
      <Wall x={-13.6} z={6} w={9.2} d={extT} ext />
      <Wall x={13.6} z={6} w={9.2} d={extT} ext />

      {/* ========================================================= */}
      {/* 4. INTERIOR GAPS (Completely Unobstructed Access)           */}
      {/* ========================================================= */}

      {/* Front Lobby Rooms */}
      <WallWithGap x={-23} z={6} length={10} gapPos={5} gapWidth={dwDbl} rot={0} />
      <WallWithGap x={-10} z={12} length={11.5} gapPos={5.4} gapWidth={dwStd} rot={Math.PI/2} />
      <WallWithGap x={-18.1} z={12} length={11.5} gapPos={5.4} gapWidth={dwStd} rot={Math.PI/2} />


      <WallWithGap x={23} z={6} length={10} gapPos={5} gapWidth={dwDbl} rot={0} />
      <WallWithGap x={13.5} z={12} length={11.5} gapPos={5.4} gapWidth={dwStd} rot={Math.PI/2} />
      <WallWithGap x={23} z={11.5} length={10} gapPos={5} gapWidth={dwStd} rot={0} />
      <WallWithGap x={18.1} z={14.6} length={6} gapPos={3.1} gapWidth={dwStd} rot={Math.PI/2} />

      {/* Wing Room Divisions */}
      <WallWithGap x={-23} z={-2} length={10} gapPos={5} gapWidth={dwDbl} rot={0} /> 
      <WallWithGap x={-23} z={-22} length={10} gapPos={5} gapWidth={dwDbl} rot={0} /> 
      <WallWithGap x={23} z={-6} length={10} gapPos={5} gapWidth={dwDbl} rot={0} />

      {/* ========================================================= */}
      {/* 5. STRUCTURAL HIGHLIGHTS                                    */}
      {/* ========================================================= */}

      <ElevatorCore x={-6.7} z={6} rot={0} />
      <ElevatorCore x={6.7} z={6} rot={0} />

      <ColumnGrid2x2 centerX={-18.25} centerZ={11.5} spacingX={4.5} spacingZ={4.5} />
      <ColumnGrid2x2 centerX={18.25} centerZ={11.5} spacingX={4.5} spacingZ={4.5} />

      {/* The Central Octagon (Room 75) - Cardinal axes left completely empty */}
      <group position={[0, floorH, -4]}>
        <Wall x={-2.83} z={-2.83} w={3.4} d={intT} rot={Math.PI/4} />
        <Wall x={-4} z={0} w={3.4} d={intT} rot={Math.PI/2} />
        <Wall x={2.83} z={-2.83} w={3.4} d={intT} rot={-Math.PI/4} />
        <Wall x={4} z={0} w={3.4} d={intT} rot={Math.PI/2} />
        <Wall x={-2.83} z={2.83} w={3.4} d={intT} rot={-Math.PI/4} />
        <Wall x={0} z={-4} w={3.4} d={intT} rot={Math.PI} />
        <Wall x={2.83} z={2.83} w={3.4} d={intT} rot={Math.PI/4} />
      </group>

      {/* The Apse (Room 76) */}
      <mesh position={[0, floorH + (h/2), -14]} castShadow receiveShadow>
        <cylinderGeometry args={[8.7, 8.7, h, 32, 1, true, Math.PI/2, Math.PI]} />
        <primitive object={materials.wallExt} attach="material" side={THREE.DoubleSide} />
      </mesh>
      {[-1.2, -0.4, 0.4, 1.2].map((angle, i) => (
        <mesh key={`apse-col-${i}`} position={[8.4 * Math.sin(angle), floorH + (h/2), -14 - 8.4 * Math.cos(angle)]} castShadow>
          <boxGeometry args={[0.5, h, 0.5]} />
          <primitive object={materials.column} attach="material" />
        </mesh>
      ))}

      {/* Wing Columns & Stairs */}
      <group>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={`col-L1-${i}`} position={[-20.5, floorH + (h/2), -19 + (i * 3.5)]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, h, 16]} />
            <primitive object={materials.column} attach="material" />
          </mesh>
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={`col-L2-${i}`} position={[-25.5, floorH + (h/2), -19 + (i * 3.5)]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, h, 16]} />
            <primitive object={materials.column} attach="material" />
          </mesh>
        ))}
      </group>

    </group>
  )
}