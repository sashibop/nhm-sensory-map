const EVERYDAY = [0, 1, 2, 3, 4, 5, 6];

export const visitors = [
  // =================================================================
  // GROUP 1: Morning Tour (Left Wing & Toilets)
  // Explores the Volcano, Ammonite, Horse, then uses the restroom
  // =================================================================
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `tour_${i}`,
    daysVisiting: EVERYDAY,
    path: [
      { time: 9.9, x: 0, z: 7.0 },  // Spawn outside entrance
      { time: 10.0, x: 0, z: 6.0 }, // Walk to Info Desk
      { time: 10.1, x: -2.5, z: 5.5 }, // Walk to Volcano
      { time: 10.4, x: -2.5, z: 5.5 }, // Look at Volcano
      { time: 10.6, x: -5, z: 5.5 }, // Turn corner into Left Wing (Crystals)
      { time: 10.8, x: -5, z: 2.0 + (i * 0.3) }, // Walk up to Ammonite
      { time: 11.2, x: -5, z: 2.0 + (i * 0.3) }, // Look at Ammonite
      { time: 11.4, x: -4.8, z: -1.5 + (i * 0.3) }, // Walk deep to Horse
      { time: 11.8, x: -4.8, z: -1.5 + (i * 0.3) }, // Look at Horse
      { time: 12.0, x: -5, z: 5.5 }, // Walk all the way back to main lobby
      { time: 12.2, x: 2.5, z: 5.5 }, // Walk across lobby to Toilets axis
      { time: 12.3, x: 2.5, z: 3.5 }, // Enter Toilets / Cloakroom
      { time: 12.5, x: 2.5, z: 3.5 }, // Spend time in Toilets
      { time: 12.6, x: 2.5, z: 5.5 }, // Back to Lobby
      { time: 12.8, x: 0, z: 5.5 }, // To Entrance
      { time: 12.9, x: 0, z: 7.0 }, // Exit
    ]
  })),

  // =================================================================
  // GROUP 2: Lunchtime Center/Right Wing (Ibex & Shark)
  // Enters, goes to Center Wing, uses Right Lift, sees Shark
  // =================================================================
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `lunch_${i}`,
    daysVisiting: EVERYDAY,
    path: [
      { time: 12.4, x: 0, z: 7.0 }, 
      { time: 12.5, x: 0, z: 5.5 }, // Lobby
      { time: 12.7, x: 0 + (i * 0.2 - 0.3), z: 1.5 }, // Straight up shorter center wing to Ibex
      { time: 13.2, x: 0 + (i * 0.2 - 0.3), z: 1.5 }, // Hang out at Ibex
      { time: 13.4, x: 0, z: 5.5 }, // Walk back to main corridor (avoiding void)
      { time: 13.5, x: 5, z: 5.5 }, // Walk to Right Wing axis
      { time: 13.6, x: 4.8, z: -1 + (i * 0.4) }, // Walk up to Shark
      { time: 13.9, x: 4.8, z: -1 + (i * 0.4) }, // Look at Shark
      { time: 14.1, x: 5, z: 5.5 }, // Back to corridor
      { time: 14.2, x: 0, z: 5.5 }, // Back to center
      { time: 14.3, x: 0, z: 7.0 }, // Exit
    ]
  })),

  // =================================================================
  // GROUP 3: Afternoon Snake & Lift Users
  // Explores the lobby, uses the snake, goes to the Left Lift
  // =================================================================
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `wander_${i}`,
    daysVisiting: EVERYDAY,
    path: [
      { time: 14.0, x: 0, z: 7.0 }, 
      { time: 14.1, x: 0, z: 6.0 }, // Stop at Info
      { time: 14.3, x: 2.5, z: 5.5 }, // Go to Snake
      { time: 14.8, x: 2.5, z: 5.5 }, // Look at Snake
      { time: 15.0, x: 0, z: 5.5 }, // Walk back to center
      { time: 15.1, x: -2, z: 5.5 }, // Walk to left lift axis
      { time: 15.2, x: -2, z: 3.0 }, // Enter Left Lift Room
      { time: 16.0, x: -2, z: 3.0 }, // (Presumably upstairs for an hour)
      { time: 16.1, x: -2, z: 5.5 }, // Return from lift to lobby
      { time: 16.2, x: 0, z: 5.5 }, // Lobby center
      { time: 16.3, x: 0, z: 7.0 }, // Exit
    ]
  }))
];