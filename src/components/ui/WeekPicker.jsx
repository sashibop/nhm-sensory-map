import useAppStore from '../../store/useAppStore'
import styles from './WeekPicker.module.css'

export default function WeekPicker() {
  const selectedDate = useAppStore((state) => state.selectedDate)
  const setSelectedDate = useAppStore((state) => state.setSelectedDate)
  
  const today = new Date()
  const week = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return date
  })

  return (
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
  )
}