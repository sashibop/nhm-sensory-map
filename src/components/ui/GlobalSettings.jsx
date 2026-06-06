import { useState } from 'react'
import styles from './styles/GlobalSettings.module.css'
import useAppStore from '../../store/useAppStore'
import { useTranslation } from "react-i18next"
import i18n from "../../i18n"

export default function GlobalSettings() {
  // Pull the current view state ('3D' or '2D')
  const activeView = useAppStore((state) => state.activeView)

  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeSetting, setActiveSetting] = useState(null)
  const { t } = useTranslation()

  // Data States
  //const [activeLang, setActiveLang] = useState('EN')
  //const [highContrast, setHighContrast] = useState(false)
  const [plainLang, setPlainLang] = useState(false)
  //const [textSize, setTextSize] = useState(100)
  //const [cursorSize, setCursorSize] = useState(100)
  const settings = useAppStore((state) => state.settings)
  const setLanguage = useAppStore((state) => state.setLanguage)
  const toggleHighContrast = useAppStore((state) => state.toggleHighContrast)
  const setTextSize = useAppStore((state) => state.setTextSize)
  const setCursorSize = useAppStore((state) => state.setCursorSize)

  const textProgress = ((settings.textSize - 50) / 100) * 100;
  const cursorProgress = ((settings.cursorSize - 50) / 100) * 100;

  const settingsOptions = [
    ...(activeView === '3D' ? [{ id: 'help', label: t("controls.controls") }] : []),
    { id: 'language', label: t("ui.language") },
    { id: 'accessibility', label: t("ui.accessibility") },
  ]

  const togglePanel = (id) => {
    setActiveSetting(activeSetting === id ? null : id)
  }

  const handleHeaderClick = () => {
    setIsMobileOpen(!isMobileOpen)
    if (activeSetting) setActiveSetting(null)
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  return (
    <div className={styles.container}>

      {/* GHOST TRIGGER HEADER */}
      <div className={styles.heading} onClick={handleHeaderClick}>
        <span className={styles.desktopText}>{t("ui.settings")}</span>
        <svg className={styles.mobileIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </div>

      <div className={`${styles.list} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        {settingsOptions.map((option) => (
          <div key={option.id} className={styles.wrapper}>

            {/* --- MAIN MENU ROW --- */}
            <div
              className={`${styles.row} ${activeSetting === option.id ? styles.active : ''}`}
              onClick={() => togglePanel(option.id)}
            >
              <span className={styles.label}>{option.label}</span>
              <div className={styles.indicator} />
            </div>

            {/* --- GHOST SUB-PANELS --- */}
            <div className={`${styles.subContent} ${activeSetting === option.id ? styles.expanded : ''}`}>

              {/* 1. CONTROLS (THE FIX: Added the conditional wrapper back) */}
              {option.id === 'help' && (
                <div className={styles.subGroup}>
                  <div className={styles.infoRow}>
                    <span className={styles.subLabel}>{t("controls.orbitControls")}</span>
                    <span className={styles.value}>{t("controls.orbit")}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.subLabel}>{t("controls.panControls")}</span>
                    <span className={styles.value}>{t("controls.pan")}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.subLabel}>{t("controls.zoomControls")}</span>
                    <span className={styles.value}>{t("controls.zoom")}</span>
                  </div>
                </div>
              )}

              {/* 2. LANGUAGE */}
              {option.id === 'language' && (
                <div className={styles.subGroup}>
                  {['DE', 'EN'].map(lang => (
                    <div
                      key={lang}
                      className={`${styles.subRow} ${settings.language === lang ? styles.subActive : ''}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      <span className={styles.subLabel}>{lang}</span>
                      <div className={styles.subIndicator} />
                    </div>
                  ))}
                </div>
              )}

              {/* 3. ACCESSIBILITY */}
              {option.id === 'accessibility' && (
                <div className={styles.subGroup}>

                  <div className={styles.sliderRow}>
                    <span className={styles.subLabel}>{t("accessibility.textSize")}</span>
                    <input
                      type="range" className={styles.ghostSlider} style={{ '--progress': `${textProgress}%` }}
                      min="50" max="150" step="1" value={settings.textSize} onChange={(e) => setTextSize(Number(e.target.value))}
                    />
                  </div>

                  <div className={styles.sliderRow}>
                    <span className={styles.subLabel}>{t("accessibility.cursorSize")}</span>
                    <input
                      type="range" className={styles.ghostSlider} style={{ '--progress': `${cursorProgress}%` }}
                      min="50" max="150" step="1" value={settings.cursorSize} onChange={(e) => setCursorSize(Number(e.target.value))}
                    />
                  </div>

                  <div className={`${styles.subRow} ${settings.highContrast ? styles.subActive : ''}`} onClick={() => toggleHighContrast()}>
                    <span className={styles.subLabel}>{t("accessibility.highContrast")}</span>
                    <div className={styles.subIndicator} />
                  </div>

                  <div className={`${styles.subRow} ${plainLang ? styles.subActive : ''}`} onClick={() => setPlainLang(!plainLang)}>
                    <span className={styles.subLabel}>{t("accessibility.plainLanguage")}</span>
                    <div className={styles.subIndicator} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}