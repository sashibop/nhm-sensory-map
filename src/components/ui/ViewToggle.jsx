import { useState } from 'react'
import styles from './styles/ViewToggle.module.css'
import useAppStore from '../../store/useAppStore'
import { useTranslation } from "react-i18next"

export default function ViewToggle() {
  const activeView = useAppStore((state) => state.activeView)
  const setActiveView = useAppStore((state) => state.setActiveView)
  const { t } = useTranslation()
    
  // Mobile accordion state
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleToggle = (view) => {
    setActiveView(view) 
    setIsMobileOpen(false) // Auto-close menu after selection on mobile
  }

  return (
    <div className={styles.container}>
      
      {/* GHOST TRIGGER HEADER */}
      <div className={styles.heading} onClick={() => setIsMobileOpen(!isMobileOpen)}>
        <span className={styles.desktopText}>{t("view.viewMode")}</span>
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
          <span className={styles.label}>{t("view.view3D")}</span>
        </button>
        
        <button 
          className={`${styles.row} ${activeView === '2D' ? styles.active : ''}`}
          onClick={() => handleToggle('2D')}
        >
          <div className={styles.indicator} />
          <span className={styles.label}>{t("view.view2D")}</span>
        </button>

      </div>
    </div>
  )
}