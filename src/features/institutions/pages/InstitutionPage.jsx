/**
 * InstitutionPage — Página de detalle de una institución.
 *
 * Muestra información completa de la institución, chat con asistente IA,
 * y sistema de reseñas.
 */

import { useParams, Link } from 'react-router-dom'
import { useInstitution } from '../hooks/useInstitutions'
import { useFavoriteIds } from '../../favorites/hooks/useFavorites'
import { useReviews } from '../hooks/useReviews'
import { useAuthStore } from '@features/auth'
import { AppSidebar, TopNav } from '@features/auth'

// Componentes extraídos
import Skeleton from '../components/Skeleton'
import InstitutionHeader from '../components/InstitutionHeader'
import InstitutionAIChat from '../components/InstitutionAIChat'
import InstitutionReviews from '../components/InstitutionReviews'

/* ─── Loading / Not Found States ────────────────────────────────────────── */

function LoadingState() {
  return (
    <main className="responsive-main" style={{ '--main-max-width': '860px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 32, boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
          <Skeleton w={80} h={24} radius={12} mb={20} />
          <Skeleton w="60%" h={36} mb={12} />
          <Skeleton w={140} h={16} mb={10} />
          <Skeleton w="90%" h={16} mb={6} />
          <Skeleton w="75%" h={16} mb={20} />
          <div style={{ display: 'flex', gap: 12 }}>
            <Skeleton w={100} h={32} radius={16} />
            <Skeleton w={120} h={32} radius={16} />
          </div>
        </div>
      </main>
  )
}

function NotFoundState() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--fg2)', marginBottom: 16, fontSize: 16 }}>Institución no encontrada.</p>
        <Link to="/explore">
          <button className="btn-primary">Volver a explorar</button>
        </Link>
      </div>
    </div>
  )
}

/* ─── InstitutionPage ─────────────────────────────────────────────────────── */

export default function InstitutionPage() {
  const { id } = useParams()
  const { data: institution, isLoading } = useInstitution(id)
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(id)
  const { data: rawFavIds } = useFavoriteIds()
  const { user, logout } = useAuthStore()

  // Normalise favoriteIds — API may return an array or a Set
  const favoriteIds = rawFavIds instanceof Set
    ? rawFavIds
    : new Set(Array.isArray(rawFavIds) ? rawFavIds.map(String) : [])

  /* ── loading / not-found states ── */

  if (isLoading) return <LoadingState />
  if (!institution) return <NotFoundState />

  const isFav = favoriteIds.has(String(institution.id))

  /* ── render ── */

  return (
    <main className="responsive-main" style={{ '--main-max-width': '860px' }}>

        {/* Breadcrumb */}
        <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 14, color: 'var(--fg3)' }}>
          <Link to="/explore" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Explorar
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--fg2)' }}>{institution.name}</span>
        </div>

        {/* 1. Header card */}
        <InstitutionHeader institution={institution} isFav={isFav} />

        {/* 2. AI Chat panel */}
        <InstitutionAIChat institutionName={institution.name} />

        {/* 3 & 4. Reviews section */}
        <InstitutionReviews
          institutionId={id}
          reviews={reviews}
          reviewsLoading={reviewsLoading}
          user={user}
        />
      </main>
  )
}
