import { useEffect, useRef, useState } from 'react'
import useAppStore from '../../store/useAppStore'
import styles from './Timeline.module.css'

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
    return now.getHours() + (now.getMinutes() / 60)
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setRealTimeFloat(now.getHours() + (now.getMinutes() / 60))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Live-Sync Engine
  useEffect(() => {
    if (isLiveMode) setTimeOfDay(realTimeFloat)
  }, [realTimeFloat, isLiveMode, setTimeOfDay])

  // Animation Loop
  useEffect(() => {
    const animate = (time) => {
      if (previousTimeRef.current !== undefined) {
        const deltaSeconds = (time - previousTimeRef.current) / 1000
        advanceTime(deltaSeconds)
      }
      previousTimeRef.current = time
      if (isPlaying) requestRef.current = requestAnimationFrame(animate)
    }
    if (isPlaying) requestRef.current = requestAnimationFrame(animate)
    else {
      previousTimeRef.current = undefined
      cancelAnimationFrame(requestRef.current)
    }
    return () => cancelAnimationFrame(requestRef.current)
  }, [isPlaying, advanceTime])

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
    <div className={`${styles.container} ${isLiveMode ? styles.isLive : ''}`}>
      <button 
        className={styles.playBtn} 
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
            style={{ left: `calc(${nowPercentage}% + ${10 - nowPercentage * 0.2}px)` }}
            onClick={() => {
              if (!isLiveMode) setLiveMode(true)
            }}
            title={isLiveMode ? "Live Tracking Active" : "Jump to Now"}
            // Optional: Remove pointer cursor when already live so it feels less like a button
            style={{ 
               left: `calc(${nowPercentage}% + ${10 - nowPercentage * 0.2}px)`,
               cursor: isLiveMode ? 'default' : 'pointer' 
            }}
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
                style={{ left: `calc(${pct}% + ${10 - pct * 0.2}px)` }}
              >
                <div className={styles.tick} />
                {h % 3 === 0 && <div className={styles.label}>{h}:00</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}