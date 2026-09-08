/**
 * Tipos de dominio para el Módulo de Accesibilidad (a11y).
 */

export type TextScale = 'base' | 'lg' | 'xl'
export type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'

export interface A11yState {
  textScale: TextScale
  highContrast: boolean
  easyRead: boolean
  reducedMotion: boolean
  ttsEnabled: boolean
  colorblindMode: ColorblindMode
  darkMode: boolean
  largeCursor: boolean
  readingGuide: boolean
  highlightLinks: boolean
  motorSpacing: boolean
  visualAlerts: boolean
}

export interface A11yActions {
  setTextScale: (textScale: TextScale) => void
  cycleTextScale: () => void
  toggleHighContrast: () => void
  toggleEasyRead: () => void
  toggleReducedMotion: () => void
  toggleTts: () => void
  toggleDarkMode: () => void
  toggleLargeCursor: () => void
  toggleReadingGuide: () => void
  toggleHighlightLinks: () => void
  toggleMotorSpacing: () => void
  toggleVisualAlerts: () => void
  setColorblindMode: (colorblindMode: ColorblindMode) => void
  reset: () => void
}

export type A11yStore = A11yState & A11yActions
