import * as THREE from 'three';

const EVERYDAY = [0, 1, 2, 3, 4, 5, 6];
const WALKING_SPEED = 2000; // Base speed

// Helper to calculate paths based on specific personas
// Helper to calculate paths based on specific personas
function generateGroup(idPrefix, count, type, baseTime, route, floor = 1) {
  const visitors = [];

  for (let i = 0; i < count; i++) {
    // Personas dictate entry staggering and overall speed variance
    let timeOffset = 0;
    let speedMod = 1.0;
    let baseNoise = 29;

    if (type === 'tour') {
      timeOffset = Math.random() * 0.1;
      speedMod = 0.8;
      baseNoise = 45;
    } else if (type === 'couple') {
      timeOffset = Math.random() * 0.05 + (i % 2 === 0 ? 0 : 0.01);
      speedMod = 1.0;
      baseNoise = 35;
    } else if (type === 'solo') {
      timeOffset = Math.random() * 2.5;
      speedMod = 1.3;
      baseNoise = 25;
    } else if (type === 'staff') {
      speedMod = 0.9;
      baseNoise = 10;
    }

    let currentTime = baseTime + timeOffset;
    const path = [];

    route.forEach((node, index) => {
      // Use the node's specific scatter radius
      const scatterX = THREE.MathUtils.randFloatSpread(node.scatter || 0.5);
      const scatterZ = THREE.MathUtils.randFloatSpread(node.scatter || 0.5);

      const targetX = node.x + scatterX;
      // ⚠️ FIX: Safely pull the Y elevation from the node, fallback to 0.99 if missing
      const targetY = node.y !== undefined ? node.y : 0.99;
      const targetZ = node.z + scatterZ;

      if (index > 0) {
        const prev = path[index - 1];
        // ⚠️ FIX: Use proper 3D distance calculation (hypot for X, Y, and Z) so they don't walk up stairs too fast
        const distance = Math.hypot(targetX - prev.x, targetY - prev.y, targetZ - prev.z);
        currentTime += (distance / (WALKING_SPEED * speedMod));
      }

      // ⚠️ FIX: Push the Y value into the path array!
      path.push({ time: currentTime, x: targetX, y: targetY, z: targetZ });

      if (node.dwell) {
        const dwellMod = type === 'solo' ? 0.5 : (type === 'tour' ? 1.2 : 1.0);
        currentTime += (node.dwell * dwellMod);

        // ⚠️ FIX: Ensure the dwell point also has the Y value
        path.push({
          time: currentTime,
          x: targetX,
          y: targetY,
          z: targetZ
        });
      }
    });

    visitors.push({
      id: `${idPrefix}_${i}`,
      daysVisiting: EVERYDAY,
      floor: floor,
      type: type,
      baseNoise: baseNoise,
      path: path
    });
  }
  return visitors;
}

