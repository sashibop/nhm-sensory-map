import { useState } from 'react'
import styles from './GlobalSettings.module.css'

export default function GlobalSettings() {
  // 1. NEW: State to control the main menu visibility on mobile
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
    { id: 'help', label: 'Help' },
    { id: 'language', label: 'Language' },
    { id: 'accessibility', label: 'Accessibility' },
  ]

  const togglePanel = (id) => {
    setActiveSetting(activeSetting === id ? null : id)
  }

  // 2. UPDATED: Header click handler
  const handleHeaderClick = () => {
    setIsMobileOpen(!isMobileOpen) // Toggles the menu on mobile
    if (activeSetting) setActiveSetting(null) // Closes any open sub-panels
  }

  return (
    <div className={styles.container}>
      
      {/* GHOST TRIGGER HEADER */}
      <div className={styles.heading} onClick={handleHeaderClick}>
        <span className={styles.desktopText}>Settings</span>
        {/* Mobile Ellipsis */}
        <svg className={styles.mobileIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
        </svg>
      </div>
      
      {/* 3. UPDATED: Apply the mobileOpen class conditionally */}
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
              
              {/* 1. HELP */}
              {option.id === 'help' && (
                <div className={styles.subGroup}>
                  <div className={styles.infoRow}>
                    <span className={styles.subLabel}>Orbit</span>
                    <span className={styles.value}>Left-Click</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.subLabel}>Pan</span>
                    <span className={styles.value}>Right-Click</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.subLabel}>Zoom</span>
                    <span className={styles.value}>Scroll</span>
                  </div>
                </div>
              )}

              {/* 2. LANGUAGE */}
              {option.id === 'language' && (
                <div className={styles.subGroup}>
                  {['EN', 'DE', 'FR'].map(lang => (
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
                  
                  {/* Micro-Dot Toggles */}
                  <div className={`${styles.subRow} ${highContrast ? styles.subActive : ''}`} onClick={() => setHighContrast(!highContrast)}>
                    <span className={styles.subLabel}>High Contrast</span>
                    <div className={styles.subIndicator} />
                  </div>
                  
                  <div className={`${styles.subRow} ${plainLang ? styles.subActive : ''}`} onClick={() => setPlainLang(!plainLang)}>
                    <span className={styles.subLabel}>Plain Language</span>
                    <div className={styles.subIndicator} />
                  </div>

                  {/* Architectural Sliders */}
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