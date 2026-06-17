import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X, Info } from 'lucide-react'
import useAppStore from '../../store/useAppStore'
import styles from './styles/MonthCalendar.module.css'

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
      
      {/* 1. GHOST TYPOGRAPHIC TRIGGER (Icon -> Label -> Chevron) */}
      <button 
        className={`${styles.triggerBtn} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open month overview"
      >
        <div className={styles.iconWrapper} aria-hidden="true">
          <CalendarDays size={16} strokeWidth={1.5} />
        </div>
        
        <span className={styles.btnMonth}>{displayMonth}</span>
        
        <ChevronDown className={styles.chevron} size={14} strokeWidth={2} />
      </button>

      {/* 2. THE SPATIAL MODAL PORTAL */}
      {isOpen && createPortal(
        <div className={styles.portalWrapper}>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.modal}>
            
            <div className={styles.header}>
              <div className={styles.monthNav}>
                <button onClick={handlePrevMonth} className={styles.navBtn}>
                  <ChevronLeft size={20} strokeWidth={2} />
                </button>
                <div className={styles.monthTitle}>
                  {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={handleNextMonth} className={styles.navBtn}>
                  <ChevronRight size={20} strokeWidth={2} />
                </button>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                 <X size={20} strokeWidth={2} />
              </button>
            </div>
            
            <div className={styles.grid}>
              {weekDays.map(day => <div key={day} className={styles.weekdayHeader}>{day}</div>)}
              {blankDays.map(key => <div key={key} className={styles.blankCell} />)}
              {days.map((day) => {
                const dateObj = new Date(currentYear, currentMonth, day)
                const isPast = dateObj < todayDateOnly
                const isToday = dateObj.getTime() === todayDateOnly.getTime()
                const isSelected = dateObj.toDateString() === selectedDate.toDateString()
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
                    `}
                  >
                    <span className={styles.dayNumber}>{day}</span>
                    
                    {/* Ghost UI Micro-Dot for Events */}
                    {eventText && (
                      <div className={styles.eventIndicator}>
                        <div className={styles.eventDot} />
                        <span className={styles.eventLabel}>{eventText}</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            
            <div className={styles.disclaimer}>
              <Info size={12} strokeWidth={2} className={styles.disclaimerIcon} />
              <span>Predictive data visualization. Real-world conditions may vary.</span>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  )
}