// ==========================================
// 📍 ARCHITECTURAL NODES FLOOR 1
// ==========================================
export const N = {
  // --- ENTRANCE & MAIN LOBBY (Lower Elevation ~0.99 - 1.07) ---
  Entrance_1: { x: -0.66, y: 1.07, z: 19.50, scatter: 3.0, dwell: 0.01 },
  Entrance_2: { x: -0.51, y: 1.07, z: 15.73, scatter: 2.0 },
  Lobby_Front: { x: -0.45, y: 0.99, z: 14.13, scatter: 2.0 },
  Lobby_Mid: { x: -0.56, y: 0.99, z: 8.28, scatter: 3.0, dwell: 0.01 },
  Lobby_Deep: { x: -0.58, y: 0.99, z: 4.20, scatter: 1 },
  Lobby_Left1: { x: -3.99, y: 0.99, z: 11.92, scatter: 2.0, dwell: 0.01 },
  Lobby_Left2: { x: -3.97, y: 0.99, z: 8.76, scatter: 2.0, dwell: 0.1 },
  Info_Left: { x: -4.37, y: 0.99, z: 2.47, scatter: 0.5 },
  Info_Right: { x: 3.23, y: 0.99, z: 2.35, scatter: 0.5 },

  // --- STAIRS & ELEVATIONS (Transitional Y values) ---
  Stairs_L_Mid: { x: -6.83, y: 1.68, z: 8.27, scatter: 0.5 },
  Stairs_R_Mid: { x: 5.47, y: 1.64, z: 8.33, scatter: 0.5 },
  Stairs_C_Mid1: { x: 1.34, y: 1.36, z: 2.16, scatter: 0.5 },
  Stairs_C_Mid2: { x: 5.07, y: 1.21, z: -1.40, scatter: 0.5 },
  Stairs_C_Mid3: { x: 5.46, y: 1.21, z: -6.78, scatter: 1.5, dwell: 0.01 },

  // --- CENTER BACK CORRIDORS (y: 0.99) ---
  Center_Back1: { x: -3.67, y: 0.99, z: -1.08, scatter: 0.5 },
  Center_Back2: { x: -0.74, y: 0.99, z: -4.83, scatter: 1.5, dwell: 0.005 },
  Center_Back3: { x: -0.42, y: 0.99, z: -9.22, scatter: 0.5 },
  Center_Back4: { x: 0.63, y: 0.99, z: -15.24, scatter: 1.0, dwell: 0.01 },
  Center_Back5: { x: -1.48, y: 0.99, z: -18.84, scatter: 1.5, dwell: 0.015 },
  Center_Right1: { x: 2.84, y: 0.99, z: -2.35, scatter: 0.5 },
  Center_Right2: { x: 3.59, y: 0.99, z: 0.33, scatter: 0.5 },
  Center_Right3: { x: 7.20, y: 0.99, z: -0.61, scatter: 0.5 },
  Center_Right4: { x: 10.72, y: 0.99, z: -0.65, scatter: 0.5 },

  // --- LEFT WING (Upper Elevation ~1.85) ---
  Left_1: { x: -10.54, y: 1.85, z: 6.55, scatter: 0.5 },
  Left_2: { x: -13.88, y: 1.85, z: 8.84, scatter: 0.5 },
  Left_3: { x: -20.25, y: 1.85, z: 8.85, scatter: 2.0, dwell: 0.015 },
  Left_4: { x: -19.92, y: 1.85, z: 4.90, scatter: 2.5, dwell: 0.015 },
  Left_5: { x: -27.55, y: 1.85, z: 8.77, scatter: 0.5 },
  Left_6: { x: -34.11, y: 1.85, z: 8.91, scatter: 3.5, dwell: 0.01 },
  Left_7: { x: -34.29, y: 1.85, z: 14.06, scatter: 2.5, dwell: 0.015 },
  Left_8: { x: -34.15, y: 1.85, z: 2.59, scatter: 0.5 },
  Left_9: { x: -30.53, y: 1.85, z: -9.63, scatter: 2.5, dwell: 0.015 },
  Left_10: { x: -30.60, y: 1.85, z: -24.57, scatter: 2.5, dwell: 0.015 },
  Left_11: { x: -34.02, y: 1.85, z: -38.36, scatter: 0.5 },
  Left_12: { x: -34.07, y: 1.85, z: -45.36, scatter: 2.5 },
  Left_13: { x: -37.30, y: 1.85, z: -45.99, scatter: 1.5, dwell: 0.01 },
  Left_14: { x: -36.80, y: 1.85, z: -30.87, scatter: 2.5, dwell: 0.015 },
  Left_15: { x: -36.65, y: 1.85, z: -16.96, scatter: 2.5, dwell: 0.015 },
  Left_16: { x: -36.70, y: 1.85, z: -5.85, scatter: 2.5, dwell: 0.015 },

  // --- RIGHT WING (Upper Elevation ~1.85) ---
  Right_1: { x: 8.96, y: 1.85, z: 6.59, scatter: 1.5 },
  Right_2: { x: 9.16, y: 1.85, z: 10.09, scatter: 1.5, dwell: 0.01 },
  Right_3: { x: 12.59, y: 1.85, z: 8.88, scatter: 0.5 },
  Right_4: { x: 19.68, y: 1.85, z: 8.68, scatter: 3.0, dwell: 0.01 },
  Right_5: { x: 19.48, y: 1.85, z: 13.79, scatter: 1.5, dwell: 0.01 },
  Right_6: { x: 26.26, y: 1.85, z: 9.12, scatter: 0.5 },
  Right_7: { x: 28.86, y: 1.85, z: 8.66, scatter: 1.5, dwell: 0.015 },
  Right_8: { x: 29.05, y: 1.85, z: 11.29, scatter: 0.5 },
  Right_9: { x: 30.57, y: 1.85, z: 12.48, scatter: 1.5, dwell: 0.015 },
  Right_10: { x: 32.65, y: 1.85, z: 14.09, scatter: 0.5 },
  Right_11: { x: 34.84, y: 1.85, z: 12.14, scatter: 0.5 },
  Right_12: { x: 36.38, y: 1.85, z: 9.16, scatter: 0.5 },
  Right_13: { x: 36.81, y: 1.85, z: 12.87, scatter: 1.5, dwell: 0.015 },
  Right_14: { x: 36.66, y: 1.85, z: 5.79, scatter: 0.5 },
  Right_15: { x: 32.89, y: 1.85, z: 4.18, scatter: 1.5, dwell: 0.015 },
  Right_16: { x: 32.47, y: 1.85, z: 0.16, scatter: 1.5, dwell: 0.035 },
  Right_17: { x: 30.19, y: 1.85, z: -0.96, scatter: 0.5 },
  Right_18: { x: 29.00, y: 1.85, z: -3.88, scatter: 0.5 },
  Right_19: { x: 28.77, y: 1.85, z: -10.61, scatter: 1.0 },
  Right_20: { x: 29.03, y: 1.85, z: -15.47, scatter: 0.5 },
  Right_21: { x: 30.89, y: 1.85, z: -18.33, scatter: 1.5, dwell: 0.015 },
  Right_22: { x: 28.65, y: 1.85, z: -21.70, scatter: 0.5 },
  Right_23: { x: 33.99, y: 1.85, z: -18.40, scatter: 1.5, dwell: 0.015 },
  Right_24: { x: 36.08, y: 1.85, z: -17.53, scatter: 1.5, dwell: 0.015 },
  Right_25: { x: 36.73, y: 1.85, z: -13.03, scatter: 0.5 },
  Right_26: { x: 36.80, y: 1.85, z: -7.78, scatter: 0.5 },
  Right_27: { x: 35.94, y: 1.85, z: -1.16, scatter: 0.5 },
  Right_28: { x: 33.95, y: 1.85, z: -22.50, scatter: 1.5, dwell: 0.015 },
  Right_29: { x: 34.81, y: 1.85, z: -26.92, scatter: 0.5 },
  Right_30: { x: 32.89, y: 1.85, z: -29.03, scatter: 1.5, dwell: 0.015 },
  Right_31: { x: 35.06, y: 1.85, z: -30.06, scatter: 0.5 },
  Right_32: { x: 36.67, y: 1.85, z: -31.52, scatter: 1.5, dwell: 0.015 },
  Right_33: { x: 29.84, y: 1.85, z: -28.89, scatter: 1.5 },
  Right_34: { x: 29.23, y: 1.85, z: -34.11, scatter: 1.5, dwell: 0.015 },
  Right_35: { x: 27.72, y: 1.85, z: -40.41, scatter: 0.5 },
  Right_36: { x: 27.43, y: 1.85, z: -50.30, scatter: 0.5 },
  Right_37: { x: 32.46, y: 1.85, z: -50.31, scatter: 1.5 },
  Right_38: { x: 32.93, y: 1.85, z: -42.60, scatter: 2.5, dwell: 0.015 },
  Right_39: { x: 24.31, y: 1.85, z: -46.47, scatter: 0.5 },
  Right_40: { x: 24.11, y: 1.85, z: -42.75, scatter: 0.5 },

  Staff_Info: { x: -5.7, y: 0.99, z: 11.89, scatter: 1.6, dwell: 1.4 },
  Staff_Lobby: { x: -2.22, y: 1.14, z: 3.3, dwell: 4.3 },
  Staff_Locker: { x: 8.35, y: 1.85, z: 13.2, dwell: 4.3 },
  Staff_Left: { x: -35.11, y: 1.85, z: 3.52, dwell: 4.3 },
  Staff_Left_Deep: { x: -35.15, y: 1.85, z: -37.36, dwell: 4 },
  Staff_Right: { x: 25.46, y: 1.85, z: 7.2, dwell: 4.3 },
  Staff_Right_Mid: { x: 31.8, y: 1.85, z: 3.34, dwell: 4.4 },
  Staff_Right_Deep: { x: 29.64, y: 1.85, z: -37.42, dwell: 4.4 },

};

