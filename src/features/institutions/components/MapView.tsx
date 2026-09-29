import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
// MapLibre GL JS v6 es ESM-only: sin export default, se usa namespace import.
import * as maplibregl from 'maplibre-gl'
// En bundlers (Vite) hay que indicar la URL del worker explícitamente.
// ?worker&url emite un chunk self-contained (el worker importa un sibling shared).
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { CategoryTag, CATEGORY_COLORS } from '@shared/components/shared'
import { createRoot, type Root } from 'react-dom/client'
import type { Institution } from '@/types/institutions'

maplibregl.setWorkerUrl(workerUrl)

const MERIDA = { lng: -89.5926, lat: 20.9674 }
const OSM_STYLE: maplibregl.StyleSpecification = {
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

interface MapViewProps {
  institutions?: Institution[]
  height?: string
}

interface ManagedMarker {
  marker: maplibregl.Marker
  root: Root
}

export default function MapView({ institutions = [], height = '400px' }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const managedMarkersRef = useRef<ManagedMarker[]>([])
  const navigate = useNavigate()

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
      managedMarkersRef.current.forEach(({ marker, root }) => {
        marker.remove()
        root.unmount()
      })
      managedMarkersRef.current = []

      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Add/remove markers when institutions change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove previous markers and unmount React Roots to prevent memory leaks
    managedMarkersRef.current.forEach(({ marker, root }) => {
      marker.remove()
      root.unmount()
    })
    managedMarkersRef.current = []

    for (const inst of institutions) {
      if (!inst.lat || !inst.lng) continue

      // Custom teal marker element with accessibility attributes
      const el = document.createElement('div')
      el.className = 'map-marker-pin'
      el.setAttribute('role', 'button')
      el.setAttribute('tabindex', '0')
      el.setAttribute('aria-label', `Marcador de ${inst.name}`)
      el.style.cssText = [
        'width:24px',
        'height:24px',
        'border-radius:50%',
        'background:#01ADFF',
        'border:3px solid white',
        'box-shadow:none',
        'cursor:pointer',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'transition:transform 0.15s',
        'outline:none',
      ].join(';')

      // White dot inside
      const dot = document.createElement('div')
      dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:white;pointer-events:none'
      el.appendChild(dot)

      // Build popup HTML
      const color = (inst.category && CATEGORY_COLORS[inst.category]) ?? '#01ADFF'
      const popupNode = document.createElement('div')
      popupNode.style.cssText = 'font-family:Lato,sans-serif;min-width:200px;padding:4px 2px'

      const root = createRoot(popupNode)
      root.render(
        <PopupContent inst={inst} color={color} onNavigate={(id) => navigate(`/instituciones/${id}`)} />
      )

      const popup = new maplibregl.Popup({ offset: 18, closeButton: false, maxWidth: '260px' })
        .setDOMContent(popupNode)

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([inst.lng, inst.lat])
        .setPopup(popup)
        .addTo(map)

      // Evento de teclado para accesibilidad (Enter o Espacio abre/cierra el popup)
      el.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          marker.togglePopup()
        }
      })

      managedMarkersRef.current.push({ marker, root })
    }
  }, [institutions, navigate])

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Mapa interactivo de instituciones"
      style={{
        width: '100%',
        height,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        boxShadow: 'none',
      }}
    />
  )
}

interface PopupContentProps {
  inst: Institution
  color: string
  onNavigate: (id: string | number) => void
}

function PopupContent({ inst, color, onNavigate }: PopupContentProps) {
  return (
    <div style={{ fontFamily: 'Lato, sans-serif', padding: '2px 0' }}>
      <div style={{
        fontFamily: 'Poppins, serif',
        fontSize: 15,
        fontWeight: 700,
        color: '#1A2E35',
        marginBottom: 8,
        lineHeight: 1.3,
      }}>
        {inst.name}
      </div>
      <div style={{ marginBottom: 10 }}>
        <CategoryTag label={inst.category ?? ''} color={color} />
      </div>
      {inst.city && (
        <div style={{ fontSize: 12, color: '#6B7E85', marginBottom: 10 }}>
          {inst.city}{inst.state ? `, ${inst.state}` : ''}
        </div>
      )}
      <button
        type="button"
        onClick={() => onNavigate(inst.id)}
        style={{
          width: '100%',
          padding: '8px 0',
          background: '#01ADFF',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'Lato, sans-serif',
        }}
      >
        Ver institución
      </button>
    </div>
  )
}
