import * as THREE from 'three'
import { useMemo } from 'react'
import CrowdLayer from '../../layers/3d/CrowdLayer'
import NoiseLayer from '../../layers/3d/NoiseLayer'
import BrightnessLayer from '../../layers/3d/BrightnessLayer'
import useAppStore from '../../../../store/useAppStore'

export default function FloorTwo() {
  const layers = useAppStore((state) => state.layers)
  const materials = useMemo(() => ({
    floorBase: new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.9 }),
    floorCorridor: new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.8 }),
    floorRoom: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1.0 }),
    floorStair: new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.9 }),
    wallExt: new THREE.MeshStandardMaterial({ color: '#334155', roughness: 1.0 }), 
    wallInt: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.9 }),
    stair: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.7 }),
    exhibit: new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.3, metalness: 0.6 }),
    elevatorCar: new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.4, roughness: 0.2 }),
    column: new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.8 }),
    ramp: new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.9 }),
    tactileWarning: new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 1.0, bumpScale: 0.05 }), 
    handrail: new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.6, roughness: 0.4 }),
    benchWood: new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.8 }),
    benchMetal: new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8 }),
  }), [])

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
        <primitive object={materials.benchMetal} attach="material" />
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

      {layers.crowd && <CrowdLayer targetFloor={2} />}
      {layers.noise && <NoiseLayer targetFloor={2} />}
      {layers.brightness && <BrightnessLayer targetFloor={2} />}


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

      {/* Rest / Relief Areas spaced appropriately in long corridors */}
      <RestAreaBench x={-8} z={16} rot={0} />
      <RestAreaBench x={19.5} z={-10} rot={Math.PI/2} />
      <RestAreaBench x={19.5} z={-18} rot={Math.PI/2} />
      <RestAreaBench x={19.5} z={-26} rot={Math.PI/2} />
      <RestAreaBench x={-26.3} z={12} rot={Math.PI/2} />


      {/* ========================================================= */}
      {/* 3. EXTERIOR SHELL                                           */}
      {/* ========================================================= */}

      <WallWithGap x={-11.5} z={17.7} length={33} gapPos={12.5} gapWidth={0} ext rot={0} />
      <WallWithGap x={16} z={17.7} length={24} gapPos={12.5} gapWidth={0} ext rot={0} />
      
      <Wall x={-27.7} z={-7.5} w={extT} d={50.3} ext />
      <Wall x={27.7} z={-7.5} w={extT} d={50.3} ext />
      <Wall x={-23} z={-32.7} w={10} d={extT} ext />
      <Wall x={23} z={-32.7} w={10} d={extT} ext />

      <Wall x={-18.3} z={-13.5} w={extT} d={39} ext />
      <Wall x={-8.70} z={-3.85} w={0.01} d={20.3} ext />
      <Wall x={18.3} z={-13.5} w={extT} d={39} ext />
      <Wall x={8.7} z={-3.85} w={0.01} d={20.3} ext />
      <Wall x={-13.6} z={6} w={9.9} d={extT} ext />
      <Wall x={13.6} z={6} w={9.9} d={extT} ext />

      {/* ========================================================= */}
      {/* 4. INTERIOR GAPS (Completely Unobstructed Access)           */}
      {/* ========================================================= */}

      {/* Front Lobby Rooms */}
      <WallWithGap x={-23} z={6} length={10} gapPos={5} gapWidth={dwDbl} rot={0} />
      <WallWithGap x={-10} z={12} length={11.5} gapPos={5.4} gapWidth={dwStd} rot={Math.PI/2} />
      <WallWithGap x={-18.1} z={12} length={11.5} gapPos={5.4} gapWidth={dwStd} rot={Math.PI/2} />


      <WallWithGap x={18.5} z={12} length={11.5} gapPos={6.3} gapWidth={dwStd} rot={Math.PI/2} />

      {/* Wing Room Divisions */}
      <WallWithGap x={-23} z={-2} length={10} gapPos={5} gapWidth={dwDbl} rot={0} /> 
      <WallWithGap x={-23} z={-22} length={10} gapPos={5} gapWidth={dwDbl} rot={0} /> 

      {/* ========================================================= */}
      {/* 5. STRUCTURAL HIGHLIGHTS                                    */}
      {/* ========================================================= */}

      <ElevatorCore x={-6.7} z={6} rot={0} />
      <ElevatorCore x={6.7} z={6} rot={0} />

      <ColumnGrid2x2 centerX={-18.25} centerZ={11.5} spacingX={4.5} spacingZ={4.5} />
      <ColumnGrid2x2 centerX={18.25} centerZ={11.5} spacingX={4.5} spacingZ={4.5} />

      <Stairs x={-23} z={-29} width={3} steps={1} stepDepth={4.5} totalHeight={0.5} rot={Math.PI} />

      <Stairs x={2.85} z={-5.8} width={2} steps={1} stepDepth={3.5} totalHeight={0.5} rot={Math.PI} />
      <Stairs x={-2.85} z={-5.8} width={2} steps={1} stepDepth={3.5} totalHeight={0.5} rot={Math.PI} />


       <group position={[0, 0, -4]}>
        <Wall x={-2.83} z={-2.83} w={3.4} d={intT} rot={Math.PI/4} />
        <Wall x={-4} z={0} w={3.4} d={intT} rot={Math.PI/2} />
        <Wall x={2.83} z={-2.83} w={3.4} d={intT} rot={-Math.PI/4} />
        <Wall x={4} z={0} w={3.4} d={intT} rot={Math.PI/2} />
        <Wall x={0} z={-4} w={3.4} d={intT} rot={Math.PI} />
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

      {/* "The Stack Overflow" (Near the Reading Lounge) */}
      <group position={[23.5, floorH, -27]}>
        {/* The Pedestal */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.2, 1, 32]} />
          <primitive object={materials.exhibit} attach="material" />
        </mesh>
        
        {/* The Precarious Stack */}
        <mesh position={[0.1, 1.15, 0.1]} rotation={[0, 0.2, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.3, 1.2]} />
          <primitive object={materials.exhibit} attach="material" />
        </mesh>
        <mesh position={[-0.2, 1.45, -0.1]} rotation={[0.1, -0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.25, 1.3]} />
          <primitive object={materials.exhibit} attach="material" />
        </mesh>
        <mesh position={[0.3, 1.75, 0.2]} rotation={[-0.1, 0.5, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.35, 1.1]} />
          <primitive object={materials.exhibit} attach="material" />
        </mesh>
        <mesh position={[-0.4, 2.1, -0.3]} rotation={[0.2, -0.6, -0.1]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.4, 1.4]} />
          <primitive object={materials.exhibit} attach="material" />
        </mesh>
        <mesh position={[0.5, 2.45, 0.4]} rotation={[-0.2, 0.8, 0.3]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.2, 1.2]} />
          <primitive object={materials.exhibit} attach="material" />
        </mesh>
      </group>

      {/* Interactive Video Wall (Lobby Left) */}
      <mesh position={[26, floorH + 1, 11]} rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2, 0.2]} />
        <primitive object={materials.exhibit} attach="material" />
      </mesh>

    </group>
  )
}