export const N2 = {
    // --- GENERAL AREAS (Floor 2) ---
    Arrival: { x: 3, z: 0, scatter: 3.0 },
    Balcony: { x: 0, z: 10, scatter: 10.0 },
    GalleryA: { x: -23, z: 13, scatter: 3.5, dwell: 0.2 },
    GalleryB: { x: 23, z: 13, scatter: 3.5, dwell: 0.1 },
    GalleryA2: { x: -23, z: -18, scatter: 3.5, dwell: 0.4 },
    GalleryB2: { x: 23, z: -23, scatter: 3.5, dwell: 0.1 },
    // --- CENTER BACK CORRIDORS (Floor 2) ---
    Main_Stair_Entry: { x: 0.69, y: 1.55, z: -3.62, scatter: 0.5, dwell:0.01 },
    F2_Center_Back1: { x: 0.96, y: 1.55, z: -6.55, scatter: 0.5,  },
    F2_Center_Back3: { x: -4.83, y: 1.55, z: -2.49, scatter: 0.5, dwell: 0.01 },
    F2_Center_Back2: { x: -4.90, y: 1.55, z: -5.69, scatter: 0.5 },
    // --- CENTER / LOBBY TRANSITION (Floor 2) ---
    F2_Center_Back4: { x: -4.84, y: 1.55, z: 4.71, scatter: 0.5 },
    F2_Center_Back5: { x: -3.57, y: 1.55, z: 6.65, scatter: 0.5 },
    F2_Lobby_Left: { x: -5.29, y: 1.55, z: 13.06, scatter: 0.5 },
    F2_Lobby_Mid: { x: 0.05, y: 1.55, z: 9.18, scatter: 2.5, dwell: 0.015},
    F2_Lobby_Right: { x: 6.53, y: 1.55, z: 12.64, scatter: 0.5, dwell: 0.02 },
    // --- LEFT WING (Floor 2) ---
    F2_Left_1: { x: -12.30, y: 1.55, z: 12.73, scatter: 0.5 },
    F2_Left_9: { x: -20.30, y: 1.55, z: 12.73, scatter: 4.5, dwell: 0.2 }, //butterlfy room

    F2_Left_2: { x: -26.18, y: 1.55, z: 13.22, scatter: 0.5 },
    F2_Left_3: { x: -32.95, y: 1.55, z: 13.13, scatter: 0.5 },
    F2_Left_4: { x: -33.44, y: 1.55, z: 7.27, scatter: 0.5 },
    F2_Left_5: { x: -37.13, y: 1.55, z: -2.72, scatter: 2.5 , dwell: 0.1},
    F2_Left_6: { x: -30.32, y: 1.55, z: -19.54, scatter: 2.5, dwell: 0.15 },
    F2_Left_7: { x: -33.27, y: 1.55, z: -34.88, scatter: 0.5, dwell: 0.01 },
    F2_Left_10: { x: -30.27, y: 1.55, z: -37.88, scatter: 1.0, dwell: 0.1 }, // sun room 
    F2_Left_8: { x: -31.25, y: 1.55, z: -44.90, scatter: 0.5, dwell:0.02 }, //stairs left wing

    // --- RIGHT WING NEAR (Floor 2) ---
    F2_Right_1: { x: 13.87, y: 1.55, z: 12.19, scatter: 0.5},
    F2_Right_2: { x: 27.90, y: 1.55, z: 12.62, scatter: 0.5, dwell:0.01 },
    F2_Right_3: { x: 34.00, y: 1.55, z: 16.41, scatter: 4.5, dwell: 0.1 },
    F2_Right_4: { x: 35.12, y: 1.55, z: 7.21, scatter: 0.5 },
    // --- RIGHT WING DEEP / EAST CORRIDOR (Floor 2) ---
    F2_Right_5: { x: 38.62, y: 1.55, z: -6.58, scatter: 3.5, dwell: 0.2 },
    F2_Right_6: { x: 30.32, y: 1.55, z: -17.37, scatter: 2.5, dwell:0.1 },
    F2_Right_7: { x: 34.98, y: 1.55, z: -26.67, scatter: 0.5 },
    F2_Right_8: { x: 30.27, y: 1.55, z: -27.00, scatter: 0.5 },
    F2_Right_9: { x: 38.31, y: 1.55, z: -32.25, scatter: 1.5, dwell: 0.3}, //small room 
    F2_Right_10: { x: 27.15, y: 1.55, z: -42.09, scatter: 0.5 , dwell:0.1}, //stairs back
    F2_Right_14: { x: 38.12, y: 1.55, z: -40.24, scatter: 1.5, dwell: 0.15 },
    F2_Right_11: { x: 29.40, y: 1.55, z: -43.33, scatter: 0.5, dwell: 0.01 },
    F2_Right_12: { x: 29.66, y: 1.55, z: -47.49, scatter: 1.5, dwell:0.01 },
    F2_Right_13: { x: 36.29, y: 1.55, z: -46.36, scatter: 1.5, dwell: 0.15 },
    // STAFF
    F2_Staff_1: { x: -25.48, y: 1.55, z: 10.71, dwell: 4 },
    F2_Staff_2: { x: 37.1, y: 1.55, z: -29.02, dwell: 4 },
};


