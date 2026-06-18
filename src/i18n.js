import i18n from "i18next"
import { initReactI18next } from "react-i18next"

i18n
    .use(initReactI18next)
    .init({
        resources: {
            EN: {
                translation: {
                    ui: {
                        settings: "Settings",
                        language: "Language",
                        accessibility: "Accessibility",
                    },

                    view: {
                        viewMode: "View Mode",
                        view3D: "3D View",
                        view2D: "2D Plan",
                    },

                    controls: {
                        controls: "Controls",
                        orbit: "Orbit",
                        pan: "Pan",
                        zoom: "Zoom",
                        orbitControls: "Left-Click + Drag",
                        panControls: "Right-Click + Drag",
                        zoomControls: "Scroll",
                    },

                    accessibility: {
                        textSize: "Text Size",
                        cursorSize: "Cursor Size",
                        highContrast: "High Contrast",
                        plainLanguage: "Plain Language",
                    },

                    floors: {
                        switchFloors: "Switch Floors",
                        firstFloor: "1F",
                        secondFloor: "2F",
                    },

                    layers: {
                        displayLayers: "Display Layers",
                        crowd: "Crowd",
                        noise: "Noise",
                        brightness: "Brightness",
                        dimensions: "Dimensions",
                    },

                    system: {
                        predictionInfo:
                            "Predictive data visualization. Real-world conditions may vary.",
                    },

                    monthlyCalendar: {
                        open: "Open month overview",
                        monthlyEvents: {
                            4: "Archival Tour",
                            12: "School Group",
                            15: "Late Reading",
                            22: "Gala Prep",
                            28: "Closed (Maint.)",
                        },
                    },

                    timeline: {
                        live: "Live",
                        now: "Now",
                        trackingActive: "Live Tracking Active",
                        jumpToNow: "Jump to Now",
                    },

                    dailyAnnouncements: {
                        0: "Sunday Matinee: Archival readings in the Main Hall at 11:00.",
                        1: "Notice: The main wing is closed on Mondays for archival cataloging.",
                        2: "Attention: There is a school visit from the local Gymnasium (9:00 - 11:00).",
                        3: "Weekly deep-dive guided tour of the Bücherspeicher starting at 14:00.",
                        4: "Late opening hours until 21:00 for the special evening reading night.",
                        5: "Afternoon lecture series: 'Preserving Regional Literary History' at 15:00.",
                        6: "Weekend Workshop: Bookbinding basics taking place in Room 85.",
                        default: "Welcome to the library."
                    },

                    legend: {
                        dark: "Dark",
                        indoor: "Indoor",
                        bright: "Bright",
                        pax: "pax",
                    },


                    analytics: {
                        openPanel: "Open analytics",
                        closePanel: "Close analytics",
                        museumOverview: "Museum Overview",
                        allAreas: "All areas",
                        exhibitions: "{{count}} Exhibitions",
                        close: "Close",

                        charts: {
                            crowd: "Crowd Density",
                            noise: "Noise Level",
                            brightness: "Brightness",
                        },

                        units: {
                            visitors: "visitors",
                            db: "dB",
                            lux: "lux",
                        },

                        rooms: {
                            vivarium: "Climates and habitats – Vivarium",
                            africanNature: "African habitats",
                            atrium: "Atrium",
                            diorama: "Dioramas",
                            fossils: "Fossils found in southern Baden",
                            geology: "Geology on the Upper Rhine",
                            insects: "The world of insects",
                            minerals: "The realm of minerals",
                            nativeNature: "Native flora and fauna",
                            natureRoleModel: "Form and function – inspired by nature",
                            prehistoricTimes: "Life in prehistoric times",
                            rotary: "Rotary Room of Nature",
                            specialExhibition: "Special exhibition (small)",
                            specialExhibitionBig: "Special exhibition (big)",
                            default: "Exhibition",
                        },
                    },
                },
            },

            DE: {
                translation: {
                    ui: {
                        settings: "Einstellungen",
                        language: "Sprache",
                        accessibility: "Barrierefreiheit",
                    },

                    view: {
                        viewMode: "Ansichtsmodus",
                        view3D: "3D Ansicht",
                        view2D: "2D Plan",
                    },

                    controls: {
                        controls: "Steuerung",
                        orbit: "Orbit",
                        pan: "Verschieben",
                        zoom: "Zoom",
                        orbitControls: "Links-Klick + Ziehen",
                        panControls: "Rechts-Klick + Ziehen",
                        zoomControls: "Scrollen",
                    },

                    accessibility: {
                        textSize: "Textgröße",
                        cursorSize: "Cursorgröße",
                        highContrast: "Hoher Kontrast",
                        plainLanguage: "Einfache Sprache",
                    },

                    floors: {
                        switchFloors: "Stockwerk wechseln",
                        firstFloor: "EG",
                        secondFloor: "1. OG",
                    },

                    layers: {
                        displayLayers: "Overlays anzeigen",
                        crowd: "Besucher",
                        noise: "Geräusche",
                        brightness: "Helligkeit",
                        dimensions: "Maße",
                    },

                    system: {
                        predictionInfo:
                            "Prognosebasierte Datenvisualisierung. Die tatsächlichen Bedingungen können variieren.",
                    },

                    monthlyCalendar: {
                        open: "Monatsübersicht öffnen",
                        monthlyEvents: {
                            4: "Archivführung",
                            12: "Schulgruppe",
                            15: "Späte Lesung",
                            22: "Gala-Vorbereitung",
                            28: "Geschlossen (Wartung)",
                        },
                    },

                    timeline: {
                        live: "Live",
                        now: "Jetzt",
                        trackingActive: "Live-Tracking aktiv",
                        jumpToNow: "Zu Jetzt springen",
                    },

                    dailyAnnouncements: {
                        0: "Sonntagsmatinee: Archivlesungen in der Hauptbibliothek um 11:00 Uhr.",
                        1: "Hinweis: Der Hauptflügel ist montags für die Archivkatalogisierung geschlossen.",
                        2: "Achtung: Es findet ein Schulbesuch vom örtlichen Gymnasium statt (9:00 - 11:00 Uhr).",
                        3: "Wöchentliche, vertiefende Führung durch den Bücherspeicher ab 14:00 Uhr.",
                        4: "Lange Öffnungszeiten bis 21:00 Uhr für die besondere Abendlesung.",
                        5: "Nachmittagsvortragsreihe: 'Erhaltung regionaler Literaturgeschichte' um 15:00 Uhr.",
                        6: "Wochenend-Workshop: Grundlagen der Buchbinderei in Raum 85.",
                        default: "Willkommen in der Bibliothek."
                    },

                    legend: {
                        dark: "Dunkel",
                        indoor: "Innen",
                        bright: "Hell",
                        pax: "Pers.",
                    },

                    analytics: {
                        openPanel: "Analyse öffnen",
                        closePanel: "Analyse schließen",
                        museumOverview: "Museumsübersicht",
                        allAreas: "Alle Bereiche",
                        exhibitions: "{{count}} Ausstellungen",
                        close: "Schließen",

                        charts: {
                            crowd: "Besucherdichte",
                            noise: "Lärmpegel",
                            brightness: "Helligkeit",
                        },

                        units: {
                            visitors: "Besucher",
                            db: "dB",
                            lux: "lux",
                        },

                        rooms: {
                            vivarium: "Klimata und Lebensräume – Vivarium",
                            africanNature: "Afrikanische Lebensräume",
                            atrium: "Atrium",
                            diorama: "Dioramen",
                            fossils: "Fossilien aus dem südbadischen Raum",
                            geology: "Geologie am Oberrhein",
                            insects: "Die Welt der Insekten",
                            minerals: "Das Reich der Mineralien",
                            nativeNature: "Heimische Flora und Fauna",
                            natureRoleModel: "Form und Funktion – Vorbild Natur",
                            prehistoricTimes: "Leben in der Urzeit",
                            rotary: "Rotary-Naturkabinett",
                            specialExhibition: "Sonderausstellung (klein)",
                            specialExhibitionBig: "Sonderausstellung (groß)",
                            default: "Ausstellung",
                        },
                    },
                },
            },
        },

        lng: "EN",
        fallbackLng: "EN",

        interpolation: {
            escapeValue: false,
        },
    })

export default i18n

