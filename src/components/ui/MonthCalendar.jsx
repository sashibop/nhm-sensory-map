import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import useAppStore from '../../store/useAppStore'
import styles from './MonthCalendar.module.css'

export default function MonthCalendar() {
  const [isOpen, setIsOpen] = useState(false)
  const selectedDate = useAppStore((state) => state.selectedDate)
  const setSelectedDate = useAppStore((state) => state.setSelectedDate)
  const [viewDate, setViewDate] = useState(new Date())

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setViewDate(new Date(selectedDate)) 
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen, selectedDate])

  // --- CALENDAR MATH ---
  const today = new Date()
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  const currentMonth = viewDate.getMonth()
  const currentYear = viewDate.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 
  
  const blankDays = Array.from({ length: startOffset }, (_, i) => `blank-${i}`)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const monthlyEvents = {
    4: "Archival Tour",
    12: "School Group",
    15: "Late Reading",
    22: "Gala Prep",
    28: "Closed (Maint.)"
  }

  const handleDateClick = (day) => {
    const newDate = new Date(currentYear, currentMonth, day)
    if (newDate >= todayDateOnly) {
      setSelectedDate(newDate)
      setIsOpen(false) 
    }
  }

  const handlePrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1))
  const handleNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1))

  // --- EXTRACT MONTH AND YEAR FOR VERTICAL STACKING ---
  const displayMonth = selectedDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() // e.g. "MAY"
  const displayYear = selectedDate.getFullYear() // e.g. "2026"

  return (
    <div className={styles.container}>
      {/* 1. THE VERTICAL TRIGGER BUTTON */}
      <button 
        className={`${styles.triggerBtn} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open month overview"
      >
        <div className={styles.btnTextWrapper}>
          <span className={styles.btnMonth}>{displayMonth}</span>
          <span className={styles.btnYear}>{displayYear}</span>
        </div>
        
        {/* Subtle, smaller Chevron Down */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.chevron}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* 2. THE FULLSCREEN MODAL (Portal) ... (keep exactly as is) */}

      {isOpen && createPortal(
        <div className={styles.portalWrapper}>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.modal}>
            
            <div className={styles.header}>
              {/* NEW: Month Navigation Controls */}
              <div className={styles.monthNav}>
                <button onClick={handlePrevMonth} className={styles.navBtn}>←</button>
                <div className={styles.monthTitle}>
                  {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={handleNextMonth} className={styles.navBtn}>→</button>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>×</button>
            </div>
            
            <div className={styles.grid}>
              {weekDays.map(day => <div key={day} className={styles.weekdayHeader}>{day}</div>)}
              {blankDays.map(key => <div key={key} className={styles.blankCell} />)}
              {days.map((day) => {
                const dateObj = new Date(currentYear, currentMonth, day)
                const isPast = dateObj < todayDateOnly
                const isToday = dateObj.getTime() === todayDateOnly.getTime()
                const isSelected = dateObj.toDateString() === selectedDate.toDateString()
                // Check if the current view is the current month before assigning static mock events
                const isCurrentMonthRealTime = currentMonth === today.getMonth() && currentYear === today.getFullYear()
                const eventText = isCurrentMonthRealTime ? monthlyEvents[day] : null

                return (
                  <button
                    key={day}
                    disabled={isPast}
                    onClick={() => handleDateClick(day)}
                    className={`
                      ${styles.dayCell} 
                      ${isSelected ? styles.selected : ''} 
                      ${isToday ? styles.today : ''} 
                      ${isPast ? styles.past : ''}
                      ${eventText ? styles.hasEvent : ''}
                    `}
                  >
                    <span className={styles.dayNumber}>{day}</span>
                    {/* Fixed: Event renders even if it is in the past */}
                    {eventText && <span className={styles.eventLabel}>{eventText}</span>}
                  </button>
                )
              })}
            </div>
            
            {/* NEW: The Predictive Disclaimer */}
            <div className={styles.disclaimer}>
              <span className={styles.disclaimerIcon}>ℹ</span>
              Crowd level predictions are based on historical data and ticket sales. Accuracy may vary for dates beyond 30 days.
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  )
}