import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Preferencias de accesibilidad. Se aplican como atributos data-* en <html>
 * (ver applyA11yAttributes) para que el CSS global reaccione, y persisten
 * en localStorage entre sesiones.
 */
export const useA11yStore = create(
  persist(
    (set) => ({
      textScale: 'base',       // 'base' | 'lg' | 'xl'
      highContrast: false,
      easyRead: false,
      reducedMotion: false,
      ttsEnabled: false,
      colorblindMode: 'none',  // 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'
      darkMode: false,         // 'false' | 'true'
      largeCursor: false,      // Cursor grande y de alto contraste
      readingGuide: false,     // Guía de lectura horizontal
      highlightLinks: false,   // Resaltar enlaces e interacciones
      motorSpacing: false,     // Ampliación de áreas de clic/touch
      visualAlerts: false,     // Alertas visuales de notificaciones

      setTextScale: (textScale) => set({ textScale }),
      cycleTextScale: () => set((s) => ({
        textScale: s.textScale === 'base' ? 'lg' : s.textScale === 'lg' ? 'xl' : 'base',
      })),
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      toggleEasyRead: () => set((s) => ({ easyRead: !s.easyRead })),
      toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
      toggleTts: () => set((s) => ({ ttsEnabled: !s.ttsEnabled })),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      toggleLargeCursor: () => set((s) => ({ largeCursor: !s.largeCursor })),
      toggleReadingGuide: () => set((s) => ({ readingGuide: !s.readingGuide })),
      toggleHighlightLinks: () => set((s) => ({ highlightLinks: !s.highlightLinks })),
      toggleMotorSpacing: () => set((s) => ({ motorSpacing: !s.motorSpacing })),
      toggleVisualAlerts: () => set((s) => ({ visualAlerts: !s.visualAlerts })),
      setColorblindMode: (colorblindMode) => set({ colorblindMode }),
      reset: () => set({ textScale: 'base', highContrast: false, easyRead: false, reducedMotion: false, ttsEnabled: false, colorblindMode: 'none', darkMode: false, largeCursor: false, readingGuide: false, highlightLinks: false, motorSpacing: false, visualAlerts: false }),
    }),
    { name: 'raices_a11y' }
  )
)

/** Aplica las preferencias al elemento <html> como atributos data-*. */
export function applyA11yAttributes(state) {
  const el = document.documentElement
  el.setAttribute('data-text-scale', state.textScale)
  el.setAttribute('data-contrast', state.highContrast ? 'high' : 'normal')
  el.setAttribute('data-easy-read', state.easyRead ? 'true' : 'false')
  el.setAttribute('data-reduced-motion', state.reducedMotion ? 'true' : 'false')
  el.setAttribute('data-colorblind', state.colorblindMode ?? 'none')
  el.setAttribute('data-theme', state.darkMode ? 'dark' : 'light')
  el.setAttribute('data-large-cursor', state.largeCursor ? 'true' : 'false')
  el.setAttribute('data-reading-guide', state.readingGuide ? 'true' : 'false')
  el.setAttribute('data-highlight-links', state.highlightLinks ? 'true' : 'false')
  el.setAttribute('data-motor-spacing', state.motorSpacing ? 'true' : 'false')
  el.setAttribute('data-visual-alerts', state.visualAlerts ? 'true' : 'false')
}
