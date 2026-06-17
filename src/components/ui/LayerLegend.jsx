import React, { useMemo } from 'react'
import useAppStore from '../../store/useAppStore'
import { visitors } from '../../data/mockVisitorData'
import styles from './styles/LayerLegend.module.css'
import { Users, AudioWaveform } from 'lucide-react'

const getNoiseColor = (percent) => {
  const stops = [
    { p: 0,  c: [13, 102, 115] },   // 15dB - Teal
    { p: 20, c: [31, 178, 102] },   // Green
    { p: 35, c: [153, 204, 38] },   // Lime
    { p: 50, c: [250, 191, 13] },   // Yellow
    { p: 65, c: [242, 102, 26] },   // Orange
    { p: 85, c: [230, 38, 51] },    // Red
    { p: 100, c: [127, 0, 51] }     // 65dB+ Dark Red
  ];

  let lower = stops[0], upper = stops[stops.length - 1];
  
  for (let i = 0; i < stops.length - 1; i++) {
    if (percent >= stops[i].p && percent <= stops[i+1].p) {
      lower = stops[i];
      upper = stops[i+1];
      break;
    }
  }

  if (lower === upper) return `rgb(${lower.c.join(',')})`;

  const t = (percent - lower.p) / (upper.p - lower.p);
  const r = Math.round(lower.c[0] + (upper.c[0] - lower.c[0]) * t);
  const g = Math.round(lower.c[1] + (upper.c[1] - lower.c[1]) * t);
  const b = Math.round(lower.c[2] + (upper.c[2] - lower.c[2]) * t);

  return `rgb(${r}, ${g}, ${b})`;
}

const getCrowdColor = (count) => {
  const maxCapacity = 50; 
  const percent = Math.min(100, (count / maxCapacity) * 100);
  
  const start = [200, 200, 200]; // Light Gray
  const end = [242, 102, 26];    // Orange
  
  const t = percent / 100;
  const r = Math.round(start[0] + (end[0] - start[0]) * t);
  const g = Math.round(start[1] + (end[1] - start[1]) * t);
  const b = Math.round(start[2] + (end[2] - start[2]) * t);
  
  return `rgb(${r}, ${g}, ${b})`;
};

