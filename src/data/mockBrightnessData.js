import * as THREE from 'three';
import { visitors } from '../data/mockVisitorData'

const EVERYDAY = [0, 1, 2, 3, 4, 5, 6];

// ==========================================
// TIME-BASED SPREAD MODULATOR
// ==========================================
 export function applyTimeBasedSpread(sources, timeOfDay, rules = DEFAULT_SPREAD_RULES) {
  sources.forEach(source => {
    if (!source.id) return; 

    rules.forEach(rule => {
      if (!source.id.includes(rule.idFilter)) return;

      // Find the two surrounding keyframes
      const keyframes = rule.keyframes;
      let startKf = keyframes[0];
      let endKf = keyframes[keyframes.length - 1];

      for (let i = 0; i < keyframes.length - 1; i++) {
        if (timeOfDay >= keyframes[i].time && timeOfDay <= keyframes[i + 1].time) {
          startKf = keyframes[i];
          endKf = keyframes[i + 1];
          break;
        }
      }

      // Lerp spread between the two keyframes
      const duration = endKf.time - startKf.time;
      const t = duration === 0 ? 1 : (timeOfDay - startKf.time) / duration;
      const clamped = Math.max(0, Math.min(1, t));

      source.spread = lerp(startKf.spread, endKf.spread, clamped);

      // modulate brightness
      if (startKf.brightness !== undefined && endKf.brightness !== undefined) {
        source.volume = lerp(startKf.brightness, endKf.brightness, clamped);
      }
    });
  });

  return sources; 
}

// ==========================================
// DEFAULT NATURAL LIGHT SPREAD RULES
// ==========================================
export const DEFAULT_SPREAD_RULES = [
  {
    idFilter: 'window_east',
    keyframes: [
      { time: 9,  spread: 0.6, brightness: 20 },  // Dawn: tight, dim shaft
      { time: 11,  spread: 0.3, brightness: 65 },  // Morning: sun shining in directly 
      { time: 12, spread: 0.35, brightness: 55 },  
      { time: 15, spread: 0.45, brightness: 45 },  // Afternoon: narrowing
      { time: 18, spread: 0.8, brightness: 35 },  // Dusk: rather dark 
      { time: 20, spread: 0.85, brightness: 10 },  // Night: almost nothing
    ]
  }, 
  {
    idFilter: 'window_west',
    keyframes: [
      { time: 9,  spread: 0.8, brightness: 20 },  // Dawn: tight, dim shaft
      { time: 11,  spread: 0.55, brightness: 35 },  // Morning: rather dark 
      { time: 15, spread: 0.3, brightness: 65 },  // Afternoon: brightest 
      { time: 18, spread: 0.4, brightness: 55 },  // Dusk: sun still shining in
      { time: 20, spread: 0.85, brightness: 10 },  // Night: almost nothing
    ]
  }
];

// ==========================================
// STATIC EXHIBIT NOISE SOURCES
// ==========================================
export const staticBrightnessSources = {
  1: [
    { id: 'entry_door', x: 0, z: 17, baseBrightness: 60, spread: 0.20 }, 
    { id: 'right_wing_window_east_1', x: 19, z: -10, baseBrightness: 55, spread: 0.62 }, 
    { id: 'right_wing_window_east_2', x: 19, z: -18, baseBrightness: 55, spread: 0.22 }, 
    { id: 'right_wing_window_east_3', x: 19, z: -26, baseBrightness: 55, spread: 0.62 },
    { id: 'left_wing_ceiling_light1', x: -25, z: 15, baseBrightness: 80, spread: 0.30 },
    { id: 'left_wing_ceiling_light2', x: -23, z: -10, baseBrightness: 45, spread: 0.07 }, 

    { id: 'elevator1', x: -7, z: 6, baseBrightness: 25, spread: 0.40 }, 
    { id: 'elevator2', x: 7, z: 6, baseBrightness: 25, spread: 0.40 },
    { id: 'stairs', x: 3.5, z: -3, baseBrightness: 25, spread: 0.25}, 
    { id: 'stairs2', x: -3.5, z: -3, baseBrightness: 25, spread: 0.25 },  
    { id: 'stairs3', x: -23, z: -26, baseBrightness: 25, spread: 0.30 },  
  ],
  2: [
    { id: 'stairs', x: 3.5, z: -4, baseBrightness: 40, spread: 0.30 }, 
    { id: 'stairs2', x: -3.5, z: -4, baseBrightness: 40, spread: 0.30 }, 
    { id: 'stairs3_left', x: -23, z: -26, baseBrightness: 30, spread: 0.20 },  
    { id: 'cafe_area', x: 0, z: 16.5, baseBrightness: 60, spread: 0.1 }, 
    { id: 'elevator1_F2', x: -6.8, z: 6, baseBrightness: 15, spread: 0.60 }, 
    { id: 'elevator2_F2', x: 6.8, z: 6, baseBrightness: 15, spread: 0.60 },
    { id: 'video_wall', x: 26, z: 11, baseBrightness: 35, spread: 0.12 }, 
    { id: 'middle_area_ceiling_light_right', x: -4, z: -13, baseBrightness: 70, spread: 0.80 }, 
    { id: 'middle_area_ceiling_light_middle', x: -0, z: -19, baseBrightness: 70, spread: 0.80 }, 
    { id: 'middle_area_ceiling_light_left', x: +4, z: -13, baseBrightness: 70, spread: 0.80 }, 
    { id: 'left_wing_ceiling_light_1', x: -23, z: +9, baseBrightness: 80, spread: 0.80 },  
    { id: 'left_wing_ceiling_light_2', x: -23, z: 2, baseBrightness: 80, spread: 0.80 },  
    { id: 'left_wing_ceiling_light_3', x: -23, z: -6, baseBrightness: 80, spread: 0.80 },  
    { id: 'left_wing_ceiling_light_4', x: -23, z: -13, baseBrightness: 80, spread: 0.80 },  
    { id: 'left_wing_ceiling_light_5', x: -23, z: -20, baseBrightness: 80, spread: 0.80 },  
    { id: 'right_wing_window_west_1', x: 28, z: -5, baseBrightness: 60, spread: 0.3 }, 
    { id: 'right_wing_window_west_2', x: 28, z: -25, baseBrightness: 60, spread: 0.3 }, 
    { id: 'right_wing_window_east_1', x: 19, z: -18, baseBrightness: 55, spread: 0.22 }, 
  ]
}

