import { visitors, getNoiseSources } from "./mockVisitorData";

export const ROOMS = {
    // ── Floor 1 ──────────────────────────────────────────────────────────────
    natureRoleModel: {
        floor: 1,
        minX: 27,  maxX: 39,
        minZ: -50, maxZ: 14,
    },
    vivarium: {
        floor: 1,
        minX: 12,  maxX: 26,
        minZ: 3, maxZ: 16,
    },
    fossils: {
        floor: 1,
        minX: -41, maxX: -28,
        minZ: -52, maxZ: -39,
    },
    prehistoricTimes: {
        floor: 1,
        minX: -40, maxX: -29,
        minZ: -39, maxZ: 3,
    },
    minerals: {
        floor: 1,
        minX: -41,  maxX: -28,
        minZ: 3, maxZ: 16,
    },
    geology: {
        floor: 1,
        minX: -28,  maxX: -14,
        minZ: 3, maxZ: 16,
    },
    diorama: {
        floor: 1,
        minX: -5, maxX: 4,
        minZ: -20,   maxZ: -1,
    },

    // ── Floor 2 ──────────────────────────────────────────────────────────────
    specialExhibition: {
        floor: 2,
        minX: -39, maxX: -26,
        minZ: -48, maxZ: -35,
    },
    atrium: {
        floor: 2,
        minX: -3, maxX: 6,
        minZ: -16,   maxZ: 3,
    },
    nativeNature: {
        floor: 2,
        minX: -38, maxX: -27,
        minZ: -35, maxZ: 7,
    },
    africanNature: {
        floor: 2,
        minX: -39,  maxX: -26,
        minZ: 7, maxZ: 20,
    },
    insects: {
        floor: 2,
        minX: -26,  maxX: -12,
        minZ: 7, maxZ: 20,
    },
    rotary: {
        floor: 2,
        minX: 14,  maxX: 28,
        minZ: 7, maxZ: 20,
    },
    specialExhibitionBig: {
        floor: 2,
        minX: 29,  maxX: 41,
        minZ: -46, maxZ: 18,
    },

};


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
        visitor.path.forEach(p => {
            const hour = Math.floor(p.time)
            if (hour >= OPEN.start && hour < OPEN.end && isInsideRoom(p.x, p.z, room)) {
                hours[hour] += 1
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