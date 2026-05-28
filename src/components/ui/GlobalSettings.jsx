import { useState } from 'react'
import styles from './GlobalSettings.module.css'
// 1. IMPORT YOUR APP STORE
import useAppStore from '../../store/useAppStore'

export default function GlobalSettings() {
  // Pull the current view state ('3D' or '2D')
  const activeView = useAppStore((state) => state.activeView)

  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeSetting, setActiveSetting] = useState(null)
  
  // Data States
  const [activeLang, setActiveLang] = useState('EN')
  const [highContrast, setHighContrast] = useState(false)
  const [plainLang, setPlainLang] = useState(false)
  const [textSize, setTextSize] = useState(100)
  const [cursorSize, setCursorSize] = useState(100)

  const textProgress = ((textSize - 50) / 100) * 100;
  const cursorProgress = ((cursorSize - 50) / 100) * 100;

  const settingsOptions = [
    ...(activeView === '3D' ? [{ id: 'help', label: 'Controls' }] : []),
    { id: 'language', label: 'Language' },
    { id: 'accessibility', label: 'Accessibility' },
  ]

  const togglePanel = (id) => {
    setActiveSetting(activeSetting === id ? null : id)
  }

  const handleHeaderClick = () => {
    setIsMobileOpen(!isMobileOpen) 
    if (activeSetting) setActiveSetting(null) 
  }

  return (
    <div className={styles.container}>
      
      {/* GHOST TRIGGER HEADER */}
      <div className={styles.heading} onClick={handleHeaderClick}>
        <span className={styles.desktopText}>Settings</span>
        <svg className={styles.mobileIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
        </svg>
      </div>
      
      <div className={`${styles.list} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        {settingsOptions.map((option) => (
          <div key={option.id} className={styles.wrapper}>
            
            {/* --- MAIN MENU ROW --- */}
            <div 
              className={`${styles.row} ${activeSetting === option.id ? styles.active : ''}`} 
              onClick={() => togglePanel(option.id)}
            >
              <span className={styles.label}>{option.label}</span>
              <div className={styles.indicator} />
            </div>

            {/* --- GHOST SUB-PANELS --- */}
            <div className={`${styles.subContent} ${activeSetting === option.id ? styles.expanded : ''}`}>
              
              {/* 1. CONTROLS (THE FIX: Added the conditional wrapper back) */}
              {option.id === 'help' && (
                <div className={styles.subGroup}>
                  <div className={styles.infoRow}>
                    <span className={styles.subLabel}>Left-Click + Drag</span>
                    <span className={styles.value}>Orbit</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.subLabel}>Right-Click + Drag</span>
                    <span className={styles.value}>Pan</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.subLabel}>Scroll</span>
                    <span className={styles.value}>Zoom</span>
                  </div>
                </div>
              )}

              {/* 2. LANGUAGE */}
              {option.id === 'language' && (
                <div className={styles.subGroup}>
                  {['DE', 'EN'].map(lang => (
                    <div 
                      key={lang} 
                      className={`${styles.subRow} ${activeLang === lang ? styles.subActive : ''}`}
                      onClick={() => setActiveLang(lang)}
                    >
                      <span className={styles.subLabel}>{lang}</span>
                      <div className={styles.subIndicator} />
                    </div>
                  ))}
                </div>
              )}

              {/* 3. ACCESSIBILITY */}
              {option.id === 'accessibility' && (
                <div className={styles.subGroup}>
                  <div className={`${styles.subRow} ${highContrast ? styles.subActive : ''}`} onClick={() => setHighContrast(!highContrast)}>
                    <span className={styles.subLabel}>High Contrast</span>
                    <div className={styles.subIndicator} />
                  </div>
                  
                  <div className={`${styles.subRow} ${plainLang ? styles.subActive : ''}`} onClick={() => setPlainLang(!plainLang)}>
                    <span className={styles.subLabel}>Plain Language</span>
                    <div className={styles.subIndicator} />
                  </div>

                  <div className={styles.sliderRow}>
                    <span className={styles.subLabel}>Text Size</span>
                    <input 
                      type="range" className={styles.ghostSlider} style={{ '--progress': `${textProgress}%` }}
                      min="50" max="150" step="1" value={textSize} onChange={(e) => setTextSize(e.target.value)} 
                    />
                  </div>
                  
                  <div className={styles.sliderRow}>
                    <span className={styles.subLabel}>Cursor Size</span>
                    <input 
                      type="range" className={styles.ghostSlider} style={{ '--progress': `${cursorProgress}%` }}
                      min="50" max="150" step="1" value={cursorSize} onChange={(e) => setCursorSize(e.target.value)} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}