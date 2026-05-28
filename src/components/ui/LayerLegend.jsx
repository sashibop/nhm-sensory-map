import React from 'react'
import styles from './LayerLegend.module.css'

export default function LayerLegend() {
  return (
    <div className={styles.container}>
      <span className={styles.title}>Noise Level (dB)</span>
      <div className={styles.gradientBar} />
      <div className={styles.labels}>
        <span>35</span>
        <span>45</span>
        <span>55+</span>
      </div>
    </div>
  )
}