// // =========================================
// // 🚶 ROUTE DEFINITIONS (FIXED NODE REFERENCES)
// // ==========================================;

// ------ FLOOR 1 ROUTES ------------------------


const ROUTE_FULL_MUSEUM = [
  N.Entrance_1, N.Entrance_2, N.Lobby_Front, N.Lobby_Left1,
  N.Lobby_Mid, N.Lobby_Deep, N.Info_Right, N.Center_Right2,
  N.Stairs_C_Mid2, N.Stairs_C_Mid3, N.Stairs_C_Mid2, N.Center_Right2,
  N.Center_Right1, N.Center_Back2, N.Center_Back3, N.Center_Back4,
  N.Center_Back5, N.Center_Back3, N.Center_Back2, N.Center_Back1,
  N.Info_Left, N.Lobby_Deep, N.Stairs_R_Mid, N.Right_3, N.Right_4,
  N.Right_6, N.Right_7, N.Right_8, N.Right_9, N.Right_10, N.Right_11,
  N.Right_13, N.Right_12, N.Right_14, N.Right_15, N.Right_16, N.Right_27,
  N.Right_26, N.Right_25, N.Right_24, N.Right_23, N.Right_28, N.Right_29,
  N.Right_31, N.Right_32, N.Right_30, N.Right_33, N.Right_34, N.Right_35,
  N.Right_36, N.Right_37, N.Right_38, N.Right_37, N.Right_36, N.Right_35,
  N.Right_34, N.Right_33, N.Right_22, N.Right_21, N.Right_20, N.Right_19,
  N.Right_18, N.Right_17, N.Right_16, N.Right_15, N.Right_14, N.Right_12,
  N.Right_11, N.Right_9, N.Right_6, N.Right_3, N.Stairs_R_Mid, N.Stairs_L_Mid,
  N.Left_2, N.Left_4, N.Left_5, N.Left_7, N.Left_8, N.Left_16, N.Left_9,
  N.Left_10, N.Left_11, N.Left_12, N.Left_13, N.Left_11, N.Left_14, N.Left_15,
  N.Left_8, N.Left_6, N.Left_3, N.Stairs_L_Mid, N.Lobby_Left2,
  N.Lobby_Front, N.Entrance_1
];
const ROUTE_TO_2F = [N.Entrance_1, N.Entrance_2, N.Lobby_Front, N.Lobby_Left1,N.Lobby_Mid, 
  N.Lobby_Deep,  N.Stairs_R_Mid]

