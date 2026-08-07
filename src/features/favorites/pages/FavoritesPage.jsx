import { Link } from 'react-router-dom'
import { useFavorites, useToggleFavorite } from '../hooks/useFavorites'
import { Icons, CategoryTag, CATEGORY_COLORS } from '@shared/components/shared'
import { AppSidebar, TopNav } from '@features/auth'
import { useMe, useAuthStore } from '@features/auth'
import BackendFallback from '@shared/components/BackendFallback'
import { FAVORITE_ENDPOINTS } from '@shared/constants/backendEndpoints'

export default function FavoritesPage() {
  const { data: favorites = [], isLoading, isError, refetch } = useFavorites()
  const toggle = useToggleFavorite()
  const { data: user } = useMe()
  const { logout } = useAuthStore()

  return (
    <main className="responsive-main">
      <div className="animate-fade-in-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>Guardados</h1>
        <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>
          {isLoading ? '' : `${favorites.length} institución${favorites.length !== 1 ? 'es' : ''} guardada${favorites.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {isError ? (
        <BackendFallback method={FAVORITE_ENDPOINTS.LIST.method} endpoint={FAVORITE_ENDPOINTS.LIST.path} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--fg3)', padding: 40 }}>
          {Icons.loader({ s: 20 })} Cargando...
        </div>
      ) : favorites.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 64, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            {Icons.heart({ s: 28 })}
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>Aún no tienes guardados</h3>
          <p style={{ fontSize: 15, color: 'var(--fg2)', marginBottom: 24 }}>Guarda instituciones para encontrarlas fácilmente más adelante</p>
          <Link to="/explore">
            <button className="btn-primary" style={{ padding: '12px 24px', fontSize: 14, fontWeight: 600, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {Icons.search({ s: 16 })} Explorar instituciones
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {favorites.map((inst) => {
            const color = CATEGORY_COLORS[inst.category] ?? 'var(--primary)'
            return (
              <div key={inst.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 12, transition: 'box-shadow 0.2s ease' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <CategoryTag label={inst.category} color={color} />
                  <button onClick={() => toggle.mutate(inst.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4789A', padding: 0, display: 'flex' }}>
                    {Icons.heart({ s: 18, filled: true })}
                  </button>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', lineHeight: 1.3 }}>{inst.name}</div>
                <div style={{ fontSize: 14, color: 'var(--fg3)', lineHeight: 1.5, flex: 1 }}>{inst.description?.slice(0, 80)}{inst.description?.length > 80 ? '...' : ''}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg3)' }}>{Icons.mapPin({ s: 14 })} {inst.city}, {inst.state}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
                  <span style={{ fontSize: 13, color: '#D4944C', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {Icons.star({ s: 14, filled: true })} {inst.rating_avg?.toFixed(1) ?? '—'}
                    <span style={{ color: 'var(--fg3)' }}>({inst.rating_count ?? 0})</span>
                  </span>
                  <Link to={`/institution/${inst.id}`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Ver más {Icons.arrowRight({ s: 14 })}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
