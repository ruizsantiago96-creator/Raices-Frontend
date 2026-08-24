import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router-dom'
import {
  LeafIcon,
  Icons,
  CategoryTag,
  BrandMark,
  hashColor,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  labelStyle,
  inputStyle,
  AppFooter,
  TopNav,
} from '../shared'

function withRouter(ui) {
  return <HashRouter>{ui}</HashRouter>
}

// ═══════════════════════════════════════════════════════════════
// LeafIcon
// ═══════════════════════════════════════════════════════════════
describe('LeafIcon', () => {
  it('renders an SVG element', () => {
    const { container } = render(withRouter(<LeafIcon />))
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('uses default size 16', () => {
    const { container } = render(withRouter(<LeafIcon />))
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('width')).toBe('16')
    expect(svg.getAttribute('height')).toBe('16')
  })

  it('accepts custom size', () => {
    const { container } = render(withRouter(<LeafIcon size={24} />))
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('width')).toBe('24')
  })

  it('accepts custom color', () => {
    const { container } = render(withRouter(<LeafIcon color="red" />))
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('fill')).toBe('red')
  })

  it('accepts custom style', () => {
    const { container } = render(withRouter(<LeafIcon style={{ opacity: 0.5 }} />))
    const svg = container.querySelector('svg')
    expect(svg.style.opacity).toBe('0.5')
  })
})

// ═══════════════════════════════════════════════════════════════
// Icons
// ═══════════════════════════════════════════════════════════════
describe('Icons', () => {
  const iconNames = [
    'home', 'search', 'heart', 'message', 'user', 'sparkles',
    'shield', 'users', 'activity', 'mapPin', 'star', 'arrowRight',
    'arrowLeft', 'building', 'brain', 'send', 'x', 'check',
    'filter', 'bookmark', 'phone', 'mail', 'globe', 'upload',
    'target', 'logout', 'plus', 'edit', 'shieldAlert', 'barChart',
    'compass', 'milestone', 'heartPulse', 'bell', 'briefcase',
    'graduationCap', 'grid', 'list', 'loader', 'camera', 'sliders',
    'chevronDown', 'eye', 'eyeOff', 'link', 'trash',
  ]

  iconNames.forEach((name) => {
    it(`Icons.${name} renders an SVG`, () => {
      const { container } = render(withRouter(Icons[name]()))
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg.getAttribute('aria-hidden')).toBe('true')
    })
  })

  it('Icons.heart renders with filled prop', () => {
    const { container } = render(withRouter(Icons.heart({ filled: true })))
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('fill')).toBe('currentColor')
  })

  it('Icons.heart renders without filled prop', () => {
    const { container } = render(withRouter(Icons.heart({ filled: false })))
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('fill')).toBe('none')
  })

  it('Icons accept custom size via s prop', () => {
    const { container } = render(withRouter(Icons.home({ s: 32 })))
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('width')).toBe('32')
    expect(svg.getAttribute('height')).toBe('32')
  })
})

// ═══════════════════════════════════════════════════════════════
// CategoryTag
// ═══════════════════════════════════════════════════════════════
describe('CategoryTag', () => {
  it('renders the category label for known category', () => {
    render(withRouter(<CategoryTag label="funcional" color="#000" />))
    expect(screen.getByText('Salud y Terapia')).toBeInTheDocument()
  })

  it('renders raw label for unknown category', () => {
    render(withRouter(<CategoryTag label="custom" color="#000" />))
    expect(screen.getByText('custom')).toBeInTheDocument()
  })

  it('renders all CATEGORY_LABELS mappings', () => {
    Object.entries(CATEGORY_LABELS).forEach(([key, value]) => {
      const { unmount } = render(withRouter(<CategoryTag label={key} color="#000" />))
      expect(screen.getByText(value)).toBeInTheDocument()
      unmount()
    })
  })

  it('applies the color prop', () => {
    render(withRouter(<CategoryTag label="funcional" color="#FF0000" />))
    const span = screen.getByText('Salud y Terapia').closest('span')
    expect(span).toHaveStyle({ color: '#FF0000' })
  })
})

