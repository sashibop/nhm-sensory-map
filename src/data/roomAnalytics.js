import { visitors, getNoiseSources } from "./mockVisitorData";
import {getBrightnessSources} from "./mockBrightnessData";

export const ROOMS = {
  // ── Floor 1 ──────────────────────────────────────────────────────────────
  natureRoleModel: {
    floor: 1,
    minX: 27,  maxX: 39,  minZ: -51.8, maxZ: 15.5,
    minX2D: 26.7,  maxX2D: 38.6,  minZ2D: -53.7, maxZ2D: 14.5,
  },
  vivarium: {
    floor: 1,
    minX: 12,  maxX: 26,  minZ: 2.5,   maxZ: 15.5,
    minX2D: 12.2,  maxX2D: 26,  minZ2D: 1.5,   maxZ2D: 14.5,
  },
  fossils: {
    floor: 1,
    minX: -40.7, maxX: -27.5, minZ: -51.8, maxZ: -38.6,
    minX2D: -41, maxX2D: -27.5, minZ2D: -53.7, maxZ2D: -39.7,
  },
  prehistoricTimes: {
    floor: 1,
    minX: -40, maxX: -28.7, minZ: -38.6, maxZ: 2.5,
    minX2D: -40, maxX2D: -28.7, minZ2D: -39.7, maxZ2D: 1.5,
  },
  minerals: {
    floor: 1,
    minX: -40.7, maxX: -27.5, minZ: 2.5,   maxZ: 15.5,
    minX2D: -41, maxX2D: -27.8, minZ2D: 1.5,   maxZ2D: 14.5,
  },
  geology: {
    floor: 1,
    minX: -27.5, maxX: -14, minZ: 2.5,   maxZ: 15.5,
    minX2D: -27.8, maxX2D: -13.8, minZ2D: 1.5,   maxZ2D: 14.5,
  },
  diorama: {
    floor: 1,
    minX: -5,  maxX: 4,   minZ: -20, maxZ: -1,
    minX2D: -5.2,  maxX2D: 3.8,   minZ2D: -20.8, maxZ2D: -2,
  },

  // ── Floor 2 ──────────────────────────────────────────────────────────────
  specialExhibition: {
    floor: 2,
    minX: -39, maxX: -26, minZ: -48.5, maxZ: -35,
    minX2D: -38.6, maxX2D: -25.4, minZ2D: -48.6, maxZ2D: -34.6,
  },
  atrium: {
    floor: 2,
    minX: -6.2,  maxX: 7.7,   minZ: -13.2, maxZ: 6.8,
    minX2D: -5.5,  maxX2D: 7.9,   minZ2D: -13, maxZ2D: 6.7,
  },
  nativeNature: {
    floor: 2,
    minX: -38, maxX: -27, minZ: -35, maxZ: 7,
    minX2D: -37.8, maxX2D: -26.6, minZ2D: -34.6, maxZ2D: 6.6,
  },
  africanNature: {
    floor: 2,
    minX: -39, maxX: -26, minZ: 6.5,   maxZ: 20,
    minX2D: -38.6, maxX2D: -25.6, minZ2D: 6.6,   maxZ2D: 19.6,
  },
  insects: {
    floor: 2,
    minX: -26, maxX: -12, minZ: 6.5,   maxZ: 20,
    minX2D: -25.6, maxX2D: -11.7, minZ2D: 6.6,   maxZ2D: 19.6,
  },
  rotary: {
    floor: 2,
    minX: 14,  maxX: 28,  minZ: 6.5,   maxZ: 20,
    minX2D: 14.4,  maxX2D: 28.1,  minZ2D: 6.6,   maxZ2D: 19.6,
  },
  specialExhibitionBig: {
    floor: 2,
    minX: 29,  maxX: 40.5,  minZ: -48.5, maxZ: 20,
    minX2D: 29.1,  maxX2D: 40.5,  minZ2D: -48.6, maxZ2D: 19.6,
  },
}

export const OPEN = { start: 9, end: 18 }
export const HOURS = Array.from({ length: OPEN.end - OPEN.start + 1 }, (_, i) => i + OPEN.start)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isInsideRoom(x, z, room) {
    return (
        x >= room.minX &&
        x <= room.maxX &&
        z >= room.minZ &&
        z <= room.maxZ
    );
}

function generateSamplePoints(room, cells = 4, inset = 0.15) {
    const dx = room.maxX - room.minX;
    const dz = room.maxZ - room.minZ;
    const startX = room.minX + dx * inset;
    const endX   = room.maxX - dx * inset;
    const startZ = room.minZ + dz * inset;
    const endZ   = room.maxZ - dz * inset;
    const points = [];
    for (let i = 0; i < cells; i++) {
        for (let j = 0; j < cells; j++) {
            const tX = i / (cells - 1);
            const tZ = j / (cells - 1);
            points.push([
                startX + (endX - startX) * tX,
                startZ + (endZ - startZ) * tZ,
            ]);
        }
    }
    return points;
}

