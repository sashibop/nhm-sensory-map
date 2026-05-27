import { useState, useEffect } from 'react'
import useAppStore from '../../store/useAppStore'
import styles from './Announcements.module.css'

export default function Announcements() {
  const selectedDate = useAppStore((state) => state.selectedDate)
  const dayOfWeek = selectedDate.getDay()

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCollapsed(true)
      setHasAutoCollapsed(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Desktop Hover Handlers
  const handleMouseLeave = () => { if (hasAutoCollapsed) setIsCollapsed(true) }

  // NEW: Mobile Tap Handler
  const handleToggle = () => { if (hasAutoCollapsed) setIsCollapsed(!isCollapsed) }

  const dailyAnnouncements = {
    0: "Sunday Matinee: Archival readings in the Main Hall at 11:00.",
    1: "Notice: The main wing is closed on Mondays for archival cataloging.",
    2: "Attention: There is a school visit from the local Gymnasium (9:00 - 11:00).",
    3: "Weekly deep-dive guided tour of the Bücherspeicher starting at 14:00.",
    4: "Late opening hours until 21:00 for the special evening reading night.",
    5: "Afternoon lecture series: 'Preserving Regional Literary History' at 15:00.",
    6: "Weekend Workshop: Bookbinding basics taking place in Room 85."
  }

  const currentAnnouncement = dailyAnnouncements[dayOfWeek] || "Welcome to the library."

  return (
    <div 
      className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}
      onMouseLeave={handleMouseLeave}
      onClick={handleToggle} /* <-- ADDED TOUCH SUPPORT HERE */
    >
      <div className={styles.iconWrapper}>
        <svg className={styles.icon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      
      <div className={styles.content}>
        <span className={styles.text}>{currentAnnouncement}</span>
      </div>
    </div>
  )
}