const ROUTE_LEFT_WING = [
  N.Entrance_1, N.Entrance_2, N.Lobby_Front, N.Lobby_Left1, N.Lobby_Mid,

  N.Stairs_L_Mid, N.Left_2, N.Left_4, N.Left_5, N.Left_7, N.Left_8, N.Left_16,
  N.Left_9, N.Left_10, N.Left_11, N.Left_12, N.Left_13, N.Left_11, N.Left_14,
  N.Left_15, N.Left_8, N.Left_6, N.Left_3, N.Stairs_L_Mid, N.Lobby_Left2,

  N.Lobby_Front, N.Entrance_1
];

const ROUTE_RIGHT_WING = [ 
  N.Entrance_1, N.Entrance_2, N.Lobby_Front, N.Lobby_Left1, N.Lobby_Mid,

  N.Stairs_R_Mid, N.Right_3, N.Right_4,
  N.Right_6, N.Right_7, N.Right_8, N.Right_9, N.Right_10, N.Right_11,
  N.Right_13, N.Right_12, N.Right_14, N.Right_15, N.Right_16, N.Right_27,
  N.Right_26, N.Right_25, N.Right_24, N.Right_23, N.Right_28, N.Right_29,
  N.Right_31, N.Right_32, N.Right_30, N.Right_33, N.Right_34, N.Right_35,
  N.Right_36, N.Right_37, N.Right_38, N.Right_37, N.Right_36, N.Right_35,
  N.Right_34, N.Right_33, N.Right_22, N.Right_21, N.Right_20, N.Right_19,
  N.Right_18, N.Right_17, N.Right_16, N.Right_15, N.Right_14, N.Right_12,
  N.Right_11, N.Right_9, N.Right_6, N.Right_3, N.Stairs_R_Mid,

  N.Lobby_Left2, N.Lobby_Front, N.Entrance_1
];

const ROUTE_MID_WING = [
  N.Entrance_1, N.Entrance_2, N.Lobby_Front, N.Lobby_Left1, N.Lobby_Mid,

  N.Lobby_Deep, N.Info_Right, N.Center_Right2,
  N.Stairs_C_Mid2, N.Stairs_C_Mid3, N.Stairs_C_Mid2, N.Center_Right2,
  N.Center_Right1, N.Center_Back2, N.Center_Back3, N.Center_Back4,
  N.Center_Back5, N.Center_Back3, N.Center_Back2, N.Center_Back1,
  N.Info_Left, N.Lobby_Deep,

  N.Lobby_Left2, N.Lobby_Front, N.Entrance_1
];

const ROUTE_STAFF_INFO = [
  N.Entrance_1, N.Entrance_2, N.Lobby_Front, N.Lobby_Left2, N.Staff_Info, N.Staff_Info, N.Staff_Info, N.Lobby_Left2, N.Lobby_Front, N.Entrance_1
];

const ROUTE_STAFF_LOBBY = [
  N.Entrance_1, N.Lobby_Front, N.Lobby_Mid, N.Staff_Lobby, N.Lobby_Front, N.Entrance_1
];

const ROUTE_STAFF_LEFT = [
  N.Entrance_1, N.Lobby_Front, N.Lobby_Mid, N.Stairs_L_Mid, N.Left_2, N.Left_5,
  N.Staff_Left, N.Left_5, N.Left_2, N.Lobby_Mid, N.Entrance_1
];

const ROUTE_STAFF_LEFT_DEEP = [
  N.Entrance_1, N.Lobby_Front, N.Lobby_Mid, N.Left_2, N.Left_5, N.Left_8,
  N.Staff_Left_Deep, N.Left_8, N.Left_5, N.Left_2, N.Lobby_Mid, N.Entrance_1
];

const ROUTE_STAFF_RIGHT = [
  N.Entrance_1, N.Lobby_Mid, N.Right_3, N.Staff_Right, N.Right_3, N.Lobby_Mid, N.Entrance_1
];

const ROUTE_STAFF_RIGHT_MID = [
  N.Entrance_1, N.Lobby_Mid, N.Right_3, N.Right_6, N.Right_9, N.Right_11, N.Right_12,
  N.Right_14, N.Staff_Right_Mid, N.Right_14, N.Right_12, N.Right_11, N.Right_9,
  N.Right_6, N.Right_3, N.Lobby_Mid, N.Entrance_1
];

const ROUTE_STAFF_RIGHT_DEEP = [
  N.Right_9, N.Right_11, N.Right_12, N.Right_14, N.Right_15, N.Right_16, N.Right_17,
  N.Right_18, N.Right_19, N.Right_20, N.Right_22, N.Right_33, N.Staff_Right_Deep,
  N.Right_33, N.Right_22, N.Right_19, N.Right_17, N.Right_15, N.Right_14, N.Right_12,
  N.Right_11, N.Right_9, N.Right_6, N.Lobby_Mid, N.Entrance_1
];


