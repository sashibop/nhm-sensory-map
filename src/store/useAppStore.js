import { create } from 'zustand'

const useAppStore = create((set, get) => ({
  // --- STATE ---
  selectedDate: new Date(),
  timeOfDay: 9.0,
  isPlaying: false,
  isLiveMode: false,
  activeFloor: 1,
  activeView: '3D',
  settings: {
    language: "EN",
    highContrast: false,
    textSize: 100,
    cursorSize: 100,
  },
  selectedIcon: null,

  // Multi-select rooms
  selectedRooms: new Set(),

  toggleSelectedRoom: (key) =>
    set((state) => {
      const next = new Set(state.selectedRooms);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return { selectedRooms: next };
    }),

  clearSelectedRooms: () => set({ selectedRooms: new Set() }),

  // Hover sync (chart line ↔ map icon)
  hoveredMapIcon: null,
  setHoveredMapIcon: (key) => set({ hoveredMapIcon: key }),

  setSelectedIcon: (id) => set({ selectedIcon: id }),
  clearSelectedIcon: () => set({ selectedIcon: null }),

  setActiveView: (view) => set({ activeView: view }),

  // --- ACTIONS ---
  setActiveFloor: (floorNumber) => set({ activeFloor: floorNumber }),

  setLiveMode: (status) => set({
    isLiveMode: status,
    isPlaying: false // Turning on Live Mode stops playback
  }),

  setSelectedDate: (date) => {
    const isToday = date.toDateString() === new Date().toDateString()
    let startingTime = 9.0

    if (isToday) {
      const now = new Date()
      const currentFloat = now.getHours() + (now.getMinutes() / 60)
      startingTime = Math.max(9.0, Math.min(currentFloat, 18.0))
    }

    set({
      selectedDate: date,
      timeOfDay: startingTime,
      isPlaying: false,
      isLiveMode: false // Changing dates breaks the live sync
    })
  },

  setTimeOfDay: (time) => set({ timeOfDay: time }),

  togglePlaying: () => {
    const state = get()
    if (!state.isPlaying && state.timeOfDay >= 18.0) {
      set({ timeOfDay: 9.0, isPlaying: true, isLiveMode: false })
    } else {
      set({ isPlaying: !state.isPlaying, isLiveMode: false }) // Playing breaks live sync
    }
  },

  advanceTime: (deltaSeconds) => set((state) => {
    let newTime = state.timeOfDay + (0.45 * deltaSeconds)
    if (newTime >= 18.0) return { timeOfDay: 18.0, isPlaying: false }
    return { timeOfDay: newTime }
  }),

  setLanguage: (lang) =>
    set((state) => ({
      settings: {
        ...state.settings,
        language: lang,
      },
    })),

  toggleHighContrast: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        highContrast: !state.settings.highContrast,
      },
    })),

  setTextSize: (size) =>
    set((state) => ({
      settings: {
        ...state.settings,
        textSize: size,
      },
    })),

  setCursorSize: (size) =>
    set((state) => ({
      settings: {
        ...state.settings,
        cursorSize: size,
      },
    })),

  // --- LAYER STATE ---
  layers: { crowd: true, noise: false, brightness: false, dimensions: false },
  toggleLayer: (layerName) => set((state) => ({
    layers: { ...state.layers, [layerName]: !state.layers[layerName] }
  }))
}))

export default useAppStore