import '@testing-library/jest-dom/vitest'
import { vi, beforeEach } from 'vitest'

// ─── Ensure localStorage & sessionStorage exist in jsdom 30+ ────────
// jsdom 30 removed automatic localStorage/sessionStorage globals.
function createStorage() {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i) => Object.keys(store)[i] ?? null,
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = createStorage()
}
if (typeof globalThis.sessionStorage === 'undefined') {
  globalThis.sessionStorage = createStorage()
}

// ─── Mock window.matchMedia ────────────────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// ─── Mock IntersectionObserver ──────────────────────────────────────
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() { return null }
  unobserve() { return null }
  disconnect() { return null }
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
})

// ─── Mock ResizeObserver ────────────────────────────────────────────
class MockResizeObserver {
  constructor() {}
  observe() { return null }
  unobserve() { return null }
  disconnect() { return null }
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
})

// ─── Mock window.scrollTo ───────────────────────────────────────────
window.scrollTo = () => {}

// ─── Clean localStorage & sessionStorage before each test ───────────
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})
