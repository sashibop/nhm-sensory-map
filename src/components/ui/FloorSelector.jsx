import useAppStore from '../../store/useAppStore'
import styles from './styles/FloorSelector.module.css'
import { useTranslation } from "react-i18next"

export default function FloorSelector() {
  const activeFloor = useAppStore((state) => state.activeFloor)
  const setActiveFloor = useAppStore((state) => state.setActiveFloor)
  const { t } = useTranslation()

  return (
    <div className={styles.container}>
      <div className={styles.heading}>{t("floors.switchFloors")}</div>
      <div className={styles.list}>
        <button 
          className={`${styles.row} ${activeFloor === 2 ? styles.active : ''}`}
          onClick={() => setActiveFloor(2)}
        >
          <div className={styles.indicator} />
          <span className={styles.label}>{t("floors.secondFloor")}</span>
        </button>
        
        <button 
          className={`${styles.row} ${activeFloor === 1 ? styles.active : ''}`}
          onClick={() => setActiveFloor(1)}
        >
          <div className={styles.indicator} />
          <span className={styles.label}>{t("floors.firstFloor")}</span>
        </button>
      </div>
    </div>
  )
}