// ─── Crowd ────────────────────────────────────────────────────────────────────

export function getRoomCrowdHourlyData(roomKey, dayOfWeek) {
    const room = ROOMS[roomKey]
    if (!room) return HOURS.map(hour => ({ hour, value: 0 }))

    const hours = Object.fromEntries(HOURS.map(h => [h, 0]))

    const relevantVisitors = visitors.filter(v =>
        v.daysVisiting.includes(dayOfWeek) &&
        v.floor === room.floor
    )

    relevantVisitors.forEach(visitor => {
        const countedHours = new Set()
        visitor.path.forEach(p => {
            const hour = Math.floor(p.time)
            if (
                hour >= OPEN.start &&
                hour < OPEN.end &&
                !countedHours.has(hour) &&
                isInsideRoom(p.x, p.z, room)
            ) {
                hours[hour] += 1
                countedHours.add(hour)
            }
        })
    })

    return HOURS.map(hour => ({ hour, value: hours[hour] }))
}

// ─── Noise ────────────────────────────────────────────────────────────────────

export function getRoomNoiseHourlyData(roomKey, dayOfWeek) {
    const room = ROOMS[roomKey]
    if (!room) return HOURS.map(hour => ({ hour, value: 0 }))

    const samplePoints = generateSamplePoints(room, 4, 0.15)

    return HOURS.map(hour => {
        const sources = getNoiseSources(hour, room.floor, dayOfWeek)
        let energy = 0
        samplePoints.forEach(([sx, sz]) => {
            sources.forEach(s => {
                const dx = sx - s.x
                const dz = sz - s.z
                const dist = Math.hypot(dx, dz)
                energy += s.volume / (1 + dist * 0.35)
            })
        })
        energy = Math.max(energy, 0.0001)
        return { hour, value: Math.round(Math.log10(energy) * 200) / 10 }
    })
}

// ─── Brightness ───────────────────────────────────────────────────────────────
export function getRoomBrightnessHourlyData(roomKey, dayOfWeek) {
    const room = ROOMS[roomKey]
    if (!room) return HOURS.map(hour => ({ hour, value: 0 }))

    const samplePoints = generateSamplePoints(room, 4, 0.15)

    return HOURS.map(hour => {
        const sources = getBrightnessSources(hour, room.floor, dayOfWeek)
        let energy = 0
        samplePoints.forEach(([sx, sz]) => {
            sources.forEach(s => {
                const dx = sx - s.x
                const dz = sz - s.z
                const dist = Math.hypot(dx, dz)
                energy += s.volume / (1 + dist * s.spread)
            })
        })
        return { hour, value: Math.round(energy / samplePoints.length) }
    })
}

// ─── Museum-wide overview (aggregates all rooms across all floors) ────────────

export function getMuseumOverviewData(dataFn, dayOfWeek) {
    const allKeys = Object.keys(ROOMS);

    const allData = allKeys.map((k) => dataFn(k, dayOfWeek));

    return HOURS.map((hour) => ({
        hour,
        value:
            Math.round(
                (allData.reduce((sum, d) => {
                    const entry = d.find(e => e.hour === hour)
                    return sum + (entry?.value ?? 0)
                }, 0) / allData.length) * 10
            ) / 10,
    }))
}

export function getMuseumCrowdOverviewData(dayOfWeek) {
    return HOURS.map(hour => {
        const total = visitors.filter(v =>
            v.daysVisiting.includes(dayOfWeek) &&
            v.path[0].time <= hour &&
            v.path[v.path.length - 1].time >= hour
        ).length
        return { hour, value: total }
    })
}

export function getMuseumNoiseOverviewData(dayOfWeek) {
    return HOURS.map(hour => {
        const total = visitors.filter(v =>
            v.daysVisiting.includes(dayOfWeek) &&
            v.path[0].time <= hour &&
            v.path[v.path.length - 1].time >= hour
        ).length
        const baseline = 30
        const db = total === 0 ? baseline : Math.min(65, baseline + total * 0.35)
        return { hour, value: Math.round(db * 10) / 10 }
    })
}

export function getMuseumBrightnessOverviewData(dayOfWeek) {
    const allKeys = Object.keys(ROOMS)
    return HOURS.map(hour => {
        const values = allKeys.map(k => {
            const data = getRoomBrightnessHourlyData(k, dayOfWeek)
            return data.find(d => d.hour === hour)?.value ?? 0
        })
        const avg = values.reduce((sum, v) => sum + v, 0) / values.length
        return { hour, value: Math.round(avg) }
    })
}