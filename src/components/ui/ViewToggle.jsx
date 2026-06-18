import { useState } from 'react'
import { Eye, Box, Map } from 'lucide-react'
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

  // Map the View options
  const viewOptions = [
    { id: '3D', label: '3D View', icon: Box },
    { id: '2D', label: '2D Plan', icon: Map },
  ]

  return (
    <div className={styles.container}>
      
      {/* GHOST TRIGGER HEADER */}
      <div className={styles.heading} onClick={() => setIsMobileOpen(!isMobileOpen)}>
        <span className={styles.desktopText}>{t("view.viewMode")}</span>
        {/* Swapped hardcoded SVG for Lucide Eye */}
        <Eye className={styles.mobileIcon} size={20} strokeWidth={2} />
      </div>

      {/* EXPANDING LIST */}
      <div className={`${styles.list} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        
        {viewOptions.map((option) => {
          const IconComponent = option.icon;

          return (
            <button 
              key={option.id}
              className={`${styles.row} ${activeView === option.id ? styles.active : ''}`}
              onClick={() => handleToggle(option.id)}
            >
              <div className={styles.indicator} aria-hidden="true" />

              <div className={styles.iconWrapper} aria-hidden="true">
                <IconComponent size={14} strokeWidth={1.5} />
              </div>

              <span className={styles.label}>{option.label}</span>
              
            </button>
          )
        })}

      </div>
    </div>
  )
}