import React from 'react'
import styles from './styles/Disclaimer.module.css'

export default function Disclaimer() {
  return (
    <div 
      className={styles.container}
      role="note" 
      aria-label="Data accuracy disclaimer"
    >
      Predictive data visualization. Real-world conditions may vary.
    </div>
  )
}