// ------ FLOOR 2 ROUTES ------------------------
const F2_ROUTE_RIGHT_WING =  [ N2.Main_Stair_Entry, N2.F2_Center_Back1,
  N2.F2_Center_Back2, N2.F2_Center_Back3, N2.F2_Center_Back4, N2.F2_Center_Back5,
  N2.F2_Lobby_Mid, N2.F2_Lobby_Right, N2.F2_Right_1, N2.F2_Right_2, N2.F2_Right_3,
  N2.F2_Right_4, N2.F2_Right_5, N2.F2_Right_6, N2.F2_Right_8, N2.F2_Right_10 ]

 const F2_ROUTE_LEFT_WING = [ N2.Main_Stair_Entry, N2.F2_Center_Back1, 
 N2.F2_Center_Back2, N2.F2_Center_Back3, N2.F2_Center_Back4, N2.F2_Center_Back5, 
 N2.F2_Lobby_Mid, N2.F2_Lobby_Left, N2.F2_Left_1,N2.F2_Left_9, N2.F2_Left_2, N2.F2_Left_3, N2.F2_Left_4, 
 N2.F2_Left_5, N2.F2_Left_6, N2.F2_Left_7, N2.F2_Left_8 ]

 const F2_ROUTE_FULL_MUSEUM = [ N2.Main_Stair_Entry, N2.F2_Center_Back1, 
 N2.F2_Center_Back2, N2.F2_Center_Back3, N2.F2_Center_Back4, N2.F2_Center_Back5, 
 N2.F2_Lobby_Mid, N2.F2_Lobby_Right, N2.F2_Right_1, N2.F2_Right_2, N2.F2_Right_4, 
 N2.F2_Right_5, N2.F2_Right_7, N2.F2_Right_9, N2.F2_Right_7, N2.F2_Right_6, N2.F2_Right_4, 
 N2.F2_Right_2, N2.F2_Right_1, N2.F2_Lobby_Right, N2.F2_Lobby_Left, N2.F2_Left_1,
 N2.F2_Left_9,  N2.F2_Left_2,
 N2.F2_Left_3, N2.F2_Left_4, N2.F2_Left_5, N2.F2_Left_6, N2.F2_Left_7, 
 N2.F2_Left_10, N2.F2_Left_4, 
 N2.F2_Left_3, N2.F2_Left_2, N2.F2_Left_1, N2.F2_Lobby_Left, N2.F2_Lobby_Mid, 
 N2.F2_Center_Back5, N2.F2_Center_Back4, N2.F2_Center_Back3, N2.F2_Center_Back2, 
 N2.F2_Center_Back1, N2.Main_Stair_Entry]

 const F2_LEFT_WING_HALF = [ N2.Main_Stair_Entry, N2.F2_Center_Back1,
 N2.F2_Center_Back2, N2.F2_Center_Back3, N2.F2_Center_Back4, N2.F2_Center_Back5, 
 N2.F2_Lobby_Mid, N2.F2_Lobby_Left, N2.F2_Left_1, N2.F2_Left_9, N2.F2_Left_2, N2.F2_Left_3, N2.F2_Left_4,
 N2.F2_Left_5, N2.F2_Left_4, N2.F2_Left_3, N2.F2_Left_2, N2.F2_Left_1 ]

 const F2_RIGHT_WING_END = [ N2.F2_Right_10, N2.F2_Right_11, N2.F2_Right_12, 
 N2.F2_Right_13, N2.F2_Right_14, N2.F2_Right_13, N2.F2_Right_12, N2.F2_Right_11, 
 N2.F2_Right_8, N2.F2_Right_7, N2.F2_Right_9, N2.F2_Right_7, N2.F2_Right_6, N2.F2_Right_8, 
 N2.F2_Right_11, N2.F2_Right_10 ]

 const F2_STAFF_1 = [N2.Main_Stair_Entry, N2.F2_Center_Back1, N2.F2_Center_Back2, 
 N2.F2_Center_Back3, N2.F2_Center_Back4, N2.F2_Center_Back5, N2.F2_Lobby_Mid,
 N2.F2_Lobby_Left, 
 N2.F2_Left_1, N2.F2_Staff_1, N2.F2_Left_1]

 const F2_STAFF_2 = [ N2.Main_Stair_Entry, N2.F2_Center_Back1, N2.F2_Center_Back2,
 N2.F2_Center_Back3, N2.F2_Center_Back4, N2.F2_Center_Back5, N2.F2_Lobby_Mid, 
 N2.F2_Lobby_Right, N2.F2_Right_1, N2.F2_Right_2, N2.F2_Right_4, N2.F2_Right_7, 
 N2.F2_Staff_2, N2.F2_Right_7, N2.F2_Right_8, N2.F2_Right_11, N2.F2_Right_10]


