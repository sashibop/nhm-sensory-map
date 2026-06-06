import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import useAppStore from '../../store/useAppStore'
import styles from './styles/MonthCalendar.module.css'
import { useTranslation } from "react-i18next"

export default function MonthCalendar() {
  const [isOpen, setIsOpen] = useState(false)
  const selectedDate = useAppStore((state) => state.selectedDate)
  const setSelectedDate = useAppStore((state) => state.setSelectedDate)
  const [viewDate, setViewDate] = useState(new Date())
  const { t, i18n } = useTranslation()

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
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(2024, 0, i + 1)
    return new Intl.DateTimeFormat(i18n.language, {
      weekday: "short",
    }).format(date)
  })

  const monthlyEvents = {
    4: t("monthlyCalendar.monthlyEvents.4"),
    12: t("monthlyCalendar.monthlyEvents.12"),
    15: t("monthlyCalendar.monthlyEvents.15"),
    22: t("monthlyCalendar.monthlyEvents.22"),
    28: t("monthlyCalendar.monthlyEvents.28")
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
  const displayMonth = new Intl.DateTimeFormat(i18n.language, {
    month: "short",
  }).format(selectedDate).toUpperCase() // e.g. "MAY"
  const displayYear = selectedDate.getFullYear() // e.g. "2026"

  return (
    <div className={styles.container}>
      {/* 1. Refined GHOST ACTION PILL (Trigger Button) */}
      {/* 1. GHOST TYPOGRAPHIC TRIGGER */}
      <button
        className={`${styles.triggerBtn} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label={t('monthlyCalendar.open')}
      >
        <span className={styles.btnMonth}>{displayMonth}</span>
        <svg className={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* 2. THE SPATIAL MODAL PORTAL */}
      {isOpen && createPortal(
        <div className={styles.portalWrapper}>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.modal}>

            <div className={styles.header}>
              <div className={styles.monthNav}>
                <button onClick={handlePrevMonth} className={styles.navBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <div className={styles.monthTitle}>
                  {viewDate.toLocaleDateString(i18n.language, {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <button onClick={handleNextMonth} className={styles.navBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
              <span className={styles.disclaimerIcon}>ℹ</span>
              {t("system.predictionInfo")}
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  )
}