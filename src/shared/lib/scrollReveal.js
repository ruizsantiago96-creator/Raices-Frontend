/**
 * Inicializa las animaciones de scroll reveal para todos los elementos
 * con clase .scroll-reveal, .scroll-reveal-left, .scroll-reveal-right,
 * .scroll-reveal-scale, .scroll-reveal-up
 */
export function initScrollReveal() {
  const SELECTORS = [
    '.scroll-reveal',
    '.scroll-reveal-left',
    '.scroll-reveal-right',
    '.scroll-reveal-scale',
    '.scroll-reveal-up',
  ]

  const elements = document.querySelectorAll(SELECTORS.join(', '))
  if (!elements.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
        } else {
          entry.target.classList.remove('revealed')
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )

  elements.forEach((el) => observer.observe(el))

  return () => observer.disconnect()
}
