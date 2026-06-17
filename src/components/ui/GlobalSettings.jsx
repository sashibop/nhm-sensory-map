import { useState } from 'react'
import { 
  Mouse, Globe, Accessibility, 
  Rotate3D, Move, ZoomIn, 
  Languages, Type, MousePointer2, 
  Contrast, BookOpen, Volume2 
} from 'lucide-react'
import styles from './styles/GlobalSettings.module.css'
import useAppStore from '../../store/useAppStore'
import A11yAssistant from './A11yAssistant'

export default function GlobalSettings() {
  const activeView = useAppStore((state) => state.activeView)

  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeSetting, setActiveSetting] = useState(null)

  // Data States
  const [activeLang, setActiveLang] = useState('EN')
  const [highContrast, setHighContrast] = useState(false)
  const [plainLang, setPlainLang] = useState(false)
  const [textSize, setTextSize] = useState(100)
  const [cursorSize, setCursorSize] = useState(100)

  const textProgress = ((textSize - 50) / 100) * 100;
  const cursorProgress = ((cursorSize - 50) / 100) * 100;

  const settingsOptions = [
    ...(activeView === '3D' ? [{ id: 'help', label: 'Controls', icon: Mouse }] : []),
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  ]

  const togglePanel = (id) => {
    setActiveSetting(activeSetting === id ? null : id)
  }

  const handleHeaderClick = () => {
    setIsMobileOpen(!isMobileOpen)
    if (activeSetting) setActiveSetting(null)
  }

  const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  }

  return (
    <div className={styles.container}>

      <button
        className={styles.heading}
        onClick={handleHeaderClick}
        aria-expanded={isMobileOpen}
        aria-label="Toggle Global Settings"
        style={{ background: 'none', border: 'none', padding: 0, font: 'inherit' }}
      >
        <span className={styles.heading}>Settings</span>
        <svg aria-hidden="true" className={styles.mobileIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      <div className={`${styles.list} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        {settingsOptions.map((option) => {
          const IconComponent = option.icon;

          return (
            <div key={option.id} className={styles.wrapper}>

              <div
                className={`${styles.row} ${activeSetting === option.id ? styles.active : ''}`}
                role="button"
                tabIndex={0}
                aria-expanded={activeSetting === option.id}
                onClick={() => togglePanel(option.id)}
                onKeyDown={(e) => handleKeyDown(e, () => togglePanel(option.id))}
              >
                <div className={styles.iconWrapper} aria-hidden="true">
                  <IconComponent size={14} strokeWidth={1.5} />
                </div>

                <span className={styles.label}>{option.label}</span>

                <div className={styles.indicator} aria-hidden="true" />
              </div>

              {/* --- GHOST SUB-PANELS --- */}
              <div className={`${styles.subContent} ${activeSetting === option.id ? styles.expanded : ''}`}>

                {/* 1. CONTROLS */}
                {option.id === 'help' && (
                  <div className={styles.subGroup} aria-label="Control instructions">
                    <div className={styles.infoRow}>
                      <div className={styles.subHeaderFlex}>
                        <div className={styles.iconWrapper}><Rotate3D size={12} strokeWidth={1.5} /></div>
                        <span className={styles.subLabel}>Left-Click + Drag</span>
                      </div>
                      <span className={styles.value}>Orbit</span>
                    </div>
                    <div className={styles.infoRow}>
                      <div className={styles.subHeaderFlex}>
                        <div className={styles.iconWrapper}><Move size={12} strokeWidth={1.5} /></div>
                        <span className={styles.subLabel}>Right-Click + Drag</span>
                      </div>
                      <span className={styles.value}>Pan</span>
                    </div>
                    <div className={styles.infoRow}>
                      <div className={styles.subHeaderFlex}>
                        <div className={styles.iconWrapper}><ZoomIn size={12} strokeWidth={1.5} /></div>
                        <span className={styles.subLabel}>Scroll</span>
                      </div>
                      <span className={styles.value}>Zoom</span>
                    </div>
                  </div>
                )}

                {/* 2. LANGUAGE */}
                {option.id === 'language' && (
                  <div className={styles.subGroup} role="radiogroup" aria-label="Select Language">
                    {['DE', 'EN'].map(lang => (
                      <div
                        key={lang}
                        className={`${styles.subRow} ${activeLang === lang ? styles.subActive : ''}`}
                        role="radio"
                        aria-checked={activeLang === lang}
                        tabIndex={0}
                        onClick={() => setActiveLang(lang)}
                        onKeyDown={(e) => handleKeyDown(e, () => setActiveLang(lang))}
                      >
                        <div className={styles.iconWrapper} aria-hidden="true">
                          <Languages size={12} strokeWidth={1.5} />
                        </div>
                        <span className={styles.subLabel}>{lang}</span>
                        <div className={styles.subIndicator} aria-hidden="true" />
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. ACCESSIBILITY */}
                {option.id === 'accessibility' && (
                  <div className={styles.subGroup}>

                    <div
                      className={`${styles.subRow} ${highContrast ? styles.subActive : ''}`}
                      role="switch"
                      aria-checked={highContrast}
                      tabIndex={0}
                      onClick={() => setHighContrast(!highContrast)}
                      onKeyDown={(e) => handleKeyDown(e, () => setHighContrast(!highContrast))}
                    >
                      <div className={styles.iconWrapper} aria-hidden="true"><Contrast size={12} strokeWidth={1.5} /></div>
                      <span className={styles.subLabel}>High Contrast</span>
                      <div className={styles.subIndicator} aria-hidden="true" />
                    </div>

                    <div className={styles.sliderRow}>
                      <div className={styles.subHeaderFlex}>
                        <div className={styles.iconWrapper}><Type size={12} strokeWidth={1.5} /></div>
                        <span className={styles.subLabel} aria-hidden="true">Text Size</span>
                      </div>
                      <input
                        type="range"
                        className={styles.ghostSlider}
                        aria-label="Adjust Text Size"
                        style={{ '--progress': `${textProgress}%` }}
                        min="50" max="150" step="1" value={textSize}
                        onChange={(e) => setTextSize(e.target.value)}
                      />
                    </div>

                    <div className={styles.sliderRow} style={{ marginTop: '4px', alignItems: 'flex-end' }}>
                      <div className={styles.subHeaderFlex} style={{ marginBottom: '4px' }}>
                        <div className={styles.iconWrapper}><Volume2 size={12} strokeWidth={1.5} /></div>
                        <span className={styles.subLabel}>Screen Reader</span>
                      </div>
                      <A11yAssistant />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}