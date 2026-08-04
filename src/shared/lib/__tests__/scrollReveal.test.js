import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initScrollReveal } from '../scrollReveal'

describe('shared/lib/scrollReveal', () => {
  let observeSpy
  let disconnectSpy
  let observerCallback

  beforeEach(() => {
    // Spy on IntersectionObserver constructor
    observeSpy = vi.fn()
    disconnectSpy = vi.fn()

    vi.spyOn(window, 'IntersectionObserver').mockImplementation((cb) => {
      observerCallback = cb
      return { observe: observeSpy, disconnect: disconnectSpy, unobserve: vi.fn() }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('returns a cleanup function when elements exist', () => {
    document.body.innerHTML = '<div class="scroll-reveal"></div>'
    const cleanup = initScrollReveal()
    expect(typeof cleanup).toBe('function')
    cleanup()
  })

  it('returns undefined when no matching elements exist', () => {
    const result = initScrollReveal()
    expect(result).toBeUndefined()
  })

  it('observes elements with .scroll-reveal class', () => {
    document.body.innerHTML = '<div class="scroll-reveal"></div><div class="scroll-reveal"></div>'
    initScrollReveal()
    expect(observeSpy).toHaveBeenCalledTimes(2)
  })

  it('observes elements with .scroll-reveal-scale class', () => {
    document.body.innerHTML = '<div class="scroll-reveal-scale"></div>'
    initScrollReveal()
    expect(observeSpy).toHaveBeenCalledTimes(1)
  })

  it('observes mixed selector classes', () => {
    document.body.innerHTML = `
      <div class="scroll-reveal"></div>
      <div class="scroll-reveal-left"></div>
      <div class="scroll-reveal-right"></div>
      <div class="scroll-reveal-scale"></div>
      <div class="scroll-reveal-up"></div>
    `
    initScrollReveal()
    expect(observeSpy).toHaveBeenCalledTimes(5)
  })

  it('does not create observer when no elements match', () => {
    document.body.innerHTML = '<div class="no-match"></div>'
    initScrollReveal()
    expect(observeSpy).not.toHaveBeenCalled()
  })

  it('disconnects observer on cleanup', () => {
    document.body.innerHTML = '<div class="scroll-reveal"></div>'
    const cleanup = initScrollReveal()
    cleanup()
    expect(disconnectSpy).toHaveBeenCalledTimes(1)
  })

  it('adds "revealed" class when element is intersecting', () => {
    document.body.innerHTML = '<div class="scroll-reveal"></div>'
    initScrollReveal()

    const el = document.querySelector('.scroll-reveal')
    observerCallback([{ isIntersecting: true, target: el }])

    expect(el.classList.contains('revealed')).toBe(true)
  })

  it('removes "revealed" class when element is not intersecting', () => {
    document.body.innerHTML = '<div class="scroll-reveal revealed"></div>'
    initScrollReveal()

    const el = document.querySelector('.scroll-reveal')
    observerCallback([{ isIntersecting: false, target: el }])

    expect(el.classList.contains('revealed')).toBe(false)
  })

  it('handles multiple entries in a single callback', () => {
    document.body.innerHTML = `
      <div class="scroll-reveal"></div>
      <div class="scroll-reveal"></div>
    `
    initScrollReveal()

    const els = document.querySelectorAll('.scroll-reveal')
    observerCallback([
      { isIntersecting: true, target: els[0] },
      { isIntersecting: false, target: els[1] },
    ])

    expect(els[0].classList.contains('revealed')).toBe(true)
    expect(els[1].classList.contains('revealed')).toBe(false)
  })

  it('configures IntersectionObserver with correct threshold and rootMargin', () => {
    document.body.innerHTML = '<div class="scroll-reveal"></div>'
    initScrollReveal()

    expect(window.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    )
  })
})
