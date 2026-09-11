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
import type { Institution } from '@/types/institutions'
import { useOnboardingStatus } from '@features/institutions/hooks/useRecommendations'

export interface InstitutionHeaderProps {
  institution: Institution
  isFav?: boolean
}

export default function InstitutionHeader({ institution, isFav = false }: InstitutionHeaderProps) {
  const toggle = useToggleFavorite()
  const { data: onboardingStatus } = useOnboardingStatus()
  const categoryColor = CATEGORY_COLORS[institution.category ?? ''] ?? 'var(--primary)'
  const isIncomplete = Boolean(onboardingStatus && !(onboardingStatus as { onboardingCompleto?: boolean }).onboardingCompleto)

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
          <CategoryTag label={institution.category ?? ''} color={categoryColor} />
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
          onClick={() => {
            if (isIncomplete) {
              alert('Completa tu perfil en el dashboard para guardar en favoritos.')
              return
            }
            toggle.mutate(institution)
          }}
          disabled={toggle.isPending}
          title={isIncomplete ? 'Completa tu perfil para guardar en favoritos' : ''}
          style={{
            background: isFav
              ? 'color-mix(in oklch, #C4789A 12%, transparent)'
              : (isIncomplete ? '#f0f0f0' : 'var(--bg-warm)'),
            border: `1px solid ${isFav ? '#C4789A' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-pill)',
            cursor: toggle.isPending ? 'wait' : (isIncomplete ? 'not-allowed' : 'pointer'),
            color: isFav ? '#C4789A' : (isIncomplete ? 'var(--fg4)' : 'var(--fg3)'),
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
          {isIncomplete ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 15V17M6 11V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V11M5 11H19C20.1046 11 21 11.8954 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8954 3.89543 11 5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : Icons.heart({ s: 16, filled: isFav })}
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
      {institution.disability_types && institution.disability_types.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {institution.disability_types.map((type: string) => (
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
      <div style={{ position: 'relative' }}>
        {isIncomplete && (
          <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(3px)', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8,
            fontWeight: 700, color: '#073B4C', gap: 6, fontSize: 13
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 15V17M6 11V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V11M5 11H19C20.1046 11 21 11.8954 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8954 3.89543 11 5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Completa tu perfil para contactar
          </div>
        )}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {institution.phone && (
            <a href={`tel:${institution.phone}`} onClick={e => isIncomplete && e.preventDefault()} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 14, color: 'var(--fg2)', textDecoration: 'none',
              pointerEvents: isIncomplete ? 'none' : 'auto'
            }}>
              {Icons.phone({ s: 16 })} {institution.phone}
            </a>
          )}
          {institution.email && (
            <a href={`mailto:${institution.email}`} onClick={e => isIncomplete && e.preventDefault()} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 14, color: 'var(--fg2)', textDecoration: 'none',
              pointerEvents: isIncomplete ? 'none' : 'auto'
            }}>
              {Icons.mail({ s: 16 })} {institution.email}
            </a>
          )}
          {institution.website && (
            <a href={institution.website} target="_blank" rel="noreferrer" onClick={e => isIncomplete && e.preventDefault()} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 14, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none',
              pointerEvents: isIncomplete ? 'none' : 'auto'
            }}>
              {Icons.globe({ s: 16 })} Sitio web
            </a>
          )}
        </div>
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
