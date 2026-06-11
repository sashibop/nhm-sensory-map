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

  const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); 
      callback();
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading} id="layer-panel-heading">
        Display Layers
      </div>
      
      <div 
        className={styles.list} 
        role="group" 
        aria-labelledby="layer-panel-heading"
      >
        {layerOptions.map((option) => (
          <div 
            key={option.id} 
            className={`${styles.row} ${layers[option.id] ? styles.active : ''}`} 
            
            role="switch"
            tabIndex={0}
            aria-checked={layers[option.id]}
            aria-label={`Toggle ${option.label} Layer`}
            
            onClick={() => toggleLayer(option.id)}
            onKeyDown={(e) => handleKeyDown(e, () => toggleLayer(option.id))}
          >
            <span className={styles.label}>{option.label}</span>
            <div className={styles.indicator} aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  )
}