// --- GENERATE THE CROWD VARIANCE ---
export const visitors = [
  // FLOOR 1
  ...generateGroup('tour_to_2f_morn1', 20, 'tour', 9.0, ROUTE_TO_2F),
  ...generateGroup('tour_to_2f_morn2', 12, 'tour', 11.0, ROUTE_TO_2F), 
  ...generateGroup('tour_to_2f_mid', 12, 'tour', 15.0, ROUTE_TO_2F), 
  ...generateGroup('tour_to_2f_aft1', 15, 'tour', 14.50, ROUTE_TO_2F), 

  ...generateGroup('tour_morn_full', 20, 'tour', 9.0, ROUTE_FULL_MUSEUM),
  ...generateGroup('solo_morn_full', 10, 'solo', 9.1, ROUTE_FULL_MUSEUM),
  ...generateGroup('tour_morn_left', 12, 'tour', 9.0, ROUTE_LEFT_WING),
  ...generateGroup('couple_morn_right', 6, 'couple', 9.0, ROUTE_RIGHT_WING),
  ...generateGroup('tour_morn_full_2', 8, 'tour', 10.5, ROUTE_FULL_MUSEUM),

  ...generateGroup('couple_noon_mid', 8, 'couple', 12.0, ROUTE_MID_WING),

  ...generateGroup('tour_aft_full', 10, 'tour', 13.0, ROUTE_FULL_MUSEUM),
  ...generateGroup('tour_aft_mid', 8, 'tour', 13.0, ROUTE_MID_WING),
  ...generateGroup('solo_aft_right', 10, 'solo', 15.0, ROUTE_RIGHT_WING),
  ...generateGroup('solo_aft_left', 4, 'solo', 14.0, ROUTE_LEFT_WING),
  ...generateGroup('couple_aft_left', 2, 'couple', 16.0, ROUTE_LEFT_WING),

  ...generateGroup('staff_info', 1, 'staff', 9.0, ROUTE_STAFF_INFO),
  ...generateGroup('staff_lobby', 1, 'staff', 9.0, ROUTE_STAFF_LOBBY),
  ...generateGroup('staff_left', 1, 'staff', 9.0, ROUTE_STAFF_LEFT),
  ...generateGroup('staff_left_deep', 1, 'staff', 9.0, ROUTE_STAFF_LEFT_DEEP),
  ...generateGroup('staff_right', 1, 'staff', 9.0, ROUTE_STAFF_RIGHT),
  ...generateGroup('staff_right_mid', 1, 'staff', 9.0, ROUTE_STAFF_RIGHT_MID),
  ...generateGroup('staff_right_deep', 1, 'staff', 9.0, ROUTE_STAFF_RIGHT_DEEP),

  ...generateGroup('staff_info_aft', 2, 'staff', 13.0, ROUTE_STAFF_INFO),
  ...generateGroup('staff_lobby_aft', 1, 'staff', 13.0, ROUTE_STAFF_LOBBY),
  ...generateGroup('staff_left_aft', 1, 'staff', 13.0, ROUTE_STAFF_LEFT),
  ...generateGroup('staff_left_deep_aft', 1, 'staff', 13.0, ROUTE_STAFF_LEFT_DEEP),
  ...generateGroup('staff_right_aft', 1, 'staff', 13.0, ROUTE_STAFF_RIGHT),
  ...generateGroup('staff_right_mid_aft', 1, 'staff', 13.0, ROUTE_STAFF_RIGHT_MID),
  ...generateGroup('staff_right_deep_aft', 1, 'staff', 13.0, ROUTE_STAFF_RIGHT_DEEP),

  // FLOOR 2 
  ...generateGroup('f2_tour_morn_full', 20, 'tour', 9.0, F2_ROUTE_RIGHT_WING, 2),
  ...generateGroup('f2_solo_morn_full', 10, 'solo', 9.1, F2_ROUTE_FULL_MUSEUM,2),
  ...generateGroup('f2_tour_morn_left', 12, 'tour', 9.0, F2_ROUTE_LEFT_WING,2),
  ...generateGroup('f2_couple_morn_right_end', 6, 'couple', 9.0, F2_RIGHT_WING_END, 2),
  ...generateGroup('f2_tour_morn_full_2', 8, 'tour', 10.5, F2_ROUTE_FULL_MUSEUM, 2),

  ...generateGroup('f2_tour_aft_full', 10, 'tour', 12.0, F2_ROUTE_FULL_MUSEUM, 2),
  ...generateGroup('f2_tour_aft_left_half', 8, 'tour', 14.0, F2_LEFT_WING_HALF, 2),
  ...generateGroup('f2_solo_aft_right', 10, 'solo', 15.0, F2_ROUTE_RIGHT_WING, 2),
  ...generateGroup('f2_solo_aft_left', 4, 'solo', 14.0, F2_ROUTE_LEFT_WING, 2),
  ...generateGroup('f2_couple_aft_right_end', 2, 'couple', 16.0, F2_RIGHT_WING_END, 2),
  ...generateGroup('f2_tour_aft_right_end', 9, 'tour', 14.0, F2_RIGHT_WING_END, 2),
  ...generateGroup('f2_tour_aft_right_end', 9, 'tour', 16.0, F2_RIGHT_WING_END, 2),
  ...generateGroup('f2_tour_aft_full', 7, 'tour', 15.0, F2_ROUTE_FULL_MUSEUM, 2),

  ...generateGroup('f2_staff_info_1', 1, 'staff', 9.0, F2_STAFF_1, 2),
  ...generateGroup('f2_staff_info_2', 1, 'staff', 9.0, F2_STAFF_2, 2),
  ...generateGroup('f2_staff_info_1_aft', 1, 'staff', 13.0, F2_STAFF_1, 2),
  ...generateGroup('f2_staff_info_2_aft', 1, 'staff', 13.0, F2_STAFF_2, 2),
];

