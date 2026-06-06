import React from 'react'
import styles from './styles/Disclaimer.module.css'
import { useTranslation } from "react-i18next"

export default function Disclaimer() {
  const { t } = useTranslation()
  return (
    <div className={styles.container}>
      {t("system.predictionInfo")}
    </div>
  )
}