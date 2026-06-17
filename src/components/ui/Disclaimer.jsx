import React from 'react'
import { Info } from 'lucide-react'
import styles from './styles/Disclaimer.module.css'

export default function Disclaimer() {
  return (
    <div 
      className={styles.container}
      role="note" 
      aria-label="Data accuracy disclaimer"
    >
      <Info size={12} strokeWidth={2} />
      <span>Predictive data visualization. Real-world conditions may vary.</span>
    </div>
  )
}