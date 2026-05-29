import useAppStore from '../../store/useAppStore'
import styles from './styles/FloorSelector.module.css'

export default function FloorSelector() {
  const activeFloor = useAppStore((state) => state.activeFloor)
  const setActiveFloor = useAppStore((state) => state.setActiveFloor)

  return (
    <div className={styles.container}>
      <div className={styles.heading}>Switch Floors</div>
      <div className={styles.list}>
        <button 
          className={`${styles.row} ${activeFloor === 2 ? styles.active : ''}`}
          onClick={() => setActiveFloor(2)}
        >
          <div className={styles.indicator} />
          <span className={styles.label}>2F / 1. OG</span>
        </button>
        
        <button 
          className={`${styles.row} ${activeFloor === 1 ? styles.active : ''}`}
          onClick={() => setActiveFloor(1)}
        >
          <div className={styles.indicator} />
          <span className={styles.label}>1F / EG</span>
        </button>
      </div>
    </div>
  )
}