// Helper for linear interpolation
const lerp = (x, y, t) => (1 - t) * x + t * y;

// ==========================================
// UNIFIED BRIGHTNESS ENGINE
// ==========================================
export function getBrightnessSources(timeOfDay, targetFloor, dayOfWeek) {
  const activeSources = [];

  // 1. Inject Static Architectural Sources
  const staticExhibits = staticBrightnessSources[targetFloor] || [];
  staticExhibits.forEach(exhibit => {
    activeSources.push({
      id: exhibit.id,  
      x: exhibit.x,
      z: exhibit.z,
      volume: exhibit.baseBrightness,
      spread: exhibit.spread,
      isStatic: true
    });
  });

  applyTimeBasedSpread(activeSources, timeOfDay);


//    //==================== brightness dependant on visitors:
//   // 2. Filter Active Visitors for this Day and Floor
//   const activeVisitors = visitors.filter(v => 
//     v.daysVisiting.includes(dayOfWeek) && v.floor === targetFloor
//   );

//   // 3. Compute Raw Interpolated Positions for Visitors
//   const visitorPositions = [];
//   activeVisitors.forEach((visitor) => {
//     const path = visitor.path;
//     const enterTime = path[0].time;
//     const exitTime = path[path.length - 1].time

//     if (timeOfDay >= enterTime && timeOfDay <= exitTime) {
//       let startIndex = 0;
//       for (let j = 0; j < path.length - 1; j++) {
//         if (timeOfDay >= path[j].time && timeOfDay <= path[j+1].time) {
//           startIndex = j;
//           break;
//         }
//       }
      
//       const startNode = path[startIndex];
//       const endNode = path[startIndex + 1];
//       const duration = endNode.time - startNode.time;
//       const progress = duration === 0 ? 1 : (timeOfDay - startNode.time) / duration
      
//       // Simulating Three.js smootherstep interpolation natively
//       const t = Math.max(0, Math.min(1, progress));
//       const easedProgress = t * t * t * (t * (t * 6 - 15) + 10);

//       const currentX = lerp(startNode.x, endNode.x, easedProgress);
//       const currentZ = lerp(startNode.z, endNode.z, easedProgress);

//       // Lower noise if they are dwelling (standing still)
//       const segmentDistance = Math.hypot(endNode.x - startNode.x, endNode.z - startNode.z);
//       const isDwelling = segmentDistance < 0.5;
//       const currentNoise = isDwelling ? visitor.baseNoise - 12 : visitor.baseNoise;

//       visitorPositions.push({ x: currentX, z: currentZ, volume: currentNoise });
//     }
//   });

//   // 4. Calculate Proximity Compounding Factors (Crowd Buzz)
//   visitorPositions.forEach((pos, i) => {
//     let dynamicNoise = pos.volume;
    
//     visitorPositions.forEach((neighbor, j) => {
//       if (i !== j) {
//         const dist = Math.hypot(pos.x - neighbor.x, pos.z - neighbor.z);
//         if (dist < 1) {
//           dynamicNoise += (2.5 - dist) * 0.2; // Crowded spaces generate secondary group murmur
//         }
//       }
//     });

//     activeSources.push({
//       x: pos.x,
//       z: pos.z,
//       volume: 1- Math.min(dynamicNoise, 65), // Cap volume at 65dB
//       spread: 0.9,
//       isStatic: false
//     });
//   });
// //    //====================
  
  return activeSources;
}