// ==========================================
// STATIC EXHIBIT NOISE SOURCES
// ==========================================
export const staticNoiseSources = {
  1: [
    { id: 'elevator1', x: -10.5, z: 5.5, baseNoise: 25, spread: 0.25 },
    { id: 'elevator2', x: 9.5, z: 5.5, baseNoise: 25, spread: 0.25 },
    { id: 'mid-deep-left', x: -5.5, z: -17, baseNoise: 15, spread: 0.20 },
    { id: 'mid-deep-right', x: 5.3, z: -17, baseNoise: 15, spread: 0.20 },

    { id: 'mid-left', x: -5.5, z: -7, baseNoise: 15, spread: 0.20 },
    { id: 'mid-right', x: 5.3, z: -7, baseNoise: 15, spread: 0.20 },

    { id: 'right-low', x: 33.5, z: 10.5, baseNoise: 20, spread: 0.30 },
    { id: 'right-mid', x: 33.5, z: -1, baseNoise: 15, spread: 0.10 },
    { id: 'right-mid-2', x: 33.5, z: -14, baseNoise: 15, spread: 0.10 },
    { id: 'right-deep', x: 34, z: -35, baseNoise: 25, spread: 0.10 },

    { id: 'entry', x: -0.8, z: 15, baseNoise: 25, spread: 0.20 },
  ],
  2: [
    { id: 'stairs', x: 0.7, z: -1, baseNoise: 25, spread: 0.20 },
    { id: 'elevator1', x: -9.7, z: 8.5, baseNoise: 10, spread: 0.25 },
    { id: 'elevator2', x: 11, z: 8.5, baseNoise: 10, spread: 0.25 },
    { id: 'cafe_area', x: 0.7, z: 20.5, baseNoise: 35, spread: 0.04 },
  ]
}

// Helper for linear interpolation
const lerp = (x, y, t) => (1 - t) * x + t * y;

// ==========================================
// UNIFIED NOISE ENGINE
// ==========================================
export function getNoiseSources(timeOfDay, targetFloor, dayOfWeek) {
  const activeSources = [];

  // 1. Inject Static Architectural Sources
  const staticExhibits = staticNoiseSources[targetFloor] || [];
  staticExhibits.forEach(exhibit => {
    activeSources.push({
      x: exhibit.x,
      z: exhibit.z,
      volume: exhibit.baseNoise,
      spread: exhibit.spread,
      isStatic: true
    });
  });

  // 2. Filter Active Visitors for this Day and Floor
  const activeVisitors = visitors.filter(v =>
    v.daysVisiting.includes(dayOfWeek) && v.floor === targetFloor
  );

  // 3. Compute Raw Interpolated Positions for Visitors
  const visitorPositions = [];
  activeVisitors.forEach((visitor) => {
    const path = visitor.path;
    const enterTime = path[0].time;
    const exitTime = path[path.length - 1].time

    if (timeOfDay >= enterTime && timeOfDay <= exitTime) {
      let startIndex = 0;
      for (let j = 0; j < path.length - 1; j++) {
        if (timeOfDay >= path[j].time && timeOfDay <= path[j + 1].time) {
          startIndex = j;
          break;
        }
      }

      const startNode = path[startIndex];
      const endNode = path[startIndex + 1];
      const duration = endNode.time - startNode.time;
      const progress = duration === 0 ? 1 : (timeOfDay - startNode.time) / duration

      // Simulating Three.js smootherstep interpolation natively
      const t = Math.max(0, Math.min(1, progress));
      const easedProgress = t * t * t * (t * (t * 6 - 15) + 10);

      const currentX = lerp(startNode.x, endNode.x, easedProgress);
      const currentZ = lerp(startNode.z, endNode.z, easedProgress);

      // Lower noise if they are dwelling (standing still)
      const segmentDistance = Math.hypot(endNode.x - startNode.x, endNode.z - startNode.z);
      const isDwelling = segmentDistance < 0.5;
      const currentNoise = isDwelling ? visitor.baseNoise - 12 : visitor.baseNoise;

      visitorPositions.push({ x: currentX, z: currentZ, volume: currentNoise });
    }
  });

  // 4. Calculate Proximity Compounding Factors (Crowd Buzz)
  visitorPositions.forEach((pos, i) => {
    let dynamicNoise = pos.volume;

    visitorPositions.forEach((neighbor, j) => {
      if (i !== j) {
        const dist = Math.hypot(pos.x - neighbor.x, pos.z - neighbor.z);
        if (dist < 1) {
          dynamicNoise += (2.5 - dist) * 0.2; // Crowded spaces generate secondary group murmur
        }
      }
    });

    activeSources.push({
      x: pos.x,
      z: pos.z,
      volume: Math.min(dynamicNoise, 65), // Cap volume at 65dB
      spread: 0.9,
      isStatic: false
    });
  });

  return activeSources;
}