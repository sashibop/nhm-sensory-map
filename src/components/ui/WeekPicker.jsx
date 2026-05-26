import useAppStore from '../../store/useAppStore'
import Announcements from './Announcements'
import MonthCalendar from './MonthCalendar'
import styles from './WeekPicker.module.css'

export default function WeekPicker() {
  const selectedDate = useAppStore((state) => state.selectedDate)
  const setSelectedDate = useAppStore((state) => state.setSelectedDate)
  
  // --- THE SYNC LOGIC ---
  // Find the Monday of whatever week the selectedDate belongs to
  const getStartOfWeek = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    // Shift so Monday is the start of the week (if Sunday (0), go back 6 days)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) 
    return new Date(d.setDate(diff))
  }

  const startOfWeek = getStartOfWeek(selectedDate)
  
  // Generate the 7 days based on that calculated Monday
  const week = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  return (
    <div className={styles.wrapper}>
      <Announcements />
      <MonthCalendar />

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
    </div>
  )
}