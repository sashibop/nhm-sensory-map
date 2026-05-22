import useAppStore from '../../store/useAppStore'
import styles from './LayerPanel.module.css'

export default function LayerPanel() {
  const layers = useAppStore((state) => state.layers)
  const toggleLayer = useAppStore((state) => state.toggleLayer)

  const layerOptions = [
    { id: 'crowd', label: 'Crowd Level' },
    { id: 'noise', label: 'Noise Level' },
    { id: 'brightness', label: 'Brightness' },
    { id: 'dimensions', label: 'Dimensions' },
  ]

  return (
    <div className={styles.container}>
      <h3 style={{margin: '0 0 8px 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase'}}>Display Layers</h3>
      {layerOptions.map((option) => (
        // Wrapping the whole row in a div with onClick makes it user-friendly
        <div key={option.id} className={styles.row} onClick={() => toggleLayer(option.id)}>
          <span>{option.label}</span>
          
          {/* The visual toggle switch */}
          <div className={`${styles.switch} ${layers[option.id] ? styles.active : ''}`}>
            <div className={styles.thumb} />
          </div>
          
        </div>
      ))}
    </div>
  )
}