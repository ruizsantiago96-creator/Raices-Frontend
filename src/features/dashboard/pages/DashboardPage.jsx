import { Link } from 'react-router-dom'
import { useMe, useProfile } from '@features/auth'
import { useDiscovery } from '@features/institutions'
import { useFavoriteIds, useToggleFavorite } from '../../favorites/hooks/useFavorites'
import { useAINextSteps } from '../../tutor/hooks/useAI'
import { useAuthStore } from '@features/auth'
import { Icons, CategoryTag, CATEGORY_COLORS, hashColor } from '@shared/components/shared'
import { AppSidebar, TopNav } from '@features/auth'
import { NotificationBell } from '@features/notifications'

export default function DashboardPage() {
  const { logout } = useAuthStore()
  const { data: user } = useMe()
  const { data: profile } = useProfile()
  const { data: recommendations = [], isLoading } = useDiscovery()
  const { data: favIds = [] } = useFavoriteIds()
  const toggle = useToggleFavorite()
  const { data: aiInsights, isLoading: aiLoading } = useAINextSteps()

  // Cálculo simple de completitud del perfil para el banner guía
  const hasProfiling = !!profile?.profiling
  const filledBasics = [profile?.full_name, profile?.city, profile?.state].filter(Boolean).length
  const profilePct = Math.min(100, Math.round(((hasProfiling ? 3 : 0) + filledBasics) / 6 * 100))
  const profileComplete = hasProfiling && filledBasics >= 2

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      <AppSidebar currentPage="dashboard" />
      <TopNav user={user} onLogout={logout} currentPage="dashboard" />

      <main className="responsive-main" style={{ maxWidth: 1100 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Greeting */}
        <div className="scroll-reveal" style={{ marginBottom: 36 }}>
          <div className="responsive-header dashboard-greeting" style={{ marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50% 50% 50% 14%', background: user?.avatar_url ? 'transparent' : hashColor(user?.full_name ?? ''), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, overflow: 'hidden', flexShrink: 0 }}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.full_name?.[0]?.toUpperCase() ?? '?'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                Hola, {user?.full_name?.split(' ')[0] ?? 'bienvenid@'}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--fg3)', margin: 0 }}>Tu ecosistema personalizado</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Banner guía: completar perfil (persistente hasta completar) */}
        {!profileComplete && (
          <div className="dashboard-banner" style={{ marginBottom: 32, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: 'var(--radius-md)', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: 'var(--shadow-md)', flexWrap: 'wrap' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50% 50% 50% 16%', background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {Icons.target({ s: 28 })}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                Completa tu perfil
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', margin: '0 0 12px', lineHeight: 1.5 }}>
                Cuéntanos sobre tus necesidades para darte recomendaciones que de verdad encajen contigo.
              </p>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.25)', borderRadius: 5, overflow: 'hidden', maxWidth: 360 }}
                role="progressbar" aria-valuenow={profilePct} aria-valuemin={0} aria-valuemax={100} aria-label={`Perfil completado al ${profilePct}%`}>
                <div style={{ height: '100%', width: `${profilePct}%`, background: '#fff', borderRadius: 5, transition: 'width 0.5s ease' }} />
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '6px 0 0' }}>{profilePct}% completado</p>
            </div>
            <Link to="/onboarding" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <button style={{ background: '#fff', color: 'var(--primary-dark)', border: 'none', borderRadius: 'var(--radius-pill)', fontSize: 16, fontWeight: 700, padding: '14px 28px', minHeight: 48, cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Completar ahora {Icons.arrowRight({ s: 18 })}
              </button>
            </Link>
          </div>
        )}

        {/* AI Analysis Panel */}
        <div className="scroll-reveal" style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50% 50% 50% 10%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icons.brain({ s: 16 })}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
              Análisis IA — Próximos pasos
            </h2>
            {aiInsights?.mock && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'color-mix(in oklch, #D4944C 15%, transparent)', color: '#D4944C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Demo
              </span>
            )}
          </div>
          {aiLoading ? (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: i < 2 ? 16 : 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--border-color)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ width: `${70 - i * 10}%`, height: 16, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              ))}
            </div>
          ) : aiInsights?.next_steps?.length > 0 ? (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {aiInsights.next_steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-display)' }}>
                      {i + 1}
                    </div>
                    <div style={{ fontSize: 15, color: 'var(--fg1)', lineHeight: 1.5, paddingTop: 4 }}>{step}</div>
                  </div>
                ))}
              </div>
              {aiInsights.reasoning && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: 'var(--primary)', flexShrink: 0, paddingTop: 2 }}>{Icons.sparkles({ s: 14 })}</span>
                  <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>{aiInsights.reasoning}</p>
                </div>
              )}
              {aiInsights.institution_suggestions?.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                    Instituciones sugeridas
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {aiInsights.institution_suggestions.map((s, i) => (
                      <Link key={i} to={`/explore?category=${encodeURIComponent(s.category)}`} style={{ textDecoration: 'none' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--primary-subtle)', color: 'var(--primary)', fontSize: 13, fontWeight: 700, border: '1px solid color-mix(in oklch, var(--primary) 30%, transparent)' }}>
                          {Icons.building({ s: 13 })} {s.category} — {s.reason}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Recommendations */}
        <div className="scroll-reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, gap: 12 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
            Recomendaciones para ti
          </h2>
          <Link to="/explore" style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            Ver todas {Icons.arrowRight({ s: 14 })}
          </Link>
        </div>

        {isLoading ? (            <div className="responsive-grid-cards">
            {[0, 1, 2].map(i => (
              <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: 80, height: 24, borderRadius: 12, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
                <div style={{ width: '80%', height: 18, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ width: '55%', height: 14, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ width: 48, height: 14, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ width: 56, height: 14, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 40, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {Icons.sparkles({ s: 24 })}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>Completa tu perfil</h3>
            <p style={{ fontSize: 14, color: 'var(--fg2)', marginBottom: 20 }}>Con más información podemos recomendarte instituciones que realmente encajen contigo</p>
            <Link to="/onboarding">
              <button className="btn-primary" style={{ fontSize: 15, padding: '10px 24px' }}>
                Completar perfil {Icons.arrowRight({ s: 16 })}
              </button>
            </Link>
          </div>
        ) : (            <div className="responsive-grid-cards">
            {recommendations.slice(0, 6).map((inst, i) => (
              <div key={inst.id} className={`scroll-reveal scroll-reveal-delay-${Math.min(i + 1, 6)}`}><InstitutionCard inst={inst} isFav={favIds.includes(inst.id)} onToggleFav={() => toggle.mutate(inst.id)} /></div>
            ))}
          </div>
        )}
        </div>
      </main>
    </div>
  )
}

function InstitutionCard({ inst, isFav, onToggleFav }) {
  const color = CATEGORY_COLORS[inst.category] ?? 'var(--primary)'
  return (
    <div className="card-hover" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.2s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <CategoryTag label={inst.category} color={color} />
        <button onClick={onToggleFav} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFav ? 'var(--color-salud)' : 'var(--fg3)', padding: 0, display: 'flex' }}>
          {Icons.heart({ s: 18, filled: isFav })}
        </button>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', lineHeight: 1.3 }}>{inst.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg3)' }}>
        {Icons.mapPin({ s: 14 })} {inst.city}, {inst.state}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
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
}
