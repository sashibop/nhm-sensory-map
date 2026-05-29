import useAppStore from '../../store/useAppStore'
import styles from './styles/LayerPanel.module.css'

export default function LayerPanel() {
  const layers = useAppStore((state) => state.layers)
  const toggleLayer = useAppStore((state) => state.toggleLayer)

  const layerOptions = [
    { id: 'crowd', label: 'Crowd' },
    { id: 'noise', label: 'Noise' },
    { id: 'brightness', label: 'Brightness' },
    { id: 'dimensions', label: 'Dimensions' },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.heading}>Display Layers</div>
      
      <div className={styles.list}>
        {layerOptions.map((option) => (
          <div 
            key={option.id} 
            className={`${styles.row} ${layers[option.id] ? styles.active : ''}`} 
            onClick={() => toggleLayer(option.id)}
          >
            <span className={styles.label}>{option.label}</span>
            <div className={styles.indicator} />
          </div>
        ))}
      </div>
    </div>
  )
}