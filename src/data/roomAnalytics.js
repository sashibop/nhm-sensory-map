import { visitors, getNoiseSources } from "./mockVisitorData";
import useAppStore from "../store/useAppStore";

export const ROOMS = {
    shark: {
        minX: 20,
        maxX: 27,
        minZ: -25,
        maxZ: -10,
    },
};

function isInsideRoom(x, z, room) {
    return (
        x >= room.minX &&
        x <= room.maxX &&
        z >= room.minZ &&
        z <= room.maxZ
    );
}

function generateSamplePoints(room, cells = 4, inset = 0.15) {
    const minX = room.minX;
    const maxX = room.maxX;
    const minZ = room.minZ;
    const maxZ = room.maxZ;

    const dx = maxX - minX;
    const dz = maxZ - minZ;

    // Rand-Abstand
    const offsetX = dx * inset;
    const offsetZ = dz * inset;

    const startX = minX + offsetX;
    const endX = maxX - offsetX;
    const startZ = minZ + offsetZ;
    const endZ = maxZ - offsetZ;

    const points = [];

    for (let i = 0; i < cells; i++) {
        for (let j = 0; j < cells; j++) {
            const tX = i / (cells - 1);
            const tZ = j / (cells - 1);

            const x = startX + (endX - startX) * tX;
            const z = startZ + (endZ - startZ) * tZ;

            points.push([x, z]);
        }
    }

    return points;
}

/*function getRoomCenter(room) {
    return {
        x: (room.minX + room.maxX) / 2,
        z: (room.minZ + room.maxZ) / 2,
    };
}

function roomInfluence(x, z, room) {
    const c = getRoomCenter(room);

    const dx = x - c.x;
    const dz = z - c.z;
    const dist = Math.hypot(dx, dz);

    // tuneable radius of influence
    const radius = 10;

    return Math.max(0, 1 - dist / radius);
}*/

export function getRoomCrowdHourlyData(roomKey, dayOfWeek, activeFloor) {
    const room = ROOMS[roomKey];

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

    return hours.map((value, hour) => ({
        hour,
        value
    }));
}

/*export function getRoomNoiseHourlyData(roomKey, dayOfWeek, activeFloor) {
    const room = ROOMS[roomKey];

    const result = Array.from({ length: 24 }, () => 0);

    for (let hour = 0; hour < 24; hour++) {
        const sources = getNoiseSources(hour, activeFloor, dayOfWeek);

        let total = 0;

        sources.forEach(s => {
            const weight = roomInfluence(s.x, s.z, room);
            total += s.volume * weight;
        });

        result[hour] = total;
    }

    return result.map((value, hour) => ({
        hour,
        value: Math.round(value)
    }));
}*/

export function getRoomNoiseHourlyData(roomKey, dayOfWeek, activeFloor) {
    const room = ROOMS[roomKey];

    const result = Array.from({ length: 24 }, () => 0);

    const centerX = (room.minX + room.maxX) / 2;
    const centerZ = (room.minZ + room.maxZ) / 2;

    // sampling points inside room
    const samplePoints = generateSamplePoints(room, 4, 0.15); 

    for (let hour = 0; hour < 24; hour++) {
        const sources = getNoiseSources(hour, activeFloor, dayOfWeek);

        let energy = 0;

        samplePoints.forEach(([sx, sz]) => {
            sources.forEach(s => {
                const dx = sx - s.x;
                const dz = sz - s.z;
                const dist = Math.hypot(dx, dz);

                const weight = 1 / (1 + dist * 0.35);

                energy += s.volume * weight;
            });
        });

        energy = Math.max(energy, 0.0001);


        const db = Math.log10(energy) * 20; // Convert to dB?

        result[hour] = db;
    }

    return result.map((value, hour) => ({
        hour,
        value: Math.round(value * 10) / 10
    }));
}
