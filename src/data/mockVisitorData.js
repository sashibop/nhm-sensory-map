import * as THREE from 'three';

const EVERYDAY = [0, 1, 2, 3, 4, 5, 6];
const WALKING_SPEED = 800; // Base speed

// Helper to calculate paths based on specific personas
function generateGroup(idPrefix, count, type, baseTime, route, floor = 1) {
  const visitors = [];

  for (let i = 0; i < count; i++) {
    // Personas dictate entry staggering and overall speed variance
    let timeOffset = 0;
    let speedMod = 1.0;
    let baseNoise = 29;

    if (type === 'tour') {
      timeOffset = Math.random() * 0.1; // Tours clump tightly (within 6 minutes)
      speedMod = 0.8; // Tours walk slower
    } else if (type === 'couple') {
      timeOffset = Math.random() * 0.05 + (i % 2 === 0 ? 0 : 0.01); // Couples stick together
      speedMod = 1.0;
    } else if (type === 'solo') {
      timeOffset = Math.random() * 2.5; // Solos enter randomly across a 2.5 hour window!
      speedMod = 1.3; // Solos walk fast
    }

    let currentTime = baseTime + timeOffset;
    const path = [];

    route.forEach((node, index) => {
      // Use the node's specific scatter radius to fan out in rooms, but squeeze through doors
      const scatterX = THREE.MathUtils.randFloatSpread(node.scatter || 0.5);
      const scatterZ = THREE.MathUtils.randFloatSpread(node.scatter || 0.5);
      
      const targetX = node.x + scatterX;
      const targetZ = node.z + scatterZ;

      if (index > 0) {
        const prev = path[index - 1];
        const distance = Math.hypot(targetX - prev.x, targetZ - prev.z);
        // Calculate travel time
        currentTime += (distance / (WALKING_SPEED * speedMod));
      }

      path.push({ time: currentTime, x: targetX, z: targetZ });

      if (node.dwell) {
        // Solos spend less time dwelling, tours spend more
        const dwellMod = type === 'solo' ? 0.5 : (type === 'tour' ? 1.2 : 1.0);
        currentTime += (node.dwell * dwellMod);
        
        // Add a tiny random micro-movement during the dwell so they aren't totally frozen
        path.push({ 
          time: currentTime, 
          x: targetX + THREE.MathUtils.randFloatSpread(0.2), 
          z: targetZ + THREE.MathUtils.randFloatSpread(0.2) 
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

// --- ARCHITECTURAL NODES ---
// scatter dictates how wide the radius is. Rooms = Big (3.0), Doors = Tight (1.5)
const N = {
  Entrance:       { x: 0, z: 20, scatter: 4.0 },
  Lobby:          { x: 0, z: 12, scatter: 10.0, dwell: 0.1}, // Lobby is a big open space, so it has a huge scatter to encourage wandering
  LobbyLeft:      { x: -14, z: 12, scatter: 3.5},
  LobbyRightGate: { x: 14, z: 12, scatter: 1.5},
  
  // Left Wing (Volcano, Ammonite exhibits)
  // Removed dwell times from gates/doors so they walk straight through
  LeftWingGate:   { x: -23, z: 7, scatter: 1.5}, 
  LeftDeep:       { x: -23, z: -12, scatter: 4.0, dwell: 0.2 }, 
  
  // Right Wing (Sharks, Birds exhibits)
  RightWingGate:  { x: 23, z: 7, scatter: 1.5},
  RightDeep:      { x: 23, z: -18, scatter: 6, dwell: 0.2 },
  
  // Center (Info Desk, Restrooms)
  Octagon:        { x: 0, z: 0, scatter: 2.5, dwell: 0.3 },
  Restroom:       { x: 8, z: 15, scatter: 1.5, dwell: 0.2 },
  LeftLift:       { x: -6.7, z: 6, scatter: 1.0, dwell: 0.2 },
 
  // Additional Transitional Spaces
  LeftDown:       { x: -22, z: 12, scatter: 1.5},  
  RightDown:      { x: 23, z: 16, scatter: 1.5},  
  RightMidDoor:   { x: 23, z: -6, scatter: 1.5},  
  RightMidRoom:   { x: 25, z: 0, scatter: 2.5, dwell: 0.3 }, 
};

// --- ROUTE DEFINITIONS ---

// Comprehensive Left Wing Tour
const ROUTE_LEFT_FULL = [
  N.Entrance, N.Lobby, N.LobbyLeft, N.LeftDown, N.LeftWingGate, N.LeftDeep, 
  N.LeftWingGate, N.LeftDown, N.LobbyLeft, N.Lobby, N.Entrance
];

// Deep Right Wing Tour 
const ROUTE_RIGHT_FULL = [
  N.Entrance, N.Lobby, N.LobbyRightGate, N.RightDown, N.RightWingGate, 
  N.RightMidDoor, N.RightMidRoom, N.RightMidDoor, N.RightDeep, 
  N.RightWingGate, N.RightDown, N.LobbyRightGate, N.Lobby, N.Entrance
];

// Center focused: Lobby -> Lift -> Lobby -> Octagon -> Lobby -> Restroom
const ROUTE_CENTER_REST = [
  N.Entrance, N.Lobby, 
  N.LeftLift, N.Lobby,   // Visit Lift, return to Lobby
  N.Octagon,  N.Lobby,   // RULE ENFORCED: Must enter from Lobby, must exit to Lobby
  N.Restroom, N.Lobby,   // Visit Restroom, return to Lobby
  N.Entrance
];

// Cross-museum wandering: Backtracks to Lobby before crossing to Octagon/Right Wing
const ROUTE_WANDER = [
  N.Entrance, N.Lobby, 
  N.LobbyLeft, N.LeftDown, N.LeftWingGate, // Go deep Left
  N.LeftDown, N.LobbyLeft, N.Lobby,        // Retreat back to Lobby
  N.Octagon, N.Lobby,                      // RULE ENFORCED: Enter Octagon, return to Lobby
  N.LobbyRightGate, N.RightDown, N.RightWingGate, N.RightMidDoor, N.RightMidRoom, // Go deep Right
  N.RightMidDoor, N.RightWingGate, N.RightDown, N.LobbyRightGate, N.Lobby, // Retreat
  N.Entrance
];

// Just popping into the Right Wing briefly
const ROUTE_QUICK_LOOK = [
  N.Entrance, N.Lobby, N.LobbyRightGate, N.RightDown, N.RightWingGate, 
  N.LobbyRightGate, N.Lobby, N.Octagon, N.Lobby, N.Entrance
];

// --- FLOOR 2 ARCHITECTURAL NODES ---
const N2 = {
  // Assuming they arrive via the central stairs or elevator
  Arrival:    { x: 3, z: 0, scatter: 3.0 }, 
  Balcony:    { x: 0, z: 10, scatter: 10.0 },
  GalleryA:   { x: -23, z: 13, scatter: 3.5, dwell: 0.2 },
  GalleryB:   { x: 23, z: 13, scatter: 3.5, dwell: 0.1 },
  GalleryA2:   { x: -23, z: -18, scatter: 3.5, dwell: 0.4 },
  GalleryB2:   { x: 23, z: -23, scatter: 3.5, dwell: 0.1 },

};

// --- FLOOR 2 ROUTES ---
const ROUTE_F2_WANDER = [
  N2.Arrival, N2.Balcony, N2.GalleryA, N2.GalleryA2, N2.GalleryA, N2.Balcony, N2.GalleryB, N2.GalleryB2, N2.GalleryB, N2.Balcony, N2.Arrival
];

const ROUTE_F2_TOUR = [
  N2.Arrival, N2.Balcony, N2.GalleryB, N2.GalleryB2, N2.GalleryB, N2.Balcony, N2.GalleryA, N2.GalleryA2, N2.GalleryA, N2.Balcony, N2.Arrival
];


// --- GENERATE THE CROWD VARIANCE ---
export const visitors = [
  // 9:30 AM - Morning Guided Tour (Left Wing)
  ...generateGroup('tour_morn_left', 12, 'tour', 9.5, ROUTE_LEFT_FULL),
  // 9:45 AM - Morning Guided Tour (Right Wing) -> SIMULTANEOUS EXPLORATION
  ...generateGroup('tour_morn_right', 12, 'tour', 9.75, ROUTE_RIGHT_FULL),

  // 10:00 AM to 12:30 PM - Solo Wanderers filtering through both wings independently
  ...generateGroup('solo_morn', 20, 'solo', 10.0, ROUTE_WANDER),

  // 11:30 AM to 1:30 PM - Couples going to the center and restrooms 
  ...generateGroup('couple_lunch', 10, 'couple', 11.5, ROUTE_CENTER_REST),

  // 13:30 PM - Afternoon School Groups (Splitting up left and right at the same time)
  ...generateGroup('tour_aft_left', 15, 'tour', 13.5, ROUTE_LEFT_FULL),
  ...generateGroup('tour_aft_right', 15, 'tour', 13.5, ROUTE_RIGHT_FULL),
  
  // 14:00 PM to 16:30 PM - Afternoon Solo Explorers
  ...generateGroup('solo_aft', 15, 'solo', 14.0, ROUTE_LEFT_FULL),

  // 15:30 PM - Late Afternoon Quick Look
  ...generateGroup('couple_late', 8, 'couple', 16.5, ROUTE_QUICK_LOOK),

  // --- FLOOR 2 CROWDS ---
  ...generateGroup('f2_tour_aft', 12, 'tour', 14.0, ROUTE_F2_TOUR, 2),
  ...generateGroup('f2_tour_aft2', 9, 'tour', 14.0, ROUTE_F2_WANDER, 2),
  ...generateGroup('f2_solo_lunch', 15, 'solo', 11.0, ROUTE_F2_WANDER, 2),
  ...generateGroup('f2_couple_lunch', 6, 'couple', 12.5, ROUTE_F2_WANDER, 2),
  ...generateGroup('f2_tour_morning', 12, 'tour', 9.0, ROUTE_F2_TOUR, 2),
];