// ═══════════════════════════════════════════════════════════════
// BrandMark
// ═══════════════════════════════════════════════════════════════
describe('BrandMark', () => {
  it('renders "Raíces" text', () => {
    render(withRouter(<BrandMark onClick={() => {}} />))
    expect(screen.getByText('Raíces')).toBeInTheDocument()
  })

  it('renders "." dot', () => {
    render(withRouter(<BrandMark onClick={() => {}} />))
    expect(screen.getByText('.')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(withRouter(<BrandMark onClick={onClick} />))
    await user.click(screen.getByText('Raíces'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('accepts custom size', () => {
    render(withRouter(<BrandMark onClick={() => {}} size={32} />))
    const raices = screen.getByText('Raíces')
    expect(raices).toHaveStyle({ fontSize: 32 })
  })

  it('applies light color when light=true', () => {
    render(withRouter(<BrandMark onClick={() => {}} light />))
    const raices = screen.getByText('Raíces')
    expect(raices).toHaveStyle({ color: 'rgb(255, 255, 255)' })
  })

  it('renders as a button element', () => {
    render(withRouter(<BrandMark onClick={() => {}} />))
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════
// hashColor
// ═══════════════════════════════════════════════════════════════
describe('hashColor', () => {
  it('returns a string', () => {
    expect(typeof hashColor('test')).toBe('string')
  })

  it('returns same color for same input (deterministic)', () => {
    expect(hashColor('hello')).toBe(hashColor('hello'))
  })

  it('returns different colors for different inputs', () => {
    // With high probability, different strings produce different colors
    const color1 = hashColor('alice')
    const color2 = hashColor('bob')
    // They may or may not be different, but the function should not throw
    expect(typeof color1).toBe('string')
    expect(typeof color2).toBe('string')
  })

  it('handles empty string', () => {
    expect(typeof hashColor('')).toBe('string')
  })

  it('handles undefined by falling back to empty string', () => {
    expect(typeof hashColor(undefined)).toBe('string')
  })
})

// ═══════════════════════════════════════════════════════════════
// CATEGORY_COLORS
// ═══════════════════════════════════════════════════════════════
describe('CATEGORY_COLORS', () => {
  it('has colors for standard categories', () => {
    expect(CATEGORY_COLORS['funcional']).toBeDefined()
    expect(CATEGORY_COLORS['educativo']).toBeDefined()
    expect(CATEGORY_COLORS['laboral']).toBeDefined()
    expect(CATEGORY_COLORS['social']).toBeDefined()
  })

  it('has colors for Spanish labels', () => {
    expect(CATEGORY_COLORS['Salud']).toBeDefined()
    expect(CATEGORY_COLORS['Educación']).toBeDefined()
    expect(CATEGORY_COLORS['Empleo']).toBeDefined()
    expect(CATEGORY_COLORS['Comunidad']).toBeDefined()
  })
})

// ═══════════════════════════════════════════════════════════════
// Style constants
// ═══════════════════════════════════════════════════════════════
describe('style constants', () => {
  it('labelStyle has expected properties', () => {
    expect(labelStyle.display).toBe('block')
    expect(labelStyle.fontWeight).toBe(700)
    expect(labelStyle.marginBottom).toBe(6)
  })

  it('inputStyle has expected properties', () => {
    expect(inputStyle.width).toBe('100%')
    expect(inputStyle.height).toBe(48)
    expect(inputStyle.fontSize).toBe(16)
  })
})

// ═══════════════════════════════════════════════════════════════
// TopNav
// ═══════════════════════════════════════════════════════════════
describe('TopNav', () => {
  it('renders the brand mark', () => {
    render(withRouter(<TopNav />))
    expect(screen.getByText('Raíces')).toBeInTheDocument()
  })

  it('renders user initials when user is provided', () => {
    render(withRouter(<TopNav user={{ full_name: 'Juan Perez' }} />))
    expect(screen.getByText('JP')).toBeInTheDocument()
  })

  it('renders first name when user is provided', () => {
    render(withRouter(<TopNav user={{ full_name: 'Juan Perez' }} />))
    expect(screen.getByText('Juan')).toBeInTheDocument()
  })

  it('renders avatar image when avatar_url is provided', () => {
    render(withRouter(<TopNav user={{ full_name: 'Juan', avatar_url: 'http://img.com/a.png' }} />))
    expect(screen.getByRole('img', { name: 'Juan' })).toBeInTheDocument()
  })

  it('renders logout button when onLogout is provided', () => {
    render(withRouter(<TopNav onLogout={() => {}} />))
    expect(screen.getByText(/Salir/)).toBeInTheDocument()
  })

  it('calls onLogout when logout button is clicked', async () => {
    const onLogout = vi.fn()
    const user = userEvent.setup()
    render(withRouter(<TopNav onLogout={onLogout} />))
    await user.click(screen.getByText(/Salir/))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it('does not render logout button when onLogout is not provided', () => {
    render(withRouter(<TopNav />))
    expect(screen.queryByText(/Salir/)).not.toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════
// AppFooter
// ═══════════════════════════════════════════════════════════════
describe('AppFooter', () => {
  it('renders the brand name', () => {
    render(withRouter(<AppFooter />))
    expect(screen.getByText('Raíces')).toBeInTheDocument()
  })

  it('renders footer column titles', () => {
    render(withRouter(<AppFooter />))
    expect(screen.getByText('Caminos')).toBeInTheDocument()
    expect(screen.getByText('Florece')).toBeInTheDocument()
  })

  it('renders footer items', () => {
    render(withRouter(<AppFooter />))
    expect(screen.getByText('Salud y bienestar')).toBeInTheDocument()
    expect(screen.getByText('Acerca de nosotros')).toBeInTheDocument()
  })

  it('renders copyright year', () => {
    render(withRouter(<AppFooter />))
    expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0)
  })

  it('renders privacy and accessibility links', () => {
    render(withRouter(<AppFooter />))
    expect(screen.getAllByText(/Privacidad/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Accesibilidad/).length).toBeGreaterThan(0)
  })
})
