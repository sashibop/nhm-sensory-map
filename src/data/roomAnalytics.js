import { visitors, getNoiseSources } from "./mockVisitorData";

export const ROOMS = {
    // ── Floor 1 ──────────────────────────────────────────────────────────────
    natureRoleModel: {
        floor: 1,
        minX: 18,  maxX: 28,
        minZ: -25, maxZ: -10,
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
        minX: 18,  maxX: 28,
        minZ: -25, maxZ: -10,
    },
    atrium: {
        floor: 2,
        minX: -8,  maxX: 8,
        minZ: -22, maxZ: -8,
    },
    nativeNature: {
        floor: 2,
        minX: -28, maxX: -18,
        minZ: -25, maxZ: -10,
    },
    africanNature: {
        floor: 2,
        minX: -28, maxX: -18,
        minZ: -14, maxZ: -2,
    },
    insects: {
        floor: 2,
        minX: 18,  maxX: 28,
        minZ: -33, maxZ: -25,
    },
    rotary: {
        floor: 2,
        minX: -28, maxX: -18,
        minZ: 4,   maxZ: 17,
    },
};

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

export function getRoomCrowdHourlyData(roomKey, dayOfWeek, activeFloor) {
    const room = ROOMS[roomKey];
    if (!room) return Array.from({ length: 24 }, (_, hour) => ({ hour, value: 0 }));

    const hours = Array.from({ length: 24 }, () => 0);

    const relevantVisitors = visitors.filter(v =>
        v.daysVisiting.includes(dayOfWeek) &&
        v.floor === activeFloor
    );

    relevantVisitors.forEach(visitor => {
        visitor.path.forEach(p => {
            const hour = Math.floor(p.time);
            if (isInsideRoom(p.x, p.z, room)) {
                hours[hour] += 1;
            }
        });
    });

    return hours.map((value, hour) => ({ hour, value }));
}

// ─── Noise ────────────────────────────────────────────────────────────────────

export function getRoomNoiseHourlyData(roomKey, dayOfWeek, activeFloor) {
    const room = ROOMS[roomKey];
    if (!room) return Array.from({ length: 24 }, (_, hour) => ({ hour, value: 0 }));

    const result = Array.from({ length: 24 }, () => 0);
    const samplePoints = generateSamplePoints(room, 4, 0.15);

    for (let hour = 0; hour < 24; hour++) {
        const sources = getNoiseSources(hour, activeFloor, dayOfWeek);
        let energy = 0;

        samplePoints.forEach(([sx, sz]) => {
            sources.forEach(s => {
                const dx   = sx - s.x;
                const dz   = sz - s.z;
                const dist = Math.hypot(dx, dz);
                const weight = 1 / (1 + dist * 0.35);
                energy += s.volume * weight;
            });
        });

        energy = Math.max(energy, 0.0001);
        result[hour] = Math.log10(energy) * 20;
    }

    return result.map((value, hour) => ({
        hour,
        value: Math.round(value * 10) / 10,
    }));
}

// ─── Museum-wide overview (aggregates all rooms across all floors) ────────────

export function getMuseumOverviewData(dataFn, dayOfWeek) {
    const allKeys = Object.keys(ROOMS);

    const allData = allKeys.map((k) => dataFn(k, dayOfWeek, ROOMS[k].floor));

    return Array.from({ length: 24 }, (_, hour) => ({
        hour,
        value:
            Math.round(
                (allData.reduce((sum, d) => sum + (d[hour]?.value ?? 0), 0) /
                    allData.length) *
                    10
            ) / 10,
    }));
}
