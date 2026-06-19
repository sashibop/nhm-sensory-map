import { useState } from 'react'
import useAppStore from '../../../../store/useAppStore'
import { ROOMS } from '../../../../data/roomAnalytics'

const EXHIBITION_ICONS = {
  natureRoleModel: 'icons/natureRoleModel.svg',
  vivarium: 'icons/vivarium.svg',
  fossils: 'icons/fossils.svg',
  prehistoricTimes: 'icons/prehistoricTimes.svg',
  minerals: 'icons/minerals.svg',
  geology: 'icons/geology.svg',
  diorama: 'icons/diorama.svg',
  specialExhibition: 'icons/specialExhibition.svg',
  atrium: 'icons/atrium.svg',
  nativeNature: 'icons/nativeNature.svg',
  africanNature: 'icons/africanNature.svg',
  insects: 'icons/insects.svg',
  rotary: 'icons/rotary.svg',
  specialExhibitionBig: 'icons/specialExhibition.svg',
}

function worldToSVG(x, z, mapScale, offsetX, offsetZ) {
  return {
    x: x * mapScale + offsetX,
    y: z * mapScale + offsetZ,
  }
}

function ExhibitionRoom({ roomKey, room, mapScale, offsetX, offsetZ }) {
  const isSelected = useAppStore((s) => s.selectedRooms.has(roomKey))
  const isHighlighted = useAppStore((s) => s.hoveredMapIcon === roomKey)
  const [hovered, setHovered] = useState(false)

  const active = hovered || isHighlighted
  const visible = isSelected || isHighlighted || hovered

  const tl = worldToSVG(room.minX2D, room.minZ2D, mapScale, offsetX, offsetZ)
  const br = worldToSVG(room.maxX2D, room.maxZ2D, mapScale, offsetX, offsetZ)
  const w = br.x - tl.x
  const h = br.y - tl.y
  const cx = tl.x + w / 2
  const cy = tl.y + h / 2

  const iconSize = Math.min(Math.abs(w), Math.abs(h)) * 0.45

  return (
    <g
      onClick={() => {
        useAppStore.getState().toggleSelectedRoom(roomKey)
        useAppStore.getState().setIsPanelOpen(true)
      }}
      onMouseEnter={() => {
        setHovered(true)
        useAppStore.getState().setHoveredMapIcon(roomKey)
      }}
      onMouseLeave={() => {
        setHovered(false)
        useAppStore.getState().setHoveredMapIcon(null)
      }}
      style={{ cursor: 'pointer' }}
    >


      <rect
        x={tl.x} y={tl.y} width={w} height={h}
        fill="#6C8EFF"
        style={{ transition: 'opacity 0.25s', opacity: visible ? 0.45 : 0 }}
      />



      <image
        href={EXHIBITION_ICONS[roomKey]}
        x={cx - iconSize / 2}
        y={cy - iconSize / 2}
        width={iconSize}
        height={iconSize}
        style={{
          opacity: active || isSelected ? 1 : 0.7,
          transform: active ? `scale(1.5)` : 'scale(1)',
          transformOrigin: `${cx}px ${cy}px`,
          transition: 'opacity 0.2s, transform 0.2s',
        }}
      />
    </g>
  )
}

export default function ExhibitionsLayer2D({
  targetFloor = 1,
  mapScale = 0.9,
  offsetX = 0,
  offsetZ = 0,
}) {
  const activeFloor = useAppStore((s) => s.activeFloor)
  if (activeFloor !== targetFloor) return null

  const floorRooms = Object.entries(ROOMS).filter(
    ([, room]) => room.floor === targetFloor
  )

  return (
    <g id={`exhibitions-layer-2d-f${targetFloor}`}>
      {floorRooms.map(([roomKey, room]) => (
        <ExhibitionRoom
          key={roomKey}
          roomKey={roomKey}
          room={room}
          mapScale={mapScale}
          offsetX={offsetX}
          offsetZ={offsetZ}
        />
      ))}
    </g>
  )
}