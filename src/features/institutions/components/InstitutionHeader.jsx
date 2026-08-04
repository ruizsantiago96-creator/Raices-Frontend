/**
 * InstitutionHeader — Tarjeta principal con información de la institución.
 *
 * Muestra: categoría, nombre, ubicación, calificación, descripción,
 * tipos de discapacidad, información de contacto y mapa.
 *
 * Props:
 *   institution — Objeto de la institución
 *   isFav       — Si está en favoritos
 *   onToggleFav — Callback para toggle de favoritos
 *   togglePending — Estado de carga del toggle
 */

import { useToggleFavorite } from '../../favorites/hooks/useFavorites'
import { CategoryTag, Icons, CATEGORY_COLORS } from '@shared/components/shared'
import StarRow from './StarRow'

export default function InstitutionHeader({ institution, isFav }) {
  const toggle = useToggleFavorite()
  const categoryColor = CATEGORY_COLORS[institution.category] ?? 'var(--primary)'

  return (
    <div className="animate-fade-in-up delay-1" style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: 32,
      boxShadow: 'var(--shadow-sm)',
      marginBottom: 24,
    }}>
      {/* Top row: tags + save button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <CategoryTag label={institution.category} color={categoryColor} />
          {institution.plan_type === 'premium' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 12px', borderRadius: 'var(--radius-pill)',
              background: 'color-mix(in oklch, #D4944C 15%, transparent)',
              color: '#D4944C', fontSize: 12, fontWeight: 700,
            }}>
              {Icons.star({ s: 12, filled: true })} Premium
            </span>
          )}
        </div>
        <button
          onClick={() => toggle.mutate(institution.id)}
          disabled={toggle.isPending}
          style={{
            background: isFav
              ? 'color-mix(in oklch, #C4789A 12%, transparent)'
              : 'var(--bg-warm)',
            border: `1px solid ${isFav ? '#C4789A' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-pill)',
            cursor: toggle.isPending ? 'wait' : 'pointer',
            color: isFav ? '#C4789A' : 'var(--fg3)',
            padding: '8px 18px',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-body)',
            transition: 'all 0.15s ease',
          }}
        >
          {Icons.heart({ s: 16, filled: isFav })}
          {isFav ? 'Guardado' : 'Guardar'}
        </button>
      </div>

      {/* Name */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 30, fontWeight: 700,
        color: 'var(--fg1)', margin: '0 0 8px',
      }}>
        {institution.name}
      </h1>

      {/* Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--fg3)', marginBottom: 12 }}>
        {Icons.mapPin({ s: 16 })}
        {institution.address ? `${institution.address}, ` : ''}
        {institution.city}{institution.state ? `, ${institution.state}` : ''}
      </div>

      {/* Rating summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <StarRow rating={institution.rating_avg ?? 0} size={16} />
        <span style={{ color: 'var(--fg1)', fontWeight: 700, fontSize: 15 }}>
          {institution.rating_avg?.toFixed(1) ?? '—'}
        </span>
        <span style={{ color: 'var(--fg3)', fontSize: 13 }}>
          ({institution.rating_count ?? 0} reseñas)
        </span>
      </div>

      {/* Description */}
      {institution.description && (
        <p style={{ fontSize: 15, color: 'var(--fg2)', lineHeight: 1.7, margin: '0 0 20px' }}>
          {institution.description}
        </p>
      )}

      {/* Disability types */}
      {institution.disability_types?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {institution.disability_types.map(type => (
            <span key={type} style={{
              padding: '4px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: 12, fontWeight: 600,
              background: 'color-mix(in oklch, var(--primary) 10%, transparent)',
              color: 'var(--primary)',
              border: '1px solid color-mix(in oklch, var(--primary) 25%, transparent)',
            }}>
              {type}
            </span>
          ))}
        </div>
      )}

      {/* Contact info */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {institution.phone && (
          <a href={`tel:${institution.phone}`} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 14, color: 'var(--fg2)', textDecoration: 'none',
          }}>
            {Icons.phone({ s: 16 })} {institution.phone}
          </a>
        )}
        {institution.email && (
          <a href={`mailto:${institution.email}`} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 14, color: 'var(--fg2)', textDecoration: 'none',
          }}>
            {Icons.mail({ s: 16 })} {institution.email}
          </a>
        )}
        {institution.website && (
          <a href={institution.website} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 14, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none',
          }}>
            {Icons.globe({ s: 16 })} Sitio web
          </a>
        )}
      </div>

      {/* Mapa y cómo llegar */}
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.mapPin({ s: 18 })} Ubicación
          </span>
          <a
            href={institution.lat && institution.lng
              ? `https://www.google.com/maps/dir/?api=1&destination=${institution.lat},${institution.lng}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([institution.address, institution.city, institution.state, 'México'].filter(Boolean).join(', '))}`
            }
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--primary)', color: '#fff',
              padding: '10px 20px', borderRadius: 'var(--radius-pill)',
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
            }}
          >
            {Icons.mapPin({ s: 15 })} Cómo llegar
          </a>
        </div>
        {institution.lat && institution.lng ? (
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', height: 220 }}>
            <iframe
              title={`Mapa de ${institution.name}`}
              width="100%"
              height="220"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${institution.lng - 0.01},${institution.lat - 0.01},${institution.lng + 0.01},${institution.lat + 0.01}&layer=mapnik&marker=${institution.lat},${institution.lng}`}
            />
          </div>
        ) : (
          <div style={{ padding: '12px 16px', background: 'var(--bg-warm)', borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {Icons.mapPin({ s: 15 })}
            {[institution.address, institution.city, institution.state].filter(Boolean).join(', ') || 'Dirección no disponible'}
          </div>
        )}
      </div>
    </div>
  )
}
