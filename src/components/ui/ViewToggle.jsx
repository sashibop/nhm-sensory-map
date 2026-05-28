import { useState } from 'react'
import styles from './ViewToggle.module.css'

export default function ViewToggle() {
  const activeView = '3D'; // This will eventually come from useAppStore
  
  // Mobile accordion state
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleToggle = (view) => {
    // setActiveView(view) // Call store setter here
    setIsMobileOpen(false) // Auto-close menu after selection on mobile
  }

  return (
    <div className={styles.container}>
      
      {/* GHOST TRIGGER HEADER */}
      <div className={styles.heading} onClick={() => setIsMobileOpen(!isMobileOpen)}>
        <span className={styles.desktopText}>View Mode</span>
        {/* Universal 'View/Eye' Icon for Mobile */}
        <svg className={styles.mobileIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>

      {/* EXPANDING LIST */}
      <div className={`${styles.list} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        
        <button 
          className={`${styles.row} ${activeView === '3D' ? styles.active : ''}`}
          onClick={() => handleToggle('3D')}
        >
          <div className={styles.indicator} />
          <span className={styles.label}>3D View</span>
        </button>
        
        <button 
          className={`${styles.row} ${activeView === '2D' ? styles.active : ''}`}
          onClick={() => handleToggle('2D')}
        >
          <div className={styles.indicator} />
          <span className={styles.label}>2D Plan</span>
        </button>

      </div>
    </div>
  )
}