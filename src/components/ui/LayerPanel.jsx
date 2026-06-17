import useAppStore from '../../store/useAppStore'
import { Users, AudioWaveform, Sun, Ruler } from 'lucide-react'
import styles from './styles/LayerPanel.module.css'

export default function LayerPanel() {
  const layers = useAppStore((state) => state.layers)
  const toggleLayer = useAppStore((state) => state.toggleLayer)

  // 1. Map the Lucide components directly to your layer options
  const layerOptions = [
    { id: 'crowd', label: 'Crowd', icon: Users },
    { id: 'noise', label: 'Noise', icon: AudioWaveform },
    { id: 'brightness', label: 'Brightness', icon: Sun },
    { id: 'dimensions', label: 'Dimensions', icon: Ruler },
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
        {layerOptions.map((option) => {
          // Extract the icon for rendering
          const IconComponent = option.icon;

          return (
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
              {/* 2. Inject the Icon Wrapper before the label */}
              <div className={styles.iconWrapper} aria-hidden="true">
                <IconComponent size={14} strokeWidth={1.5} />
              </div>

              <span className={styles.label}>{option.label}</span>
              <div className={styles.indicator} aria-hidden="true" />
            </div>
          )
        })}
      </div>
    </div>
  )
}