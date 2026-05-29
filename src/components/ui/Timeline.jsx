import { useEffect, useRef, useState } from 'react'
import useAppStore from '../../store/useAppStore'
import styles from './styles/Timeline.module.css'

export default function Timeline() {
  const { 
    timeOfDay, isPlaying, isLiveMode, 
    setTimeOfDay, togglePlaying, setLiveMode, advanceTime, selectedDate 
  } = useAppStore()

  const requestRef = useRef()
  const previousTimeRef = useRef()

  // Real-world clock (updates every minute)
  const [realTimeFloat, setRealTimeFloat] = useState(() => {
    const now = new Date()
    return now.getHours() + (now.getMinutes() / 60) + (now.getSeconds() / 3600)
  })

  useEffect(() => {
    // Run every 50ms so the marker glides smoothly even when the simulation is paused
    const interval = setInterval(() => {
      const now = new Date()
      const exact = now.getHours() + (now.getMinutes() / 60) + (now.getSeconds() / 3600) + (now.getMilliseconds() / 3600000)
      setRealTimeFloat(exact)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // --- UNIFIED ANIMATION & LIVE-SYNC LOOP ---
  useEffect(() => {

    const PLAYBACK_SPEED = 0.5;

    const animate = (time) => {
      if (isLiveMode) {
        // 1. LIVE MODE: Calculate real-world time down to the exact millisecond
        const now = new Date()
        const exactRealTime = 
          now.getHours() + 
          (now.getMinutes() / 60) + 
          (now.getSeconds() / 3600) + 
          (now.getMilliseconds() / 3600000)
        
        setTimeOfDay(exactRealTime)
      } else if (isPlaying && previousTimeRef.current !== undefined) {
        // 2. PLAYBACK MODE: Advance time based on frame delta
        const deltaSeconds = (time - previousTimeRef.current) / 1000
        advanceTime(deltaSeconds * PLAYBACK_SPEED)
      }
      
      previousTimeRef.current = time
      
      // Keep looping if we are playing OR if we are in live mode
      if (isPlaying || isLiveMode) {
        requestRef.current = requestAnimationFrame(animate)
      }
    }

    // Start the loop
    if (isPlaying || isLiveMode) {
      requestRef.current = requestAnimationFrame(animate)
    } else {
      previousTimeRef.current = undefined
      cancelAnimationFrame(requestRef.current)
    }

    return () => cancelAnimationFrame(requestRef.current)
  }, [isPlaying, isLiveMode, advanceTime, setTimeOfDay])

  // UI Calculations
  const hours = Array.from({ length: 10 }, (_, i) => i + 9)
  const isToday = selectedDate.toDateString() === new Date().toDateString()
  const isMuseumOpenNow = realTimeFloat >= 9 && realTimeFloat <= 18
  const showNowMarker = isToday && isMuseumOpenNow
  
  // Calculate percentages for positioning and track filling (0% to 100%)
  const nowPercentage = ((realTimeFloat - 9) / 9) * 100
  const currentPercentage = ((timeOfDay - 9) / 9) * 100

  const handleSliderChange = (e) => {
    setTimeOfDay(parseFloat(e.target.value))
    if (isLiveMode) setLiveMode(false) 
  }

  return (
    <div className={`${styles.container} ${isLiveMode ? styles.isLive : ''} ${isPlaying ? styles.isPlaying : ''}`}>
      <button 
        className={`${styles.playBtn} ${isPlaying ? styles.isPlaying : ''}`} 
        onClick={togglePlaying}
        aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
      >
        {isPlaying ? (
           <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        ) : (
           <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
        )}
      </button>
      
      <div className={styles.trackWrapper}>
        
        {/* The NOW / LIVE Marker */}
        {showNowMarker && (
          <button 
            className={`${styles.nowMarker} ${isLiveMode ? styles.liveActive : ''}`} 
            // FIX: Updated math for a 10px thumb
            style={{ 
               left: `calc(${nowPercentage}% + ${5 - nowPercentage * 0.1}px)`,
               cursor: isLiveMode ? 'default' : 'pointer' 
            }}
            onClick={() => {
              if (!isLiveMode) setLiveMode(true)
            }}
            title={isLiveMode ? "Live Tracking Active" : "Jump to Now"}
          >
            <div className={styles.nowLabel}>{isLiveMode ? 'LIVE' : 'NOW'}</div>
            <div className={styles.nowLine} />
          </button>
        )}

        <input 
          type="range" 
          className={styles.slider}
          style={{ '--progress': `${currentPercentage}%` }}
          min="9" max="18" step="0.01" 
          value={timeOfDay} 
          onChange={handleSliderChange}
        />
        
        {/* Unified Ticks and Labels using the same alignment formula */}
        <div className={styles.ticksContainer}>
          {hours.map(h => {
            const pct = ((h - 9) / 9) * 100;
            return (
              <div 
                key={`tickGroup-${h}`} 
                className={styles.tickGroup}
                style={{ left: `calc(${pct}% + ${5 - pct * 0.1}px)` }}
              >
                <div className={styles.tick} />
                {h % 1 === 0 && <div className={styles.label}>{h}:00</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}