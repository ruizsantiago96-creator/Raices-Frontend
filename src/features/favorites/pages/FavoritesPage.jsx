import { Link } from 'react-router-dom'
import { useFavorites, useToggleFavorite } from '../hooks/useFavorites'
import { Icons, CategoryTag, CATEGORY_COLORS } from '@shared/components/shared'
import { AppSidebar, TopNav } from '@features/auth'
import { useMe, useAuthStore } from '@features/auth'

export default function FavoritesPage() {
  const { data: favorites = [], isLoading } = useFavorites()
  const toggle = useToggleFavorite()
  const { data: user } = useMe()
  const { logout } = useAuthStore()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      <AppSidebar currentPage="favorites" />
      <TopNav user={user} onLogout={logout} currentPage="favorites" />

      <main className="responsive-main">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
          Instituciones guardadas
        </h1>
        <p style={{ fontSize: 15, color: 'var(--fg3)', margin: '0 0 32px' }}>
          {isLoading ? '' : `${favorites.length} institución${favorites.length !== 1 ? 'es' : ''} guardada${favorites.length !== 1 ? 's' : ''}`}
        </p>

        {isLoading ? (
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
              <button className="btn-primary" style={{ fontSize: 15, padding: '10px 28px' }}>
                Explorar instituciones {Icons.arrowRight({ s: 16 })}
              </button>
            </Link>
          </div>
        ) : (
          <div className="responsive-grid-cards">
            {favorites.map(inst => {
              const color = CATEGORY_COLORS[inst.category] ?? 'var(--primary)'
              return (
                <div key={inst.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <CategoryTag label={inst.category} color={color} />
                    <button onClick={() => toggle.mutate(inst.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-salud)', padding: 0, display: 'flex' }}>
                      {Icons.heart({ s: 18, filled: true })}
                    </button>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', lineHeight: 1.3 }}>{inst.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg3)' }}>
                    {Icons.mapPin({ s: 14 })} {inst.city}, {inst.state}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
                    <span style={{ fontSize: 13, color: '#D4944C', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {Icons.star({ s: 14, filled: true })} {inst.rating_avg?.toFixed(1) ?? '—'}
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
    </div>
  )
}