export default function LayerLegend() {
  const layers = useAppStore((state) => state.layers)
  const timeOfDay = useAppStore((state) => state.timeOfDay)
  const selectedDate = useAppStore((state) => state.selectedDate)
  const activeFloor = useAppStore((state) => state.activeFloor)

  const stats = useMemo(() => {
    const dayOfWeek = selectedDate.getDay()
    const todayVisitors = visitors.filter(v => v.daysVisiting.includes(dayOfWeek) && v.floor === activeFloor)
    const liveVisitors = todayVisitors.filter(v => {
      const enter = v.path[0].time
      const exit = v.path[v.path.length - 1].time
      return timeOfDay >= enter && timeOfDay <= exit
    })
    const total = liveVisitors.length
    const individuals = liveVisitors.filter(v => v.type === 'solo').length
    const groupVisitors = liveVisitors.filter(v => v.type !== 'solo')
    const uniqueGroups = new Set(groupVisitors.map(v => v.id.substring(0, v.id.lastIndexOf('_'))))
    return { total, individuals, groups: uniqueGroups.size }
  }, [selectedDate, activeFloor, timeOfDay])

  const averageNoise = useMemo(() => {
    if (!layers.noise) return 15;
    const emptyRoomBaseline = activeFloor === 1 ? 32 : 28;
    if (stats.total === 0) return emptyRoomBaseline;
    const crowdMurmur = stats.total * 0.35;
    return Math.min(65, emptyRoomBaseline + crowdMurmur);
  }, [layers.noise, activeFloor, stats.total])

  // Noise Calculations
  const noisePercent = Math.max(0, Math.min(100, ((averageNoise - 15) / 50) * 100))
  const dynamicNoiseColor = getNoiseColor(noisePercent)

  // Crowd Calculations (assuming 80 is max capacity for the visual scale)
  const maxCrowdScale = 90;
  const crowdPercent = Math.min(100, (stats.total / maxCrowdScale) * 100);
  const dynamicCrowdColor = getCrowdColor(stats.total);

  if (!layers.noise && !layers.crowd) return null

  return (
    <div className={styles.container}>
      
      {/* --- CROWD LEGEND --- */}
      {layers.crowd && (
        <div className={styles.ghostBlock}>
          {/* 2. Update the Heading */}
          <div className={`${styles.heading} ${styles.desktopOnly}`}>
            <Users size={12} strokeWidth={1.5} />
            Crowd
          </div>
          
          {/* DESKTOP: Crowd Gliding Track */}
          <div className={`${styles.trackWrapper} ${styles.desktopOnly}`}>
            <div className={styles.liveNeedle} style={{ left: `${crowdPercent}%` }}>
              <div className={styles.needleLabel}>
                {stats.total}<span>/{maxCrowdScale}</span>
              </div>
              <div 
                className={styles.dynamicNeedleDot} 
                style={{ '--glow-color': dynamicCrowdColor }} 
              />
            </div>
            
            <div className={`${styles.gradientTrack} ${styles.crowdTrack}`} />
            <div className={styles.ticksContainer}>
              <div className={styles.tickGroup} style={{ left: '0%' }}><div className={styles.tick} /><span className={styles.tickLabel}>0</span></div>
              <div className={styles.tickGroup} style={{ left: '50%' }}><div className={styles.tick} /><span className={styles.tickLabel}>{maxCrowdScale / 2}</span></div>
              <div className={styles.tickGroup} style={{ left: '100%' }}><div className={styles.tick} /><span className={styles.tickLabel}>{maxCrowdScale}+</span></div>
            </div>
          </div>

          {/* MOBILE: Minimalist Crowd Stat Block */}
          <div className={`${styles.mobileStatBlock} ${styles.mobileOnly}`}>
            <div 
              className={styles.dynamicNeedleDot} 
              style={{ '--glow-color': dynamicCrowdColor, position: 'relative' }} 
            />
            <div className={styles.mobileStatValue}>
              {stats.total}<span> pax</span>
            </div>
          </div>
        </div>
      )}

      {/* --- NOISE LEGEND --- */}
      {layers.noise && (
        <div className={styles.ghostBlock}>
          {/* 3. Update the Heading */}
          <div className={`${styles.heading} ${styles.desktopOnly}`}>
            <AudioWaveform size={12} strokeWidth={1.5} />
            Noise
          </div>
          
          {/* DESKTOP: Noise Gliding Track */}
          <div className={`${styles.trackWrapper} ${styles.desktopOnly}`}>
            <div className={styles.liveNeedle} style={{ left: `${noisePercent}%` }}>
              <div className={styles.needleLabel}>
                {Math.round(averageNoise)}<span>dB</span>
              </div>
              <div 
                className={styles.dynamicNeedleDot} 
                style={{ '--glow-color': dynamicNoiseColor }} 
              />
            </div>
            
            <div className={`${styles.gradientTrack} ${styles.noiseTrack}`} />
            <div className={styles.ticksContainer}>
              <div className={styles.tickGroup} style={{ left: '0%' }}><div className={styles.tick} /><span className={styles.tickLabel}>15dB</span></div>
              <div className={styles.tickGroup} style={{ left: '50%' }}><div className={styles.tick} /><span className={styles.tickLabel}>40dB</span></div>
              <div className={styles.tickGroup} style={{ left: '100%' }}><div className={styles.tick} /><span className={styles.tickLabel}>65dB+</span></div>
            </div>
          </div>

          {/* MOBILE: Minimalist Noise Stat Block */}
          <div className={`${styles.mobileStatBlock} ${styles.mobileOnly}`}>
            <div 
              className={styles.dynamicNeedleDot} 
              style={{ '--glow-color': dynamicNoiseColor, position: 'relative' }} 
            />
            <div className={styles.mobileStatValue}>
              {Math.round(averageNoise)}<span>dB</span>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}