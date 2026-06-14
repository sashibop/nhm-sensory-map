import * as THREE from 'three'
import { useMemo, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import useAppStore from '../../../../store/useAppStore'
import { ROOMS } from '../../../../data/roomAnalytics'

const EXHIBITIONS = [
  // ── Floor 1 ──────────────────────────────────────────────────────────────
  {
    floor: 1,
    roomKey: 'natureRoleModel',
    asset: 'src/assets/natureRoleModel.svg',
    position: [32, 3.01, -8],
    rotation: [-Math.PI / 2, 0, -Math.PI / 4],
  },
  {
    floor: 1,
    roomKey: 'vivarium',
    asset: 'src/assets/vivarium.svg',
    position: [20, 3.01, 10],
    rotation: [-Math.PI / 2, 0, -Math.PI / 4],
  },
  {
    floor: 1,
    roomKey: 'fossils',
    asset: 'src/assets/fossils.svg',
    position: [-34, 3.01, -44],
    rotation: [-Math.PI / 2, 0, Math.PI / 4],
  },
  {
    floor: 1,
    roomKey: 'prehistoricTimes',
    asset: 'src/assets/prehistoricTimes.svg',
    position: [-34, 3.01, -16],
    rotation: [-Math.PI / 2, 0, Math.PI / 4],
  },
  {
    floor: 1,
    roomKey: 'minerals',
    asset: 'src/assets/minerals.svg',
    position: [-34, 3.01, 9],
    rotation: [-Math.PI / 2, 0, -Math.PI / 4],
  },
  {
    floor: 1,
    roomKey: 'geology',
    asset: 'src/assets/geology.svg',
    position: [-20, 3.01, 9],
    rotation: [-Math.PI / 2, 0, 0],
  },
  {
    floor: 1,
    roomKey: 'diorama',
    asset: 'src/assets/diorama.svg',
    position: [0, 3.01, -10],
    rotation: [-Math.PI / 2, 0, Math.PI / 4],
  },

  // ── Floor 2 ──────────────────────────────────────────────────────────────
  {
    floor: 2,
    roomKey: 'specialExhibition',
    asset: 'src/assets/specialExhibition.svg',
    position: [-33, 3.01, -42],
    rotation: [-Math.PI / 2, 0, -Math.PI / 4],
  },
  {
    floor: 2,
    roomKey: 'atrium',
    asset: 'src/assets/atrium.svg',
    position: [0, 3.01, -10],
    rotation: [-Math.PI / 2, 0, 0],
  },
  {
    floor: 2,
    roomKey: 'nativeNature',
    asset: 'src/assets/nativeNature.svg',
    position: [-33, 3.01, -15],
    rotation: [-Math.PI / 2, 0, Math.PI / 4],
  },
  {
    floor: 2,
    roomKey: 'africanNature',
    asset: 'src/assets/africanNature.svg',
    position: [-33, 3.01, 13],
    rotation: [-Math.PI / 2, 0, Math.PI / 4],
  },
  {
    floor: 2,
    roomKey: 'insects',
    asset: 'src/assets/insects.svg',
    position: [-19, 3.01, 12],
    rotation: [-Math.PI / 2, 0, -Math.PI / 4],
  },
  {
    floor: 2,
    roomKey: 'rotary',
    asset: 'src/assets/rotary.svg',
    position: [21, 3.01, 13],
    rotation: [-Math.PI / 2, 0, Math.PI / 4],
  },
  {
    floor: 2,
    roomKey: 'specialExhibitionBig',
    asset: 'src/assets/specialExhibition.svg',
    position: [34, 3.01, -12],
    rotation: [-Math.PI / 2, 0, -Math.PI / 4],
  },
]

// ─── Room plane ───────────────────────────────────────────────────────────────
function RoomPlane({ room, roomKey, focusRef, initialFocus }) {
  const matRef = useRef()
  const isSelected = useAppStore((s) => s.selectedRooms.has(roomKey))
  const isHighlighted = useAppStore((s) => s.hoveredMapIcon === roomKey)

  useFrame(() => {
    if (matRef.current) {
      matRef.current.uniforms.uFocus.value = focusRef.current
      matRef.current.uniforms.uSelected.value = THREE.MathUtils.lerp(
        matRef.current.uniforms.uSelected.value,
        isSelected || isHighlighted ? 1.0 : 0.0,
        0.08
      )
    }
  })

  const w = room.maxX - room.minX
  const d = room.maxZ - room.minZ

  return (
    <mesh
      position={[(room.minX + room.maxX) / 2, 0.5, (room.minZ + room.maxZ) / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={5}
    >
      <planeGeometry args={[w * 1.4, d * 1.4]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        depthTest={false}
        uniforms={{
          uFocus: { value: initialFocus },
          uSelected: { value: isSelected ? 1.0 : 0.0 },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uFocus;
          uniform float uSelected;
          varying vec2 vUv;
          void main() {
            vec2 center = abs(vUv - 0.5) * 2.0;
            float dist = max(center.x, center.y);
            float alpha = smoothstep(1.0, 0.3, dist) * 0.5 * uFocus * uSelected;
            gl_FragColor = vec4(0.424, 0.557, 1.0, alpha);
          }
        `}
      />
    </mesh>
  )
}

// ─── Hotspot ──────────────────────────────────────────────────────────────────
function Hotspot({ texture, glowTexture, isSelected, isHighlighted, onClick, onPointerEnter, onPointerLeave, size = 6, focusRef }) {
  const [hovered, setHovered] = useState(false)
  const active = hovered || isHighlighted

  const glowRef = useRef()
  const ringRef = useRef()
  const iconRef = useRef()

  useFrame((_, delta) => {
    const focus = focusRef?.current ?? 1
    const targetOpacity = {
      glow: isSelected ? 0.9 : active ? 0.75 : 0.5,
      icon: isSelected ? 1 : active ? 0.95 : 0.75,
    }

    if (glowRef.current) {
      glowRef.current.opacity = THREE.MathUtils.lerp(
        glowRef.current.opacity,
        targetOpacity.glow * focus,
        delta * 4
      )
    }
    if (iconRef.current) {
      iconRef.current.opacity = THREE.MathUtils.lerp(
        iconRef.current.opacity,
        targetOpacity.icon * Math.max(focus, 0.08),
        delta * 4
      )
    }
  })

  return (
    <group>
      {/* Glow */}
      <mesh position={[0, 0, -0.01]} renderOrder={10}>
        <planeGeometry args={[size * 2.5, size * 2.5]} />
        <meshBasicMaterial
          ref={glowRef}
          map={glowTexture}
          transparent
          depthTest={false}
          depthWrite={false}
          opacity={isSelected ? 0.9 : active ? 0.75 : 0.5}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0, -0.005]} renderOrder={11}>
          <ringGeometry args={[size * 0.6, size * 0.72, 32]} />
          <meshBasicMaterial
            ref={ringRef}
            color="#6C8EFF"
            transparent
            depthTest={false}
            depthWrite={false}
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Icon */}
      <mesh
        scale={active ? 1.15 : 1}
        renderOrder={12}
        onPointerOver={(e) => {
          setHovered(true)
          document.body.style.cursor = 'pointer'
          onPointerEnter?.(e)
        }}
        onPointerOut={(e) => {
          setHovered(false)
          document.body.style.cursor = 'default'
          onPointerLeave?.(e)
        }}
        onClick={onClick}
      >
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial
          ref={iconRef}
          map={texture}
          transparent
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
          opacity={1}
        />
      </mesh>
    </group>
  )
}

// ─── Single exhibition entry with store wiring ────────────────────────────────
function ExhibitHotspot({ roomKey, texture, glowTexture, position, rotation, focusRef }) {
  const isSelected = useAppStore((s) => s.selectedRooms.has(roomKey))
  const isHighlighted = useAppStore((s) => s.hoveredMapIcon === roomKey)

  return (
    <group position={position} rotation={rotation}>
      <Hotspot
        texture={texture}
        glowTexture={glowTexture}
        isSelected={isSelected}
        isHighlighted={isHighlighted}
        focusRef={focusRef}
        onClick={(e) => {
          e.stopPropagation()
          useAppStore.getState().toggleSelectedRoom(roomKey)
          useAppStore.getState().setIsPanelOpen(true)
        }}
        onPointerEnter={(e) => {
          e.stopPropagation()
          useAppStore.getState().setHoveredMapIcon(roomKey)
        }}
        onPointerLeave={(e) => {
          e.stopPropagation()
          useAppStore.getState().setHoveredMapIcon(null)
        }}
      />
    </group>
  )
}

// ─── Layer ────────────────────────────────────────────────────────────────────
export default function ExhibitionsLayer({ targetFloor }) {
  const activeFloor = useAppStore((s) => s.activeFloor)
  const currentFloor = targetFloor ?? activeFloor

  const focusRef = useRef(currentFloor === activeFloor ? 1.0 : 0.0)
  const activeFloorRef = useRef(activeFloor)
  activeFloorRef.current = activeFloor

  useFrame((_, delta) => {
    const isActive = activeFloorRef.current === currentFloor
    focusRef.current = THREE.MathUtils.lerp(
      focusRef.current,
      isActive ? 1.0 : 0.0,
      delta * 4
    )
  })

  const floorExhibitions = useMemo(
    () => EXHIBITIONS.filter((e) => e.floor === currentFloor),
    [currentFloor]
  )

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader()
    return Object.fromEntries(
      floorExhibitions.map(({ roomKey, asset }) => [roomKey, loader.load(asset)])
    )
  }, [floorExhibitions])

  const glowTexture = useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(0, 170, 255, 0.9)')
    gradient.addColorStop(0.3, 'rgba(0, 170, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(0, 170, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  return (
    <group>
      {/* Highlight planes */}
      {floorExhibitions.map(({ roomKey }) => {
        const room = ROOMS[roomKey]
        if (!room) return null
        return (
          <RoomPlane
            key={`plane-${roomKey}`}
            room={room}
            roomKey={roomKey}
            focusRef={focusRef}
            initialFocus={currentFloor === activeFloor ? 1.0 : 0.0}
          />
        )
      })}

      {/* Exhibition hotspots */}
      {floorExhibitions.map(({ roomKey, position, rotation }) => (
        <ExhibitHotspot
          key={roomKey}
          roomKey={roomKey}
          texture={textures[roomKey]}
          glowTexture={glowTexture}
          focusRef={focusRef}
          position={position}
          rotation={rotation}
        />
      ))}
    </group>
  )
}
