import { useState, useEffect } from 'react'
import useAppStore from '../../store/useAppStore'
import styles from './styles/Announcements.module.css'
import { useTranslation } from "react-i18next"

export default function Announcements() {
  const selectedDate = useAppStore((state) => state.selectedDate)
  const dayOfWeek = selectedDate.getDay()

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false)
  const { t } = useTranslation()

  // Initial 3-second auto-collapse
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCollapsed(true)
      setHasAutoCollapsed(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleMouseLeave = () => { if (hasAutoCollapsed) setIsCollapsed(true) }
  const handleToggle = () => { if (hasAutoCollapsed) setIsCollapsed(!isCollapsed) }

  const dailyAnnouncements = {
    0: t('dailyAnnouncements.0'),
    1: t('dailyAnnouncements.1'),
    2: t('dailyAnnouncements.2'),
    3: t('dailyAnnouncements.3'),
    4: t('dailyAnnouncements.4'),
    5: t('dailyAnnouncements.5'),
    6: t('dailyAnnouncements.6')
  }

  const currentAnnouncement = dailyAnnouncements[dayOfWeek] || t('dailyAnnouncements.default')

  return (
    // 1. Invisible spacer that reserves the slot in the WeekPicker row
    <div className={styles.wrapper}>
      
      {/* 2. The dynamically expanding spatial plate */}
      <div 
        className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}
        onMouseLeave={handleMouseLeave}
        onClick={handleToggle}
      >
        <div className={styles.iconWrapper}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        
        <div className={styles.content}>
          <span className={styles.text}>{currentAnnouncement}</span>
        </div>
      </div>

    </div>
  )
}