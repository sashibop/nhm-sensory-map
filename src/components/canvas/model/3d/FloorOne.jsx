import * as THREE from 'three'
import { useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import CrowdLayer from '../../layers/3d/CrowdLayer'
import NoiseLayer from '../../layers/3d/NoiseLayer'
import useAppStore from '../../../../store/useAppStore'
import { Html } from '@react-three/drei'

// --- DEBUG TOOL: WAYPOINT VISUALIZER ---
const DebugNodes = () => {
  // We keep a local copy of the nodes here so you can easily tweak the x/z numbers
  // right here in the visualizer, then copy-paste them back to mockVisitorData.js when perfect.
  const nodes = {
    Entrance: { x: 0, z: 20 },
    Lobby: { x: 0, z: 12 },
    LobbyLeft: { x: -14, z: 12 },
    LobbyRight: { x: 14, z: 12 },
    LeftWingMid: { x: -23, z: 7 },
    LeftDeep: { x: -23, z: -18 },
    RightWingMid: { x: 23, z: 7 },
    RightDeep: { x: 23, z: -18 },
    Octagon: { x: 0, z: 0 },
    Restroom: { x: 8, z: 15 },
    LeftLift: { x: -6.7, z: 6 },
    LeftDown: { x: -23, z: 15 },
    RightDown: { x: 23, z: 16 },
    RightMidDoor: { x: 23, z: -6 },
    RightMidRoom: { x: 25, z: 0 },

  };

  return (
    <group>
      {Object.entries(nodes).map(([name, pos]) => (
        <group key={name} position={[pos.x, 1.0, pos.z]}>
          {/* 1. The Red Marker (Wireframe so it looks like a tech/debug tool) */}
          <mesh>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshBasicMaterial color="#ef4444" wireframe={true} />
          </mesh>

          {/* 2. The Floating UI Label */}
          <Html center position={[0, 0.8, 0]} zIndexRange={[100, 0]}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.85)',
              color: '#ef4444', // Red text
              padding: '4px 8px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '11px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              pointerEvents: 'none', // Prevents the label from blocking your camera controls
              border: '1px solid #ef4444'
            }}>
              {name} <br />
              <span style={{ color: 'white', fontWeight: 'normal' }}>
                [{pos.x}, {pos.z}]
              </span>
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}

export default function FloorOne({ isActive, focusRef }) {

  const layers = useAppStore((state) => state.layers);

  // --- PRE-CALCULATE COLORS FOR HIGH PERFORMANCE ---
  const { materials, origColors, dullColors } = useMemo(() => {
    const mats = {
      floorBase: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9 }),
      floorCorridor: new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.8 }),
      floorRoom: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1.0 }),
      floorStair: new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.9 }),
      wallExt: new THREE.MeshStandardMaterial({ color: '#334155', roughness: 1.0 }),
      wallInt: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.9 }),
      stair: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.7 }),
      elevatorCar: new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.4, roughness: 0.2 }),
      column: new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.8 }),
      ramp: new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.9 }),
      tactileWarning: new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 1.0, bumpScale: 0.05 }),
      handrail: new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.6, roughness: 0.4 }),
      benchWood: new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.8 }),
      benchMetal: new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8 }),
      exhibit: new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.3, metalness: 0.6 }),
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
    <mesh position={[0, yOffset, zOffset]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
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

  const Stairs = ({ x, y, z, width, steps = 6, stepDepth = 0.35, totalHeight = floorH, rot = 0 }) => {
    const stepH = totalHeight / steps;
    const totalDepth = steps * stepDepth;
    const angle = Math.atan(totalHeight / totalDepth);
    const hyp = Math.hypot(totalDepth, totalHeight);

    return (
      <group position={[x, y, z]} rotation={[0, rot, 0]}>
        {/* Steps */}
        {Array.from({ length: steps }).map((_, i) => (
          <mesh key={i} position={[0, (i * stepH) + (stepH / 2), (i * stepDepth) - (totalDepth / 2)]} receiveShadow castShadow>
            <boxGeometry args={[width, stepH * (i + 1), stepDepth]} />
            <primitive object={materials.stair} attach="material" />
          </mesh>
        ))}
      </group>
    )
  }

  const AccessibleRamp = ({ x, z, width = 2.5, length = 4, totalHeight = floorH + 0.2, rot = 0 }) => {
    const angle = Math.atan(totalHeight / length);
    const hyp = Math.hypot(length, totalHeight);
    return (
      <group position={[x, 0, z]} rotation={[0, rot, 0]}>
        <mesh position={[0, totalHeight / 2, 0]} rotation={[angle, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[width, 0.1, hyp]} />
          <primitive object={materials.ramp} attach="material" />
        </mesh>

        <mesh position={[0, 0, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
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
      {/* <mesh position={[0, floorH, 0.2]} castShadow>
        <boxGeometry args={[2.4, 0.1, 2.4]} />
        <primitive object={materials.elevatorCar} attach="material" />
      </mesh> */}

      {/* Tactile indicator for elevator controls / boarding area */}
      <mesh position={[0, floorH + 0.1, 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
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
      <mesh position={[1.65, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
        <mesh key={i} position={[centerX + (dx * spacingX / 2), floorH + (h / 2), centerZ + (dz * spacingZ / 2)]} castShadow>
          <cylinderGeometry args={[radius, radius, h, 16]} />
          <primitive object={materials.column} attach="material" />
        </mesh>
      ))}
    </group>
  )

  const sharkTexture = useMemo(() => {
    return new THREE.TextureLoader().load('src/assets/natureRoleModel.svg');
  }, []);


  const glowTexture = useMemo(() => {
    const size = 256;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );

    gradient.addColorStop(0, 'rgba(0, 170, 255, 0.9)');
    gradient.addColorStop(0.3, 'rgba(0, 170, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 170, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }, []);

  function Hotspot({ position, rotation, texture, onClick, onPointerEnter, onPointerLeave, isSelected, isHighlighted, size = 6 }) {
    const [hovered, setHovered] = useState(false);
    const active = hovered || isHighlighted;

    return (
      <group position={position} rotation={rotation}>
        {/* Glow */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[size * 2.5, size * 2.5]} />
          <meshBasicMaterial
            map={glowTexture}
            transparent
            opacity={isSelected ? 0.9 : active ? 0.75 : 0.5}
            depthWrite={false}
          />
        </mesh>

        {/* Selection ring */}
        {isSelected && (
          <mesh position={[0, 0, -0.005]}>
            <ringGeometry args={[size * 0.6, size * 0.72, 32]} />
            <meshBasicMaterial
              color="#6C8EFF"
              transparent
              opacity={0.9}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Icon */}
        <mesh
          scale={active ? 1.15 : 1}
          onPointerOver={(e) => {
            setHovered(true);
            document.body.style.cursor = 'pointer';
            onPointerEnter?.(e);
          }}
          onPointerOut={(e) => {
            setHovered(false);
            document.body.style.cursor = 'default';
            onPointerLeave?.(e);
          }}
          onClick={onClick}
        >
          <planeGeometry args={[size, size]} />
          <meshBasicMaterial
            map={texture}
            transparent
            side={THREE.DoubleSide}
            opacity={isSelected ? 1 : active ? 0.95 : 0.75}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group>

      {layers.crowd && <CrowdLayer targetFloor={1} />}
      {layers.noise && <NoiseLayer targetFloor={1} />}
      {/* <DebugNodes /> */}

      {/* ========================================================= */}
      {/* 1. WALKABLE SURFACES & FOUNDATION                           */}
      {/* ========================================================= */}

      {/* <Floor x={0} z={12} w={56} d={12} mat={materials.floorCorridor} /> 
      <Floor x={0} z={-4} w={18} d={20} mat={materials.floorCorridor} /> 
      <Floor x={-23} z={-8} w={10} d={50} /> 
      <Floor x={23} z={-8} w={10} d={50} /> 
      
      <mesh position={[0, floorH/2, -14]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 32, 0, Math.PI]} />
        <primitive object={materials.floorBase} attach="material" />
      </mesh> */}

      {/* ========================================================= */}
      {/* 2. ACCESSIBILITY ENTRANCE, CIRCULATION, & REST AREAS        */}
      {/* ========================================================= */}

      {/* Main Entrance Integration */}
      <Stairs x={0} y={0} z={18.2} width={8} steps={6} stepDepth={0.35} rot={Math.PI} />
      <AccessibleRamp x={-3.7} z={19} width={2.5} length={3.5} />

      {/* Rear Wing Exits */}
      <Stairs x={-9.5} y={0} z={-9} width={10} steps={6} stepDepth={0.3} rot={Math.PI / 2} />
      <Stairs x={9.5} y={0} z={-9} width={10} steps={6} stepDepth={0.3} rot={-Math.PI / 2} />

      {/* To Floor Two */}
      <Stairs x={2.85} y={floorH} z={-3.9} width={2} steps={15} stepDepth={0.27} totalHeight={1.5} rot={Math.PI} />
      <Stairs x={-2.85} y={floorH} z={-3.9} width={2} steps={15} stepDepth={0.27} totalHeight={1.5} rot={Math.PI} />

      <Stairs x={-23} y={floorH} z={-26} width={3} steps={15} stepDepth={0.3} totalHeight={1.5} rot={Math.PI} />

      {/* Rest / Relief Areas spaced appropriately in long corridors */}
      <RestAreaBench x={-8} z={16} rot={0} />
      <RestAreaBench x={12} z={16} rot={Math.PI / 2} />
      <RestAreaBench x={26.5} z={3} rot={Math.PI / 2} />
      <RestAreaBench x={26.5} z={-2} rot={Math.PI / 2} />
      <RestAreaBench x={19.5} z={-10} rot={Math.PI / 2} />
      <RestAreaBench x={19.5} z={-18} rot={Math.PI / 2} />
      <RestAreaBench x={19.5} z={-26} rot={Math.PI / 2} />
      <RestAreaBench x={0.5} z={-11} rot={Math.PI} />
      <RestAreaBench x={-22} z={-29} rot={Math.PI} />
      <RestAreaBench x={-26.3} z={9} rot={Math.PI / 2} />


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
      <WallWithGap x={-10} z={12} length={11.5} gapPos={5.7} gapWidth={dwStd + 2} rot={Math.PI / 2} />


      <WallWithGap x={23} z={6} length={10} gapPos={5} gapWidth={dwDbl} rot={0} />
      <WallWithGap x={13.5} z={12} length={11.5} gapPos={5.4} gapWidth={dwStd} rot={Math.PI / 2} />
      <WallWithGap x={23} z={11.5} length={10} gapPos={5} gapWidth={dwStd} rot={0} />
      <WallWithGap x={18.1} z={14.6} length={6} gapPos={3.1} gapWidth={dwStd} rot={Math.PI / 2} />

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
      <group position={[0, 0, -4]}>
        <Wall x={-2.83} z={-2.83} w={3.4} d={intT} rot={Math.PI / 4} />
        <Wall x={-4} z={0} w={3.4} d={intT} rot={Math.PI / 2} />
        <Wall x={2.83} z={-2.83} w={3.4} d={intT} rot={-Math.PI / 4} />
        <Wall x={4} z={0} w={3.4} d={intT} rot={Math.PI / 2} />
        <Wall x={0} z={-4} w={3.4} d={intT} rot={Math.PI} />
      </group>

      {/* The Apse (Room 76) */}
      <mesh position={[0, floorH + (h / 2), -14]} castShadow receiveShadow>
        <cylinderGeometry args={[8.7, 8.7, h, 32, 1, true, Math.PI / 2, Math.PI]} />
        <primitive object={materials.wallExt} attach="material" side={THREE.DoubleSide} />
      </mesh>
      {[-1.2, -0.4, 0.4, 1.2].map((angle, i) => (
        <mesh key={`apse-col-${i}`} position={[8.4 * Math.sin(angle), floorH + (h / 2), -14 - 8.4 * Math.cos(angle)]} castShadow>
          <boxGeometry args={[0.5, h, 0.5]} />
          <primitive object={materials.column} attach="material" />
        </mesh>
      ))}

      {/* Wing Columns & Stairs */}
      <group>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={`col-L1-${i}`} position={[-20.5, floorH + (h / 2), -19 + (i * 3.5)]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, h, 16]} />
            <primitive object={materials.column} attach="material" />
          </mesh>
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={`col-L2-${i}`} position={[-25.5, floorH + (h / 2), -19 + (i * 3.5)]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, h, 16]} />
            <primitive object={materials.column} attach="material" />
          </mesh>
        ))}
      </group>

      {/* 6. STATIC EXHIBITS (Physical Geometry)*/}
      {/* The Aviary (Right Deep Wing) */}
      <mesh position={[25, floorH + 0.5, -27]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 1.0, 32]} />
        <primitive object={materials.exhibit} attach="material" />
      </mesh>

      {/* The Waterfall Feature (Left Deep Wing) */}
      <mesh position={[-23, floorH + 0.6, -18]} castShadow receiveShadow>
        <boxGeometry args={[2, 1.2, 2]} />
        <primitive object={materials.exhibit} attach="material" />
      </mesh>


      {/* "Potassium & Hubris" (The Duct-Taped Banana) */}
      <group position={[0, floorH, -3]}>

        {/* The pristine, pretentious gallery partition wall */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 3, 0.4]} />
          <meshStandardMaterial color="#fff" roughness={0.1} />
        </mesh>

        {/* --- THE ENTIRE BANANA GROUP --- */}
        {/* Shifted slightly left (-0.15) and grouped so the tilt affects the tips too */}
        <group position={[-0.30, 1.65, 0.22]} rotation={[0, 0, -Math.PI / 4]}>

          {/* Main Banana Body (Sliced Donut) */}
          <mesh castShadow>
            <torusGeometry args={[0.4, 0.08, 16, 32, Math.PI / 2.5]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} /> {/* Bright Yellow */}
          </mesh>

          {/* Distal Tip (The bottom brown point) */}
          {/* Placed at the start of the torus arc and rotated to point down */}
          <mesh position={[0.4, -0.06, 0]} rotation={[0, 0, Math.PI]} castShadow>
            <coneGeometry args={[0.08, 0.15, 16]} />
            <meshStandardMaterial color="#eab308" roughness={0.6} /> {/* Bruised Dark Yellow */}
          </mesh>

          {/* Stem Base (The top woody attachment) */}
          {/* Calculated to sit exactly at the 72-degree end of the torus arc */}
          <mesh position={[0.08, 0.40, 0]} rotation={[0, 0, 1.2]} castShadow>
            <cylinderGeometry args={[0.03, 0.08, 0.20, 8]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.8} /> {/* Olive Green/Brown */}
          </mesh>

          <mesh position={[0.01, 0.42, -0.03]} rotation={[0, 0, 1.2]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.15, 3]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
        </group>

        {/* The Duct Tape */}
        {/* Tape sits at Z=0.3, perfectly pinning the banana (Z=0.22) to the wall */}
        <mesh position={[0.0, 1.65, 0.3]} rotation={[0, 0, -Math.PI / 6]} castShadow>
          <boxGeometry args={[0.8, 0.15, 0.02]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.2} roughness={0.7} /> {/* Silver Tape */}
        </mesh>

        {/* The tiny, overly-serious museum plaque */}
        <mesh position={[0.8, 0.8, 0.21]}>
          <boxGeometry args={[0.3, 0.2, 0.02]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

      </group>


      {/* Kinetic Sculpture (Right Mid Room) */}
      <mesh position={[20.5, floorH + 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[1, 0.3, 16, 32]} />
        <primitive object={materials.exhibit} attach="material" />
      </mesh>

      {/* "Tangled Headphones: A Modern Tragedy" (Left Down Room) */}
      <mesh
        position={[-25, floorH + 1.2, 15]}
        castShadow
        receiveShadow
      >
        {/* args: [radius, tube, tubularSegments, radialSegments] */}
        <torusKnotGeometry args={[0.8, 0.25, 128, 16]} />
        <primitive object={materials.exhibit} attach="material" />
      </mesh>


      <Hotspot
        position={[23, floorH + 0.01, -18]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 4]}
        texture={sharkTexture}
        isSelected={useAppStore((s) => s.selectedRooms.has("shark"))}
        isHighlighted={useAppStore((s) => s.hoveredMapIcon === "shark")}
        onClick={(e) => {
          e.stopPropagation();
          useAppStore.getState().toggleSelectedRoom("shark");
        }}
        onPointerEnter={(e) => {
          e.stopPropagation();
          useAppStore.getState().setHoveredMapIcon("shark");
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          useAppStore.getState().setHoveredMapIcon(null);
        }}
      />


    </group>
  )
}