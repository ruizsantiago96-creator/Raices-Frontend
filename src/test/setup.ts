import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

// ─── Ensure localStorage & sessionStorage exist in jsdom 30+ ────────
// jsdom 30 removed automatic localStorage/sessionStorage globals.
function createStorage(): Storage {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value) },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createStorage(),
    writable: true,
  })
}
if (typeof globalThis.sessionStorage === 'undefined') {
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: createStorage(),
    writable: true,
  })
}

// ─── Mock window.matchMedia ────────────────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
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
  callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
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
