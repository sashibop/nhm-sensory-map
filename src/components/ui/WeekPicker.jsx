import useAppStore from '../../store/useAppStore'
import Announcements from './Announcements'
import MonthCalendar from './MonthCalendar'
import styles from './WeekPicker.module.css'

export default function WeekPicker() {
  const selectedDate = useAppStore((state) => state.selectedDate)
  const setSelectedDate = useAppStore((state) => state.setSelectedDate)
  
  const getStartOfWeek = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) 
    return new Date(d.setDate(diff))
  }

  const startOfWeek = getStartOfWeek(selectedDate)
  
  const week = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  return (
    <div className={styles.wrapper}>
      {/* 1. The Month Breadcrumb Trigger */}
      <MonthCalendar />
      
      {/* Structural Divider */}
      <div className={styles.divider} />

      {/* 2. The Days of the Week */}
      <div className={styles.container}>
        {week.map((date, index) => {
          const isSelected = date.toDateString() === selectedDate.toDateString()
          return (
            <button
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`${styles.dayButton} ${isSelected ? styles.selected : ''}`}
            >
              <span className={styles.weekday}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className={styles.date}>
                {date.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      {/* Structural Divider */}
      <div className={styles.divider} />

      {/* 3. The Announcements (Moved to Right) */}
      <Announcements />
    </div>
  )
}