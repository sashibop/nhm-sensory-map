import useAppStore from '../../store/useAppStore'
import styles from './FloorSelector.module.css'

export default function FloorSelector() {
  const activeFloor = useAppStore((state) => state.activeFloor)
  const setActiveFloor = useAppStore((state) => state.setActiveFloor)

  return (
    <div className={styles.container}>
      {/* 1. OG is listed first so it renders on top */}
      <button 
        className={`${styles.floorBtn} ${activeFloor === 2 ? styles.active : ''}`}
        onClick={() => setActiveFloor(2)}
        title="1. Obergeschoss"
      >
        2F
      </button>
      
      {/* EG is listed second so it renders on the bottom */}
      <button 
        className={`${styles.floorBtn} ${activeFloor === 1 ? styles.active : ''}`}
        onClick={() => setActiveFloor(1)}
        title="Erdgeschoss"
      >
        1F
      </button>
    </div>
  )
}