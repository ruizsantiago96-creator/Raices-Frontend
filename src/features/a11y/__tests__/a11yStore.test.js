import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useA11yStore, applyA11yAttributes } from '../store/a11yStore'

beforeEach(() => {
  // Reset store to defaults
  useA11yStore.setState({
    textScale: 'base',
    highContrast: false,
    easyRead: false,
    reducedMotion: false,
    ttsEnabled: false,
    colorblindMode: 'none',
    darkMode: false,
    largeCursor: false,
    readingGuide: false,
    highlightLinks: false,
    motorSpacing: false,
    visualAlerts: false,
  })
  localStorage.clear()
})

afterEach(() => {
  // Clean up document.documentElement attributes to prevent test leaks
  const attrs = [
    'data-text-scale', 'data-contrast', 'data-easy-read', 'data-reduced-motion',
    'data-colorblind', 'data-theme', 'data-large-cursor', 'data-reading-guide',
    'data-highlight-links', 'data-motor-spacing', 'data-visual-alerts',
  ]
  attrs.forEach(a => document.documentElement.removeAttribute(a))
})

describe('features/a11y/store/a11yStore', () => {
  // ═══════════════════════════════════════════════════════════════
  // Initial State
  // ═══════════════════════════════════════════════════════════════
  describe('initial state', () => {
    it('has textScale as "base"', () => {
      expect(useA11yStore.getState().textScale).toBe('base')
    })

    it('has all boolean flags as false', () => {
      const s = useA11yStore.getState()
      expect(s.highContrast).toBe(false)
      expect(s.easyRead).toBe(false)
      expect(s.reducedMotion).toBe(false)
      expect(s.ttsEnabled).toBe(false)
      expect(s.darkMode).toBe(false)
      expect(s.largeCursor).toBe(false)
      expect(s.readingGuide).toBe(false)
      expect(s.highlightLinks).toBe(false)
      expect(s.motorSpacing).toBe(false)
      expect(s.visualAlerts).toBe(false)
    })

    it('has colorblindMode as "none"', () => {
      expect(useA11yStore.getState().colorblindMode).toBe('none')
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // Text Scale
  // ═══════════════════════════════════════════════════════════════
  describe('text scale', () => {
    it('setTextScale sets a specific scale', () => {
      useA11yStore.getState().setTextScale('lg')
      expect(useA11yStore.getState().textScale).toBe('lg')
    })

    it('cycleTextScale cycles from base -> lg', () => {
      useA11yStore.getState().cycleTextScale()
      expect(useA11yStore.getState().textScale).toBe('lg')
    })

    it('cycleTextScale cycles from lg -> xl', () => {
      useA11yStore.getState().setTextScale('lg')
      useA11yStore.getState().cycleTextScale()
      expect(useA11yStore.getState().textScale).toBe('xl')
    })

    it('cycleTextScale cycles from xl -> base', () => {
      useA11yStore.getState().setTextScale('xl')
      useA11yStore.getState().cycleTextScale()
      expect(useA11yStore.getState().textScale).toBe('base')
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // Toggle functions
  // ═══════════════════════════════════════════════════════════════
  describe('toggle functions', () => {
    const toggleMap = [
      ['toggleHighContrast', 'highContrast'],
      ['toggleEasyRead', 'easyRead'],
      ['toggleReducedMotion', 'reducedMotion'],
      ['toggleTts', 'ttsEnabled'],
      ['toggleDarkMode', 'darkMode'],
      ['toggleLargeCursor', 'largeCursor'],
      ['toggleReadingGuide', 'readingGuide'],
      ['toggleHighlightLinks', 'highlightLinks'],
      ['toggleMotorSpacing', 'motorSpacing'],
      ['toggleVisualAlerts', 'visualAlerts'],
    ]

    toggleMap.forEach(([method, key]) => {
      it(`${method} toggles from false to true`, () => {
        useA11yStore.getState()[method]()
        expect(useA11yStore.getState()[key]).toBe(true)
      })

      it(`${method} toggles from true to false`, () => {
        useA11yStore.setState({ [key]: true })
        useA11yStore.getState()[method]()
        expect(useA11yStore.getState()[key]).toBe(false)
      })

      it(`${method} double toggle returns to original`, () => {
        useA11yStore.getState()[method]()
        useA11yStore.getState()[method]()
        expect(useA11yStore.getState()[key]).toBe(false)
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // Colorblind Mode
  // ═══════════════════════════════════════════════════════════════
  describe('colorblind mode', () => {
    it('setColorblindMode sets a specific mode', () => {
      useA11yStore.getState().setColorblindMode('deuteranopia')
      expect(useA11yStore.getState().colorblindMode).toBe('deuteranopia')
    })

    it('setColorblindMode can set protanopia', () => {
      useA11yStore.getState().setColorblindMode('protanopia')
      expect(useA11yStore.getState().colorblindMode).toBe('protanopia')
    })

    it('setColorblindMode can set tritanopia', () => {
      useA11yStore.getState().setColorblindMode('tritanopia')
      expect(useA11yStore.getState().colorblindMode).toBe('tritanopia')
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // Reset
  // ═══════════════════════════════════════════════════════════════
  describe('reset', () => {
    it('resets all values to defaults', () => {
      // Change everything
      useA11yStore.getState().setTextScale('xl')
      useA11yStore.getState().toggleHighContrast()
      useA11yStore.getState().toggleEasyRead()
      useA11yStore.getState().toggleDarkMode()
      useA11yStore.getState().toggleReducedMotion()
      useA11yStore.getState().toggleTts()
      useA11yStore.getState().toggleLargeCursor()
      useA11yStore.getState().toggleReadingGuide()
      useA11yStore.getState().toggleHighlightLinks()
      useA11yStore.getState().toggleMotorSpacing()
      useA11yStore.getState().toggleVisualAlerts()
      useA11yStore.getState().setColorblindMode('deuteranopia')

      // Verify they changed
      expect(useA11yStore.getState().darkMode).toBe(true)
      expect(useA11yStore.getState().textScale).toBe('xl')

      // Reset
      useA11yStore.getState().reset()

      // Verify all defaults
      const s = useA11yStore.getState()
      expect(s.textScale).toBe('base')
      expect(s.highContrast).toBe(false)
      expect(s.easyRead).toBe(false)
      expect(s.reducedMotion).toBe(false)
      expect(s.ttsEnabled).toBe(false)
      expect(s.darkMode).toBe(false)
      expect(s.largeCursor).toBe(false)
      expect(s.readingGuide).toBe(false)
      expect(s.highlightLinks).toBe(false)
      expect(s.motorSpacing).toBe(false)
      expect(s.visualAlerts).toBe(false)
      expect(s.colorblindMode).toBe('none')
    })
  })
})

// ═══════════════════════════════════════════════════════════════
// applyA11yAttributes
// ═══════════════════════════════════════════════════════════════
describe('applyA11yAttributes', () => {
  const defaultState = {
    textScale: 'base', highContrast: false, easyRead: false, reducedMotion: false,
    colorblindMode: 'none', darkMode: false, largeCursor: false, readingGuide: false,
    highlightLinks: false, motorSpacing: false, visualAlerts: false,
  }

  it('applies text-scale attribute', () => {
    applyA11yAttributes({ ...defaultState, textScale: 'lg' })
    expect(document.documentElement.getAttribute('data-text-scale')).toBe('lg')
  })

  it('applies high contrast attribute', () => {
    applyA11yAttributes({ ...defaultState, highContrast: true })
    expect(document.documentElement.getAttribute('data-contrast')).toBe('high')
  })

  it('applies normal contrast when highContrast is false', () => {
    applyA11yAttributes({ ...defaultState, highContrast: false })
    expect(document.documentElement.getAttribute('data-contrast')).toBe('normal')
  })

  it('applies dark mode attribute', () => {
    applyA11yAttributes({ ...defaultState, darkMode: true })
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('applies light mode when darkMode is false', () => {
    applyA11yAttributes({ ...defaultState, darkMode: false })
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('applies colorblind mode', () => {
    applyA11yAttributes({ ...defaultState, colorblindMode: 'deuteranopia' })
    expect(document.documentElement.getAttribute('data-colorblind')).toBe('deuteranopia')
  })

  it('applies all boolean attributes as "true" or "false"', () => {
    applyA11yAttributes({
      ...defaultState,
      easyRead: true, reducedMotion: true, largeCursor: true,
      readingGuide: true, highlightLinks: true, motorSpacing: true, visualAlerts: true,
    })
    expect(document.documentElement.getAttribute('data-easy-read')).toBe('true')
    expect(document.documentElement.getAttribute('data-reduced-motion')).toBe('true')
    expect(document.documentElement.getAttribute('data-large-cursor')).toBe('true')
    expect(document.documentElement.getAttribute('data-reading-guide')).toBe('true')
    expect(document.documentElement.getAttribute('data-highlight-links')).toBe('true')
    expect(document.documentElement.getAttribute('data-motor-spacing')).toBe('true')
    expect(document.documentElement.getAttribute('data-visual-alerts')).toBe('true')
  })
})
