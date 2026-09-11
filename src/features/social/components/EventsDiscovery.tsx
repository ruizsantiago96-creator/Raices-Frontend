import { useState } from 'react'
import {
  Users,
  BookOpen,
  Gamepad2,
  Bot,
  Palette,
  Trophy,
  HeartPulse,
  Wrench,
  MapPin,
} from 'lucide-react'

const MOCK_CATEGORIES = [
  { id: 1, name: 'Familia', icon: Users, color: '#ec4899' },
  { id: 2, name: 'Libros y Lectura', icon: BookOpen, color: '#eab308' },
  { id: 3, name: 'Juegos', icon: Gamepad2, color: '#f59e0b' },
  { id: 4, name: 'Tecnología e IA', icon: Bot, color: '#3b82f6' },
  { id: 5, name: 'Arte y Cultura', icon: Palette, color: '#ec4899' },
  { id: 6, name: 'Deporte y Fitness', icon: Trophy, color: '#14b8a6' },
  { id: 7, name: 'Bienestar', icon: HeartPulse, color: '#06b6d4' },
  { id: 8, name: 'Talleres', icon: Wrench, color: '#8b5cf6' },
]

const MOCK_REGIONS = ['América del Norte', 'América del Sur', 'Europa', 'Online']

const MOCK_CITIES = [
  { id: 1, name: 'Ciudad de México', count: '120 Eventos', region: 'América del Norte', bg: '#e8aa42' },
  { id: 2, name: 'Monterrey', count: '45 Eventos', region: 'América del Norte', bg: '#ef4444' },
  { id: 3, name: 'Guadalajara', count: '60 Eventos', region: 'América del Norte', bg: '#3b82f6' },
  { id: 4, name: 'Bogotá', count: '85 Eventos', region: 'América del Sur', bg: '#22c55e' },
  { id: 5, name: 'Buenos Aires', count: '110 Eventos', region: 'América del Sur', bg: '#8b5cf6' },
  { id: 6, name: 'Santiago', count: '40 Eventos', region: 'América del Sur', bg: '#f59e0b' },
  { id: 7, name: 'Madrid', count: '150 Eventos', region: 'Europa', bg: '#ec4899' },
  { id: 8, name: 'Barcelona', count: '90 Eventos', region: 'Europa', bg: '#14b8a6' },
  { id: 9, name: 'Global / Virtual', count: '500+ Eventos', region: 'Online', bg: '#6366f1' },
]

export function EventsDiscovery() {
  const [activeRegion, setActiveRegion] = useState('América del Norte')

  const filteredCities = MOCK_CITIES.filter(c => c.region === activeRegion)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }} className="animate-fade-in-up delay-1">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 12px' }}>
          Descubrir eventos
        </h1>
        <p style={{ fontSize: 16, color: 'var(--fg2)', margin: 0, lineHeight: 1.5, maxWidth: 600 }}>
          Explora eventos populares cerca de ti, navega por categoría o echa un vistazo a algunos de los excelentes calendarios comunitarios.
        </p>
      </div>

      {/* Explorar por categoría */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px' }}>
          Explorar por categoría
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16
        }}>
          {MOCK_CATEGORIES.map(cat => {
            const IconComp = cat.icon
            return (
              <button
                key={cat.id}
                className="card-hover"
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${cat.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IconComp size={22} color={cat.color} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg1)' }}>
                    {cat.name}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Explora eventos locales */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 16px' }}>
          Explora eventos locales
        </h2>
        
        {/* Tabs Region */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {MOCK_REGIONS.map(region => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: 'none',
                background: activeRegion === region ? 'var(--primary-subtle)' : 'transparent',
                color: activeRegion === region ? 'var(--primary)' : 'var(--fg2)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s',
              }}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Cities Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 20
        }}>
          {filteredCities.map(city => (
            <button
              key={city.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: city.bg, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <MapPin size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg1)' }}>
                  {city.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
