import useAppStore from '../../store/useAppStore'
import styles from './styles/LayerPanel.module.css'
import { useTranslation } from "react-i18next"

export default function LayerPanel() {
  const layers = useAppStore((state) => state.layers)
  const toggleLayer = useAppStore((state) => state.toggleLayer)
  const { t } = useTranslation()

  const layerOptions = [
    { id: 'crowd', label: t("layers.crowd") },
    { id: 'noise', label: t("layers.noise") },
    { id: 'brightness', label: t("layers.brightness") },
    { id: 'dimensions', label: t("layers.dimensions") },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.heading}>{t("layers.displayLayers")}</div>
      
      <div className={styles.list}>
        {layerOptions.map((option) => (
          <div 
            key={option.id} 
            className={`${styles.row} ${layers[option.id] ? styles.active : ''}`} 
            aria-selected={layers[option.id]}
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