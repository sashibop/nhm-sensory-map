import React from 'react'
import { Info } from 'lucide-react'
import styles from './styles/Disclaimer.module.css'
import { useTranslation } from "react-i18next"

export default function Disclaimer() {
  const { t } = useTranslation()
  return (
    <div 
      className={styles.container}
      role="note" 
      aria-label="Data accuracy disclaimer"
    >
      <Info size={12} strokeWidth={2} />
      <span>{t("system.predictionInfo")}</span>
    </div>
  )
}