import * as THREE from 'three';
import { visitors } from '../data/mockVisitorData'

const EVERYDAY = [0, 1, 2, 3, 4, 5, 6];
// ==========================================
// TIME-BASED SPREAD MODULATOR
// ==========================================
export function applyTimeBasedSpread(sources, timeOfDay, dayOfWeek, rules = DEFAULT_SPREAD_RULES) {
  
  const activeRules = [0, 1, 4].includes(dayOfWeek)
  ? DEFAULT_SPREAD_RULES
  : CLOUDY_SPREAD_RULES;

  // const activeRules = dayOfWeek % 2 === 0
  //   ? DEFAULT_SPREAD_RULES
  //   : CLOUDY_SPREAD_RULES;
  
  sources.forEach(source => {
    if (!source.id) return;

    activeRules.forEach(rule => {
      if (!source.id.includes(rule.idFilter)) return;

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

      const duration = endKf.time - startKf.time;
      const t = duration === 0 ? 1 : (timeOfDay - startKf.time) / duration;
      const clamped = Math.max(0, Math.min(1, t));

      source.spread = lerp(startKf.spread, endKf.spread, clamped);

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
// TODO: change brightness depending on day (cloudy vs sunny day == cariance in brightness data)
export const DEFAULT_SPREAD_RULES = [
  {
    idFilter: 'window_east',
    keyframes: [
      { time: 9,  spread: 0.45, brightness: 30 },  // Dawn: tight, dim shaft
      { time: 10,  spread: 0.35, brightness: 35 },  // Morning: sun shining in directly 
      { time: 12, spread: 0.40, brightness: 30 },  
      { time: 15, spread: 0.45, brightness: 30 },  // Afternoon: narrowing
      { time: 18, spread: 0.7, brightness: 25 },  // Dusk: rather dark 
      { time: 20, spread: 0.85, brightness: 10 },  // Night: almost nothing
    ]
  }, 
  {
    idFilter: 'window_west',
    keyframes: [
      { time: 9,  spread: 0.8, brightness: 20 },  // Dawn: tight, dim shaft
      { time: 11,  spread: 0.7, brightness: 25 },  // Dawn: tight, dim shaft
      { time: 12,  spread: 0.55, brightness: 25 },  // Morning: rather dark 

      { time: 13,  spread: 0.35, brightness: 25 },  // Morning: rather dark 
      { time: 15, spread: 0.40, brightness: 35 },  // Afternoon: brightest 
      { time: 18, spread: 0.35, brightness: 30 },  // Dusk: sun still shining in
      { time: 20, spread: 0.85, brightness: 10 },  // Night: almost nothing
    ]
  }
];

// ==========================================
// CLOUDY LIGHT SPREAD RULES
// ==========================================
export const CLOUDY_SPREAD_RULES = [
  {
    idFilter: 'window_east',
    keyframes: [
      { time: 9,  spread: 0.55, brightness: 22 },
      { time: 10, spread: 0.50, brightness: 34 },
      { time: 12, spread: 0.58, brightness: 28 },
      { time: 15, spread: 0.62, brightness: 20 },
      { time: 18, spread: 0.78, brightness: 16 },
      { time: 20, spread: 0.88, brightness: 8 },
    ]
  },
  {
    idFilter: 'window_west',
    keyframes: [
      { time: 9,  spread: 0.82, brightness: 15 },
      { time: 11, spread: 0.74, brightness: 18 },
      { time: 12, spread: 0.64, brightness: 19 },
      { time: 13, spread: 0.52, brightness: 22 },
      { time: 15, spread: 0.50, brightness: 34 },
      { time: 18, spread: 0.58, brightness: 21 },
      { time: 20, spread: 0.88, brightness: 7 },
    ]
  }
];

// ==========================================
// STATIC EXHIBIT BRIGHTNESS SOURCES
// ==========================================

export const staticBrightnessSources = {
  1: [
    { id: 'entry', x: -0.5, z: 15, baseBrightness: 50, spread: 0.3 },
    // { id: 'private_room', x: -0.7, z: -15, baseBrightness: 40, spread: 0.30 },
    { id: 'elevator1_right', x: -10.6, z: 5.4, baseBrightness: 55, spread: 0.45 },
    { id: 'elevator2_left', x: 9.5, z: 5.4, baseBrightness: 55, spread: 0.45 },   
    { id: 'main_stairs', x:-0.7, z: 3, baseBrightness: 45, spread: 0.2}, 
    { id: 'stairs_right_wing', x: -34.5, z: -50.5, baseBrightness: 55, spread: 0.55}, 

    // RIGHT-WING -------------------------------
    // east
    // //room 1
    { id: 'right_wing_ceiling', x: -24.5, z: 13, baseBrightness: 35, spread: 1.0 }, 
    { id: 'right_wing_ceiling', x: -20.5, z: 13, baseBrightness: 35, spread: 1.0 }, 
    { id: 'right_wing_ceiling', x: -16.5, z: 13, baseBrightness: 35, spread: 1.0 }, 
    { id: 'right_wing_ceiling', x: -24.5, z: 6, baseBrightness: 35, spread: 1.0 }, 
    { id: 'right_wing_ceiling', x: -20.5, z: 6, baseBrightness: 35, spread: 1.0 }, 
    { id: 'right_wing_ceiling', x: -16.5, z: 6, baseBrightness: 35, spread: 1.0 }, 

    //room 2
    { id: 'right_wing_window_east_1', x: -40.5, z: 14, baseBrightness: 15, spread: 0.92 }, 
    { id: 'right_wing_window_east_2', x: -40.5, z: 9.6, baseBrightness: 15, spread: 0.92 }, 
    // { id: 'right_wing_window_east_3', x: -40.5, z: 4.8, baseBrightness: 15, spread: 0.92 }, 
    { id: 'right_wing_ceiling', x: -36.5, z: 14.6, baseBrightness: 35, spread: 0.82 }, 

    // // long room 3
    { id: 'right_wing_window_east_4', x: -40, z: -1.2, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_5', x: -40, z: -7.1, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_6', x: -40, z: -12.5, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_7', x: -40, z: -17.9, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_8', x: -40, z: -23.5, baseBrightness: 15, spread: 0.82 },
    { id: 'right_wing_window_east_9', x: -40, z: -29.3, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_10', x: -40, z: -35, baseBrightness: 15, spread: 0.82 }, 
    // east
    // // { id: 'right_wing_window_west_1', x: -28.9, z: -1.2, baseBrightness: 55, spread: 0.62 }, 
    { id: 'right_wing_window_west_1', x: -28.9, z: -1, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_2', x: -28.9, z: -6.6, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_3', x: -28.9, z: -12.3, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_4', x: -28.9, z: -17.8, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_5', x: -28.9, z: -23.5, baseBrightness: 15, spread: 0.82 },
    { id: 'right_wing_window_west_6', x: -28.9, z: -29.3, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_7', x: -28.9, z: -34.8, baseBrightness: 15, spread: 0.82 }, 

    //room 4
    { id: 'right_wing_window_east_11', x: -40.5, z: -40.9, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_12', x: -40.5, z: -45.9, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_13', x: -40.5, z: -50.5, baseBrightness: 15, spread: 0.82 }, 
    
    // LEFT-WING -------------------------------
    //Room 1 north +south windows
    { id: 'right_wing_ceiling', x: 24, z: 13, baseBrightness: 35, spread: 1.0 }, 
    { id: 'right_wing_ceiling', x: 20, z: 13, baseBrightness: 35, spread: 1.0 }, 
    { id: 'right_wing_ceiling', x: 16, z: 13, baseBrightness: 35, spread: 1.0 }, 
    { id: 'right_wing_ceiling', x: 24, z: 6, baseBrightness: 35, spread: 1.0 }, 
    { id: 'right_wing_ceiling', x: 20, z: 6, baseBrightness: 35, spread: 1.0 }, 
    { id: 'right_wing_ceiling', x: 16, z: 6, baseBrightness: 35, spread: 1.0 }, 

    //Room2 + 3: Aquarium: only ceiling lights
    { id: 'left_wing_ceiling_1', x: 30, z: 10.5, baseBrightness: 20, spread: 0.25 },
    { id: 'left_wing_ceiling_2', x: 33, z: 2.5, baseBrightness:20, spread: 0.25 },
    { id: 'left_wing_ceiling_3', x: 30, z: -28.5, baseBrightness: 20, spread: 0.1 },

    //Room 4
    { id: 'left_wing_window_west_1', x: 40, z: -40.5, baseBrightness: 15, spread: 0.95 },
    { id: 'left_wing_window_west_2', x: 39, z: -50.5, baseBrightness: 15, spread: 0.82 }, 
    { id: 'left_wing_ceiling', x: 25.5, z: -45.5, baseBrightness: 45, spread: 0.32 }, 

  ],
  2: [
    { id: 'main_stairs', x: 0.7, z: 0, baseBrightness: 60, spread: 0.15 }, 
    { id: 'stairs_right_wing', x: -32.5, z: -48, baseBrightness: 45, spread: 0.25}, 
    { id: 'private_room', x: 0.6, z: -19, baseBrightness: 40, spread: 0.30 },

    { id: 'cafe_area_1', x: 4.5, z: 19.5, baseBrightness: 50, spread: 0.95 }, 
    { id: 'cafe_area_2', x: -3, z: 19.5, baseBrightness: 50, spread: 0.95 }, 
    { id: 'cafe_area_1', x: 6, z: 13.5, baseBrightness: 30, spread: 0.95 }, 
    { id: 'cafe_area_2', x: -5, z: 13.5, baseBrightness: 30, spread: 0.95 }, 
    { id: 'cafe_area_3', x: -2.5, z: 9.5, baseBrightness: 20, spread: 0.75 }, 
    { id: 'cafe_area_3', x: 4.5, z: 9.5, baseBrightness: 20, spread: 0.75 }, 


    { id: 'elevator1_left', x: -9, z: 9.4, baseBrightness: 55, spread: 0.45 },
    { id: 'elevator2_right', x: 10.5, z: 9.4, baseBrightness: 55, spread: 0.45 },   

    // LEFT-WING -------------------------------------------------------------------------------
    // east
    //room 1
    // { id: 'right_wing_ceiling_1', x: -12.5, z: 13, baseBrightness: 40, spread: 0.85 }, 
    { id: 'right_wing_ceiling', x: -17, z: 13, baseBrightness: 40, spread: 0.85 }, 
    { id: 'right_wing_ceiling', x: -22, z: 13, baseBrightness: 40, spread: 0.85 }, 
    { id: 'right_wing_ceiling', x: -26.5, z: 13, baseBrightness: 40, spread: 0.85 }, 

    //room 2
    { id: 'right_wing_window_east_1', x: -40.5, z: 14, baseBrightness: 15, spread: 0.92 }, 
    { id: 'right_wing_window_east_2', x: -40.5, z: 9.6, baseBrightness: 15, spread: 0.92 }, 
    { id: 'right_wing_window_east_3', x: -40.5, z: 18.6, baseBrightness: 15, spread: 0.92 }, 
    { id: 'right_wing_ceiling', x: -32.5, z: 13, baseBrightness: 40, spread: 0.85 }, 
    { id: 'right_wing_ceiling', x: -33, z: 6.8, baseBrightness: 40, spread: 0.85 }, 

    // long room 3
    { id: 'right_wing_window_east_4', x: -39, z: 2.9, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_5', x: -39, z: -3, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_6', x: -39, z: -8.8, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_7', x: -39, z: -14.4, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_8', x: -39, z: -20.2, baseBrightness: 15, spread: 0.82 },
    { id: 'right_wing_window_east_9', x: -39, z: -25.8, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_10', x: -39, z: -31., baseBrightness: 15, spread: 0.82 }, 

    //room 4
    { id: 'right_wing_window_east_11', x: -40, z: -42.5, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_12', x: -39.5, z: -46.9, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing ceiling', x: -33, z: -38, baseBrightness: 42, spread: 0.55}, 

    //west 
    { id: 'right_wing_window_west_1', x: -27.5, z: 2.8, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_2', x: -27.5, z: -2.8, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_3', x: -27.5, z: -8.4, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_4', x: -27.5, z: -14, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_5', x: -27.5, z: -19.9, baseBrightness: 15, spread: 0.82 },
    { id: 'right_wing_window_west_6', x: -27.5, z: -25.8, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_7', x: -27.5, z: -31.2, baseBrightness: 15, spread: 0.82 }, 
    // ------------------------------------
    // Room 1
    { id: 'right_wing_ceiling', x: 17, z: 13, baseBrightness: 40, spread: 0.85 }, 
    { id: 'right_wing_ceiling', x: 22, z: 13, baseBrightness: 40, spread: 0.85 }, 
    { id: 'right_wing_ceiling', x: 26.5, z: 13, baseBrightness: 40, spread: 0.85 }, 

    // Room 2
    { id: 'right_wing_ceiling', x: 31.5, z: 17, baseBrightness: 40, spread: 0.85 }, 
    { id: 'right_wing_ceiling', x: 38.5, z: 17, baseBrightness: 30, spread: 0.85 }, 
    { id: 'right_wing_ceiling', x: 31.5, z: 10, baseBrightness: 40, spread: 0.85 }, 
    { id: 'right_wing_ceiling', x: 38.5, z: 10, baseBrightness: 40, spread: 0.85 }, 
    { id: 'right_wing_window_west_0', x: 41.5, z: 18, baseBrightness: 15, spread: 0.85 }, 


    // Room 3 (long)
    //east windows
    { id: 'right_wing_window_east_1', x: 29, z: 3.2, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_2', x: 29, z: -2.8, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_3', x: 29, z: -8.4, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_4', x: 29, z: -14.5, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_east_5', x: 29, z: -19.9, baseBrightness: 15, spread: 0.82 },
    //west windows
    { id: 'right_wing_window_west_1', x: 41, z: 3.2, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_2', x: 41, z: -2.8, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_3', x: 41, z: -8.4, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_4', x: 41, z: -14.2, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_5', x: 41, z: -20.2, baseBrightness: 15, spread: 0.82 },
    // { id: 'right_wing_window_west_6', x: 41, z: -25.8, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_ceiling', x: 31, z: -24.8, baseBrightness: 25, spread: 0.52 }, 

   
    // Room 4 
    { id: 'right_wing_ceiling', x: 38.5, z: -31.2, baseBrightness: 45, spread: 0.42 }, 

    // { id: 'right_wing_window_west_7', x: 40.5, z: -31.2, baseBrightness: 15, spread: 0.82 }, 

    //Room 5
    { id: 'stairs', x: 27, z: -42, baseBrightness: 55, spread: 0.32 }, 
    { id: 'right_wing_window_west_8', x: 41.5, z: -42, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_window_west_9', x: 41.5, z: -47, baseBrightness: 15, spread: 0.82 }, 
    { id: 'right_wing_ceiling', x: 34, z: -48, baseBrightness: 25, spread: 0.22 }, 

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

  applyTimeBasedSpread(activeSources, timeOfDay, dayOfWeek);
  
  return activeSources;
}