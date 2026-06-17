import useAppStore from '../../store/useAppStore'
import { ArrowUp, ArrowDown } from 'lucide-react'
import styles from './styles/FloorSelector.module.css'

export default function FloorSelector() {
  const activeFloor = useAppStore((state) => state.activeFloor)
  const setActiveFloor = useAppStore((state) => state.setActiveFloor)

  // Map the floor options with directional icons
  const floorOptions = [
    { id: 2, label: '2F', icon: ArrowUp },
    { id: 1, label: '1F', icon: ArrowDown },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.heading}>Switch Floors</div>
      <div className={styles.list}>
        
        {floorOptions.map((option) => {
          const IconComponent = option.icon;

          return (
            <button 
              key={option.id}
              className={`${styles.row} ${activeFloor === option.id ? styles.active : ''}`}
              onClick={() => setActiveFloor(option.id)}
            >
              <div className={styles.indicator} aria-hidden="true" />

              <div className={styles.iconWrapper} aria-hidden="true">
                <IconComponent size={14} strokeWidth={1.5} />
              </div>
              
              <span className={styles.label}>{option.label}</span>
             
            </button>
          )
        })}

      </div>
    </div>
  )
}