import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { CategoryTag, CATEGORY_COLORS } from './shared'
import { createRoot } from 'react-dom/client'

const MERIDA = { lng: -89.5926, lat: 20.9674 }
const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

export default function MapView({ institutions = [], height = '400px' }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  // Initialize map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [MERIDA.lng, MERIDA.lat],
      zoom: 12,
    })

    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Add/remove markers when institutions change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove previous markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    for (const inst of institutions) {
      if (!inst.lat || !inst.lng) continue

      // Custom teal marker element
      const el = document.createElement('div')
      el.style.cssText = [
        'width:24px',
        'height:24px',
        'border-radius:50%',
        'background:#2B7A84',
        'border:3px solid white',
        'box-shadow:0 2px 8px rgba(0,0,0,0.25)',
        'cursor:pointer',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'transition:transform 0.15s',
      ].join(';')

      // White dot inside
      const dot = document.createElement('div')
      dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:white'
      el.appendChild(dot)

      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.2)' })
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })

      // Build popup HTML
      const color = CATEGORY_COLORS[inst.category] ?? '#2B7A84'
      const popupNode = document.createElement('div')
      popupNode.style.cssText = 'font-family:Inter,sans-serif;min-width:200px;padding:4px 2px'

      const root = createRoot(popupNode)
      root.render(
        <PopupContent inst={inst} color={color} />
      )

      const popup = new maplibregl.Popup({ offset: 18, closeButton: false, maxWidth: '260px' })
        .setDOMContent(popupNode)

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([inst.lng, inst.lat])
        .setPopup(popup)
        .addTo(map)

      markersRef.current.push(marker)
    }
  }, [institutions])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}
    />
  )
}

function PopupContent({ inst, color }) {
  const handleClick = () => {
    window.location.href = `/institution/${inst.id}`
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '2px 0' }}>
      <div style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 15,
        fontWeight: 700,
        color: '#1A2E35',
        marginBottom: 8,
        lineHeight: 1.3,
      }}>
        {inst.name}
      </div>
      <div style={{ marginBottom: 10 }}>
        <CategoryTag label={inst.category} color={color} />
      </div>
      {inst.city && (
        <div style={{ fontSize: 12, color: '#6B7E85', marginBottom: 10 }}>
          {inst.city}{inst.state ? `, ${inst.state}` : ''}
        </div>
      )}
      <button
        onClick={handleClick}
        style={{
          width: '100%',
          padding: '8px 0',
          background: '#2B7A84',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Ver institución
      </button>
    </div>
  )
}
